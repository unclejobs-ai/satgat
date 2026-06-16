import { z } from 'zod';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import type { SatgatTemplate, SatgatDocumentData, TemplateSlot } from '@/lib/templates/types';
import type { BrandProfile } from '@/lib/design-system/brand-resolver';
import { buildGenerationPrompt } from '@/lib/bridge/prompt-builder';
import { buildSlotsSchema } from '@/lib/generation/slot-schema';
import { validateDocumentData } from '@/lib/engine/validator';
import { normalizeImageSlot } from '@/lib/engine/slot-image';
import { normalizeVisualSlot } from '@/lib/engine/slot-visual';

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
    case 'visual':
      return undefined;
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

/** table row를 항상 문자열 배열로 강제. 모델이 객체 row를 주면 값들을 배열로 변환. */
function normalizeTableRow(row: unknown): string[] {
  if (Array.isArray(row)) return row.map(stringifySlotValue);
  if (row && typeof row === 'object') return Object.values(row).map(stringifySlotValue);
  return [stringifySlotValue(row)];
}

/**
 * slot 값을 템플릿 타입에 맞게 정규화 (모델 출력 후처리 안전망)
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
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const table = value as { headers?: unknown; rows?: unknown };
        const headers = Array.isArray(table.headers) ? table.headers.map(stringifySlotValue) : [];
        const rows = Array.isArray(table.rows) ? table.rows.map(normalizeTableRow) : [];
        if (rows.length > 0) return { headers, rows };
      }
      return undefined;

    case 'visual':
      return normalizeVisualSlot(value);

    case 'text':
    case 'textarea':
    case 'markdown':
    default:
      return stringifySlotValue(value);
  }
}

const GENERATION_SYSTEM =
  '당신은 삿갓(Satgat) 문서 생성 엔진입니다. 한국 전통 미학(한지·먹·명조)을 따르는 문서 데이터를, 주어진 스키마에 정확히 맞는 한국어 구조화 데이터로만 생성하세요.';

/**
 * 모델 호출 seam. 기본 구현은 Gemini structured output을 쓰고,
 * 테스트는 이 함수를 주입해 모델 없이 검증한다.
 */
export type SlotGenerator = (args: {
  template: SatgatTemplate;
  system: string;
  prompt: string;
  schema: z.ZodTypeAny;
}) => Promise<Record<string, unknown>>;

const defaultSlotGenerator: SlotGenerator = async ({ system, prompt, schema }) => {
  const { object } = await generateObject({
    model: google('gemini-2.5-flash'),
    schema,
    system,
    prompt,
    temperature: 0.7,
  });
  return object as Record<string, unknown>;
};

function normalizeSlots(
  template: SatgatTemplate,
  rawSlots: Record<string, unknown>,
  userPrompt: string,
  withFallback: boolean
): Record<string, unknown> {
  const slots: Record<string, unknown> = {};
  for (const slot of template.slots) {
    if (slot.id in rawSlots) {
      const normalized = normalizeSlotValue(rawSlots[slot.id], slot.type);
      if (!isEmptySlotValue(normalized)) {
        slots[slot.id] = normalized;
        continue;
      }
    }
    if (withFallback && slot.required) {
      const fallback = fallbackForRequiredSlot(slot, userPrompt);
      if (!isEmptySlotValue(fallback)) {
        slots[slot.id] = fallback;
      }
    }
  }
  return slots;
}

export interface GenerateOptions {
  /** 모델 호출 주입 (테스트용). 미지정 시 Gemini structured output. */
  generateSlots?: SlotGenerator;
  /** schema-invalid / 필수 누락 시 재시도 횟수. 기본 2 (총 3회 시도). */
  maxRetries?: number;
}

/**
 * AI로 문서 데이터 생성.
 * generateObject(structured output) + per-template zod 스키마로 모델 출력을 강제하고,
 * 스키마 위반/필수 누락 시 bounded retry(기본 2회) 후 fallback 채움으로 떨어진다.
 */
export async function generateDocumentData(
  template: SatgatTemplate,
  userPrompt: string,
  brandProfile?: BrandProfile | null,
  options?: GenerateOptions
): Promise<SatgatDocumentData> {
  const system = GENERATION_SYSTEM;
  const prompt = buildGenerationPrompt(template, userPrompt, brandProfile);
  const schema = buildSlotsSchema(template);
  const generate = options?.generateSlots ?? defaultSlotGenerator;
  const maxRetries = options?.maxRetries ?? 2;

  let lastRaw: Record<string, unknown> = {};
  let lastError: unknown;
  let modelResponded = false;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    let raw: Record<string, unknown>;
    try {
      raw = await generate({ template, system, prompt, schema });
    } catch (error) {
      lastError = error; // schema-invalid 또는 API 오류 → 재시도
      continue;
    }

    modelResponded = true;
    lastRaw = raw && typeof raw === 'object' ? raw : {};
    const slots = normalizeSlots(template, lastRaw, userPrompt, false);
    const data: SatgatDocumentData = { templateId: template.id, slots };
    if (validateDocumentData(template, data).valid) {
      return data; // 깨끗한 성공 — fallback 불필요
    }
    // 필수 slot 비어있음 → 재시도
  }

  // 모든 시도가 throw 했으면(모델이 한 번도 응답 못 함: API 키/쿼터/네트워크 오류)
  // 가짜 placeholder 문서로 성공을 위장하지 말고 실제 오류를 올린다.
  if (!modelResponded) {
    if (lastError instanceof Error) throw lastError;
    throw new Error('Document generation failed: model produced no response.');
  }

  // 모델은 응답했으나 필수 slot이 비어있는 경우에만 fallback 채움(부분 출력 보전).
  const slots = normalizeSlots(template, lastRaw, userPrompt, true);
  const data: SatgatDocumentData = { templateId: template.id, slots };
  const validation = validateDocumentData(template, data);
  if (!validation.valid) {
    const reason = lastError instanceof Error ? ` (last error: ${lastError.message})` : '';
    throw new Error(`Generated document failed validation: ${validation.errors.join('; ')}${reason}`);
  }
  return data;
}
