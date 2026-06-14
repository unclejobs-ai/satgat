import { z } from 'zod';
import type { SatgatTemplate, TemplateSlot } from '@/lib/templates/types';

/**
 * 삿갓 구조화 출력 스키마 빌더
 *
 * 템플릿의 slot 정의로부터 Gemini structured-output(generateObject)용 zod 스키마를
 * 만든다. 핵심 제약:
 * - Gemini structured output은 닫힌 객체(closed object)만 허용한다. 자유로운
 *   `z.record`/additionalProperties는 쓸 수 없으므로 list 항목은 "알려진 필드의
 *   합집합"을 가진 닫힌 객체로 표현한다 (각 필드는 optional 문자열).
 * - image는 `{ url, alt }` 단일 객체 형태만 사용한다. `string | object` union 금지
 *   (Gemini가 표현하지 못한다).
 * - table은 `{ headers: string[], rows: string[][] }` 형태. rows는 반드시 배열의 배열
 *   (verify-template-catalog.mjs가 non-Array row를 거부한다).
 * - 선택 slot은 `.nullable().optional()` — 누락도, null도 허용해 결정적으로 비움 처리.
 *
 * 모델 출력은 이후 normalizeSlotValue/fallbackForRequiredSlot 후처리를 거치므로
 * 이 스키마는 "모델이 무엇을 반환할 수 있는가"의 계약이고, 렌더러가 읽는 최종
 * 형태는 정규화 단계가 보장한다.
 */

const imageObject = z.object({
  url: z.string(),
  alt: z.string(),
}).partial();

// 14개 템플릿의 list 항목 fixture에서 실제로 쓰이는 필드의 합집합.
// 새 템플릿이 새 필드를 쓰면 여기에 추가한다 (닫힌 스키마 유지).
const listItem = z.object({
  title: z.string(),
  description: z.string(),
  summary: z.string(),
  company: z.string(),
  role: z.string(),
  period: z.string(),
  school: z.string(),
  degree: z.string(),
  year: z.string(),
  event: z.string(),
  name: z.string(),
  background: z.string(),
  metric: z.string(),
  value: z.string(),
  label: z.string(),
  image: imageObject,
}).partial();

const tableObject = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

type SlotSchema = z.ZodTypeAny;

function baseSchemaForSlot(slot: TemplateSlot): SlotSchema {
  switch (slot.type) {
    case 'list':
      return z.array(listItem);
    case 'image':
      return imageObject;
    case 'image-list':
      return z.array(imageObject);
    case 'table':
      return tableObject;
    case 'text':
    case 'textarea':
    case 'markdown':
    default:
      return z.string();
  }
}

/** 단일 slot의 zod 스키마. 선택 slot은 누락/null 모두 허용. */
export function schemaForSlot(slot: TemplateSlot): SlotSchema {
  const base = baseSchemaForSlot(slot);
  return slot.required ? base : base.nullable().optional();
}

/**
 * 템플릿 전체의 slots 객체 스키마. generateObject에 그대로 전달한다.
 * 키는 slot.id, 값은 slot 타입별 Gemini-safe 스키마.
 */
export function buildSlotsSchema(template: SatgatTemplate): z.ZodObject<Record<string, SlotSchema>> {
  const shape: Record<string, SlotSchema> = {};
  for (const slot of template.slots) {
    shape[slot.id] = schemaForSlot(slot);
  }
  return z.object(shape);
}
