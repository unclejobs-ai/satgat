import { afterEach, expect, test } from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parseArgs, readConstraintValues, renderTokenCss } from './generate-design-tokens.mjs';

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })));
});

test('renders semantic canvas, ink, accent, and font variables', () => {
  const css = renderTokenCss({
    CANVAS: '#F7F7F2',
    IVORY: '#FFFFFB',
    INK: '#1C1916',
    INK_LIGHT: '#3A3833',
    INK_MUTED: '#4D4B46',
    HAIRLINE: '#D2D6CB',
    DANCHEONG: '#9B1B1B',
    FONT_MYEONGJO: "'Nanum Myeongjo', serif",
    FONT_BATANG: "'Gowun Batang', serif",
    FONT_DODUM: "'Gowun Dodum', sans-serif",
  });

  expect(css).toContain('--satgat-canvas: #F7F7F2;');
  expect(css).toContain('--satgat-surface: #FFFFFB;');
  expect(css).toContain('--satgat-ink: #1C1916;');
  expect(css).toContain('--satgat-accent: #9B1B1B;');
  expect(css).toContain("--satgat-font-display: 'Nanum Myeongjo', serif;");
  expect(css).not.toContain('rgba(');
  expect(css).not.toContain('--brand:');
});

test('normalizes solid color tokens to uppercase hex', () => {
  const css = renderTokenCss({
    CANVAS: '#f7f7f2',
    IVORY: '#fffffb',
    INK: '#1c1916',
    INK_LIGHT: '#3a3833',
    INK_MUTED: '#4d4b46',
    HAIRLINE: '#d2d6cb',
    DANCHEONG: '#9b1b1b',
    FONT_MYEONGJO: 'serif',
    FONT_BATANG: 'serif',
    FONT_DODUM: 'sans-serif',
  });
  expect(css).toContain('#F7F7F2');
  expect(css).not.toContain('#f7f7f2');
});

test('rejects non-solid colors and incomplete base values', () => {
  const base = {
    CANVAS: '#F7F7F2', IVORY: '#FFFFFB', INK: '#1C1916', INK_LIGHT: '#3A3833',
    INK_MUTED: '#4D4B46', HAIRLINE: '#D2D6CB', DANCHEONG: '#9B1B1B',
    FONT_MYEONGJO: 'serif', FONT_BATANG: 'serif', FONT_DODUM: 'sans-serif',
  };
  expect(() => renderTokenCss({ ...base, CANVAS: 'rgba(0,0,0,.5)' })).toThrow('solid hex');
  const missingCanvas = { ...base };
  delete missingCanvas.CANVAS;
  expect(() => renderTokenCss(missingCanvas)).toThrow('Missing token value: CANVAS');
});

test('reads only literal constraint exports', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'satgat-token-test-'));
  temporaryDirectories.push(directory);
  const file = path.join(directory, 'constraint.ts');
  await fs.writeFile(file, [
    "export const CANVAS = '#F7F7F2';",
    "export const IVORY = '#FFFFFB';",
    "export const INK = '#1C1916';",
    "export const INK_LIGHT = '#3A3833';",
    "export const INK_MUTED = '#4D4B46';",
    "export const HAIRLINE = '#D2D6CB';",
    "export const DANCHEONG = '#9B1B1B';",
    "export const FONT_MYEONGJO = 'serif';",
    "export const FONT_BATANG = 'serif';",
    "export const FONT_DODUM = 'sans-serif';",
  ].join('\n'));
  expect((await readConstraintValues(file)).CANVAS).toBe('#F7F7F2');

  await fs.appendFile(file, "\nexport const JADE = makeColor();\n");
  await expect(readConstraintValues(file)).rejects.toThrow('JADE must be a string literal');
});

test('accepts only explicit write and check commands', () => {
  expect(parseArgs(['--write'])).toBe('--write');
  expect(parseArgs(['--check'])).toBe('--check');
  expect(() => parseArgs([])).toThrow('Usage:');
  expect(() => parseArgs(['--write', '--check'])).toThrow('Usage:');
  expect(() => parseArgs(['--unknown'])).toThrow('Usage:');
});
