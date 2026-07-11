/**
 * 삿갓 디자인 토큰 (Layer 3 — 한국화)
 *
 * 본 파일은 TS/React 컴포넌트(chrome) 편의용 토큰 모음입니다.
 * 색 토큰의 단일 권위원천(Single Source of Truth)은 constraint.ts 입니다.
 * 이 파일의 모든 색 값은 constraint.ts 의 정식 토큰과 정확히 일치해야 하며,
 * drift 가 발견되면 constraint.ts 값을 기준으로 정렬합니다.
 * (design-guard 가 design-system/ 계층의 색 drift 를 감지합니다.)
 *
 * 변경 사유 → docs/FORK-LOG.md
 */

// ─── Color Tokens ───────────────────────────────────────────────────────────
// constraint.ts 가 색 토큰의 단일 권위원천(Single Source of Truth).
// 이 블록의 색 이름(parchment/brand/jade/...)은 constraint.ts 의 정식 토큰과
// 1:1 로 대응하며, hex 값이 정확히 일치해야 함. drift 재발 방지.
// 값을 바꿀 때는 반드시 constraint.ts 를 먼저 고치고 여기로 복사할 것.

export const colors = {
  /** 백자지(白瓷紙) — 누런 양피지 대신 맑은 닥종이. #FFF 금지. = constraint.CANVAS */
  parchment: '#F7F7F2',
  ivory: '#FFFFFB',            // = constraint.IVORY
  warmSand: '#E7E8DD',         // = constraint.CANVAS_DARK

  /** 단청(丹靑) — 조선왕실 적색. 단 하나의 강조색, 5% 이내.
   *  constraint.ts 가 단일 권위원천 — 이 값은 constraint.DANCHEONG 와 일치해야 함. */
  brand: '#9B1B1B',
  brandLight: '#B92D2D',

  /** 취색(翠色) — 청자 깊이. 보조. = constraint.JADE */
  jade: '#2E6B5E',
  jadeLight: '#3D8B7A',        // = constraint.JADE_LIGHT

  /** 금박(金箔) — 절제된 고급감. 최소 사용. = constraint.GOLD */
  gold: '#B8954F',
  goldLight: '#D4B76A',        // = constraint.GOLD_LIGHT

  /** 먹(墨) — 따뜻한 흑. cool gray 금지. = constraint.INK */
  nearBlack: '#1C1916',        // = constraint.INK
  darkWarm: '#3A3833',         // = constraint.INK_LIGHT
  olive: '#4D4B46',            // = constraint.INK_MUTED
  stone: '#6B6862',            // legacy extra (constraint.MUTED 계보, 별도 토큰)

  /** 엷음(淡) — 구분선·테두리. = constraint.HAIRLINE / BORDER */
  border: '#D2D6CB',           // = constraint.HAIRLINE
  borderSoft: '#E6E8DE',       // legacy extra (constraint.BORDER 계보, 별도 토큰)

  // ── Legacy 별칭 (기존 컴포넌트 호환) ─────────────────────────────────────
  // constraint.ts 가 색 토큰의 단일 권위원천(Single Source of Truth).
  // 이 별칭 블록의 모든 색 값은 constraint.ts 의 정식 토큰과 정확히 일치해야 함.
  // drift 재발 방지: 값을 바꿀 때 반드시 constraint.ts 를 먼저 고치고 여기로 복사.
  canvas: '#F7F7F2',          // = constraint.CANVAS
  canvasDark: '#E7E8DD',      // = constraint.CANVAS_DARK
  ink: '#1C1916',             // = constraint.INK
  inkLight: '#3A3833',        // = constraint.INK_LIGHT
  inkMuted: '#4D4B46',        // = constraint.INK_MUTED  (drift fixed M1 — was a cool gray)
  dancheong: '#9B1B1B',       // = constraint.DANCHEONG
  dancheongLight: '#B92D2D',  // = constraint.DANCHEONG_LIGHT  (aligned M1 — was a brighter red)
  hairline: '#D2D6CB',        // = constraint.HAIRLINE
  muted: '#73786F',           // = constraint.MUTED
  placeholder: '#969B91',     // = constraint.PLACEHOLDER
  // NOTE: shadow* 값은 rgba() 표현 — design-guard RGBA_USAGE 가 info 로 기록.
  // constraint.ts 의 SHADOW_* 토큰이 권위원천이며, 텍스트 캐스트용 legacy alias 임.
  shadow: 'rgba(28, 25, 22, 0.04)',
  shadowMedium: 'rgba(28, 25, 22, 0.08)',
  shadowDeep: 'rgba(28, 25, 22, 0.12)',
} as const;

// ─── Typography Tokens ──────────────────────────────────────────────────────

export const fonts = {
  /** 본문 한글 — 따뜻한 바탕 + 명조 fallback */
  serif:
    "'Gowun Batang', 'Nanum Myeongjo', 'Noto Serif KR', serif",

  /** Display/H1 — 장중한 명조 */
  serifDisplay:
    "'Nanum Myeongjo', 'Noto Serif KR', serif",

  /** Latin display italic — Cormorant Garamond */
  serifLatin: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",

  /** UI/라벨/한자 인덱스 — 돋움 + Pretendard fallback */
  sans:
    "'Gowun Dodum', 'Nanum Myeongjo', 'Noto Serif KR', sans-serif",

  /** 코드 블록 */
  mono: "'JetBrains Mono', 'IBM Plex Mono', 'Fira Code', 'SF Mono', Consolas, Monaco, monospace",
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
} as const;

// ─── Theme bundle ───────────────────────────────────────────────────────────

export const satgatTheme = {
  colors,
  fonts,
  typography,
  spacing,
  layout,
  shadows,
  textures,
} as const;

export type SatgatTheme = typeof satgatTheme;
