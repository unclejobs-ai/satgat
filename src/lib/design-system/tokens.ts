/**
 * 삿갓 디자인 토큰 (Layer 3 — 한국화)
 *
 * Kami CSS 변수를 TypeScript 상수로 미러링.
 * 자동 생성 아님 — Kami styles.css + kami-overrides.css와 손으로 동기 유지.
 * CSS cascade가 진실원천. 이 파일은 TS/React 컴포넌트 편의용.
 *
 * 변경 사유 → docs/FORK-LOG.md
 */

// ─── Color Tokens ───────────────────────────────────────────────────────────

export const colors = {
  /** 한지(韓紙) — 담황 머금은 따뜻한 오프화이트. #FFF 금지 */
  parchment: '#F3EFE6',
  ivory: '#FAF8F1',
  warmSand: '#E8E3D4',

  /** 단청(丹靑) — 조선왕실 적색. 단 하나의 강조색, 5% 이내 */
  brand: '#9B1B1B',
  brandLight: '#B53030',

  /** 취색(翠色) — 청자 깊이. 보조 */
  jade: '#2E6B5E',
  jadeLight: '#3D8B7A',

  /** 금박(金箔) — 절제된 고급감. 최소 사용 */
  gold: '#B8954F',
  goldLight: '#D4B76A',

  /** 먹(墨) — 따뜻한 흑. cool gray 금지 */
  nearBlack: '#1C1916',
  darkWarm: '#3A3833',
  olive: '#4D4B46',
  stone: '#6B6862',

  /** 엷음(淡) — 구분선·테두리 */
  border: '#D9D4C8',
  borderSoft: '#E3DDD1',

  // ── Legacy 별칭 (기존 컴포넌트 호환) ─────────────────────────────────────
  canvas: '#F3EFE6',
  canvasDark: '#EBE5D9',
  ink: '#1C1916',
  inkLight: '#3A3833',
  inkMuted: '#5C5C5C',
  dancheong: '#9B1B1B',
  dancheongLight: '#B53030',
  hairline: '#D9D4C8',
  muted: '#8A8478',
  placeholder: '#A39E92',
  shadow: 'rgba(28, 25, 22, 0.04)',
  shadowMedium: 'rgba(28, 25, 22, 0.08)',
  shadowDeep: 'rgba(28, 25, 22, 0.12)',
} as const;

// ─── Typography Tokens ──────────────────────────────────────────────────────

export const fonts = {
  /** 본문 한글 — 따뜻한 바탕 + 명조 fallback */
  serif:
    "'Gowun Batang', 'Nanum Myeongjo', AppleMyungjo, 'Noto Serif KR', 'Source Han Serif K', 'Batang', Georgia, serif",

  /** Display/H1 — 장중한 명조 */
  serifDisplay:
    "'Nanum Myeongjo', AppleMyungjo, 'Noto Serif KR', 'Source Han Serif K', Georgia, serif",

  /** Latin display italic — Cormorant Garamond */
  serifLatin: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",

  /** UI/라벨/한자 인덱스 — 돋움 + Pretendard fallback */
  sans:
    "'Gowun Dodum', 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",

  /** 코드 블록 */
  mono: "'JetBrains Mono', 'IBM Plex Mono', 'Fira Code', 'SF Mono', Consolas, Monaco, monospace",
} as const;

export const typeScale = {
  display: { size: '48pt', lineHeight: 1.1, weight: 800 },
  h1: { size: '22pt', lineHeight: 1.2, weight: 700 },
  h2: { size: '16pt', lineHeight: 1.25, weight: 700 },
  h3: { size: '13pt', lineHeight: 1.3, weight: 600 },
  body: { size: '10pt', lineHeight: 1.55, weight: 400 },
  caption: { size: '9pt', lineHeight: 1.45, weight: 400 },
  label: { size: '8pt', lineHeight: 1.35, weight: 600 },
} as const;

// ─── Spacing (Kami 4pt base) ────────────────────────────────────────────────

export const spacing = {
  xs: '3pt',
  sm: '5pt',
  md: '10pt',
  lg: '20pt',
  xl: '32pt',
  '2xl': '52pt',
  '3xl': '96pt',

  // Legacy alias: 텍스트 블록 내 간격 (구 sangsae 컴포넌트 호환)
  inline: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },

  // Legacy alias: 섹션 간격
  section: {
    xs: '20px',
    sm: '28px',
    md: '36px',
    lg: '52px',
    xl: '72px',
    xxl: '96px',
  },

  // Legacy alias: A4 페이지 여백
  page: {
    top: '28mm',
    bottom: '28mm',
    left: '24mm',
    right: '24mm',
  },
} as const;

