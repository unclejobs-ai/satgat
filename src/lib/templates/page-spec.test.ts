import { expect, test } from 'bun:test';
import { PAGE_SPEC_IDS } from './types';
import { getPageSpec, PAGE_SPECS } from './registry';

test('defines all five physical page contracts', () => {
  const expected = {
    a4Portrait: {
      canvas: { widthMm: 210, heightMm: 297 },
      cssSize: '210mm 297mm',
    },
    a4Landscape: {
      canvas: { widthMm: 297, heightMm: 210 },
      cssSize: '297mm 210mm',
    },
    slide16x9: {
      canvas: { widthMm: 297, heightMm: 167 },
      cssSize: '297mm 167mm',
    },
    businessCard8Up: {
      canvas: { widthMm: 210, heightMm: 297 },
      cssSize: '210mm 297mm',
    },
    postcardPortrait: {
      canvas: { widthMm: 105, heightMm: 148 },
      cssSize: '105mm 148mm',
    },
  } as const;

  expect(Object.keys(PAGE_SPECS)).toEqual([...PAGE_SPEC_IDS]);

  for (const id of PAGE_SPEC_IDS) {
    const spec = getPageSpec(id);

    expect(spec.id).toBe(id);
    expect(spec.canvas).toEqual(expected[id].canvas);
    expect(spec.cssSize).toBe(expected[id].cssSize);
  }

  expect(getPageSpec('businessCard8Up').imposition).toEqual({
    columns: 2,
    rows: 4,
    cardWidthMm: 90,
    cardHeightMm: 55,
  });
});
