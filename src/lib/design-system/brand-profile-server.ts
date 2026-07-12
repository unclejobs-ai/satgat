import { readFile } from "fs/promises";
import { homedir } from "os";
import path from "path";
import { parseBrandProfile, type BrandProfile } from "./brand-resolver";

/** Reads the established ~/.config/satgat/brand.md server profile when present. */
export async function loadBrandProfileFromDisk(): Promise<BrandProfile | null> {
  try {
    const fullPath = path.join(homedir(), ".config", "satgat", "brand.md");
    return parseBrandProfile(await readFile(fullPath, "utf-8"));
  } catch {
    return null;
  }
}

/** Resolves the server-side profile source without importing browser storage. */
export async function resolveBrandProfile(): Promise<BrandProfile | null> {
  return loadBrandProfileFromDisk();
}
