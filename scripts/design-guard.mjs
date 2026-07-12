/**
 * 삿갓(Satgat) design-guard — static analyzer enforcing the 삿갓 8 design rules.
 *
 * Modeled on scripts/verify-template-catalog.mjs: pure static analysis using the
 * TypeScript compiler API for structural parsing + line-level text scanning for
 * color/weight literals. It never imports/executes app code, never touches the
 * network, and never starts a server.
 *
 * Modes:
 *   --check          Run the 6 design rules (RGBA_USAGE, PURE_WHITE,
 *                    DANCHEONG_BUDGET, SYNTHETIC_BOLD, COOL_GRAY, DUAL_ACCENT).
 *   --check-density  Run the content-density estimator (per-page fill %, SPARSE warns).
 *
 * Severity contract (M1 = WARN mode):
 *   - Rules emit `warn` findings. The script ALWAYS exits 0 so existing
 *     CI/workflows are not broken. A future stricter mode may exit non-zero;
 *     that is out of scope for M1.
 *   - `// permit` on a line (trailing) suppresses any finding on that line to
 *     `info` severity (permitted audit trail, not counted in warn/error totals).
 *
 * Output: one finding per line, stable greppable shape:
 *   <severity> <RULE_ID> <file>:<line> — <hint>
 * Ends with a summary: total counts per severity.
 */

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();

// ─── Density scanner (M2: --check-density) ──────────────────────────────────
// A static, offline, deterministic per-page content-density estimator.
//
// Approach: we never start a browser/dev server. Instead we parse the 14
// template definitions (AST, same pattern as verify-template-catalog.mjs) and
// combine them with the fixture slot values to estimate, per page, how much of
// the printable canvas area is filled. The estimate mirrors the visual layout:
//   - text slots → estimated line count × line height (mm)
//   - list slots → item count × item block height
//   - table slots → (rows+1) × row height + header weight
//   - visual slots → fixed chart block height
//   - dividers/footers → fixed heights
// The summed content height is divided by the printable page height (canvas
// height minus page margins) to get a fill %. Pages below 50% are SPARSE.
//
// Multi-page templates (investor-deck renders one SatgatDocument per slide)
// are expanded into one density row per slide, mirroring the renderer's
// conditional slide emission.
//
// All magic numbers are documented inline so the estimate is reproducible.

// A4 printable area subtracts the margins mirrored from constraint.ts.
// Non-A4 form factors use their physical PageSpec geometry below.
const MARGIN_X_MM = 24;
const MARGIN_Y_MM = 28;

let parsedRegistryCatalog;

function registryCatalog() {
  if (!parsedRegistryCatalog) parsedRegistryCatalog = parseRegistryCatalog();
  return parsedRegistryCatalog;
}

// Body typography assumed for line estimation. 15px body @ 1.72 line-height.
// 1mm ≈ 3.78px (96dpi), so 15px ≈ 3.97mm line-box ≈ 6.8mm per line.
// We use ~6.8mm/line for body text. Korean text wraps wider; chars-per-line is
// derived from printable width / avg-glyph-width (≈ 3.2mm for 15px Korean).
const MM_PER_LINE = 6.8;
const MM_PER_GLYPH = 3.2;
// Section gaps (SECTION_GAP_STD = 48px ≈ 12.7mm).
const SECTION_GAP_MM = 12.7;
// Heading heights (myeongjo 800 display).
const HEADING_H1_MM = 18;
const HEADING_H2_MM = 14;
// List item block: title (1 line) + description (1-2 lines) + gap.
const LIST_ITEM_MM = 16;
// Table row height + header row.
const TABLE_ROW_MM = 9;
const TABLE_HEADER_MM = 11;
// Visual/chart block height.
const VISUAL_MM = 55;
// Divider height.
const DIVIDER_MM = 4;
// Slide chrome: investor-deck SlideSection structural overhead — kicker label +
// large H2 title (32px) + accent divider + generous spacing + centering factor.
// This represents the visual weight a centered one-message slide carries even
// with minimal text body. A slide with this chrome + any message is NOT sparse.
const SLIDE_CHROME_MM = 51;
// Minimum content for a page that is not a stub (title + minimal body).
const SPARSE_THRESHOLD = 0.5; // < 50% fill → SPARSE

function pageSpecGeometry(pageSpec) {
  const spec = registryCatalog().pageSpecs.get(pageSpec);
  if (!spec) throw new Error(`Unknown page spec "${pageSpec}"`);
  return spec;
}

function usableDimensionsMm(pageSpec) {
  const spec = pageSpecGeometry(pageSpec);
  switch (pageSpec) {
    case 'businessCard8Up':
      if (!spec.imposition) throw new Error('businessCard8Up requires imposition geometry');
      return { w: spec.imposition.cardWidthMm, h: spec.imposition.cardHeightMm };
    case 'postcardPortrait':
      return { w: spec.canvas.widthMm, h: spec.canvas.heightMm };
    default:
      return {
        w: spec.canvas.widthMm - MARGIN_X_MM * 2,
        h: spec.canvas.heightMm - MARGIN_Y_MM * 2,
      };
  }
}

function printableHeightMm(pageSpec) {
  return usableDimensionsMm(pageSpec).h;
}

function printableWidthMm(pageSpec) {
  return usableDimensionsMm(pageSpec).w;
}

/** Parse a template definition file via the TypeScript compiler AST. Returns
 *  { id, pageSpec, slots: [{id,type,required}], contentOutline: [{type, slots:[]}] }. */
