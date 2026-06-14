import { test, expect } from 'bun:test';
import { generateDocumentData, type SlotGenerator } from '@/lib/generation/document-generator';
import { getTemplate } from '@/lib/templates/registry';
import type { SatgatTemplate } from '@/lib/templates/types';

const resume = getTemplate('resume')!;
const brochure = getTemplate('product-brochure')!;

/** Fill every required slot with a schema-valid sample value for the given template. */
function validSlots(template: SatgatTemplate): Record<string, unknown> {
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
        slots[slot.id] = { url: 'https://example.com/a.png', alt: '대표 이미지' };
        break;
      case 'image-list':
        slots[slot.id] = [{ url: 'https://example.com/a.png', alt: '이미지' }];
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
