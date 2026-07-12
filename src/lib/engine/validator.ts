import { z } from 'zod';
import type { TemplateCatalogEntry } from '@/lib/templates/types';
import { buildSlotsSchema, MAX_PRIVATE_TRANSPORT_BYTES } from './slot-schema';

export { isSafeImageSource } from './slot-schema';


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
  template: TemplateCatalogEntry,
  data: unknown,
): { valid: boolean; errors: string[] } {
  const schema = z.object({
    templateId: z.literal(template.id),
    title: z.string().optional(),
    slots: buildSlotsSchema(template),
  }).strict().superRefine((document, context) => {
    const bytes = new TextEncoder().encode(JSON.stringify(document)).byteLength;
    if (bytes > MAX_PRIVATE_TRANSPORT_BYTES) {
      context.addIssue({
        code: 'custom',
        message: 'Document exceeds private preview transport capacity',
      });
    }
  });
  const parseResult = schema.safeParse(data);
  if (!parseResult.success) {
    return {
      valid: false,
      errors: parseResult.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    };
  }

  const errors: string[] = [];
  for (const slot of template.slots) {
    if (
      slot.required &&
      (!(slot.id in parseResult.data.slots) ||
        isMissingRequiredSlot(parseResult.data.slots[slot.id]))
    ) {
      errors.push(`Missing required slot: "${slot.id}" (${slot.label})`);
    }
  }
  return { valid: errors.length === 0, errors };
}