function parseTemplateDef(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(filePath, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  let templateObject;
  function visitDef(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      templateObject = node.initializer;
    }
    ts.forEachChild(node, visitDef);
  }
  visitDef(sf);
  if (!templateObject) throw new Error(`No template object in ${path.relative(root, filePath)}`);
  const fields = new Map();
  for (const p of templateObject.properties) {
    if (ts.isPropertyAssignment(p)) fields.set(propNameText(p.name), p.initializer);
  }
  const slots = [];
  const slotArr = fields.get('slots');
  if (slotArr && ts.isArrayLiteralExpression(slotArr)) {
    for (const sn of slotArr.elements) {
      if (!ts.isObjectLiteralExpression(sn)) continue;
      const sf2 = new Map();
      for (const p of sn.properties) {
        if (ts.isPropertyAssignment(p)) sf2.set(propNameText(p.name), p.initializer);
      }
      slots.push({
        id: stringLit(sf2.get('id')),
        type: stringLit(sf2.get('type')),
        required: sf2.get('required')?.kind === ts.SyntaxKind.TrueKeyword,
      });
    }
  }
  const contentOutline = [];
  const secArr = fields.get('contentOutline');
  if (secArr && ts.isArrayLiteralExpression(secArr)) {
    for (const secNode of secArr.elements) {
      if (!ts.isObjectLiteralExpression(secNode)) continue;
      const sf3 = new Map();
      for (const p of secNode.properties) {
        if (ts.isPropertyAssignment(p)) sf3.set(propNameText(p.name), p.initializer);
      }
      contentOutline.push({ type: stringLit(sf3.get('type')), slots: strArr(sf3.get('slots')) });
    }
  }
  return {
    id: stringLit(fields.get('id')),
    pageSpec: stringLit(fields.get('pageSpec')),
    slots,
    contentOutline,
  };
}
function parseRegistryCatalog() {
  const registryPath = process.env.DESIGN_GUARD_REGISTRY
    ? path.resolve(process.env.DESIGN_GUARD_REGISTRY)
    : path.join(root, 'src/lib/templates/registry.ts');
  const sourceFile = ts.createSourceFile(
    registryPath,
    fs.readFileSync(registryPath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  let pageSpecsObject;
  let templatesObject;

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      if (node.name.text === 'PAGE_SPECS') pageSpecsObject = node.initializer;
      if (node.name.text === 'templates') templatesObject = node.initializer;
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  if (!pageSpecsObject) throw new Error('No PAGE_SPECS registry object found');
  if (!templatesObject) throw new Error('No templates registry object found');

  const pageSpecs = new Map();
  for (const property of pageSpecsObject.properties) {
    if (!ts.isPropertyAssignment(property) || !ts.isObjectLiteralExpression(property.initializer)) continue;
    const id = propNameText(property.name);
    const fields = objectFields(property.initializer);
    const canvas = numericObject(fields.get('canvas'), ['widthMm', 'heightMm']);
    const imposition = numericObject(
      fields.get('imposition'),
      ['columns', 'rows', 'cardWidthMm', 'cardHeightMm'],
    );
    if (!id || !canvas) throw new Error(`Invalid PageSpec geometry for "${id ?? 'unknown'}"`);
    pageSpecs.set(id, { canvas, imposition });
  }

  const templateIds = templatesObject.properties
    .map((property) => {
      if (ts.isShorthandPropertyAssignment(property)) return property.name.text;
      if (ts.isPropertyAssignment(property)) return propNameText(property.name);
      return undefined;
    })
    .filter(Boolean);

  return { pageSpecs, templateIds };
}

function objectFields(node) {
  if (!node || !ts.isObjectLiteralExpression(node)) return new Map();
  const fields = new Map();
  for (const property of node.properties) {
    if (ts.isPropertyAssignment(property)) fields.set(propNameText(property.name), property.initializer);
  }
  return fields;
}

function numericObject(node, keys) {
  if (!node) return undefined;
  const fields = objectFields(node);
  const result = {};
  for (const key of keys) {
    const value = fields.get(key);
    if (!value || !ts.isNumericLiteral(value)) return undefined;
    result[key] = Number(value.text);
  }
  return result;
}

function formatPageSpecGeometry() {
  return [...registryCatalog().pageSpecs.entries()]
    .map(([id, spec]) => {
      const canvas = `${id} ${spec.canvas.widthMm}×${spec.canvas.heightMm}mm`;
      if (!spec.imposition) return canvas;
      const { columns, rows, cardWidthMm, cardHeightMm } = spec.imposition;
      return `${canvas} (${columns}×${rows}, ${cardWidthMm}×${cardHeightMm}mm faces)`;
    })
    .join(', ');
}

function propNameText(name) {
  if (!name) return undefined;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return undefined;
}

function stringLit(node) {
  return node && ts.isStringLiteralLike(node) ? node.text : undefined;
}

function strArr(node) {
  if (!node || !ts.isArrayLiteralExpression(node)) return [];
  return node.elements.map(stringLit).filter(Boolean);
}

/** Estimate the rendered height (mm) of a single slot's value. */
function estimateSlotHeightMm(slotType, value, pageSpec) {
  if (value == null) return 0;
  const pWidth = printableWidthMm(pageSpec);
  const charsPerLine = Math.max(1, Math.floor(pWidth / MM_PER_GLYPH));

  switch (slotType) {
    case 'text':
    case 'textarea':
    case 'markdown': {
      const text = typeof value === 'string' ? value : String(value);
      if (!text.trim()) return 0;
      // Count newlines + wrapped lines.
      const paragraphs = text.split('\n').filter((l) => l.trim());
      let lines = 0;
      for (const para of paragraphs) {
        lines += Math.max(1, Math.ceil(para.length / charsPerLine));
      }
      return lines * MM_PER_LINE;
    }
    case 'list': {
      if (!Array.isArray(value)) return 0;
      let h = 0;
      for (const item of value) {
        if (!item || typeof item !== 'object') continue;
        const title = String(item.title ?? item.name ?? item.label ?? item.metric ?? '').trim();
        const desc = String(item.description ?? item.summary ?? item.value ?? item.role ?? '').trim();
        let itemLines = 0;
        if (title) itemLines += Math.max(1, Math.ceil(title.length / charsPerLine));
        if (desc) itemLines += Math.max(1, Math.ceil(desc.length / charsPerLine));
        h += Math.max(LIST_ITEM_MM, itemLines * MM_PER_LINE);
      }
      return h;
    }
    case 'table': {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return 0;
      const headers = Array.isArray(value.headers) ? value.headers : [];
      const rows = Array.isArray(value.rows) ? value.rows : [];
      if (headers.length === 0 && rows.length === 0) return 0;
      return TABLE_HEADER_MM + rows.length * TABLE_ROW_MM;
    }
    case 'visual': {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return 0;
      return VISUAL_MM;
    }
    case 'image': {
      if (typeof value === 'string' && value.trim()) return VISUAL_MM;
      if (value && typeof value === 'object') {
        const src = String(value.url ?? value.src ?? '').trim();
        if (src) return VISUAL_MM;
      }
      return 0;
    }
    case 'image-list': {
      if (!Array.isArray(value)) return 0;
      return value.length > 0 ? VISUAL_MM : 0;
    }
    default:
      return 0;
  }
}

/** Expand a template + fixture into one or more "pages", each with an
 *  estimated content height (mm). slide16x9 is multi-page, mirroring the
 *  renderer's conditional slide emission. Returns page density inputs. */
function expandPages(templateDef, fixture, pageSpec) {
  const s = fixture.slots ?? fixture;

  if (pageSpec === 'slide16x9') {
    return expandInvestorDeckSlides(s, pageSpec);
  }

  // Card and postcard layouts have a designed face spanning their physical
  // usable height. Derive that allowance from PageSpec rather than a fixed size.
  let contentHeight =
    pageSpec === 'businessCard8Up' || pageSpec === 'postcardPortrait'
      ? usableDimensionsMm(pageSpec).h
      : 0;
  let sectionCount = 0;
  for (const section of templateDef.contentOutline) {
    if (section.type === 'divider') {
      contentHeight += DIVIDER_MM;
      sectionCount++;
      continue;
    }
    let sectionHasContent = false;
    for (const slotId of section.slots) {
      const slotDef = templateDef.slots.find((sl) => sl.id === slotId);
      if (!slotDef) continue;
      const val = s[slotId];
      const h = estimateSlotHeightMm(slotDef.type, val, pageSpec);
      if (h > 0) {
        contentHeight += h;
        sectionHasContent = true;
      }
    }
    if (sectionHasContent) {
      sectionCount++;
      // hero section has a big heading.
      if (section.type === 'hero') contentHeight += HEADING_H1_MM;
    }
  }
  // Inter-section gaps.
  if (sectionCount > 1) contentHeight += (sectionCount - 1) * SECTION_GAP_MM;
  return [{ label: 'p1', contentHeightMm: contentHeight, pageSpec }];
}

/** Mirror InvestorDeck.tsx slide structure. Each slide is one SatgatDocument.
 *  Slides are conditionally emitted based on which slots are populated. */
function expandInvestorDeckSlides(s, pageSpec) {
  const slides = [];
  const problem = String(s.problem ?? '').trim();
  const solution = String(s.solution ?? '').trim();
  const marketSize = String(s.market_size ?? '').trim();
  const businessModel = String(s.business_model ?? '').trim();
  const ask = String(s.ask ?? '').trim();
  const traction = Array.isArray(s.traction) ? s.traction : [];
  const tractionChart = s.traction_chart;
  const team = Array.isArray(s.team) ? s.team : [];

  // S1: Cover — dense grid (company + deck_title + problem + solution + market + traction + model + ask).
  // This slide packs a lot, so estimate generously.
  let s1 = HEADING_H1_MM + SECTION_GAP_MM;
  if (problem) s1 += estimateSlotHeightMm('textarea', problem, pageSpec);
  if (solution) s1 += estimateSlotHeightMm('textarea', solution, pageSpec);
  if (marketSize) s1 += HEADING_H2_MM;
  if (traction.length) s1 += LIST_ITEM_MM * Math.min(traction.length, 2);
  if (businessModel) s1 += estimateSlotHeightMm('textarea', businessModel, pageSpec) * 0.6;
  if (ask) s1 += HEADING_H2_MM;
  slides.push({ label: 'S1 cover', contentHeightMm: s1, pageSpec });

  // S2: Problem
  if (problem) {
    slides.push({
      label: 'S2 problem',
      contentHeightMm: SLIDE_CHROME_MM + estimateSlotHeightMm('textarea', problem, pageSpec),
      pageSpec,
    });
  }
  // S3: Solution
  if (solution) {
    slides.push({
      label: 'S3 solution',
      contentHeightMm: SLIDE_CHROME_MM + estimateSlotHeightMm('textarea', solution, pageSpec),
      pageSpec,
    });
  }
  // S4: Market
  if (marketSize) {
    slides.push({
      label: 'S4 market',
      contentHeightMm: SLIDE_CHROME_MM + HEADING_H1_MM * 0.9,
      pageSpec,
    });
  }
  // S5: Traction metrics
  if (traction.length) {
    slides.push({
      label: 'S5 traction',
      contentHeightMm: SLIDE_CHROME_MM + LIST_ITEM_MM * Math.min(traction.length, 3),
      pageSpec,
    });
  }
  // S5b: Traction chart
  if (Boolean(tractionChart) && typeof tractionChart === 'object') {
    slides.push({
      label: 'S5b chart',
      contentHeightMm: SLIDE_CHROME_MM + VISUAL_MM,
      pageSpec,
    });
  }
  // S6: Business Model
  if (businessModel) {
    slides.push({
      label: 'S6 model',
      contentHeightMm: SLIDE_CHROME_MM + estimateSlotHeightMm('textarea', businessModel, pageSpec),
      pageSpec,
    });
  }
  // S7: Team
  if (team.length) {
    slides.push({
      label: 'S7 team',
      contentHeightMm: SLIDE_CHROME_MM + LIST_ITEM_MM * Math.min(team.length, 3),
      pageSpec,
    });
  }
  // S8: Ask
  if (ask) {
    slides.push({
      label: 'S8 ask',
      contentHeightMm: SLIDE_CHROME_MM + HEADING_H1_MM,
      pageSpec,
    });
  }
  return slides;
}

/** Compute fill % for a page = contentHeight / printableHeight, clamped [0,100]. */
function fillPercent(contentHeightMm, pageSpec) {
  const printable = printableHeightMm(pageSpec);
  if (printable <= 0) return 0;
  return Math.min(100, (contentHeightMm / printable) * 100);
}

function runDensityScan() {
  // Load fixtures.
  const { previewFixtures } = awaitImportFixtures();
  // Optionally load the sparse control fixture.
  const useSparseControl = argv.includes('--sparse-control');
  let sparseControl = null;
  if (useSparseControl) {
    try {
      sparseControl = loadSparseControlSync();
    } catch {
      sparseControl = null;
    }
  }

  // Parse all template definitions.
  const defDir = path.join(root, 'src/lib/templates/definitions');
  const defFiles = fs.readdirSync(defDir).filter((f) => f.endsWith('.ts')).sort().map((f) => path.join(defDir, f));
  const defs = new Map();
  for (const f of defFiles) {
    const d = parseTemplateDef(f);
    if (d.id) defs.set(d.id, d);
  }

  const registryIds = registryCatalog().templateIds;

  const report = [];
  let totalPages = 0;
  let totalSparse = 0;
  const sparseWarnings = [];

  for (const templateId of registryIds) {
    const def = defs.get(templateId);
    if (!def) {
      report.push(`  (skipped: definition for "${templateId}" not found)`);
      continue;
    }
    const pageSpec = def.pageSpec;
    const fixture = previewFixtures[templateId];
    if (!fixture) {
      report.push(`  (skipped: fixture for "${templateId}" not found)`);
      continue;
    }

    const pages = expandPages(def, fixture, pageSpec);
    report.push(`▸ ${templateId} (${pageSpec})`);
    pages.forEach((page, idx) => {
      const fill = fillPercent(page.contentHeightMm, pageSpec);
      const sparse = fill < SPARSE_THRESHOLD * 100;
      const flag = sparse ? '  SPARSE' : '       ';
      const pageLabel = pages.length > 1 ? ` page ${idx + 1}/${pages.length} (${page.label})` : ' page 1/1';
      report.push(`  ${flag} ${pageLabel}  fill ${fill.toFixed(1)}%`);
      totalPages++;
      if (sparse) {
        totalSparse++;
        sparseWarnings.push({
          templateId,
          pageIndex: idx + 1,
          label: page.label,
          fill: fill.toFixed(1),
        });
      }
    });
  }

  // Sparse control fixture (if requested).
  let controlSparse = false;
  if (sparseControl) {
    const def = defs.get(sparseControl.templateId);
    if (def) {
      const pages = expandPages(def, sparseControl, def.pageSpec);
      report.push('');
      report.push(`▸ sparse-control: ${sparseControl.templateId} (${def.pageSpec}) [deliberately hollow]`);
      pages.forEach((page, idx) => {
        const fill = fillPercent(page.contentHeightMm, def.pageSpec);
        const sparse = fill < SPARSE_THRESHOLD * 100;
        const flag = sparse ? '  SPARSE' : '       ';
        if (sparse) controlSparse = true;
        report.push(`  ${flag} page ${idx + 1}/${pages.length}  fill ${fill.toFixed(1)}%`);
      });
    }
  }

  // Build the human-readable report.
  const out = [];
  out.push('design-guard — 삿갓 content-density scan (warn mode)');
  out.push('');
  out.push(`Threshold: pages below ${(SPARSE_THRESHOLD * 100).toFixed(0)}% fill are flagged SPARSE.`);
  out.push(`Page specs: ${formatPageSpecGeometry()}.`);
  out.push(`Usable area: A4 and slide specs subtract ${MARGIN_X_MM}×${MARGIN_Y_MM}mm margins per edge; postcards use their canvas; business cards use each imposed face.`);
  out.push('');

  if (sparseWarnings.length) {
    out.push('WARN  SPARSE — under-filled pages in shipping fixtures:');
    for (const w of sparseWarnings) {
      out.push(`  WARN  SPARSE  ${w.templateId} page ${w.pageIndex} (${w.label}) — fill ${w.fill}% (< 50%)`);
    }
    out.push('');
  }

  for (const line of report) out.push(line);

  if (sparseControl && controlSparse) {
    out.push('');
    out.push('Sparse control fixture: CORRECTLY flagged (proves the threshold fires).');
  } else if (sparseControl && !controlSparse) {
    out.push('');
    out.push('Sparse control fixture: NOT flagged (threshold may need calibration).');
  }

  out.push('');
  out.push(
    `Summary: ${registryIds.length} templates, ${totalPages} pages, ${totalSparse} sparse warn(s) in shipping fixtures. ` +
      `Exit 0 (warn mode; density does not fail CI).`
  );

  console.log(out.join('\n'));
}

// Lazy import helper so the check-mode path doesn't pay the fixture-load cost.
function awaitImportFixtures() {
  // Synchronous require-equivalent for ESM via createRequire would add a dep;
  // instead we read+eval the fixture module text (it's a plain data export).
  return { previewFixtures: loadFixturesSync() };
}

function loadFixturesSync() {
  const fixturesPath = path.join(root, 'scripts/template-preview-fixtures.mjs');
  const src = fs.readFileSync(fixturesPath, 'utf8');
  // The fixture file is a pure-data ESM module (const SAMPLE_IMAGE = ...; export const previewFixtures = {...}).
  // We transform it into a CommonJS-returning function and eval in a sandbox
  // that provides ` SAMPLE_IMAGE`. This avoids dynamic import (async) so the
  // density scan stays fully synchronous and deterministic.
  const SAMPLE_IMAGE_MATCH = src.match(/const\s+SAMPLE_IMAGE\s*=\s*([\s\S]*?);/);
  const sampleImage = SAMPLE_IMAGE_MATCH ? evalLiteral(SAMPLE_IMAGE_MATCH[1]) : '';
  const objMatch = src.match(/export\s+const\s+previewFixtures\s*=\s*(\{[\s\S]*\});\s*$/);
  if (!objMatch) throw new Error('Could not parse previewFixtures from template-preview-fixtures.mjs');
  const body = objMatch[1];
  // Eval with SAMPLE_IMAGE in scope. Function constructor gives us a clean scope.
  const fn = new Function('SAMPLE_IMAGE', `return (${body});`);
  return fn(sampleImage);
}

function evalLiteral(expr) {
  // SAMPLE_IMAGE is a string literal; eval it directly.
  return new Function(`return (${expr});`)();
}

/** Load the sparse control fixture synchronously (mirrors loadFixturesSync). */
function loadSparseControlSync() {
  const p = path.join(root, 'scripts/density-sparse-control.mjs');
  const src = fs.readFileSync(p, 'utf8');
  const objMatch = src.match(/export\s+const\s+sparseControlFixture\s*=\s*(\{[\s\S]*\});\s*$/);
  if (!objMatch) throw new Error('Could not parse sparseControlFixture');
  return new Function(`return (${objMatch[1]});`)();
}

// ─── CLI ────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const mode = argv.includes('--check-density')
  ? 'density'
  : argv.includes('--check')
    ? 'check'
    : 'check'; // default mode is --check

if (mode === 'density') {
  runDensityScan();
  process.exit(0);
}

// ─── Scan targets ───────────────────────────────────────────────────────────
// Scan only active React/runtime source. Legacy static demo CSS is deliberately
// outside this gate and is removed by the obsolete-file cutover.

function listFiles(dir, exts) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(full, exts));
    } else if (
      exts.some((ext) => entry.name.endsWith(ext)) &&
      !entry.name.includes('.test.')
    ) {
      out.push(full);
    }
  }
  return out;
}

