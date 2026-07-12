import { z } from 'zod';
import type { TemplateCatalogEntry, TemplateSlot } from '@/lib/templates/types';

export const MAX_PRIVATE_TRANSPORT_BYTES = 2_000_000;
const MAX_DATA_IMAGE_LENGTH = 1_500_000;
const LOCAL_IMAGE_PATH = /^\/(?!\/)[^\u0000-\u001f\\]*$/;
const RASTER_DATA_IMAGE = /^data:image\/(?:avif|gif|jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/i;

function decodedLocalPath(source: string): string | null {
  let path = source.split(/[?#]/, 1)[0];
  try {
    for (let pass = 0; pass < 2; pass += 1) {
      const decoded = decodeURIComponent(path);
      if (decoded === path) break;
      path = decoded;
    }
  } catch {
    return null;
  }
  return LOCAL_IMAGE_PATH.test(path) ? path : null;
}

export function isSafeImageSource(value: string): boolean {
  const source = value.trim();
  const dataImage = source.match(RASTER_DATA_IMAGE);
  if (dataImage) {
    return source.length <= MAX_DATA_IMAGE_LENGTH && dataImage[1].length % 4 === 0;
  }
  if (!LOCAL_IMAGE_PATH.test(source)) return false;
  const path = decodedLocalPath(source);
  return path !== null && !/\.svg(?:\/|$)/i.test(path);
}

const safeImageSourceSchema = z.string().refine(isSafeImageSource, 'Unsafe image source');
const imageObjectSchema = z.object({
  url: safeImageSourceSchema,
  alt: z.string().optional(),
}).strict();

const listTextSchema = z.union([z.string(), z.number().finite(), z.boolean()]);
const listItemSchema = z.object({
  title: listTextSchema,
  description: listTextSchema,
  summary: listTextSchema,
  company: listTextSchema,
  role: listTextSchema,
  period: listTextSchema,
  school: listTextSchema,
  degree: listTextSchema,
  year: listTextSchema,
  event: listTextSchema,
  name: listTextSchema,
  background: listTextSchema,
  metric: listTextSchema,
  value: listTextSchema,
  label: listTextSchema,
  product_name: listTextSchema,
  service: listTextSchema,
  overview: listTextSchema,
  date: listTextSchema,
  headline: listTextSchema,
  body: listTextSchema,
  content: listTextSchema,
  project: listTextSchema,
  result: listTextSchema,
  feature: listTextSchema,
  benefit: listTextSchema,
  certification: listTextSchema,
  award: listTextSchema,
  issuer: listTextSchema,
  image: z.union([safeImageSourceSchema, imageObjectSchema]),
  image_url: safeImageSourceSchema,
  url: safeImageSourceSchema,
  src: safeImageSourceSchema,
}).partial().strict();

const generationImageObjectSchema = z.object({
  url: z.string().optional(),
  alt: z.string().optional(),
}).strict();

const generationListItemSchema = z.object({
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
  product_name: z.string(),
  service: z.string(),
  overview: z.string(),
  date: z.string(),
  headline: z.string(),
  body: z.string(),
  content: z.string(),
  project: z.string(),
  result: z.string(),
  feature: z.string(),
  benefit: z.string(),
  certification: z.string(),
  award: z.string(),
  issuer: z.string(),
  image: generationImageObjectSchema,
  image_url: z.string(),
  url: z.string(),
  src: z.string(),
}).partial().strict();

const tableObjectSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
}).strict().superRefine(({ headers, rows }, context) => {
  for (const [index, row] of rows.entries()) {
    if (row.length !== headers.length) {
      context.addIssue({
        code: 'custom',
        path: ['rows', index],
        message: 'Table row width must match headers',
      });
    }
  }
});

const generationTableObjectSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
}).strict();

