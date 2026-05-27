import { normalizeImageSlot } from './slot-image';

export type NormalizedListItem = {
  title: string;
  description: string;
  image?: string;
};

type NormalizeListOptions = {
  titleKeys?: string[];
  descriptionKeys?: string[];
  imageKeys?: string[];
};

const DEFAULT_TITLE_KEYS = ['title', 'name', 'label', 'metric', 'year', 'company', 'school'];
const DEFAULT_DESCRIPTION_KEYS = ['description', 'summary', 'value', 'event', 'role', 'background', 'period', 'degree'];
const DEFAULT_IMAGE_KEYS = ['image', 'image_url', 'url', 'src'];

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function firstText(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (value == null) continue;
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  }
  return '';
}

function firstImageSrc(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const image = normalizeImageSlot(record[key]);
    if (image) return image.src;
  }
  return '';
}

function parseListItem(item: unknown): unknown {
  if (typeof item === 'number' || typeof item === 'boolean') return String(item);
  if (typeof item !== 'string') return item;

  try {
    const parsed = JSON.parse(item);
    if (typeof parsed === 'number' || typeof parsed === 'boolean') return String(parsed);
    return parsed;
  } catch {
    return item;
  }
}

export function normalizeListItems(raw: unknown, options: NormalizeListOptions = {}): NormalizedListItem[] {
  if (!Array.isArray(raw)) return [];

  const titleKeys = options.titleKeys ?? DEFAULT_TITLE_KEYS;
  const descriptionKeys = options.descriptionKeys ?? DEFAULT_DESCRIPTION_KEYS;
  const imageKeys = options.imageKeys ?? DEFAULT_IMAGE_KEYS;

  return raw
    .map((item) => {
      const parsed = parseListItem(item);
      if (typeof parsed === 'string') return { title: parsed.trim(), description: '' };

      const record = asRecord(parsed);
      if (!record) return { title: '', description: '' };

      const title = firstText(record, titleKeys);
      const description = firstText(record, descriptionKeys);
      const image = firstImageSrc(record, imageKeys);

      return {
        title,
        description,
        ...(image ? { image } : {}),
      };
    })
    .filter((item) => item.title);
}
