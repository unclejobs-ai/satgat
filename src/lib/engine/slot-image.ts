export type NormalizedImageSlot = {
  src: string;
  alt: string;
};

const IMAGE_EXTENSION = /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i;

function textFrom(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function isLikelyImageSource(value: string): boolean {
  return (
    value.startsWith('data:image/') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/') ||
    value.startsWith('./') ||
    value.startsWith('../') ||
    IMAGE_EXTENSION.test(value)
  );
}

export function normalizeImageSlot(value: unknown): NormalizedImageSlot | undefined {
  if (typeof value === 'string') {
    const src = value.trim();
    if (!isLikelyImageSource(src)) return undefined;
    return { src, alt: '' };
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;

  const record = value as Record<string, unknown>;
  const src = textFrom(record.url) || textFrom(record.src) || textFrom(record.image_url) || textFrom(record.image);
  if (!isLikelyImageSource(src)) return undefined;

  const alt = textFrom(record.alt) || textFrom(record.title) || textFrom(record.name);
  return { src, alt };
}
