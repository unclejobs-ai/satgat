import { z } from 'zod';
import type { SatgatTemplate, SatgatDocumentData } from '@/lib/templates/types';

const DocumentDataSchema = z.object({
  templateId: z.string(),
  title: z.string().optional(),
  slots: z.record(z.string(), z.unknown()),
});

function isMissingRequiredSlot(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0 || value.every(isMissingRequiredSlot);
  if (typeof value === 'object') return Object.values(value).every(isMissingRequiredSlot);
  return false;
}

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
    if (slot.required && (!(slot.id in data.slots) || isMissingRequiredSlot(data.slots[slot.id]))) {
      errors.push(`Missing required slot: "${slot.id}" (${slot.label})`);
    }
  }

  return { valid: errors.length === 0, errors };
}
