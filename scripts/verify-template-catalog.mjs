import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { previewFixtures } from './template-preview-fixtures.mjs';
import { readTemplateDefinitionSources } from './template-catalog-source.mjs';
import { inspectPdfBytes, validatePng } from './render-template-specimens.mjs';

const root = process.cwd();
const registryPath = path.join(root, 'src/lib/templates/registry.ts');
const rendererPath = path.join(root, 'src/components/templates/runtime-catalog.tsx');
const PAGE_SPEC_IDS = new Set([
  'a4Portrait',
  'a4Landscape',
  'slide16x9',
  'businessCard8Up',
  'postcardPortrait',
]);
const PAGE_SPEC_MM = {
  a4Portrait: { width: 210, height: 297 },
  a4Landscape: { width: 297, height: 210 },
  slide16x9: { width: 297, height: 167 },
  businessCard8Up: { width: 210, height: 297 },
  postcardPortrait: { width: 105, height: 148 },
};
const TEMPLATE_CATEGORIES = new Set(['personal', 'business', 'occasion']);
const validSlotTypes = new Set(['text', 'textarea', 'image', 'list', 'table', 'visual']);
const validSectionTypes = new Set([
  'hero',
  'text',
  'grid',
  'two-column',
  'image-text',
  'table',
  'visual',
  'divider',
  'footer',
]);
const MAX_DATA_IMAGE_LENGTH = 1_500_000;
const LOCAL_IMAGE_PATH = /^\/(?!\/)[^\u0000-\u001f\\]*$/;
const RASTER_DATA_IMAGE = /^data:image\/(?:avif|gif|jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/i;

function readSource(filePath) {
  return ts.createSourceFile(filePath, fs.readFileSync(filePath, 'utf8'), ts.ScriptTarget.Latest, true);
}

function propNameText(name) {
  if (!name) return undefined;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return undefined;
}

function stringLiteralValue(node) {
  return node && ts.isStringLiteralLike(node) ? node.text : undefined;
}


function findObjectLiteral(sourceFile, variableName) {
  let found;

  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === variableName) {
      let initializer = node.initializer;
      while (
        initializer &&
        (ts.isSatisfiesExpression(initializer) ||
          ts.isAsExpression(initializer) ||
          ts.isParenthesizedExpression(initializer))
      ) {
        initializer = initializer.expression;
      }
      if (initializer && ts.isObjectLiteralExpression(initializer)) found = initializer;
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return found;
}



function parseRegistryTemplates(definitionsByExport) {
  const sourceFile = readSource(registryPath);
  const importToDefinition = new Map();

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const importPath = stringLiteralValue(statement.moduleSpecifier);
    if (!importPath?.startsWith('./definitions/')) continue;

    const namedBindings = statement.importClause?.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) continue;

    for (const specifier of namedBindings.elements) {
      const importedName = specifier.name.text;
      const definition = definitionsByExport.get(importedName);
      if (definition) importToDefinition.set(importedName, definition);
    }
  }

  const templatesObject = findObjectLiteral(sourceFile, 'templates');
  if (!templatesObject) return [];

  return templatesObject.properties.map((property) => {
    if (ts.isShorthandPropertyAssignment(property)) {
      return {
        key: property.name.text,
        definition: importToDefinition.get(property.name.text),
      };
    }
    if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.initializer)) {
      return { key: ts.isPropertyAssignment(property) ? propNameText(property.name) : undefined };
    }
    return {
      key: propNameText(property.name),
      definition: importToDefinition.get(property.initializer.text),
    };
  });
}

function parseRendererMap() {
  const sourceFile = readSource(rendererPath);
  const rendererObject = findObjectLiteral(sourceFile, 'RENDERERS');
  const keys = [];
  const imports = new Map();

  if (!rendererObject) return { keys, imports };

  for (const property of rendererObject.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const key = propNameText(property.name);
    if (!key) continue;
    keys.push(key);

    let importPath;
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        importPath = stringLiteralValue(node.arguments[0]);
      }
      ts.forEachChild(node, visit);
    }
    visit(property.initializer);
    if (importPath) imports.set(key, importPath);
  }

  return { keys, imports };
}


