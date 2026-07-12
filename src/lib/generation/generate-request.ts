import { z } from "zod";
import {
  BrowserBrandProfileSchema,
  WebBrandProfileSchema,
  type BrowserBrandProfile,
} from "@/lib/design-system/brand-resolver";

export const GENERATE_REQUEST_LIMITS = {
  templateIdMax: 64,
  promptMin: 10,
  promptMax: 1200,
} as const;

export const GenerateRequestSchema = z.object({
  templateId: z.string().trim().min(1).max(GENERATE_REQUEST_LIMITS.templateIdMax),
  prompt: z.string().trim()
    .min(GENERATE_REQUEST_LIMITS.promptMin)
    .max(GENERATE_REQUEST_LIMITS.promptMax),
  brand: WebBrandProfileSchema.optional(),
}).strict();

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export type BuildGenerateRequestInput = {
  templateId: string;
  prompt: string;
  brand: BrowserBrandProfile;
  applyBrand: boolean;
};

export function buildGenerateRequest(input: BuildGenerateRequestInput): GenerateRequest {
  const brand = input.applyBrand
    ? BrowserBrandProfileSchema.parse(input.brand)
    : null;

  return GenerateRequestSchema.parse({
    templateId: input.templateId,
    prompt: input.prompt,
    ...(brand ? { brand } : {}),
  });
}
