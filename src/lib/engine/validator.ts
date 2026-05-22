import { z } from 'zod';
import type { SatgatTemplate, SatgatDocumentData } from '@/lib/templates/types';

const SlotTypeSchema = z.enum([
  'text',
  'textarea',
  'image',
  'image-list',
  'list',
  'markdown',
  'table',
]);

const DocumentDataSchema = z.object({
  templateId: z.string(),
  title: z.string().optional(),
  slots: z.record(z.string(), z.unknown()),
});

/**
 * 문서 데이터가 템플릿의 slot 정의를 만족하는지 검증
 */
export function validateDocumentData(
  template: SatgatTemplate,
  data: SatgatDocumentData
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. 기본 shape 검증
  const parseResult = DocumentDataSchema.safeParse(data);
  if (!parseResult.success) {
    errors.push(...parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`));
    return { valid: false, errors };
  }

  // 2. templateId 일치
  if (data.templateId !== template.id) {
    errors.push(`templateId mismatch: expected "${template.id}", got "${data.templateId}"`);
  }

  // 3. required slot 존재 여부
  for (const slot of template.slots) {
    if (slot.required && !(slot.id in data.slots)) {
      errors.push(`Missing required slot: "${slot.id}" (${slot.label})`);
    }
  }

  // 4. 알 수 없는 slot 경고 (error 아님)
  const knownSlotIds = new Set(template.slots.map((s) => s.id));
  for (const slotId of Object.keys(data.slots)) {
    if (!knownSlotIds.has(slotId)) {
      errors.push(`Unknown slot: "${slotId}" (will be ignored)`);
    }
  }

  return { valid: errors.length === 0, errors };
}
