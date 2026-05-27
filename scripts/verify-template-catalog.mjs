import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { previewFixtures } from './template-preview-fixtures.mjs';

const root = process.cwd();
const definitionDir = path.join(root, 'src/lib/templates/definitions');
const registryPath = path.join(root, 'src/lib/templates/registry.ts');
const rendererPath = path.join(root, 'src/lib/engine/renderer.tsx');
const newClientPath = path.join(root, 'app/[lang]/new/NewDocumentClient.tsx');
const landingPath = path.join(root, 'public/satgat/satgat-ko.html');
const validFormats = new Set(['a4', 'a4-landscape', 'slide-16x9']);
const validSlotTypes = new Set(['text', 'textarea', 'image', 'image-list', 'list', 'markdown', 'table']);
const validSectionTypes = new Set([
  'hero',
  'text',
  'text-columns',
  'grid',
  'two-column',
  'image',
  'image-text',
  'table',
  'divider',
  'footer',
  'spacer',
]);

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

function stringArrayValues(node) {
  if (!node || !ts.isArrayLiteralExpression(node)) return [];
  return node.elements.map(stringLiteralValue).filter(Boolean);
}

function findObjectLiteral(sourceFile, variableName) {
  let found;

  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === variableName) {
      if (node.initializer && ts.isObjectLiteralExpression(node.initializer)) found = node.initializer;
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return found;
}

function objectKeys(sourceFile, variableName) {
  const objectLiteral = findObjectLiteral(sourceFile, variableName);
  if (!objectLiteral) return [];

  return objectLiteral.properties
    .map((property) => (ts.isPropertyAssignment(property) ? propNameText(property.name) : undefined))
    .filter(Boolean);
}

function parseTemplateDefinition(filePath) {
  const sourceFile = readSource(filePath);
  let templateObject;
  let exportName;

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      exportName = node.name.text;
      templateObject = node.initializer;
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  if (!templateObject) throw new Error(`No template object found in ${path.relative(root, filePath)}`);

  const fields = new Map();
  for (const property of templateObject.properties) {
    if (ts.isPropertyAssignment(property)) {
      fields.set(propNameText(property.name), property.initializer);
    }
  }

  const slots = [];
  const slotArray = fields.get('slots');
  if (slotArray && ts.isArrayLiteralExpression(slotArray)) {
    for (const slotNode of slotArray.elements) {
      if (!ts.isObjectLiteralExpression(slotNode)) continue;
      const slotFields = new Map();
      for (const property of slotNode.properties) {
        if (ts.isPropertyAssignment(property)) {
          slotFields.set(propNameText(property.name), property.initializer);
        }
      }
      slots.push({
        id: stringLiteralValue(slotFields.get('id')),
        type: stringLiteralValue(slotFields.get('type')),
        required: slotFields.get('required')?.kind === ts.SyntaxKind.TrueKeyword,
      });
    }
  }

  const sections = [];
  const sectionArray = fields.get('sections');
  if (sectionArray && ts.isArrayLiteralExpression(sectionArray)) {
    for (const sectionNode of sectionArray.elements) {
      if (!ts.isObjectLiteralExpression(sectionNode)) continue;
      const sectionFields = new Map();
      for (const property of sectionNode.properties) {
        if (ts.isPropertyAssignment(property)) {
          sectionFields.set(propNameText(property.name), property.initializer);
        }
      }
      sections.push({
        type: stringLiteralValue(sectionFields.get('type')),
        slots: stringArrayValues(sectionFields.get('slots')),
      });
    }
  }

  return {
    exportName,
    file: path.relative(root, filePath),
    id: stringLiteralValue(fields.get('id')),
    name: stringLiteralValue(fields.get('name')),
    format: stringLiteralValue(fields.get('format')),
    slots,
    sections,
  };
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

  return templatesObject.properties
    .map((property) => {
      if (!ts.isPropertyAssignment(property) || !ts.isComputedPropertyName(property.name)) return undefined;
      const expression = property.name.expression;
      if (!ts.isPropertyAccessExpression(expression) || expression.name.text !== 'id') return undefined;
      const definition = importToDefinition.get(expression.expression.getText(sourceFile));
      return definition?.id;
    })
    .filter(Boolean);
}