const generatedTokenCss = path.join(root, 'app/satgat-tokens.css');
const scanFiles = [...new Set([
  ...listFiles(path.join(root, 'app'), ['.ts', '.tsx', '.css']),
  ...listFiles(path.join(root, 'src/components'), ['.ts', '.tsx', '.css']),
  ...listFiles(path.join(root, 'src/lib/design-system'), ['.ts']),
  ...listFiles(path.join(root, 'src/lib/templates/definitions'), ['.ts']),
  path.join(root, 'public/fonts/satgat-fonts.css'),
])]
  .filter((file) => file !== generatedTokenCss)
  .filter((file) => fs.existsSync(file));

// Test hook: DESIGN_GUARD_SCAN=<dir> adds every .ts/.tsx/.css file under <dir>
// to the scan set. Used by design-guard.test.mjs to spike synthetic violations
// without polluting the repo tree. No effect when unset.
if (process.env.DESIGN_GUARD_SCAN) {
  scanFiles.push(...listFiles(process.env.DESIGN_GUARD_SCAN, ['.ts', '.tsx', '.css']));
}

const rel = (file) => path.relative(root, file);

// ─── Font weight truth (from public/fonts/satgat-fonts.css @font-face) ───────

const FONT_WEIGHTS = {
  'nanum myeongjo': new Set([400, 700, 800]),
  'gowun batang': new Set([400, 700]),
  'gowun dodum': new Set([400]),
  'noto serif kr': new Set([400, 700]),
};

