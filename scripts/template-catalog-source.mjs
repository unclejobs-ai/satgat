import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

function unwrapExpression(node) {
  let current = node;
  while (
    current &&
    (ts.isSatisfiesExpression(current) ||
      ts.isAsExpression(current) ||
      ts.isParenthesizedExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function propertiesOf(node) {
  const object = unwrapExpression(node);
  if (!object || !ts.isObjectLiteralExpression(object)) return null;
  return new Map(
    object.properties.flatMap((property) => {
      if (!ts.isPropertyAssignment(property)) return [];
      const name = propertyName(property.name);
      return name ? [[name, property.initializer]] : [];
    }),
  );
}

function literalString(node, label, file) {
  const value = unwrapExpression(node);
  if (!value || !ts.isStringLiteralLike(value)) {
    throw new Error(`${file}: ${label} must be a literal string`);
  }
  return value.text;
}

function literalBoolean(node, label, file) {
  const value = unwrapExpression(node);
  if (value?.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (value?.kind === ts.SyntaxKind.FalseKeyword) return false;
  throw new Error(`${file}: ${label} must be a literal boolean`);
}

function assertCanonicalSlug(id, file) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`${file}: id must be a canonical lowercase slug`);
  }
}

function readCanonicalTemplateIds(root) {
  const filePath = path.join(root, 'src/lib/templates/types.ts');
  const sourceFile = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  let initializer;
  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'TEMPLATE_IDS'
    ) {
      initializer = unwrapExpression(node.initializer);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return literalStringArray(initializer, 'TEMPLATE_IDS', path.relative(root, filePath));
}

function literalStringArray(node, label, file) {
  const value = unwrapExpression(node);
  if (!value || !ts.isArrayLiteralExpression(value)) {
    throw new Error(`${file}: ${label} must be an array of literal strings`);
  }
  return value.elements.map((entry, index) => literalString(entry, `${label}[${index}]`, file));
}

function findTemplateDeclaration(sourceFile, file) {
  const declarations = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      const object = propertiesOf(node.initializer);
      if (object?.has('id') && object.has('specimen')) {
        declarations.push({ exportName: node.name.text, fields: object });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  if (declarations.length !== 1) {
    throw new Error(`${file}: expected exactly one template object, found ${declarations.length}`);
  }
  return declarations[0];
}

function parseObjectArray(node, label, file, mapper) {
  const array = unwrapExpression(node);
  if (!array || !ts.isArrayLiteralExpression(array)) {
    throw new Error(`${file}: ${label} must be an array literal`);
  }
  return array.elements.map((entry, index) => {
    const fields = propertiesOf(entry);
    if (!fields) throw new Error(`${file}: ${label}[${index}] must be an object literal`);
    return mapper(fields, index);
  });
}

function readDefinitions({ definitionDir, validationMetadata }) {
  const root = process.cwd();
  const directory = definitionDir ?? path.join(root, 'src/lib/templates/definitions');
  const files = fs.readdirSync(directory).filter((file) => file.endsWith('.ts')).sort();
  const ids = new Set();

  const definitions = files.map((filename) => {
    const filePath = path.join(directory, filename);
    const file = path.relative(root, filePath);
    const sourceFile = ts.createSourceFile(
      filePath,
      fs.readFileSync(filePath, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const { exportName, fields } = findTemplateDeclaration(sourceFile, file);
    const specimenFields = propertiesOf(fields.get('specimen'));
    if (!specimenFields) throw new Error(`${file}: specimen must be an object literal`);

    const id = literalString(fields.get('id'), 'id', file);
    assertCanonicalSlug(id, file);
    if (ids.has(id)) throw new Error(`Duplicate template id "${id}" in ${file}`);
    ids.add(id);

    const catalog = {
      id,
      name: literalString(fields.get('name'), 'name', file),
      pageSpec: literalString(fields.get('pageSpec'), 'pageSpec', file),
      specimen: {
        title: literalString(specimenFields.get('title'), 'specimen.title', file),
        alt: literalString(specimenFields.get('alt'), 'specimen.alt', file),
        prompt: literalString(specimenFields.get('prompt'), 'specimen.prompt', file),
      },
    };
    if (!validationMetadata) return catalog;

    return {
      exportName,
      file,
      ...catalog,
      category: literalString(fields.get('category'), 'category', file),
      slots: parseObjectArray(fields.get('slots'), 'slots', file, (slot, index) => ({
        id: literalString(slot.get('id'), `slots[${index}].id`, file),
        type: literalString(slot.get('type'), `slots[${index}].type`, file),
        required: literalBoolean(slot.get('required'), `slots[${index}].required`, file),
      })),
      contentOutline: parseObjectArray(
        fields.get('contentOutline'),
        'contentOutline',
        file,
        (section, index) => ({
          type: literalString(section.get('type'), `contentOutline[${index}].type`, file),
          slots: literalStringArray(section.get('slots'), `contentOutline[${index}].slots`, file),
        }),
      ),
      promptSeeds: literalStringArray(fields.get('promptSeeds'), 'promptSeeds', file),
      factChecklist: literalStringArray(fields.get('factChecklist'), 'factChecklist', file),
    };
  });

  if (definitionDir) return definitions;
  const canonicalIds = readCanonicalTemplateIds(root);
  const definitionsById = new Map(definitions.map((definition) => [definition.id, definition]));
  const missing = canonicalIds.filter((id) => !definitionsById.has(id));
  const extra = definitions.map((definition) => definition.id).filter((id) => !canonicalIds.includes(id));
  if (missing.length || extra.length || canonicalIds.length !== definitions.length) {
    throw new Error(
      `Template definitions do not match canonical registry` +
      `${missing.length ? `; missing: ${missing.join(', ')}` : ''}` +
      `${extra.length ? `; extra: ${extra.join(', ')}` : ''}`,
    );
  }
  return canonicalIds.map((id) => definitionsById.get(id));
}

export function readTemplateDefinitionSources({ definitionDir } = {}) {
  return readDefinitions({ definitionDir, validationMetadata: true });
}

export function readTemplateCatalogSource({ definitionDir } = {}) {
  return readDefinitions({ definitionDir, validationMetadata: false });
}