function parseRendererMap() {
  const sourceFile = readSource(rendererPath);
  const rendererObject = findObjectLiteral(sourceFile, 'renderers');
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

function parseTemplatePreviewCases() {
  const sourceFile = readSource(newClientPath);
  const cases = [];

  function visit(node) {
    if (ts.isCaseClause(node) && ts.isStringLiteralLike(node.expression)) cases.push(node.expression.text);
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return cases;
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

function isLikelyImageSource(value) {
  if (typeof value !== 'string') return false;
  return (
    value.startsWith('data:image/') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/') ||
    value.startsWith('./') ||
    value.startsWith('../') ||
    /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(value)
  );
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
    case 'markdown':
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
      if (!isLikelyImageSource(imageSourceFrom(value))) {
        errors.push(`${label} should be an image URL/data URL or image object`);
      }
      break;

    case 'image-list':
      if (!Array.isArray(value)) {
        errors.push(`${label} should be an image array`);
        break;
      }
      for (const [index, item] of value.entries()) {
        if (!isLikelyImageSource(imageSourceFrom(item))) {
          errors.push(`${label}[${index}] should be an image URL/data URL or image object`);
        }
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

const definitionFiles = fs
  .readdirSync(definitionDir)
  .filter((file) => file.endsWith('.ts'))
  .sort()
  .map((file) => path.join(definitionDir, file));
const definitions = definitionFiles.map(parseTemplateDefinition);
const definitionsByExport = new Map(definitions.map((definition) => [definition.exportName, definition]));
const definitionIds = definitions.map((definition) => definition.id).filter(Boolean).sort();
const registryIds = parseRegistryTemplates(definitionsByExport);
const registryIdsSorted = [...registryIds].sort();
const registrySource = readSource(registryPath);
const renderer = parseRendererMap();
const rendererIds = [...renderer.keys].sort();
const promptIds = objectKeys(readSource(newClientPath), 'TEMPLATE_PROMPTS').sort();
const checklistIds = objectKeys(readSource(newClientPath), 'TEMPLATE_CHECKLIST').sort();
const sealIds = objectKeys(registrySource, 'TEMPLATE_SEAL').sort();
const voiceIds = objectKeys(registrySource, 'TEMPLATE_VOICE').sort();
const previewIds = parseTemplatePreviewCases().sort();
const landingHtml = fs.readFileSync(landingPath, 'utf8');
const landingIds = [
  ...landingHtml.matchAll(/href="\/ko\/new\?template=([^"]+)"/g),
].map((match) => match[1]).sort();

const errors = [];

for (const definition of definitions) {
  const slotIds = definition.slots.map((slot) => slot.id).filter(Boolean);
  const duplicateSlotIds = slotIds.filter((id, index) => slotIds.indexOf(id) !== index);

  if (!definition.id) errors.push(`${definition.file} has no literal id`);
  if (!definition.name) errors.push(`${definition.file} has no literal name`);
  if (!validFormats.has(definition.format)) {
    errors.push(`${definition.file} uses invalid format "${definition.format}"`);
  }
  if (definition.slots.length === 0) errors.push(`${definition.file} has no slots`);
  if (definition.slots.some((slot) => !slot.id)) errors.push(`${definition.file} has a slot without literal id`);
  if (definition.slots.some((slot) => !validSlotTypes.has(slot.type))) {
    const invalid = definition.slots.filter((slot) => !validSlotTypes.has(slot.type)).map((slot) => `${slot.id}:${slot.type}`);
    errors.push(`${definition.file} has invalid slot type(s): ${invalid.join(', ')}`);
  }
  if (duplicateSlotIds.length) errors.push(`${definition.file} has duplicate slot id(s): ${[...new Set(duplicateSlotIds)].join(', ')}`);
  if (!definition.slots.some((slot) => slot.required)) errors.push(`${definition.file} has no required slots`);

  for (const section of definition.sections) {
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
assertSameSet('template seals', registryIdsSorted, sealIds, errors);
assertSameSet('template voices', registryIdsSorted, voiceIds, errors);
assertSameSet('new page prompt seeds', registryIdsSorted, promptIds, errors);
assertSameSet('new page checklist', registryIdsSorted, checklistIds, errors);
assertSameSet('new page mini previews', registryIdsSorted, previewIds, errors);
assertSameSet('Korean landing links', registryIdsSorted, [...new Set(landingIds)].sort(), errors);
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
  if (!importPath.startsWith('@/')) continue;
  const componentPath = path.join(root, importPath.replace('@/', 'src/'));
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
}

if (registryIds.length !== definitionIds.length) {
  errors.push(`registry count ${registryIds.length} does not match definition count ${definitionIds.length}`);
}

if (errors.length) {
  console.error('Template catalog verification failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Template catalog verified: ${registryIds.length} templates`);
