import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import type { SatgatTemplate, SatgatDocumentData, TemplateSlot } from '@/lib/templates/types';
import type { BrandProfile } from '@/lib/design-system/brand-resolver';
import { buildGenerationPrompt } from '@/lib/bridge/prompt-builder';
import { validateDocumentData } from '@/lib/engine/validator';
import { normalizeImageSlot } from '@/lib/engine/slot-image';

/**
 * AI 응답에서 JSON 객체를 추출
 */
function extractJsonObject(text: string): Record<string, unknown> {
  // 1. 코드 블록 안의 JSON 추출
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1]);
  }

  // 2. 텍스트 안의 첫 JSON object를 bracket depth로 추출
  const start = text.indexOf('{');
  if (start >= 0) {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < text.length; index += 1) {
      const char = text[index];

      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      if (char === '{') depth += 1;
      if (char === '}') depth -= 1;

      if (depth === 0) {
        return JSON.parse(text.slice(start, index + 1));
      }
    }
  }

  // 3. 전체 텍스트를 JSON으로 파싱 시도
  return JSON.parse(text);
}

function isEmptySlotValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.values(value).every(isEmptySlotValue);
  return false;
}

function compactPromptSummary(userPrompt: string): string {
  return userPrompt
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function fallbackForRequiredSlot(slot: TemplateSlot, userPrompt: string): unknown {
  const summary = compactPromptSummary(userPrompt);
  const textFallback = slot.placeholder || summary || slot.label;

  switch (slot.type) {
    case 'list':
      return [
        {
          title: slot.label,
          description: summary || slot.placeholder || slot.label,
        },
      ];
    case 'image':
      return undefined;
    case 'image-list':
      return [];
    case 'table':
      return {
        headers: [slot.label],
        rows: [[summary || slot.placeholder || slot.label]],
      };
    case 'text':
    case 'textarea':
    case 'markdown':
    default:
      return textFallback;
  }
}

function stringifySlotValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

function parseMaybeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeListItem(value: unknown): unknown {
  if (typeof value === 'string') {
    const parsed = parseMaybeJson(value);
    if (typeof parsed === 'number' || typeof parsed === 'boolean') return String(parsed);
    return parsed;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return value;
}

function normalizeListArray(value: unknown[]): unknown[] {
  return value.flatMap((item) => {
    const normalized = normalizeListItem(item);
    return Array.isArray(normalized) ? normalizeListArray(normalized) : [normalized];
  });
}

/**
 * slot 값을 템플릿 타입에 맞게 정규화
 */
function normalizeSlotValue(value: unknown, slotType: string): unknown {
  switch (slotType) {
    case 'list':
      if (Array.isArray(value)) return normalizeListArray(value);
      if (typeof value === 'string') {
        const parsed = parseMaybeJson(value);
        if (Array.isArray(parsed)) return normalizeListArray(parsed);
        if (parsed && typeof parsed === 'object') return [parsed];
        if (typeof parsed === 'string' && parsed.trim()) return [parsed.trim()];
        if (typeof parsed === 'number' || typeof parsed === 'boolean') return [String(parsed)];
      }
      if (typeof value === 'number' || typeof value === 'boolean') return [String(value)];
      if (value && typeof value === 'object') return [value];
      return [];

    case 'image':
      {
        const image = normalizeImageSlot(value);
        if (image) return { url: image.src, alt: image.alt };
      }
      return undefined;

    case 'image-list':
      if (Array.isArray(value)) {
        return value
          .map((item) => normalizeSlotValue(item, 'image'))
          .filter((item) => item !== undefined);
      }
      return [];

    case 'table':
      if (
        value &&
        typeof value === 'object' &&
        'headers' in (value as object) &&
        'rows' in (value as object) &&
        Array.isArray((value as { rows?: unknown }).rows) &&
        (value as { rows: unknown[] }).rows.length > 0
      ) {
        return value;
      }
      return undefined;

    case 'text':
    case 'textarea':
    case 'markdown':
    default:
      return stringifySlotValue(value);
  }
}

/**
 * AI로 문서 데이터 생성
 */
export async function generateDocumentData(
  template: SatgatTemplate,
  userPrompt: string,
  brandProfile?: BrandProfile | null
): Promise<SatgatDocumentData> {
  const systemPrompt = buildGenerationPrompt(template, userPrompt, brandProfile);

  const result = await generateText({
    model: google('gemini-2.5-flash'),
    system: '당신은 삿갓(Satgat) 문서 생성 엔진입니다. 항상 유효한 JSON만 출력하세요.',
    prompt: systemPrompt,
    temperature: 0.7,
  });

  const rawSlots = extractJsonObject(result.text);

  // slot 타입에 맞게 정규화
  const slots: Record<string, unknown> = {};
  for (const slot of template.slots) {
    if (slot.id in rawSlots) {
      const normalized = normalizeSlotValue(rawSlots[slot.id], slot.type);
      if (!isEmptySlotValue(normalized)) {
        slots[slot.id] = normalized;
        continue;
      }
    }

    if (slot.required) {
      const fallback = fallbackForRequiredSlot(slot, userPrompt);
      if (!isEmptySlotValue(fallback)) {
        slots[slot.id] = fallback;
      }
    }
  }

  const data = {
    templateId: template.id,
    slots,
  };

  const validation = validateDocumentData(template, data);
  if (!validation.valid) {
    throw new Error(`Generated document failed validation: ${validation.errors.join('; ')}`);
  }

  return data;
}