// ─── Accent allowlist for COOL_GRAY (jade/gold legitimately have R<G) ────────
const ACCENT_HEX_ALLOWLIST = new Set([
  '#2e6b5e', // JADE
  '#3d8b7a', // JADE_LIGHT
  '#b8954f', // GOLD
  '#d4b76a', // GOLD_LIGHT
]);

// Dancheong tokens for budget + dual-accent detection.
const DANCHEONG_HEX = new Set(['#9b1b1b', '#b92d2d', '#b53030']);
const DANCHEONG_TOKEN = /\bDANCHEONG(_LIGHT)?\b/g;
const JADE_GOLD_TOKEN = /\b(JADE|JADE_LIGHT|GOLD|GOLD_LIGHT)\b/g;
const JADE_GOLD_HEX = new Set(['#2e6b5e', '#3d8b7a', '#b8954f', '#d4b76a']);

// ─── Finding model ──────────────────────────────────────────────────────────

const RULE_HINTS = {
  RGBA_USAGE: '8조 rule 6: solid hex only — rgba() is forbidden (use a solid hex token)',
  PURE_WHITE: '8조 rule 1: pure white (#FFF/#FFFFFF/white) is forbidden on 백자지 canvas',
  DANCHEONG_BUDGET: '8조 rule 2: 단청 #9B1B1B should stay ≤ 5% of a page (overuse heuristic)',
  SYNTHETIC_BOLD: '8조 rule 8: weight 600+ without a matching @font-face is synthetic bold',
  COOL_GRAY: '8조 rule 4: grays must be 회녹 rather than cool blue-gray',
  DUAL_ACCENT: '8조 rule 3: 단청 and a secondary accent (jade/gold) must not coexist in one file',
  RAW_UNICODE_ESCAPE: 'rendered UI source must not contain literal Unicode escape text',
  DECORATIVE_HANJA: 'active UI source must not contain decorative literal Hanja',
  UNMANAGED_TOKEN: 'active UI colors must reference constraint.ts or generated CSS tokens',
  PERMIT_FORMAT: 'permits require: // satgat-allow: RULE_ID ticket=SATGAT-123 reason=lowercase-slug',
};

