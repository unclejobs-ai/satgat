import { z } from "zod";

/**
 * Environment-pure brand profile types, parsing, and web-boundary validation.
 */
export interface BrandProfile {
  name?: string;
  role?: string;
  email?: string;
  website?: string;
  github?: string;
  brandColor?: string;
  language?: string;
  tone?: string;
  /** freeform notes */
  body?: string;
}

export const WEB_BRAND_PROFILE_LIMITS = {
  name: 120,
  role: 120,
  email: 254,
  website: 2048,
  tone: 500,
} as const;

export type WebBrandProfile = {
  name?: string;
  role?: string;
  email?: string;
  website?: string;
  tone?: string;
};

export type BrowserBrandProfile = Pick<
  WebBrandProfile,
  "name" | "role" | "website" | "tone"
>;

function optionalBoundedText(maxLength: number) {
  return z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(1).max(maxLength).optional(),
  );
}

const OptionalWebsiteSchema = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string()
    .trim()
    .min(1)
    .max(WEB_BRAND_PROFILE_LIMITS.website)
    .refine((value) => {
      if (!URL.canParse(value)) return false;
      const protocol = new URL(value).protocol;
      return protocol === "http:" || protocol === "https:";
    }, "Website must be an absolute http or https URL")
    .optional(),
);

export const BrowserBrandProfileSchema = z.object({
  name: optionalBoundedText(WEB_BRAND_PROFILE_LIMITS.name),
  role: optionalBoundedText(WEB_BRAND_PROFILE_LIMITS.role),
  website: OptionalWebsiteSchema,
  tone: optionalBoundedText(WEB_BRAND_PROFILE_LIMITS.tone),
}).strict().transform((profile): BrowserBrandProfile => {
  const normalized: BrowserBrandProfile = {};
  if (profile.name !== undefined) normalized.name = profile.name;
  if (profile.role !== undefined) normalized.role = profile.role;
  if (profile.website !== undefined) normalized.website = profile.website;
  if (profile.tone !== undefined) normalized.tone = profile.tone;
  return normalized;
}).refine((profile) => Object.keys(profile).length > 0, "Browser brand profile must not be empty");

export const WebBrandProfileSchema = z.object({
  name: optionalBoundedText(WEB_BRAND_PROFILE_LIMITS.name),
  role: optionalBoundedText(WEB_BRAND_PROFILE_LIMITS.role),
  email: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(1).max(WEB_BRAND_PROFILE_LIMITS.email).email().optional(),
  ),
  website: OptionalWebsiteSchema,
  tone: optionalBoundedText(WEB_BRAND_PROFILE_LIMITS.tone),
}).strict().transform((profile): WebBrandProfile => {
  const normalized: WebBrandProfile = {};
  if (profile.name !== undefined) normalized.name = profile.name;
  if (profile.role !== undefined) normalized.role = profile.role;
  if (profile.email !== undefined) normalized.email = profile.email;
  if (profile.website !== undefined) normalized.website = profile.website;
  if (profile.tone !== undefined) normalized.tone = profile.tone;
  return normalized;
}).refine((profile) => Object.keys(profile).length > 0, "Brand profile must not be empty");



export function normalizeWebBrandProfile(value: unknown): WebBrandProfile | null {
  const result = WebBrandProfileSchema.safeParse(value);
  return result.success ? result.data : null;
}
