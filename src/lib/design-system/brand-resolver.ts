/**
 * 삿갓 Brand Profile Resolver
 *
 * ~/.config/satgat/brand.md (YAML frontmatter + Markdown body) 파싱
 * 클라이언트에서는 localStorage fallback, 서버에서는 fs 사용
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

const STORAGE_KEY = 'satgat-brand-profile';

/**
 * 간단한 YAML frontmatter 파서
 */
function parseYamlFrontmatter(content: string): { frontmatter: Record<string, string>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const yamlText = match[1];
  const body = match[2].trim();
  const frontmatter: Record<string, string> = {};

  for (const line of yamlText.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

/**
 * brand.md 문자열 → BrandProfile 파싱
 */
export function parseBrandProfile(content: string): BrandProfile {
  const { frontmatter, body } = parseYamlFrontmatter(content);
  return {
    name: frontmatter.name,
    role: frontmatter.role,
    email: frontmatter.email,
    website: frontmatter.website,
    github: frontmatter.github,
    brandColor: frontmatter.brandColor ?? frontmatter['brand-color'],
    language: frontmatter.language,
    tone: frontmatter.tone,
    body,
  };
}

/**
 * 서버: fs로 brand.md 읽기 (없으면 null)
 */
export async function loadBrandProfileFromDisk(): Promise<BrandProfile | null> {
  try {
    // 서버 사이드에서만 실행
    if (typeof window !== 'undefined') return null;

    const { readFile } = await import('fs/promises');
    const { homedir } = await import('os');
    const path = (await import('path')).default;
    const fullPath = path.join(homedir(), '.config', 'satgat', 'brand.md');
    const content = await readFile(fullPath, 'utf-8');
    return parseBrandProfile(content);
  } catch {
    return null;
  }
}

/**
 * 클라이언트: localStorage에서 BrandProfile 읽기
 */
export function loadBrandProfileFromStorage(): BrandProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BrandProfile;
  } catch {
    return null;
  }
}

/**
 * 클라이언트: localStorage에 BrandProfile 저장
 */
export function saveBrandProfileToStorage(profile: BrandProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

/**
 * 환경에 맞게 BrandProfile 로드 (서버 → 클라이언트 순)
 */
export async function resolveBrandProfile(): Promise<BrandProfile | null> {
  const fromDisk = await loadBrandProfileFromDisk();
  if (fromDisk) return fromDisk;

  if (typeof window !== 'undefined') {
    return loadBrandProfileFromStorage();
  }

  return null;
}
