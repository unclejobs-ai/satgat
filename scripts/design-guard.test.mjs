/**
 * design-guard spike tests — validates the 6 rules + permit hatch against the
 * VAL-GUARD-002..008 detection matrices by injecting synthetic violations into
 * a temp dir and scanning them via the DESIGN_GUARD_SCAN hook (which the
 * production script honors). Runs against the real repo so node_modules
 * (typescript) resolves.
 *
 * Run: node scripts/design-guard.test.mjs
 * Exits 0 on all-pass, 1 on any failure.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const root = process.cwd();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'design-guard-spike-'));
let passed = 0;
let failed = 0;

function writeSpike(relName, content) {
  const full = path.join(tmp, relName);
  fs.writeFileSync(full, content);
  return full;
}

function clearSpikes() {
  for (const entry of fs.readdirSync(tmp)) {
    fs.rmSync(path.join(tmp, entry), { recursive: true, force: true });
  }
}

/**
 * Run design-guard with the spike dir added to the scan set. `grepFile` filters
 * the report to findings whose file path ends with the given basename.
 */
function runGuard(grepFile) {
  const result = spawnSync(
    'node',
    ['scripts/design-guard.mjs', '--check'],
    {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, DESIGN_GUARD_SCAN: tmp },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  return { ...parseReport(result.stdout ?? '', grepFile), status: result.status };
}

function parseReport(stdout, grepFile) {
  const findings = [];
  for (const line of stdout.split('\n')) {
    const m = line.match(/^(ERROR|WARN|INFO)\s+(\S+)\s+(\S+?):(\d+)\s+—\s+(.*)$/);
    if (m) {
      const sev = m[1].toLowerCase();
      findings.push({ severity: sev, rule: m[2], file: m[3], line: parseInt(m[4], 10), hint: m[5] });
    }
  }
  const filtered = grepFile ? findings.filter((f) => f.file.endsWith(grepFile)) : findings;
  return { findings: filtered, raw: stdout };
}

function assertOk(name, cond, detail) {
  if (cond) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

// ─── Test: strict baseline + readable report — VAL-GUARD-001/009 ────────────
function testStrictBaseline() {
  console.log('\n[VAL-GUARD-001/009] strict baseline exits 0, report is readable');
  const report = runGuard();
  assertOk('clean repository exits 0', report.status === 0, `status=${report.status}`);
  assertOk('report has banner', report.raw.includes('design-guard'));
  assertOk('report has summary line', report.raw.includes('Summary:'));
  assertOk('report has legend line', report.raw.includes('Legend:'));
}

// ─── Test: RGBA_USAGE — VAL-GUARD-002 ───────────────────────────────────────
function testRgbaUsage() {
  console.log('\n[VAL-GUARD-002] RGBA_USAGE detects rgba()');
  clearSpikes();
  writeSpike('SpikeRgba.tsx', [
    'export const SpikeRgba = () => (',
    '  <div style={{ background: "rgba(0,0,0,0.5)" }}>rgba spike</div>',
    ');',
    '',
  ].join('\n'));
  const report = runGuard('SpikeRgba.tsx');
  assertOk('spiked rgba produces RGBA_USAGE finding', report.findings.length >= 1, `got ${report.findings.length}`);
  assertOk('finding has a positive line number', report.findings.length > 0 && report.findings[0].line > 0);
}

// ─── Test: PURE_WHITE — VAL-GUARD-003 ───────────────────────────────────────
function testPureWhite() {
  console.log('\n[VAL-GUARD-003] PURE_WHITE detects pure white, exempts canvas/ivory');
  clearSpikes();
  writeSpike('SpikeWhite.tsx', [
    'export const SpikeWhite = () => (',
    '  <div',
    '    style={{',
    '      color: "#FFFFFF",',
    '      background: "#FFF",',
    '      border: "1px solid white",',
    '    }}',
    '  >',
    '    <span className="whiteSpace">no flag</span>',
    '  </div>',
    ');',
    '',
  ].join('\n'));
  const report = runGuard('SpikeWhite.tsx');
  assertOk('spiked pure white produces findings', report.findings.length >= 1, `got ${report.findings.length}`);
  // canvas #F7F7F2 and ivory #FFFFFB must NOT be flagged.
  clearSpikes();
  writeSpike('SpikeCanvas.tsx', [
    'export const SpikeCanvas = () => (',
    '  <div style={{ background: "#F7F7F2", color: "#FFFFFB" }}>canvas+ivory</div>',
    ');',
    '',
  ].join('\n'));
  const report2 = runGuard('SpikeCanvas.tsx');
  const pw = report2.findings.filter((f) => f.rule === 'PURE_WHITE');
  assertOk('canvas #F7F7F2 and ivory #FFFFFB are NOT flagged', pw.length === 0, `got ${pw.length}`);
}

// ─── Test: PURE_WHITE 4/8-digit hex — VAL-GUARD-003 ─────────────────────────
// The #rgba shorthand (#ffff) and #rrggbbaa (#ffffffff) pure-white literals
// must also be detected. Alpha is irrelevant — #ffffffff is pure white
// regardless. Regression for the parseHexes()/normalizeHex() extension.
function testPureWhiteAlphaHex() {
  console.log('\n[VAL-GUARD-003] PURE_WHITE detects 4-digit #ffff and 8-digit #ffffffff');
  // 4-digit pure-white shorthand #ffff → pure white (alpha irrelevant).
  clearSpikes();
  writeSpike('SpikeWhite4.tsx', [
    'export const SpikeWhite4 = () => (',
    '  <div style={{ color: "#ffff" }}>4-digit pure white</div>',
    ');',
    '',
  ].join('\n'));
  const report4 = runGuard('SpikeWhite4.tsx');
  const pw4 = report4.findings.filter((f) => f.rule === 'PURE_WHITE');
  assertOk('4-digit #ffff pure white is detected', pw4.length >= 1, `got ${pw4.length}`);
  // 8-digit pure-white #ffffffff → pure white (alpha irrelevant).
  clearSpikes();
  writeSpike('SpikeWhite8.tsx', [
    'export const SpikeWhite8 = () => (',
    '  <div style={{ color: "#ffffffff" }}>8-digit pure white</div>',
    ');',
    '',
  ].join('\n'));
  const report8 = runGuard('SpikeWhite8.tsx');
  const pw8 = report8.findings.filter((f) => f.rule === 'PURE_WHITE');
  assertOk('8-digit #ffffffff pure white is detected', pw8.length >= 1, `got ${pw8.length}`);
}

// ─── Test: DANCHEONG_BUDGET — VAL-GUARD-004 ─────────────────────────────────
function testDancheongBudget() {
  console.log('\n[VAL-GUARD-004] DANCHEONG_BUDGET warns on overuse');
  // Single dancheong hairline — should NOT warn (below threshold).
  clearSpikes();
  writeSpike('SpikeOne.tsx', [
    'export const SpikeOne = () => (',
    '  <div style={{ borderBottom: "1px solid #9B1B1B" }}>one hairline</div>',
    ');',
    '',
  ].join('\n'));
  const reportOne = runGuard('SpikeOne.tsx');
  const one = reportOne.findings.filter((f) => f.rule === 'DANCHEONG_BUDGET');
  assertOk('single dancheong hairline is NOT warned', one.length === 0, `got ${one.length}`);
  // Many dancheong uses — should warn.
  const many = Array.from({ length: 10 }, (_, i) =>
    `    <div key={${i}} style={{ borderBottom: "1px solid #9B1B1B", color: "#9B1B1B" }}>dancheong ${i}</div>`
  ).join('\n');
  writeSpike('SpikeMany.tsx', [
    'export const SpikeMany = () => (',
    '  <div>',
    many,
    '  </div>',
    ');',
    '',
  ].join('\n'));
  const reportMany = runGuard('SpikeMany.tsx');
  const manyHits = reportMany.findings.filter((f) => f.rule === 'DANCHEONG_BUDGET');
  assertOk('many dancheong uses trigger a warn', manyHits.length >= 1, `got ${manyHits.length}`);
}

// ─── Test: SYNTHETIC_BOLD — VAL-GUARD-005 ───────────────────────────────────
function testSyntheticBold() {
  console.log('\n[VAL-GUARD-005] SYNTHETIC_BOLD detects weight 600+ without @font-face');
  // 600 on Gowun Batang → synthetic (Gowun ships 400/700).
  clearSpikes();
  writeSpike('SpikeGowun600.tsx', [
    'export const SpikeGowun600 = () => (',
    '  <div style={{ fontFamily: "\'Gowun Batang\', serif", fontWeight: 600 }}>synthetic</div>',
    ');',
    '',
  ].join('\n'));
  const report600 = runGuard('SpikeGowun600.tsx');
  const hits600 = report600.findings.filter((f) => f.rule === 'SYNTHETIC_BOLD');
  assertOk('font-weight 600 on Gowun Batang → SYNTHETIC_BOLD', hits600.length >= 1, `got ${hits600.length}`);
  // 800 on Nanum Myeongjo → real weight (ships 800). No finding.
  clearSpikes();
  writeSpike('SpikeNanum800.tsx', [
    'export const SpikeNanum800 = () => (',
    '  <div style={{ fontFamily: "\'Nanum Myeongjo\', serif", fontWeight: 800 }}>real</div>',
    ');',
    '',
  ].join('\n'));
  const report800 = runGuard('SpikeNanum800.tsx');
  const hits800 = report800.findings.filter((f) => f.rule === 'SYNTHETIC_BOLD');
  assertOk('font-weight 800 on Nanum Myeongjo → NO finding', hits800.length === 0, `got ${hits800.length}`);
  // 700 on Gowun Batang → real weight (ships 700). No finding.
  clearSpikes();
  writeSpike('SpikeGowun700.tsx', [
    'export const SpikeGowun700 = () => (',
    '  <div style={{ fontFamily: "\'Gowun Batang\', serif", fontWeight: 700 }}>real</div>',
    ');',
    '',
  ].join('\n'));
  const report700 = runGuard('SpikeGowun700.tsx');
  const hits700 = report700.findings.filter((f) => f.rule === 'SYNTHETIC_BOLD');
  assertOk('font-weight 700 on Gowun Batang → NO finding', hits700.length === 0, `got ${hits700.length}`);
}

// ─── Test: COOL_GRAY — VAL-GUARD-006 ────────────────────────────────────────
function testCoolGray() {
  console.log('\n[VAL-GUARD-006] COOL_GRAY detects blue-dominant grays');
  // Cool grays (blue-dominant) → flag.
  clearSpikes();
  writeSpike('SpikeCool.tsx', [
    'export const SpikeCool = () => (',
    '  <div style={{ background: "#f3f4f6", color: "#6b7280", border: "#aeb8c0" }}>cool</div>',
    ');',
    '',
  ].join('\n'));
  const reportCool = runGuard('SpikeCool.tsx');
  const coolHits = reportCool.findings.filter((f) => f.rule === 'COOL_GRAY');
  assertOk('cool grays #f3f4f6/#6b7280/#aeb8c0 are flagged', coolHits.length >= 1, `got ${coolHits.length}`);
  // Warm grays (green/red dominant) → NO flag.
  clearSpikes();
  writeSpike('SpikeWarm.tsx', [
    'export const SpikeWarm = () => (',
    '  <div style={{ background: "#4D4B46", color: "#D2D6CB", border: "#73786F" }}>warm</div>',
    ');',
    '',
  ].join('\n'));
  const reportWarm = runGuard('SpikeWarm.tsx');
  const warmHits = reportWarm.findings.filter((f) => f.rule === 'COOL_GRAY');
  assertOk('warm grays #4D4B46/#D2D6CB/#73786F are NOT flagged', warmHits.length === 0, `got ${warmHits.length}`);
  // Accents jade/gold → NO flag (allowlisted).
  clearSpikes();
  writeSpike('SpikeAccent.tsx', [
    'export const SpikeAccent = () => (',
    '  <div style={{ background: "#2E6B5E", color: "#B8954F" }}>accents</div>',
    ');',
    '',
  ].join('\n'));
  const reportAccent = runGuard('SpikeAccent.tsx');
  const accentHits = reportAccent.findings.filter((f) => f.rule === 'COOL_GRAY');
  assertOk('accents jade #2E6B5E and gold #B8954F are NOT flagged', accentHits.length === 0, `got ${accentHits.length}`);
}

// ─── Test: DUAL_ACCENT — VAL-GUARD-007 ──────────────────────────────────────
function testDualAccent() {
  console.log('\n[VAL-GUARD-007] DUAL_ACCENT detects dancheong + jade/gold');
  // Both dancheong and jade → blocking error.
  clearSpikes();
  writeSpike('SpikeDual.tsx', [
    'export const SpikeDual = () => (',
    '  <div style={{ color: "#9B1B1B", borderBottom: "1px solid #2E6B5E" }}>dual</div>',
    ');',
    '',
  ].join('\n'));
  const reportDual = runGuard('SpikeDual.tsx');
  const dualHits = reportDual.findings.filter((f) => f.rule === 'DUAL_ACCENT');
  assertOk(
    'dancheong + jade together → blocking DUAL_ACCENT',
    reportDual.status === 1 && dualHits.some((finding) => finding.severity === 'error'),
    `status=${reportDual.status} hits=${JSON.stringify(dualHits)}`,
  );
  // Dancheong only → NO finding.
  clearSpikes();
  writeSpike('SpikeDanOnly.tsx', [
    'export const SpikeDanOnly = () => (',
    '  <div style={{ color: "#9B1B1B" }}>dancheong only</div>',
    ');',
    '',
  ].join('\n'));
  const reportDan = runGuard('SpikeDanOnly.tsx');
  const danHits = reportDan.findings.filter((f) => f.rule === 'DUAL_ACCENT');
  assertOk('dancheong only → NO finding', danHits.length === 0, `got ${danHits.length}`);
  // Jade only → NO finding.
  clearSpikes();
  writeSpike('SpikeJadeOnly.tsx', [
    'export const SpikeJadeOnly = () => (',
    '  <div style={{ color: "#2E6B5E" }}>jade only</div>',
    ');',
    '',
  ].join('\n'));
  const reportJade = runGuard('SpikeJadeOnly.tsx');
  const jadeHits = reportJade.findings.filter((f) => f.rule === 'DUAL_ACCENT');
  assertOk('jade only → NO finding', jadeHits.length === 0, `got ${jadeHits.length}`);
}

// ─── Test: active UI source contracts ───────────────────────────────────────
function testActiveUiSourceRules() {
  console.log('\n[VAL-GUARD-014] active UI source blocks escapes, Hanja, and raw tokens');

  clearSpikes();
  writeSpike('SpikeUnicode.tsx', 'export const SpikeUnicode = () => <p>{\"\\\\uD55C\"}</p>;\n');
  const unicode = runGuard('SpikeUnicode.tsx');
  assertOk(
    'literal Unicode escape is blocking',
    unicode.status === 1 &&
      unicode.findings.some((finding) => finding.rule === 'RAW_UNICODE_ESCAPE' && finding.severity === 'error'),
    JSON.stringify(unicode.findings),
  );

  clearSpikes();
  writeSpike('SpikeHanja.tsx', 'export const SpikeHanja = () => <p>提案</p>;\n');
  const hanja = runGuard('SpikeHanja.tsx');
  assertOk(
    'decorative literal Hanja is blocking',
    hanja.status === 1 &&
      hanja.findings.some((finding) => finding.rule === 'DECORATIVE_HANJA' && finding.severity === 'error'),
    JSON.stringify(hanja.findings),
  );

  clearSpikes();
  writeSpike('SpikeToken.tsx', 'export const SpikeToken = () => <p style={{ color: \"#123456\" }}>token</p>;\n');
  const token = runGuard('SpikeToken.tsx');
  assertOk(
    'raw UI color token is blocking',
    token.status === 1 &&
      token.findings.some((finding) => finding.rule === 'UNMANAGED_TOKEN' && finding.severity === 'error'),
    JSON.stringify(token.findings),
  );
}

// ─── Test: structured permit hatch — VAL-GUARD-008 ─────────────────────────
function testPermitHatch() {
  console.log('\n[VAL-GUARD-008] structured permits are exact, scoped, and auditable');
  clearSpikes();
  writeSpike('SpikePermit.tsx', [
    'export const SpikePermit = () => (',
    '  <div style={{ background: \"rgba(0,0,0,0.5)\" }} // satgat-allow: RGBA_USAGE ticket=SATGAT-123 reason=print-font-override',
    '  >permitted</div>',
    ');',
    '',
  ].join('\n'));
  const permitted = runGuard('SpikePermit.tsx');
  const permittedRgba = permitted.findings.filter((finding) => finding.rule === 'RGBA_USAGE');
  assertOk(
    'valid permit suppresses one matching rule to info',
    permitted.status === 0 &&
      permittedRgba.some((finding) => finding.severity === 'info') &&
      permittedRgba.every((finding) => finding.severity !== 'error'),
    `status=${permitted.status} findings=${JSON.stringify(permittedRgba)}`,
  );

  clearSpikes();
  writeSpike('SpikeMalformedPermit.tsx', [
    'export const SpikeMalformedPermit = () => (',
    '  <div style={{ background: \"rgba(0,0,0,0.5)\" }} // satgat-allow: RGBA_USAGE ticket=SATGAT-123',
    '  >rejected</div>',
    ');',
    '',
  ].join('\n'));
  const malformed = runGuard('SpikeMalformedPermit.tsx');
  assertOk(
    'permit missing a required field is blocking',
    malformed.status === 1 &&
      malformed.findings.some((finding) => finding.rule === 'PERMIT_FORMAT' && finding.severity === 'error') &&
      malformed.findings.some((finding) => finding.rule === 'RGBA_USAGE' && finding.severity === 'error'),
    `status=${malformed.status} findings=${JSON.stringify(malformed.findings)}`,
  );

  clearSpikes();
  writeSpike('SpikeWrongRulePermit.tsx', [
    'export const SpikeWrongRulePermit = () => (',
    '  <div style={{ background: \"rgba(0,0,0,0.5)\" }} // satgat-allow: PURE_WHITE ticket=SATGAT-124 reason=print-font-override',
    '  >rejected</div>',
    ');',
    '',
  ].join('\n'));
  const wrongRule = runGuard('SpikeWrongRulePermit.tsx');
  assertOk(
    'permit cannot suppress a different rule',
    wrongRule.status === 1 &&
      wrongRule.findings.some((finding) => finding.rule === 'RGBA_USAGE' && finding.severity === 'error'),
    `status=${wrongRule.status} findings=${JSON.stringify(wrongRule.findings)}`,
  );

  clearSpikes();
  writeSpike('SpikeNoPermit.tsx', 'export const color = \"rgba(0,0,0,0.5)\";\n');
  const noPermit = runGuard('SpikeNoPermit.tsx');
  assertOk(
    'blocking violation without a permit exits 1',
    noPermit.status === 1 &&
      noPermit.findings.some((finding) => finding.rule === 'RGBA_USAGE' && finding.severity === 'error'),
    `status=${noPermit.status} findings=${JSON.stringify(noPermit.findings)}`,
  );
}

// ─── Test: density scanner — VAL-DENSITY-001/002/003/004/007/008/010/011/012 ─

function runDensity(args = [], env = {}) {
  return execFileSync('node', ['scripts/design-guard.mjs', '--check-density', ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}
 
function writeSyntheticRegistry(transform) {
  const registry = fs.readFileSync(path.join(root, 'src/lib/templates/registry.ts'), 'utf8');
  const syntheticPath = path.join(tmp, 'registry-density.ts');
  fs.writeFileSync(syntheticPath, transform(registry));
  return syntheticPath;
}

function testDensityRuns() {
  console.log('\n[VAL-DENSITY-001] --check-density exists and exits 0');
  let stdout;
  let exitOk = true;
  try {
    stdout = runDensity();
  } catch (err) {
    exitOk = false;
    stdout = err.stdout?.toString() ?? '';
  }
  assertOk('density scan exits 0', exitOk, 'non-zero exit');
  assertOk('density report has banner', stdout.includes('content-density scan'));
  assertOk('density report has summary line', stdout.includes('Summary:'));
}

function testDensityAll14() {
  console.log('\n[VAL-DENSITY-002] per-page density for all 14 registry templates');
  const stdout = runDensity();
  const templateRows = stdout.split('\n').filter((line) => line.startsWith('▸ ') && !line.startsWith('▸ sparse-control:'));
  assertOk('report contains exactly 14 registry template rows', templateRows.length === 14, `got ${templateRows.length}`);
  assertOk('summary reports 14 templates', stdout.includes('Summary: 14 templates'), 'wrong template count');
  // investor-deck must expand to multiple pages.
  const slideLines = stdout.split('\n').filter((l) => /page \d+\/\d+/.test(l) && /S\d/.test(l));
  assertOk('investor-deck expands to ≥5 pages', slideLines.length >= 5, `got ${slideLines.length} slide rows`);
}

function testDensitySparseControl() {
  console.log('\n[VAL-DENSITY-003] sparse control fixture is flagged SPARSE');
  let stdout;
  try {
    stdout = runDensity(['--sparse-control']);
  } catch (err) {
    stdout = err.stdout?.toString() ?? '';
  }
  assertOk('sparse control flagged SPARSE', stdout.includes('sparse-control') && stdout.includes('SPARSE'), 'no sparse flag on control');
  assertOk('sparse control fill < 50%', /sparse-control[\s\S]*fill (\d+\.\d+)%/.test(stdout) && parseFloat(stdout.match(/sparse-control[\s\S]*?fill (\d+\.\d+)/)?.[1] ?? '99') < 50, 'fill ≥ 50%');
}

function testDensityShippingClean() {
  console.log('\n[VAL-DENSITY-004] 14 shipping fixtures have 0 sparse warnings');
  const stdout = runDensity();
  const m = stdout.match(/(\d+) sparse warn\(s\) in shipping fixtures/);
  const sparseCount = m ? parseInt(m[1], 10) : -1;
  assertOk('0 sparse warns in shipping fixtures', sparseCount === 0, `got ${sparseCount}`);
}

function testDensityFormFactors() {
  console.log('\n[VAL-DENSITY-007] density preserves all five PageSpec identities');
  const stdout = runDensity();
  const expectedRows = [
    ['report', 'a4Portrait'],
    ['brand-onepager', 'a4Landscape'],
    ['investor-deck', 'slide16x9'],
    ['business-card', 'businessCard8Up'],
    ['invitation', 'postcardPortrait'],
  ];
  for (const [templateId, pageSpec] of expectedRows) {
    assertOk(
      `${templateId} uses ${pageSpec}`,
      stdout.includes(`▸ ${templateId} (${pageSpec})`),
      `missing exact ${pageSpec} label`,
    );
  }
  assertOk('landscape does not collapse to A4 portrait', !stdout.includes('▸ brand-onepager (a4Portrait)'));
  assertOk('slide does not collapse to A4 portrait', !stdout.includes('▸ investor-deck (a4Portrait)'));
  assertOk('business card does not collapse to A4 portrait', !stdout.includes('▸ business-card (a4Portrait)'));
  assertOk('postcard does not collapse to A4 portrait', !stdout.includes('▸ invitation (a4Portrait)'));
}

function testDensityReadsContentOutline() {
  console.log('\n[VAL-DENSITY-008] density reads contentOutline slot groups');
  const stdout = runDensity();
  const resumeFill = stdout.match(/▸ resume \(a4Portrait\)[^]*?fill (\d+\.\d+)%/)?.[1];
  assertOk(
    'resume contentOutline contributes non-zero density',
    Number.parseFloat(resumeFill ?? '0') > 0,
    `got ${resumeFill ?? 'no fill row'}`,
  );
}

function testDensityParsesPageSpecs() {
  console.log('\n[VAL-DENSITY-009] density geometry is parsed from PAGE_SPECS');
  const syntheticPath = writeSyntheticRegistry((registry) =>
    registry.replace(
      "canvas: { widthMm: 105, heightMm: 148 },",
      "canvas: { widthMm: 106, heightMm: 149 },",
    ),
  );
  const stdout = runDensity([], { DESIGN_GUARD_REGISTRY: syntheticPath });
  assertOk(
    'postcard canvas follows synthetic PAGE_SPECS geometry',
    stdout.includes('postcardPortrait 106×149mm'),
    'synthetic postcard dimensions were not reported',
  );
  assertOk(
    'business-card imposition is reported from PAGE_SPECS',
    stdout.includes('businessCard8Up 210×297mm (2×4, 90×55mm faces)'),
    'business-card imposition was not reported',
  );
}

function testDensityPhysicalBounds() {
  console.log('\n[VAL-DENSITY-011] postcard and business-card synthetic allowances stay physically bounded');
  const syntheticPath = writeSyntheticRegistry((registry) =>
    registry
      .replace(
        'imposition: { columns: 2, rows: 4, cardWidthMm: 90, cardHeightMm: 55 }',
        'imposition: { columns: 2, rows: 4, cardWidthMm: 90, cardHeightMm: 12 }',
      )
      .replace(
        "canvas: { widthMm: 105, heightMm: 148 },",
        "canvas: { widthMm: 105, heightMm: 12 },",
      ),
  );
  const stdout = runDensity([], { DESIGN_GUARD_REGISTRY: syntheticPath });
  for (const templateId of ['business-card', 'invitation', 'new-year-card']) {
    const section = stdout.match(new RegExp(`▸ ${templateId} \\([^\\n]+\\)\\n([\\s\\S]*?)(?=\\n▸ |\\n\\n|$)`))?.[1] ?? '';
    const fills = [...section.matchAll(/fill (\d+\.\d+)%/g)].map((match) => Number.parseFloat(match[1]));
    assertOk(
      `${templateId} density is capped at 100%`,
      fills.length > 0 && fills.every((fill) => fill <= 100),
      `got ${fills.join(', ') || 'no fill rows'}`,
    );
  }
}

function testPreviewSelectorsMatchPageSpecIds() {
  console.log('\n[VAL-DENSITY-013] preview selectors match emitted PageSpec classes');
  const preview = fs.readFileSync(path.join(root, 'app/[lang]/preview/PreviewClient.tsx'), 'utf8');
  assertOk('a4Landscape selector uses exact PageSpec ID', preview.includes('.preview-format-a4Landscape'));
  assertOk('slide16x9 selector uses exact PageSpec ID', preview.includes('.preview-format-slide16x9'));
  assertOk(
    'legacy kebab-case selectors are absent',
    !preview.includes('.preview-format-a4-landscape') && !preview.includes('.preview-format-slide-16x9'),
  );
}

function testDensityDeterminism() {
  console.log('\n[VAL-DENSITY-012] density output is deterministic across runs');
  const a = runDensity();
  const b = runDensity();
  assertOk('two runs produce identical output', a === b, 'outputs differ');
}

function testDensityOffline() {
  console.log('\n[VAL-DENSITY-010] density runs offline (no dev server)');
  // If we got here, runDensity() already succeeded without a dev server. This
  // asserts the command is directly node-invocable.
  let ok = true;
  try {
    runDensity();
  } catch {
    ok = false;
  }
  assertOk('density command runs from a cold shell (no server)', ok, 'failed');
}

// ─── Run all tests ──────────────────────────────────────────────────────────

testStrictBaseline();
testRgbaUsage();
testPureWhite();
testPureWhiteAlphaHex();
testDancheongBudget();
testSyntheticBold();
testCoolGray();
testDualAccent();
testActiveUiSourceRules();
testPermitHatch();
// Density (M2)
testDensityRuns();
testDensityAll14();
testDensitySparseControl();
testDensityShippingClean();
testDensityFormFactors();
testDensityReadsContentOutline();
testDensityParsesPageSpecs();
testDensityPhysicalBounds();
testPreviewSelectorsMatchPageSpecIds();
testDensityDeterminism();
testDensityOffline();

// Cleanup
fs.rmSync(tmp, { recursive: true, force: true });

console.log(`\n${'='.repeat(60)}`);
console.log(`design-guard spike tests: ${passed} passed, ${failed} failed`);
if (failed > 0) throw new Error(`${failed} design-guard spike test(s) failed`);