const ADVISORY_RULES = new Set(['DANCHEONG_BUDGET']);
const findings = []; // { severity, rule, file, line, hint }

function parsePermit(lineText) {
  if (!lineText.includes('satgat-allow:')) return null;
  const match = lineText.match(
    /\/\/\s*satgat-allow:\s*([A-Z][A-Z0-9_]*)\s+ticket=(SATGAT-\d+)\s+reason=([a-z0-9]+(?:-[a-z0-9]+)*)\s*$/,
  );
  if (!match) return { valid: false };
  return { valid: true, rule: match[1], ticket: match[2], reason: match[3] };
}

function addFinding(rule, file, line, hint) {
  const text = line != null ? readLine(file, line) : '';
  const permit = line != null ? parsePermit(text) : null;
  if (permit?.valid && permit.rule === rule) {
    findings.push({
      severity: 'info',
      rule,
      file: rel(file),
      line,
      hint: `permitted by ${permit.ticket} (${permit.reason}) — ${hint}`,
    });
    return;
  }
  findings.push({
    severity: ADVISORY_RULES.has(rule) ? 'warn' : 'error',
    rule,
    file: rel(file),
    line,
    hint,
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const fileLines = new Map();

function readLines(file) {
  if (!fileLines.has(file)) {
    // Line-level rules scan raw source text; template-structure parsing is
    // done separately by parseTemplateDef(). Caching avoids re-reading.
    const src = fs.readFileSync(file, 'utf8');
    fileLines.set(file, src.split('\n'));
  }
  return fileLines.get(file);
}

function readLine(file, line) {
  const lines = readLines(file);
  return lines[line - 1] ?? '';
}

function hasMalformedPermit(lineText) {
  const permit = parsePermit(lineText);
  return permit !== null && !permit.valid;
}

function parseHexes(lineText) {
  // 3-, 4-, 6-, or 8-digit hex color literals (case-insensitive). 4-digit is
  // the #rgba shorthand and 8-digit is #rrggbbaa (alpha suffix). Returns
  // lowercased 6-digit RGB (alpha dropped by normalizeHex since alpha is
  // irrelevant to the pure-white / cool-gray checks).
  const out = [];
  const re = /#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
  let m;
  while ((m = re.exec(lineText)) !== null) {
    out.push({ raw: m[0], value: normalizeHex(m[0]) });
  }
  return out;
}

function normalizeHex(hex) {
  // Reduce any hex form to a lowercase 6-digit #rrggbb (alpha dropped — it is
  // irrelevant for the pure-white / cool-gray checks; #ffffffff is pure white
  // regardless of alpha).
  const h = hex.slice(1).toLowerCase();
  if (h.length === 3) {
    // #rgb → #rrggbb
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  if (h.length === 4) {
    // #rgba shorthand → #rrggbb (alpha discarded)
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  if (h.length === 8) {
    // #rrggbbaa → #rrggbb (alpha discarded)
    return `#${h.slice(0, 6)}`;
  }
  return `#${h}`;
}

function hexChannels(hex) {
  const h = normalizeHex(hex).slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function isPureWhite(hex) {
  return normalizeHex(hex) === '#ffffff';
}

// ─── Rule: RGBA_USAGE ───────────────────────────────────────────────────────
// Flags any `rgba(` function call (case-insensitive). Line-level text scan.

function ruleRgbaUsage(file) {
  const lines = readLines(file);
  const re = /\brgba\s*\(/gi;
  lines.forEach((text, i) => {
    if (re.test(stripComment(text))) {
      addFinding('RGBA_USAGE', file, i + 1, RULE_HINTS.RGBA_USAGE);
    }
    re.lastIndex = 0;
  });
}

// ─── Rule: PURE_WHITE ───────────────────────────────────────────────────────
// Flags #FFF / #FFFF / #FFFFFF / #ffffffff and the bare keyword `white` used
// as a color value. Exempts canvas #F7F7F2 and ivory #FFFFFB (not pure white).
// `white` inside identifiers (whiteSpace, whitespace) is NOT flagged.

function rulePureWhite(file) {
  const lines = readLines(file);
  lines.forEach((text, i) => {
    const line = i + 1;
    // Operate on code only (comments stripped) so a literal `#FFF` or the word
    // `white` appearing in prose/documentation is not flagged as usage.
    const code = stripComment(text);
    // hex pure-white literals.
    for (const { value } of parseHexes(code)) {
      if (isPureWhite(value)) {
        addFinding('PURE_WHITE', file, line, RULE_HINTS.PURE_WHITE);
        return;
      }
    }
    // bare `white` keyword as a color value. Match a standalone token so
    // `whiteSpace`/`whitespace`/`obangsaek-white` are not flagged.
    const keyword = /(^|[^a-zA-Z-])white(?![a-zA-Z-])/;
    if (keyword.test(code)) {
      addFinding('PURE_WHITE', file, line, RULE_HINTS.PURE_WHITE);
    }
  });
}

function stripComment(text) {
  // Remove `// ...` line comments and `/* ... */` block comments on the line.
  // For a multi-line block comment, the whole line is treated as comment once
  // an open `/*` is active (tracked via a simple state check on `* ` leaders).
  let out = text;
  const block = out.indexOf('/*');
  if (block !== -1) {
    const end = out.indexOf('*/', block);
    out = end === -1 ? out.slice(0, block) : out.slice(0, block) + out.slice(end + 2);
  }
  const line = out.indexOf('//');
  if (line !== -1) out = out.slice(0, line);
  // A line inside a CSS/JSDoc block comment that begins with ` *` or ` *` is
  // documentation, not code.
  const blockLeader = /^\s*\*\s/;
  if (blockLeader.test(out)) out = '';
  return out;
}

function isInjectedSource(file) {
  if (!process.env.DESIGN_GUARD_SCAN) return false;
  const injectedRoot = path.resolve(process.env.DESIGN_GUARD_SCAN);
  const resolved = path.resolve(file);
  return resolved === injectedRoot || resolved.startsWith(`${injectedRoot}${path.sep}`);
}

function isActiveUiSource(file) {
  const relative = rel(file).split(path.sep).join('/');
  return relative.startsWith('app/') || relative.startsWith('src/components/') || isInjectedSource(file);
}

function rulePermitFormat(file) {
  readLines(file).forEach((text, index) => {
    if (hasMalformedPermit(text)) {
      findings.push({
        severity: 'error',
        rule: 'PERMIT_FORMAT',
        file: rel(file),
        line: index + 1,
        hint: RULE_HINTS.PERMIT_FORMAT,
      });
    }
  });
}

function ruleRawUnicodeEscape(file) {
  if (!isActiveUiSource(file)) return;
  readLines(file).forEach((text, index) => {
    if (/\\u(?:\{[0-9a-f]+\}|[0-9a-f]{4})/i.test(stripComment(text))) {
      addFinding('RAW_UNICODE_ESCAPE', file, index + 1, RULE_HINTS.RAW_UNICODE_ESCAPE);
    }
  });
}

function ruleDecorativeHanja(file) {
  if (!isActiveUiSource(file)) return;
  readLines(file).forEach((text, index) => {
    if (/[\u3400-\u4dbf\u4e00-\u9fff]/u.test(stripComment(text))) {
      addFinding('DECORATIVE_HANJA', file, index + 1, RULE_HINTS.DECORATIVE_HANJA);
    }
  });
}

function ruleUnmanagedToken(file) {
  if (!isActiveUiSource(file)) return;
  readLines(file).forEach((text, index) => {
    const colors = parseHexes(stripComment(text));
    if (colors.length) {
      addFinding(
        'UNMANAGED_TOKEN',
        file,
        index + 1,
        `${RULE_HINTS.UNMANAGED_TOKEN} (found: ${colors.map(({ raw }) => raw).join(', ')})`,
      );
    }
  });
}

// ─── Rule: COOL_GRAY ────────────────────────────────────────────────────────
// Flags hex colors with a cool-blue cast — the anti-pattern on warm 백자지. The
// reliable signature of a cool-blue gray is that BLUE is the dominant channel
// (B is the max and B > R). Saturated accents (jade/gold) are allowlisted
// because they are intentional chromatic accents, not grays.
//
// Matrix (VAL-GUARD-006):
//   COOL (flag):  #f3f4f6 (B=max, B>R)  #6b7280 (B=max, B>R)  #aeb8c0
//   WARM (skip):  #4D4B46 (R=max)  #3A3833 (R=max)  #D2D6CB (G=max, B=min)  #73786F (G=max, B=min)
//   ACCENT (skip via allowlist): #2E6B5E jade  #B8954F gold

function ruleCoolGray(file) {
  const lines = readLines(file);
  lines.forEach((text, i) => {
    for (const { value } of parseHexes(text)) {
      if (ACCENT_HEX_ALLOWLIST.has(value)) continue;
      const { r, g, b } = hexChannels(value);
      // Only near-achromatic colors can be "gray"; saturated chroma (like the
      // dancheong red) is excluded by a saturation guard.
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const isGrayish = maxC - minC <= 24;
      if (!isGrayish) continue;
      // Cool-blue cast: blue is the dominant channel and exceeds red. This
      // separates cool grays (B-led) from warm/green grays (G-led, B-low) and
      // red-led grays — both of which 삿갓 uses intentionally as 회녹.
      if (b === maxC && b > r) {
        addFinding('COOL_GRAY', file, i + 1, `${RULE_HINTS.COOL_GRAY} (${value}: B=${b} dominant, R=${r})`);
      }
    }
  });
}

// ─── Rule: DANCHEONG_BUDGET ─────────────────────────────────────────────────
// Heuristic: count dancheong token/hex references per template renderer file,
// weight each occurrence, and warn when the weighted score crosses a threshold.
// Threshold + weights are documented inline so the math is reproducible.

const DANCHEONG_WEIGHTS = {
  hex: 1.0, // #9B1B1B / #B92D2D literal
  token: 0.6, // DANCHEONG / DANCHEONG_LIGHT identifier (often a shared token)
};
// Threshold: a single hairline (1 occurrence) is fine (score ≈ 0.6–1.0). Many
// dancheong uses push the page toward > 5% visual coverage. Threshold 6.0 ≈
// ~6 literal dancheong hexes or ~10 token references in one renderer.
const DANCHEONG_THRESHOLD = 6.0;

function countDancheong(file) {
  const lines = readLines(file);
  let score = 0;
  let hexHits = 0;
  let tokenHits = 0;
  lines.forEach((text) => {
    for (const { value } of parseHexes(text)) {
      if (DANCHEONG_HEX.has(value)) {
        score += DANCHEONG_WEIGHTS.hex;
        hexHits += 1;
      }
    }
    const tokens = text.match(DANCHEONG_TOKEN) ?? [];
    score += tokens.length * DANCHEONG_WEIGHTS.token;
    tokenHits += tokens.length;
  });
  return { score, hexHits, tokenHits };
}

function ruleDancheongBudget(file) {
  // Skip the token dictionary (constraint.ts/tokens.ts) — it defines dancheong
  // once as the authoritative token, not as page usage. Everything else that
  // references dancheong is scored.
  if (file.includes(path.join('src', 'lib', 'design-system'))) return;
  const { score, hexHits, tokenHits } = countDancheong(file);
  if (score > DANCHEONG_THRESHOLD) {
    const hint =
      `${RULE_HINTS.DANCHEONG_BUDGET} ` +
      `(score ${score.toFixed(1)} > ${DANCHEONG_THRESHOLD}; hex=${hexHits}×1.0, token=${tokenHits}×0.6)`;
    // Attach to the first dancheong-bearing line for a stable anchor.
    const lines = readLines(file);
    let anchor = 1;
    for (let i = 0; i < lines.length; i += 1) {
      const hexes = parseHexes(lines[i]).map((h) => h.value);
      const hasDanHex = hexes.some((v) => DANCHEONG_HEX.has(v));
      const hasDanToken = DANCHEONG_TOKEN.test(lines[i]);
      if (hasDanHex || hasDanToken) {
        anchor = i + 1;
        break;
      }
    }
    addFinding('DANCHEONG_BUDGET', file, anchor, hint);
  }
}

// ─── Rule: SYNTHETIC_BOLD ───────────────────────────────────────────────────
// Flags a suspicion pattern: font-weight 600+ used with a font-family stack
// whose declared @font-face weights do not include that weight. Cites file,
// line, weight, and font stack. Does not flag weights with a matching face.

function ruleSyntheticBold(file) {
  const lines = readLines(file);
  lines.forEach((text, i) => {
    // Match CSS `font-weight: 600` or JSX `fontWeight: 600` / `fontWeight={600}`.
    const weightRe = /font-?weight\s*[:=]\s*\{?\s*(\d{3})\b/gi;
    let m;
    while ((m = weightRe.exec(text)) !== null) {
      const weight = parseInt(m[1], 10);
      if (weight < 600) continue; // only 600+ can be synthetic
      // Determine the font family context. Look at the same line first, then
      // scan a small window upward for a fontFamily/font-family declaration.
      const family = resolveFontFamily(lines, i, text);
      if (!family) continue; // can't determine family → don't guess
      const weights = knownWeightsForStack(family);
      if (!weights) continue; // unknown family (e.g. generic serif) → don't guess
      if (!weights.has(weight)) {
        addFinding(
          'SYNTHETIC_BOLD',
          file,
          i + 1,
          `${RULE_HINTS.SYNTHETIC_BOLD} (weight ${weight} on "${familySummary(family)}"; available: ${[...weights].join(', ')})`
        );
      }
    }
  });
}

function resolveFontFamily(lines, idx, currentLine) {
  // Prefer a family on the same line (common in inline style objects).
  const same = familyOnLine(currentLine);
  if (same) return same;
  // Scan up to 8 lines above for the nearest fontFamily declaration in the
  // same style block. This is a best-effort heuristic, not a full scope solver.
  for (let j = idx - 1; j >= Math.max(0, idx - 8); j -= 1) {
    const f = familyOnLine(lines[j]);
    if (f) return f;
  }
  return null;
}

function familyOnLine(text) {
  const re = /font-?family\s*:\s*([^;}]+)/i;
  const m = text.match(re);
  if (m) return m[1].trim();
  return null;
}

function knownWeightsForStack(stack) {
  // Lowercase the stack and intersect with known families. If ANY recognized
  // family in the stack ships the weight, treat it as available (CSS fallback
  // means the browser will use a face that has it).
  const lower = stack.toLowerCase();
  const families = Object.keys(FONT_WEIGHTS).filter((name) => lower.includes(name));
  if (families.length === 0) return null; // no recognized family → skip
  const union = new Set();
  for (const f of families) for (const w of FONT_WEIGHTS[f]) union.add(w);
  return union;
}

function familySummary(stack) {
  // First family name only, for a concise hint.
  return stack.split(',')[0].replace(/['"]/g, '').trim();
}

// ─── Rule: DUAL_ACCENT ──────────────────────────────────────────────────────
// Enforces 8조 rule 3 for concrete document renderers. Shared primitives may
// expose mutually exclusive variants; only a renderer composes an actual page.

function ruleDualAccent(file) {
  const relative = rel(file).split(path.sep).join('/');
  if (!relative.startsWith('src/components/templates/') && !isInjectedSource(file)) return;
  const lines = readLines(file);
  let hasDancheong = false;
  let hasJadeGold = false;
  const tokens = new Set();
  lines.forEach((text) => {
    if (DANCHEONG_TOKEN.test(text)) {
      hasDancheong = true;
      text.match(DANCHEONG_TOKEN)?.forEach((t) => tokens.add(t));
    }
    for (const { value } of parseHexes(text)) {
      if (DANCHEONG_HEX.has(value)) {
        hasDancheong = true;
        tokens.add(value);
      }
      if (JADE_GOLD_HEX.has(value)) {
        hasJadeGold = true;
        tokens.add(value);
      }
    }
    const jg = text.match(JADE_GOLD_TOKEN) ?? [];
    if (jg.length) {
      hasJadeGold = true;
      jg.forEach((t) => tokens.add(t));
    }
  });
  if (hasDancheong && hasJadeGold) {
    addFinding(
      'DUAL_ACCENT',
      file,
      1,
      `${RULE_HINTS.DUAL_ACCENT} (found: ${[...tokens].join(', ')})`
    );
  }
}

// ─── Run all rules over all files ───────────────────────────────────────────

const RULES = [
  rulePermitFormat,
  ruleRgbaUsage,
  rulePureWhite,
  ruleCoolGray,
  ruleRawUnicodeEscape,
  ruleDecorativeHanja,
  ruleUnmanagedToken,
  ruleDancheongBudget,
  ruleSyntheticBold,
  ruleDualAccent,
];

for (const file of scanFiles) {
  for (const rule of RULES) {
    try {
      rule(file);
    } catch (err) {
      // A skipped blocking rule would create a blind spot, so it fails the gate.
      findings.push({
        severity: 'error',
        rule: 'INTERNAL',
        file: rel(file),
        line: 0,
        hint: `rule ${rule.name} failed: ${err.message}`,
      });
    }
  }
}

// ─── Report ─────────────────────────────────────────────────────────────────

// Stable sort: by file, then line, then rule — so output is deterministic and
// greppable (VAL-GUARD-012-style determinism is valuable here too).
findings.sort((a, b) => {
  if (a.file !== b.file) return a.file < b.file ? -1 : 1;
  if ((a.line ?? 0) !== (b.line ?? 0)) return (a.line ?? 0) - (b.line ?? 0);
  return a.rule < b.rule ? -1 : a.rule > b.rule ? 1 : 0;
});

const counts = { error: 0, warn: 0, info: 0 };
for (const f of findings) counts[f.severity] += 1;

const BANNER = 'design-guard — 삿갓 8조 static analysis (strict mode)';

const lines = [];
lines.push(BANNER);
lines.push('');
lines.push('Legend: <severity> <RULE_ID> <file>:<line> — <hint>');
lines.push('');

if (findings.length === 0) {
  lines.push('No findings. All scanned files satisfy the 8 design rules.');
} else {
  for (const f of findings) {
    const loc = f.line ? `${f.file}:${f.line}` : f.file;
    lines.push(`${f.severity.toUpperCase().padEnd(5)} ${f.rule.padEnd(18)} ${loc} — ${f.hint}`);
  }
}

lines.push('');
const exitCode = counts.error > 0 ? 1 : 0;
lines.push(
  `Summary: ${counts.error} error(s), ${counts.warn} advisory warning(s), ${counts.info} permitted — ` +
    `${findings.length} finding(s) across ${scanFiles.length} scanned file(s). ` +
    `Exit ${exitCode}.`
);

console.log(lines.join('\n'));

process.exitCode = exitCode;