// ─── Layout ─────────────────────────────────────────────────────────────────

export const layout = {
  a4: { width: '210mm', height: '297mm' },
  a4Landscape: { width: '297mm', height: '210mm' },
  slide169: { width: '297mm', height: '167mm' },
  slide16x9: { width: '297mm', height: '167mm' },

  radius: {
    sm: '3px',
    md: '5px',
    lg: '8px',
    xl: '12px',
    container: '16px',
    hero: '24px',
  },

  divider: {
    thin: '1px',
    medium: '1.5px',
    thick: '2.5px',
  },
} as const;

// ─── Shadows (Kami: ring + whisper만, hard drop 금지) ───────────────────────

export const shadows = {
  ring: '0 0 0 1pt var(--border, #D9D4C8)',
  whisper: '0 4pt 24pt rgba(28, 25, 22, 0.05)',
  paper: '0 1px 2px rgba(28, 25, 22, 0.04), 0 2px 4px rgba(28, 25, 22, 0.02)',
  paperElevated:
    '0 4px 12px rgba(28, 25, 22, 0.06), 0 2px 4px rgba(28, 25, 22, 0.04)',
} as const;

// ─── Texture URI (인라인 SVG noise) ─────────────────────────────────────────

export const textures = {
  paperNoise:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
  canvasGradient:
    'radial-gradient(ellipse at 18% 28%, rgba(184,149,79,0.04) 0%, transparent 55%), radial-gradient(ellipse at 82% 72%, rgba(46,107,94,0.025) 0%, transparent 55%)',
} as const;

// ─── 한자 인장 글자 매핑 (satgat 확장) ──────────────────────────────────────

export const sealGlyphs = {
  resume: { glyph: '履', variant: 'ink' },
  portfolio: { glyph: '作', variant: 'jade' },
  brandOnepager: { glyph: '標', variant: 'dancheong' },
  brandStorybook: { glyph: '誌', variant: 'gold' },
  productBrochure: { glyph: '品', variant: 'jade' },
  investorDeck: { glyph: '投', variant: 'dancheong' },
  companyProfile: { glyph: '社', variant: 'ink' },
  newsletter: { glyph: '報', variant: 'gold' },
} as const;

export type SealVariant = 'dancheong' | 'jade' | 'gold' | 'ink';

// ─── Legacy compat: typography 단일 export (theme.ts + 기존 컴포넌트용) ──────
export const typography = {
  fontMyeongjo: fonts.serifDisplay,
  fontBatang: fonts.serif,
  fontDodum: fonts.sans,
  fontLatin: fonts.serifLatin,
  serif: fonts.serif,
  serifDisplay: fonts.serifDisplay,
  serifLatin: fonts.serifLatin,
  sans: fonts.sans,
  mono: fonts.mono,
  sizes: {
    display: { size: '2.75rem', lineHeight: 1.15, letterSpacing: '0.02em' },
    h1: { size: '2.125rem', lineHeight: 1.25, letterSpacing: '0.01em' },
    h2: { size: '1.625rem', lineHeight: 1.35, letterSpacing: '0.01em' },
    h3: { size: '1.375rem', lineHeight: 1.4, letterSpacing: '0.005em' },
    h4: { size: '1.125rem', lineHeight: 1.5, letterSpacing: '0' },
    body: { size: '1rem', lineHeight: 1.8, letterSpacing: '0.01em' },
    bodySmall: { size: '0.9375rem', lineHeight: 1.75, letterSpacing: '0.01em' },
    caption: { size: '0.8125rem', lineHeight: 1.65, letterSpacing: '0.02em' },
    label: { size: '0.75rem', lineHeight: 1.5, letterSpacing: '0.06em' },
  },
  weights: { regular: 400, medium: 500, semibold: 600, bold: 700, extraBold: 800 },
  inkBleed: '0 0 0.3px rgba(28,25,22,0.12), 0 0 0.6px rgba(28,25,22,0.06)',
  inkBleedStrong: '0 0 0.5px rgba(28,25,22,0.18), 0 0 1px rgba(28,25,22,0.09)',
  typeScale,
} as const;

// ─── Theme bundle ───────────────────────────────────────────────────────────

export const satgatTheme = {
  colors,
  fonts,
  typography,
  typeScale,
  spacing,
  layout,
  shadows,
  textures,
  sealGlyphs,
} as const;

export type SatgatTheme = typeof satgatTheme;