function collectRendererSlotReads(filePath) {
  const sourceFile = readSource(filePath);
  const reads = new Set();

  function visit(node) {
    if (
      ts.isElementAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 's' &&
      ts.isStringLiteralLike(node.argumentExpression)
    ) {
      reads.add(node.argumentExpression.text);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return reads;
}

function sourceContainsStringLiteral(filePath, value) {
  const source = fs.readFileSync(filePath, 'utf8');
  return source.includes(`'${value}'`) || source.includes(`"${value}"`) || source.includes(`\`${value}\``);
}

function isEmptyFixtureValue(value) {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.values(value).every(isEmptyFixtureValue);
  return false;
}

function decodedLocalImagePath(source) {
  let localPath = source.split(/[?#]/, 1)[0];
  try {
    for (let pass = 0; pass < 2; pass += 1) {
      const decoded = decodeURIComponent(localPath);
      if (decoded === localPath) break;
      localPath = decoded;
    }
  } catch {
    return null;
  }
  return LOCAL_IMAGE_PATH.test(localPath) ? localPath : null;
}

export function isSafeFixtureImageSource(value) {
  if (typeof value !== 'string') return false;
  const source = value.trim();
  const dataImage = source.match(RASTER_DATA_IMAGE);
  if (dataImage) {
    return source.length <= MAX_DATA_IMAGE_LENGTH && dataImage[1].length % 4 === 0;
  }
  if (!LOCAL_IMAGE_PATH.test(source)) return false;
  const localPath = decodedLocalImagePath(source);
  return localPath !== null && !/\.svg(?:\/|$)/i.test(localPath);
}

function imageSourceFrom(value) {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
  return String(value.url ?? value.src ?? value.image_url ?? value.image ?? '').trim();
}

function encodedPreviewPayloadLength(templateId, slots) {
  return Buffer.from(JSON.stringify({ templateId, slots }), 'utf8').toString('base64url').length;
}

function validateFixtureSlotValue(templateId, slot, value, errors) {
  const label = `fixture "${templateId}.${slot.id}"`;
  if (slot.required && isEmptyFixtureValue(value)) {
    errors.push(`${label} is required but empty`);
    return;
  }
  if (!slot.required && isEmptyFixtureValue(value)) return;

  switch (slot.type) {
    case 'text':
    case 'textarea':
      if (typeof value !== 'string') errors.push(`${label} should be a string`);
      break;

    case 'list':
      if (!Array.isArray(value)) {
        errors.push(`${label} should be an array`);
        break;
      }
      for (const [index, item] of value.entries()) {
        if (typeof item === 'string') {
          errors.push(`${label}[${index}] should be an object fixture, not a string list item`);
          continue;
        }
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          errors.push(`${label}[${index}] should be an object`);
          continue;
        }
        if (Object.values(item).every(isEmptyFixtureValue)) {
          errors.push(`${label}[${index}] has no content`);
        }
      }
      break;

    case 'image':
      if (!isSafeFixtureImageSource(imageSourceFrom(value))) {
        errors.push(`${label} should use a safe root-relative path or bounded raster data URL`);
      }
      break;

    case 'table':
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        errors.push(`${label} should be a table object`);
        break;
      }
      if (!Array.isArray(value.headers) || !Array.isArray(value.rows)) {
        errors.push(`${label} should have headers[] and rows[]`);
        break;
      }
      if (slot.required && value.rows.length === 0) errors.push(`${label} is required but has no rows`);
      for (const [rowIndex, row] of value.rows.entries()) {
        if (!Array.isArray(row)) errors.push(`${label}.rows[${rowIndex}] should be an array`);
      }
      break;

    case 'visual':
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        errors.push(`${label} should be a visual object`);
        break;
      }
      if (typeof value.kind !== 'string' || !value.kind.trim()) {
        errors.push(`${label} should have a kind`);
      }
      if (
        value.data !== undefined &&
        (!Array.isArray(value.data) || value.data.some((item) => !item || typeof item !== 'object' || Array.isArray(item)))
      ) {
        errors.push(`${label}.data should be an array of objects`);
      }
      if (value.steps !== undefined && !Array.isArray(value.steps)) {
        errors.push(`${label}.steps should be an array`);
      }
      break;

    default:
      errors.push(`${label} has unsupported slot type "${slot.type}"`);
  }
}

function assertSameSet(label, expected, actual, errors) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const missing = [...expectedSet].filter((id) => !actualSet.has(id));
  const extra = [...actualSet].filter((id) => !expectedSet.has(id));

  if (missing.length) errors.push(`${label} missing: ${missing.join(', ')}`);
  if (extra.length) errors.push(`${label} extra: ${extra.join(', ')}`);
}

