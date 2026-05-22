import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import type { SatgatTemplate, SatgatDocumentData } from '@/lib/templates/types';
import type { BrandProfile } from '@/lib/design-system/brand-resolver';
import { buildGenerationPrompt } from '@/lib/bridge/prompt-builder';

/**
 * AI 응답에서 JSON 객체를 추출
 */
function extractJsonObject(text: string): Record<string, unknown> {
  // 1. 코드 블록 낶의 JSON 추출
  const codeBlockMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1]);
  }

  // 2. 중괄호로 감싸진 첫 번째 JSON 객체 추출
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  // 3. 전체 텍스트를 JSON으로 파싱 시도
  return JSON.parse(text);
}

/**
 * slot 값을 템플릿 타입에 맞게 정규화
 */
function normalizeSlotValue(value: unknown, slotType: string): unknown {
  switch (slotType) {
    case 'list':
      if (Array.isArray(value)) return value.map((v) => (typeof v === 'string' ? v : JSON.stringify(v)));
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed.map((v) => (typeof v === 'string' ? v : JSON.stringify(v)));
        } catch {
          return [value];
        }
      }
      return [];

    case 'image':
      if (typeof value === 'string') return { url: value, alt: '' };
      if (value && typeof value === 'object') return value;
      return undefined;

    case 'table':
      if (value && typeof value === 'object' && 'headers' in (value as object) && 'rows' in (value as object)) {
        return value;
      }
      return undefined;

    case 'text':
    case 'textarea':
    case 'markdown':
    default:
      return typeof value === 'string' ? value : String(value);
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
      slots[slot.id] = normalizeSlotValue(rawSlots[slot.id], slot.type);
    }
  }

  return {
    templateId: template.id,
    slots,
  };
}