const visualDatumSchema = z.record(
  z.string(),
  z.union([z.string(), z.number().finite(), z.boolean(), z.null()]),
);
const visualKindSchema = z.enum([
  'bar',
  'bar-horizontal',
  'line',
  'donut',
  'waterfall',
  'timeline',
  'flow',
  'architecture',
  'quadrant',
  'venn',
  'swimlane',
  'tree',
  'layer-stack',
  'candlestick',
]);
const visualSchema = z.object({
  kind: visualKindSchema,
  title: z.string(),
  caption: z.string(),
  data: z.array(visualDatumSchema),
  steps: z.array(z.string()),
  nodes: z.array(z.string()),
  edges: z.array(z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()])),
  lanes: z.array(z.string()),
  phases: z.array(z.object({
    name: z.string(),
    lane: z.number().int().nonnegative(),
    start: z.number().finite(),
    end: z.number().finite(),
  }).strict()),
  quadrants: z.object({
    tl: z.string(),
    tr: z.string(),
    bl: z.string(),
    br: z.string(),
    xLabel: z.string(),
    yLabel: z.string(),
  }).partial().strict(),
  venn: z.object({ a: z.string(), b: z.string(), ab: z.string() }).strict(),
  tree: z.object({
    root: z.string(),
    children: z.array(z.object({
      name: z.string(),
      sub: z.array(z.string()).optional(),
    }).strict()),
  }).strict(),
  layers: z.array(z.object({ name: z.string() }).strict()),
}).partial().required({ kind: true }).strict();

const generationVisualDatumSchema = z.object({
  label: z.string(),
  name: z.string(),
  title: z.string(),
  metric: z.string(),
  category: z.string(),
  period: z.string(),
  month: z.string(),
  week: z.string(),
  year: z.string(),
  stage: z.string(),
  value: z.number(),
  amount: z.number(),
  score: z.number(),
  count: z.number(),
  rate: z.number(),
  percent: z.number(),
  ratio: z.number(),
  revenue: z.number(),
  users: z.number(),
  volume: z.number(),
}).partial().strict();

const generationVisualSchema = visualSchema.extend({
  data: z.array(generationVisualDatumSchema).optional(),
  edges: z.array(z.array(z.number().int().nonnegative())).optional(),
});

type SlotSchema = z.ZodTypeAny;

function baseSchemaForSlot(slot: TemplateSlot): SlotSchema {
  switch (slot.type) {
    case 'list':
      return z.array(listItemSchema);
    case 'image':
      return imageObjectSchema;
    case 'table':
      return tableObjectSchema;
    case 'visual':
      return visualSchema;
    case 'text':
    case 'textarea':
      return z.string();
  }
}

export function schemaForSlot(slot: TemplateSlot): SlotSchema {
  const base = baseSchemaForSlot(slot);
  return slot.required ? base : base.nullable().optional();
}

export function buildSlotsSchema(
  template: TemplateCatalogEntry,
): z.ZodObject<Record<string, SlotSchema>> {
  const shape: Record<string, SlotSchema> = {};
  for (const slot of template.slots) {
    shape[slot.id] = schemaForSlot(slot);
  }
  return z.object(shape).strict();
}

function generationSchemaForSlot(slot: TemplateSlot): SlotSchema {
  let schema: SlotSchema;
  switch (slot.type) {
    case 'list':
      schema = z.array(generationListItemSchema);
      break;
    case 'image':
      schema = generationImageObjectSchema;
      break;
    case 'table':
      schema = generationTableObjectSchema;
      break;
    case 'visual':
      schema = generationVisualSchema;
      break;
    case 'text':
    case 'textarea':
      schema = z.string();
      break;
  }
  return slot.required ? schema : schema.nullable().optional();
}

export function buildGenerationSlotsSchema(
  template: TemplateCatalogEntry,
): z.ZodObject<Record<string, SlotSchema>> {
  const shape: Record<string, SlotSchema> = {};
  for (const slot of template.slots) {
    shape[slot.id] = generationSchemaForSlot(slot);
  }
  return z.object(shape).strict();
}