export function validateRuntimeArtifacts(catalog, manifest, artifactFiles) {
  const errors = [];
  if (!Array.isArray(manifest)) {
    return ['runtime specimen manifest must be an array with 14 manifest entries'];
  }
  if (manifest.length !== 14) {
    errors.push(`runtime specimen manifest requires exactly 14 manifest entries; found ${manifest.length}`);
  }

  const catalogById = new Map(catalog.map((entry) => [entry.id, entry]));
  const manifestIds = [];
  for (const entry of manifest) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push('runtime specimen manifest contains a non-object entry');
      continue;
    }
    const id = typeof entry.id === 'string' ? entry.id : '';
    manifestIds.push(id);
    const expected = catalogById.get(id);
    if (!expected) {
      errors.push(`runtime specimen manifest contains unknown id "${id}"`);
      continue;
    }
    if (entry.pageSpec !== expected.pageSpec) {
      errors.push(`runtime specimen "${id}" pageSpec "${entry.pageSpec}" does not match "${expected.pageSpec}"`);
    }
    for (const field of ['html', 'layout']) {
      if (Object.hasOwn(entry, field)) {
        errors.push(`runtime specimen "${id}" retains legacy field "${field}"`);
      }
    }
    for (const [field, extension] of [['png', 'png'], ['pdf', 'pdf']]) {
      const expectedFilename = `${id}.${extension}`;
      if (entry[field] !== expectedFilename) {
        errors.push(`runtime specimen "${id}" ${field} path must be "${expectedFilename}"`);
      }
    }
  }

  const expectedIds = [...catalogById.keys()].sort();
  const actualIds = manifestIds.filter(Boolean).sort();
  assertSameSet('runtime specimen manifest', expectedIds, actualIds, errors);
  if (!actualIds.includes('report')) {
    errors.push('runtime specimen manifest is missing report');
  }

  const pngFiles = artifactFiles.filter((file) => file.endsWith('.png')).sort();
  const pdfFiles = artifactFiles.filter((file) => file.endsWith('.pdf')).sort();
  if (pngFiles.length !== 14) errors.push(`runtime artifacts require exactly 14 PNG paths; found ${pngFiles.length}`);
  if (pdfFiles.length !== 14) errors.push(`runtime artifacts require exactly 14 PDF paths; found ${pdfFiles.length}`);
  assertSameSet('runtime PNG artifacts', expectedIds.map((id) => `${id}.png`).sort(), pngFiles, errors);
  assertSameSet('runtime PDF artifacts', expectedIds.map((id) => `${id}.pdf`).sort(), pdfFiles, errors);
  return errors;
}

