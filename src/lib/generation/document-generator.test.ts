import { test, expect } from 'bun:test';
import { toJSONSchema } from 'zod';
import { generateDocumentData, type SlotGenerator } from '@/lib/generation/document-generator';
import { getTemplate, listTemplates } from '@/lib/templates/registry';
import type { TemplateCatalogEntry } from '@/lib/templates/types';
import { buildGenerationSlotsSchema } from '@/lib/engine/slot-schema';

const resume = getTemplate('resume')!;
const brochure = getTemplate('product-brochure')!;

/** Fill every required slot with a schema-valid sample value for the given template. */
function validSlots(template: TemplateCatalogEntry): Record<string, unknown> {
  const slots: Record<string, unknown> = {};
  for (const slot of template.slots) {
    if (!slot.required) continue;
    switch (slot.type) {
      case 'list':
        slots[slot.id] = [{ title: '항목', description: '구체적인 내용' }];
        break;
      case 'table':
        slots[slot.id] = { headers: ['항목', '값'], rows: [['키', '내용']] };
        break;
      case 'image':
        slots[slot.id] = { url: '/images/a.png', alt: '대표 이미지' };
        break;
      case 'visual':
        slots[slot.id] = { kind: 'bar', data: [{ label: '항목', value: 1 }] };
        break;
      default:
        slots[slot.id] = `${slot.label} 샘플 값`;
    }
  }
  return slots;
}

test('schema-valid model output yields valid SatgatDocumentData', async () => {
  const generateSlots: SlotGenerator = async () => validSlots(resume);
  const data = await generateDocumentData(resume, '7년차 프론트엔드 이력서', null, { generateSlots });

  expect(data.templateId).toBe('resume');
  for (const slot of resume.slots) {
    if (slot.required) {
      expect(slot.id in data.slots).toBe(true);
    }
  }
});

test('schema-invalid (empty) FIRST response triggers bounded retry and recovers', async () => {
  let calls = 0;
  const generateSlots: SlotGenerator = async () => {
    calls += 1;
    if (calls === 1) return {}; // missing required slots → invalid → retry
    return validSlots(resume);
  };

  const data = await generateDocumentData(resume, '테스트', null, { generateSlots, maxRetries: 2 });
  expect(calls).toBe(2); // recovered on the second attempt, not the first
  expect(data.templateId).toBe('resume');
});

test('thrown (schema validation error) FIRST response is retried, then recovers', async () => {
  let calls = 0;
  const generateSlots: SlotGenerator = async () => {
    calls += 1;
    if (calls === 1) throw new Error('Gemini structured-output schema validation failed');
    return validSlots(resume);
  };

  const data = await generateDocumentData(resume, '테스트', null, { generateSlots });
  expect(calls).toBe(2);
  expect(data.templateId).toBe('resume');
});

test('persistent failure exhausts retries then falls back to required-slot fill', async () => {
  let calls = 0;
  const generateSlots: SlotGenerator = async () => {
    calls += 1;
    return {}; // always empty → never schema-valid
  };

  const data = await generateDocumentData(resume, '폴백 요청 본문', null, { generateSlots, maxRetries: 2 });
  expect(calls).toBe(3); // initial + 2 retries
  // fallback must satisfy validation (required slots filled deterministically)
  for (const slot of resume.slots) {
    if (slot.required) {
      expect(slot.id in data.slots).toBe(true);
    }
  }
});

test('list slots normalize to object items (verify-gate fixture contract)', async () => {
  const listSlot = resume.slots.find((s) => s.type === 'list' && s.required);
  expect(listSlot).toBeDefined();

  const generateSlots: SlotGenerator = async () => ({
    ...validSlots(resume),
    [listSlot!.id]: [{ company: '라운드테이블', role: '시니어 엔지니어', period: '2023 - 현재', description: '전환율 개선' }],
  });

  const data = await generateDocumentData(resume, '테스트', null, { generateSlots });
  const items = data.slots[listSlot!.id] as unknown[];
  expect(Array.isArray(items)).toBe(true);
  expect(items.length).toBeGreaterThan(0);
  expect(typeof items[0]).toBe('object');
  expect(Array.isArray(items[0])).toBe(false);
});

