import {
  BrowserBrandProfileSchema,
  type BrowserBrandProfile,
  type BrandProfile,
} from "./brand-resolver";

const STORAGE_KEY = "satgat-brand-profile";

export interface BrowserProfileStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type StoredBrandProfileResult = {
  profile: BrowserBrandProfile | null;
  failed: boolean;
};

function browserStorage(storage?: BrowserProfileStorage): BrowserProfileStorage {
  return storage ?? window.localStorage;
}

const BROWSER_PROFILE_FIELDS = ["name", "role", "website", "tone"] as const;
const LEGACY_HIDDEN_PROFILE_FIELDS = [
  "email",
  "github",
  "brandColor",
  "language",
  "body",
] as const;
const BASELINE_PROFILE_FIELDS = {
  name: true,
  role: true,
  email: true,
  website: true,
  github: true,
  brandColor: true,
  language: true,
  tone: true,
  body: true,
} satisfies Record<keyof BrandProfile, true>;

function projectLegacyBrandProfile(value: unknown): {
  candidate: unknown;
  hiddenOnly: boolean;
} {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { candidate: value, hiddenOnly: false };
  }

  const stored = value as Record<string, unknown>;
  const fields = Object.keys(stored);
  if (
    fields.some((field) => !Object.hasOwn(BASELINE_PROFILE_FIELDS, field)) ||
    LEGACY_HIDDEN_PROFILE_FIELDS.some(
      (field) => Object.hasOwn(stored, field) && typeof stored[field] !== "string",
    )
  ) {
    return { candidate: value, hiddenOnly: false };
  }

  const candidate: Record<string, unknown> = {};
  for (const field of BROWSER_PROFILE_FIELDS) {
    if (Object.hasOwn(stored, field)) candidate[field] = stored[field];
  }
  return {
    candidate,
    hiddenOnly: fields.length > 0 && Object.keys(candidate).length === 0,
  };
}

export function loadBrandProfileFromStorage(
  storage?: BrowserProfileStorage,
): StoredBrandProfileResult {
  try {
    const raw = browserStorage(storage).getItem(STORAGE_KEY);
    if (!raw) return { profile: null, failed: false };
    const parsed = JSON.parse(raw) as unknown;
    const { candidate, hiddenOnly } = projectLegacyBrandProfile(parsed);
    if (hiddenOnly) return { profile: null, failed: false };
    const profile = BrowserBrandProfileSchema.safeParse(candidate);
    return profile.success
      ? { profile: profile.data, failed: false }
      : { profile: null, failed: true };
  } catch {
    return { profile: null, failed: true };
  }
}

export function saveBrandProfileToStorage(
  profile: BrowserBrandProfile,
  storage?: BrowserProfileStorage,
): boolean {
  const normalized = BrowserBrandProfileSchema.safeParse(profile);
  if (!normalized.success) return false;

  try {
    browserStorage(storage).setItem(STORAGE_KEY, JSON.stringify(normalized.data));
    return true;
  } catch {
    return false;
  }
}

export function removeBrandProfileFromStorage(storage?: BrowserProfileStorage): boolean {
  try {
    browserStorage(storage).removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