export function validateRuntimeArtifactContents(catalog, manifest, readArtifact) {
  const errors = [];
  const catalogById = new Map(catalog.map((entry) => [entry.id, entry]));
  for (const entry of manifest) {
    const expected = catalogById.get(entry?.id);
    if (!expected) continue;
    for (const field of ['title', 'alt', 'prompt']) {
      if (entry[field] !== expected.specimen?.[field]) {
        errors.push(`runtime specimen "${entry.id}" ${field} does not match its template definition`);
      }
    }
    for (const field of ['width', 'height', 'pageCount']) {
      if (!Number.isInteger(entry[field]) || entry[field] < 1) {
        errors.push(`runtime specimen "${entry.id}" ${field} must be a positive integer`);
      }
    }
    try {
      const dimensions = validatePng(readArtifact(entry.png));
      if (dimensions.width !== entry.width || dimensions.height !== entry.height) {
        errors.push(
          `runtime specimen "${entry.id}" PNG dimensions ${dimensions.width}x${dimensions.height} ` +
          `do not match manifest ${entry.width}x${entry.height}`,
        );
      }
    } catch (error) {
      errors.push(
        `runtime specimen "${entry.id}" PNG is invalid: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    try {
      const pdf = inspectPdfBytes(readArtifact(entry.pdf));
      if (pdf.pageCount !== entry.pageCount) {
        errors.push(
          `runtime specimen "${entry.id}" PDF page count ${pdf.pageCount} ` +
          `does not match manifest ${entry.pageCount}`,
        );
      }
      const geometry = PAGE_SPEC_MM[entry.pageSpec];
      if (!geometry) {
        errors.push(`runtime specimen "${entry.id}" has unknown PageSpec geometry "${entry.pageSpec}"`);
        continue;
      }
      const expectedWidth = geometry.width * 72 / 25.4;
      const expectedHeight = geometry.height * 72 / 25.4;
      for (const [index, box] of pdf.mediaBoxes.entries()) {
        if (
          Math.abs(box.width - expectedWidth) > 1 ||
          Math.abs(box.height - expectedHeight) > 1
        ) {
          errors.push(
            `runtime specimen "${entry.id}" PDF page ${index + 1} MediaBox ` +
            `${box.width}x${box.height} does not match ${entry.pageSpec}`,
          );
        }
      }
    } catch (error) {
      errors.push(
        `runtime specimen "${entry.id}" PDF is invalid: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return errors;
}

export function verifyTemplateCatalog() {
const definitions = readTemplateDefinitionSources();
const definitionsByExport = new Map(definitions.map((definition) => [definition.exportName, definition]));
const definitionIds = definitions.map((definition) => definition.id).sort();
const registryEntries = parseRegistryTemplates(definitionsByExport);
const registryIds = registryEntries.map((entry) => entry.definition?.id).filter(Boolean);
const registryIdsSorted = [...registryIds].sort();
const renderer = parseRendererMap();
const rendererIds = [...renderer.keys].sort();

const errors = [];
const artifactDirectory = path.join(root, 'public/satgat/assets/examples/ko');
const manifestPath = path.join(artifactDirectory, 'manifest.json');
try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const artifactFiles = fs.readdirSync(artifactDirectory);
  errors.push(...validateRuntimeArtifacts(definitions, manifest, artifactFiles));
  errors.push(...validateRuntimeArtifactContents(
    definitions,
    manifest,
    (filename) => fs.readFileSync(path.join(artifactDirectory, filename)),
  ));
} catch (error) {
  errors.push(
    `runtime specimen artifacts are unavailable: ${error instanceof Error ? error.message : String(error)}`,
  );
}

for (const entry of registryEntries) {
  if (!entry.key) {
    errors.push('registry templates contains an unsupported property');
  } else if (!entry.definition) {
    errors.push(`registry key "${entry.key}" does not reference an imported template definition`);
  } else if (entry.key !== entry.definition.id) {
    errors.push(
      `registry key "${entry.key}" references definition "${entry.definition.id}"`,
    );
  }
}
for (const definition of definitions) {
  const slotIds = definition.slots.map((slot) => slot.id).filter(Boolean);
  const duplicateSlotIds = slotIds.filter((id, index) => slotIds.indexOf(id) !== index);

  if (!definition.id) errors.push(`${definition.file} has no literal id`);
  if (!definition.name) errors.push(`${definition.file} has no literal name`);
  if (!TEMPLATE_CATEGORIES.has(definition.category)) {
    errors.push(`${definition.file} uses invalid category "${definition.category}"`);
  }
  if (!PAGE_SPEC_IDS.has(definition.pageSpec)) {
    errors.push(`${definition.file} uses invalid page spec "${definition.pageSpec}"`);
  }
  if (definition.slots.length === 0) errors.push(`${definition.file} has no slots`);
  if (definition.slots.some((slot) => !slot.id)) errors.push(`${definition.file} has a slot without literal id`);
  if (definition.slots.some((slot) => !validSlotTypes.has(slot.type))) {
    const invalid = definition.slots.filter((slot) => !validSlotTypes.has(slot.type)).map((slot) => `${slot.id}:${slot.type}`);
    errors.push(`${definition.file} has invalid slot type(s): ${invalid.join(', ')}`);
  }
  if (duplicateSlotIds.length) errors.push(`${definition.file} has duplicate slot id(s): ${[...new Set(duplicateSlotIds)].join(', ')}`);
  if (!definition.slots.some((slot) => slot.required)) errors.push(`${definition.file} has no required slots`);
  if (definition.promptSeeds.length === 0) errors.push(`${definition.file} has no prompt seeds`);
  if (definition.factChecklist.length === 0) errors.push(`${definition.file} has no fact checklist`);
  for (const field of ['title', 'alt', 'prompt']) {
    if (!definition.specimen[field]?.trim()) {
      errors.push(`${definition.file} has no specimen ${field}`);
    }
  }

  for (const section of definition.contentOutline) {
    if (!validSectionTypes.has(section.type)) {
      errors.push(`${definition.file} has invalid section type "${section.type}"`);
    }
    const undeclaredSectionSlots = section.slots.filter((slotId) => !slotIds.includes(slotId));
    if (undeclaredSectionSlots.length) {
      errors.push(`${definition.file} section references undeclared slot(s): ${undeclaredSectionSlots.join(', ')}`);
    }
  }
}

assertSameSet('registry templates', definitionIds, registryIdsSorted, errors);
assertSameSet('renderer map', registryIdsSorted, rendererIds, errors);
assertSameSet('preview fixtures', registryIdsSorted, Object.keys(previewFixtures).sort(), errors);

for (const definition of definitions) {
  if (!definition.id) continue;
  const fixture = previewFixtures[definition.id];
  if (!fixture) continue;

  const slotIds = definition.slots.map((slot) => slot.id).filter(Boolean);
  const fixtureSlotIds = Object.keys(fixture).sort();
  const missingFixtureSlots = slotIds.filter((slotId) => !fixtureSlotIds.includes(slotId));
  const extraFixtureSlots = fixtureSlotIds.filter((slotId) => !slotIds.includes(slotId));

  if (missingFixtureSlots.length) {
    errors.push(`fixture "${definition.id}" missing slot(s): ${missingFixtureSlots.join(', ')}`);
  }
  if (extraFixtureSlots.length) {
    errors.push(`fixture "${definition.id}" has undeclared slot(s): ${extraFixtureSlots.join(', ')}`);
  }

  for (const slot of definition.slots) {
    validateFixtureSlotValue(definition.id, slot, fixture[slot.id], errors);
  }

  const previewLength = encodedPreviewPayloadLength(definition.id, fixture);
  if (previewLength > 12000) {
    errors.push(`fixture "${definition.id}" preview payload is too large (${previewLength} chars)`);
  }
}

for (const [id, importPath] of renderer.imports) {
  const componentPath = importPath.startsWith('@/')
    ? path.join(root, importPath.replace('@/', 'src/'))
    : path.resolve(path.dirname(rendererPath), importPath);
  const rendererFile = fs.existsSync(`${componentPath}.tsx`)
    ? `${componentPath}.tsx`
    : fs.existsSync(`${componentPath}.ts`)
      ? `${componentPath}.ts`
      : undefined;

  if (!rendererFile) {
    errors.push(`renderer "${id}" points to missing component ${importPath}`);
    continue;
  }

  const definition = definitions.find((candidate) => candidate.id === id);
  if (!definition) continue;

  const slotIds = definition.slots.map((slot) => slot.id).filter(Boolean);
  const rendererReads = collectRendererSlotReads(rendererFile);
  const undeclaredReads = [...rendererReads].filter((slotId) => !slotIds.includes(slotId));
  if (undeclaredReads.length) {
    errors.push(`renderer "${id}" reads undeclared slot(s): ${undeclaredReads.join(', ')}`);
  }

  const missingRendererMentions = slotIds.filter((slotId) => !sourceContainsStringLiteral(rendererFile, slotId));
  if (missingRendererMentions.length) {
    errors.push(`renderer "${id}" does not mention declared slot(s): ${missingRendererMentions.join(', ')}`);
  }

  const outlineSlotIds = new Set(
    definition.contentOutline.flatMap((section) => section.slots),
  );
  const missingRequiredOutlineSlots = definition.slots
    .filter(
      (slot) =>
        slot.required &&
        sourceContainsStringLiteral(rendererFile, slot.id) &&
        !outlineSlotIds.has(slot.id),
    )
    .map((slot) => slot.id);
  if (missingRequiredOutlineSlots.length) {
    errors.push(
      `template "${id}" contentOutline omits required rendered slot(s): ${missingRequiredOutlineSlots.join(', ')}`,
    );
  }
}

if (registryIds.length !== definitionIds.length) {
  errors.push(`registry count ${registryIds.length} does not match definition count ${definitionIds.length}`);
}

if (errors.length) {
  throw new Error(`Template catalog verification failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}
return registryIds.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const count = verifyTemplateCatalog();
    console.log(`Template catalog verified: ${count} templates`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
