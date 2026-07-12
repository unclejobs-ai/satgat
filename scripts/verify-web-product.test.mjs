import fs from 'node:fs';
import { expect, test } from 'bun:test';
import {
  assertLandingMetrics,
  assertPreviewUrl,
  assertReadmeContract,
  assertTemplateCardWidth,
} from './verify-web-product.mjs';
import { validateRuntimeArtifacts } from './verify-template-catalog.mjs';

test('rejects a mobile card under the minimum readable width', () => {
  expect(() => assertTemplateCardWidth(155)).toThrow('156px');
  expect(() => assertTemplateCardWidth(156)).not.toThrow();
});

test('rejects content-bearing or non-opaque normal preview URLs', () => {
  expect(() => assertPreviewUrl('/ko/preview?data=eyJ0ZW1wbGF0ZUlkIjoicmVzdW1lIn0')).toThrow('opaque draft');
  expect(() => assertPreviewUrl('/ko/preview?draft=resume')).toThrow('opaque draft');
  expect(() => assertPreviewUrl('/ko/preview?draft=8dc1d22e-95cb-4f36-83a8-0112d0f28647')).not.toThrow();
});

test('rejects landing dimensions above approved budgets', () => {
  expect(() => assertLandingMetrics({ desktopHeight: 7501, mobileHeight: 12000 })).toThrow('7500px');
  expect(() => assertLandingMetrics({ desktopHeight: 7500, mobileHeight: 12000 })).not.toThrow();
});

test('rejects missing Report artifacts and legacy manifest fields', () => {
  const catalog = Array.from({ length: 13 }, (_, index) => ({
    id: `template-${index}`,
    pageSpec: 'a4Portrait',
  })).concat({ id: 'report', pageSpec: 'a4Portrait' });
  const manifest = catalog
    .filter(({ id }) => id !== 'report')
    .map(({ id, pageSpec }) => ({
      id,
      pageSpec,
      png: `${id}.png`,
      pdf: `${id}.pdf`,
      html: `${id}.html`,
    }));
  const artifactFiles = manifest.flatMap(({ png, pdf }) => [png, pdf]);
  const errors = validateRuntimeArtifacts(catalog, manifest, artifactFiles);
  expect(errors.some((error) => error.includes('14 manifest entries'))).toBe(true);
  expect(errors.some((error) => error.includes('report'))).toBe(true);
  expect(errors.some((error) => error.includes('legacy field \"html\"'))).toBe(true);
});

test('README exposes the current web product contract', () => {
  const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  expect(() => assertReadmeContract(readme)).not.toThrow();
});

test('rejects stale README transport and static-demo claims', () => {
  expect(() => assertReadmeContract('## 1분 안에 만들기\n?data=payload\nsatgat-ko.html')).toThrow(
    'README',
  );
});