test('scalar list items normalize to closed object items', async () => {
  const listSlot = resume.slots.find((slot) => slot.type === 'list' && slot.required);
  expect(listSlot).toBeDefined();
  const generateSlots: SlotGenerator = async () => ({
    ...validSlots(resume),
    [listSlot!.id]: ['단일 경력 설명'],
  });

  const data = await generateDocumentData(resume, '테스트', null, { generateSlots });
  expect(data.slots[listSlot!.id]).toEqual([{ title: '단일 경력 설명' }]);
});

test('table row-objects normalize back to string[][]', async () => {
  const tableSlot = brochure.slots.find((s) => s.type === 'table');
  expect(tableSlot).toBeDefined();

  const generateSlots: SlotGenerator = async () => ({
    ...validSlots(brochure),
    // model returned row OBJECTS instead of arrays — normalizer must coerce to string[][]
    [tableSlot!.id]: { headers: ['항목', '사양'], rows: [{ k: '내지', v: '120g' }, { k: '크기', v: 'A5' }] },
  });

  const data = await generateDocumentData(brochure, '제품 소개서', null, { generateSlots });
  const table = data.slots[tableSlot!.id] as { headers: string[]; rows: unknown[] };
  expect(Array.isArray(table.rows)).toBe(true);
  for (const row of table.rows) {
    expect(Array.isArray(row)).toBe(true);
    for (const cell of row as unknown[]) {
      expect(typeof cell).toBe('string');
    }
  }
  expect((table.rows[0] as string[])).toEqual(['내지', '120g']);
});

test('malformed optional table is dropped without poisoning valid required brochure data', async () => {
  const generateSlots: SlotGenerator = async () => ({
    ...validSlots(brochure),
    specs: {
      headers: ['항목', '사양'],
      rows: [['용량']],
    },
  });

  const data = await generateDocumentData(brochure, '제품 소개서', null, {
    generateSlots,
    maxRetries: 0,
  });

  expect(data.templateId).toBe('product-brochure');
  expect(data.slots).not.toHaveProperty('specs');
});

test('unsafe required output is retried and replaced by a validated fallback', async () => {
  const listSlot = resume.slots.find((slot) => slot.type === 'list' && slot.required);
  expect(listSlot).toBeDefined();
  let calls = 0;
  const generateSlots: SlotGenerator = async () => {
    calls += 1;
    return {
      ...validSlots(resume),
      [listSlot!.id]: [{ title: '경력', image_url: 'https://tracker.example/pixel.png' }],
    };
  };

  const data = await generateDocumentData(resume, '테스트', null, { generateSlots, maxRetries: 1 });

  expect(calls).toBe(2);
  expect(JSON.stringify(data.slots[listSlot!.id])).not.toContain('tracker.example');
});

test('provider schemas stay closed and avoid unsupported non-null unions and records', () => {
  const hasUnsupportedShape = (value: unknown): boolean => {
    if (Array.isArray(value)) return value.some(hasUnsupportedShape);
    if (!value || typeof value !== 'object') return false;
    const object = value as Record<string, unknown>;
    if ('additionalProperties' in object && object.additionalProperties !== false) return true;
    if ('anyOf' in object) {
      const branches = object.anyOf;
      if (!Array.isArray(branches)) return true;
      const nonNullBranches = branches.filter(
        (branch) => !(
          branch &&
          typeof branch === 'object' &&
          (branch as Record<string, unknown>).type === 'null'
        ),
      );
      if (nonNullBranches.length !== 1 || nonNullBranches.length === branches.length) return true;
    }
    return Object.values(object).some(hasUnsupportedShape);
  };

  expect(hasUnsupportedShape({
    anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }],
  })).toBe(true);

  for (const template of listTemplates()) {
    expect(hasUnsupportedShape(toJSONSchema(buildGenerationSlotsSchema(template)))).toBe(false);
  }
});

test('total model failure (every attempt throws) rethrows the model error instead of fabricating a placeholder doc', async () => {
  let calls = 0;
  const generateSlots: SlotGenerator = async () => {
    calls += 1;
    throw new Error('Gemini API key invalid');
  };

  await expect(
    generateDocumentData(resume, '테스트', null, { generateSlots, maxRetries: 2 })
  ).rejects.toThrow('Gemini API key invalid');
  expect(calls).toBe(3); // initial + 2 retries, then rethrow — NOT a silent fallback success
});
