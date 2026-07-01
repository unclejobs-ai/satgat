/**
 * 삿갓(Satgat) Constraint Language
 *
 * Kami의 "One constraint language"에 대응하는 삿갓의 진실원천.
 * 모든 삿갓 문서는 이 15개 규칙을 따른다.
 * 이 규칙 자체가 AI agent에게 넘길 수 있는 brief 역할을 한다.
 *
 * 철학: "한지 위의 먹글씨" — 콘텐츠가 주인이 되고, 디자인은 격조를 돋군다.
 */

// ─── 1. CANVAS ──────────────────────────────────────────────────────────────
// 백자지(白瓷紙). 누런 양피지 대신 회녹 undertone의 맑은 닥종이.
// v11: #F7F7F2 백자지 (Kami parchment #F5F4ED와 분리)
export const CANVAS = '#F7F7F2';
export const CANVAS_DARK = '#E7E8DD';  // 접힌 닥종이 음영
export const IVORY = '#FFFFFB';        // 백자 흰빛, pure white보다 낮춤

// ─── 2. INK ─────────────────────────────────────────────────────────────────
// 먹(墨). 따뜻한 흑. cool gray 금지.
export const INK = '#1C1916';
export const INK_LIGHT = '#3A3833';
export const INK_MUTED = '#4D4B46';

// ─── 3. ACCENT ──────────────────────────────────────────────────────────────
// 단청紅(丹靑紅). 조선왕실 벽돌색. 유일한 강렬한 chromatic accent.
// 사용처: seal(도장), 강조 underline, 1px hairline, 강렬한 구분선.
// 규칙: 한 페이지에 3회 이상 사용 금지. 절제가 미덕.
export const DANCHEONG = '#9B1B1B';
export const DANCHEONG_LIGHT = '#B92D2D';

// 단청 opacity 레이어링 — 단일 액센트를 농도로 운용(3조 정합).
// 벤치마크(Blue Professional) 기법을 한국 정체성에 적용:
// 다색이 아닌 단청 1색의 농도로 위계·배경·강조를 모두 해결.
// 사용처: 카드 배경(06)·보더(12)·태그(20)·강조 숫자(100).
// 주의: 태그·배지는 solid hex 토큰을 우선. 이 값은 보조 surface용.
export const DANCHEONG_TINT_06 = '#F8EAEA';  // 옅은 surface — 카드 배경 미약 구분
export const DANCHEONG_TINT_12 = '#F3DCDC';  // 보더 옅음 — hover ring, 구역 구분
export const DANCHEONG_TINT_20 = '#E8C9C9';  // 태그·배지 기본 tint

// ─── 4. SECONDARY ACCENT ────────────────────────────────────────────────────
// 취色(翠色). 청자(靑瓷)/청록의 깊이. 보조 accent.
// 사용처: table header, secondary seal, image caption accent.
// 규칙: 단청과 동시 사용 금지. 둘 중 하나만.
export const JADE = '#2E6B5E';
export const JADE_LIGHT = '#3D8B7A';

// ─── 5. GOLD ────────────────────────────────────────────────────────────────
// 금박(金箔). 절제된 고급스러움.
// 사용처: 1px top/bottom border, hairline underline, minimal highlight.
// 규칙: decorative 목적 금지. 정보 위계를 나타내는 용도만.
export const GOLD = '#B8954F';
export const GOLD_LIGHT = '#D4B76A';

// ─── 6. NEUTRALS ────────────────────────────────────────────────────────────
// Warm gray 계열. cool blue-gray 절대 금지.
export const HAIRLINE = '#D2D6CB';
export const BORDER = '#BEC5BA';
export const MUTED = '#73786F';
export const PLACEHOLDER = '#969B91';

// ─── 7. SERIF HIERARCHY ─────────────────────────────────────────────────────
// 나눔명조(장중함) → 고울바탕(따뜻함) → 고울돋움(깔끔함)
// Latin: Cormorant Garamond (classic serif, 인쇄물 품격)
export const FONT_MYEONGJO = "'Nanum Myeongjo', 'Noto Serif KR', 'Batang', Georgia, serif";
export const FONT_BATANG = "'Gowun Batang', 'Nanum Myeongjo', 'Noto Serif KR', 'Batang', Georgia, serif";
export const FONT_DODUM = "'Gowun Dodum', 'Nanum Myeongjo', 'Noto Serif KR', sans-serif";
export const FONT_LATIN = "'Cormorant Garamond', 'Nanum Myeongjo', Georgia, 'Times New Roman', serif";

// Weight 규칙 (8조 합성 볼드 금지 · 5조 위계는 크기로):
// - Display/H1: 700 (bold) — 크기로 위계, 굵기 남용 금지
// - H2: 700 (bold)
// - H3-H4: 700 (bold) — Gowun Batang은 400/700만 로드, synthetic bold 금지
// - Body: 400 (regular)
// - Label/Caption: 400-500

// ─── 8. LINE-HEIGHT ──────────────────────────────────────────────────────────
// 한글 long-form은 Latin보다 더 넉넉한 line-height 필요.
export const LH_DISPLAY = 1.15;   // 촘촘한 타이틀
export const LH_H1 = 1.2;
export const LH_H2 = 1.3;
export const LH_H3 = 1.4;
export const LH_H4 = 1.5;
export const LH_BODY = 1.8;       // 한글 장문 최적화
export const LH_BODY_SMALL = 1.75;
export const LH_CAPTION = 1.65;
export const LH_LABEL = 1.5;

// ─── 8b. LETTER-SPACING (CJK) ────────────────────────────────────────────────
// 한글은 받침이 있어 Latin보다 자간을 살짝 조임. CJK는 pre-spaced이므로
// 디스플레이라도 음수 트래킹은 미세하게(-0.02em 이하 금지 → 뭉침).
// label uppercase만 양수로 넓힘. 단일 진실원천 — 다른 파일은 이 값을 따를 것.
export const LS_DISPLAY = '-0.018em';  // Display · H1 — 큰 글씨 미세 조임
export const LS_HEADING = '-0.012em';  // H2 · H3 — 제목
export const LS_BODY = '-0.005em';     // 본문 · 캡션 — 한글 가독의 기본
export const LS_LABEL = '0.08em';      // uppercase label — 넓힘

// ─── 9. BASELINE GRID ───────────────────────────────────────────────────────
// 8px 기반. 모든 요소의 세로 위치, margin, padding은 8px의 배수.
// 문서의 "기준선"을 물리적으로 확립.
export const BASELINE = 8;

// ─── 10. PAGE MARGIN ────────────────────────────────────────────────────────
// A4: 210mm × 297mm. 인쇄물 수준의 여백.
export const PAGE_MARGIN_X = '24mm';
export const PAGE_MARGIN_Y = '28mm';

// ─── 11. SECTION GAP ────────────────────────────────────────────────────────
// 여백이 곧 디자인. 최소 36px(8×4.5). 일반 48-64px.
export const SECTION_GAP_MIN = 36;
export const SECTION_GAP_STD = 48;
export const SECTION_GAP_LARGE = 64;

// ─── 12. SHADOWS ─────────────────────────────────────────────────────────────
// 종이 두께감만. multi-layer subtle.
// hard drop shadow, large blur 금지.
// 6조 예외: 색 토큰은 solid hex만 쓰되, opacity가 필요한 shadow·texture는 rgba 허용.
export const SHADOW_PAPER = '0 1px 2px rgba(28,28,28,0.04), 0 2px 4px rgba(28,28,28,0.02)';
export const SHADOW_BOOK = '0 8px 24px rgba(28,28,28,0.08), 0 2px 8px rgba(28,28,28,0.04)';

// ─── 13. BORDER-RADIUS ──────────────────────────────────────────────────────
// 전통지(傳統紙)의 직선미. 큰 둥근 모서리 금지.
export const RADIUS_SM = 3;
export const RADIUS_MD = 5;
export const RADIUS_LG = 8;

// ─── 14. IMAGE ──────────────────────────────────────────────────────────────
// 이미지는 문서의 일부. 장식이 아닌 정보.
// rounded corners 최소화. border는 hairline(#D9D4C8) 1px.
// caption은 고울바탕 italic 또는 고울돋움 caption size.

// ─── 15. TABLE ──────────────────────────────────────────────────────────────
// 상단: 먹색 2px 굵은 선. header는 나눔명조 semibold.
// 나머지 구분선: hairline 1px. 행 구분은 zebra 금지.
// cell padding: 12px 16px. 숫자는 우측 정렬, 텍스트는 좌측 정렬.

// ─── INK BLEED ──────────────────────────────────────────────────────────────
// 먹 번짐. 미세한 text-shadow로 종이에 스며든 느낌.
export const INK_BLEED = '0 0 0.3px rgba(28,28,28,0.12), 0 0 0.6px rgba(28,28,28,0.06)';
export const INK_BLEED_STRONG = '0 0 0.5px rgba(28,28,28,0.18), 0 0 1px rgba(28,28,28,0.09)';

// ─── TEXTURE ────────────────────────────────────────────────────────────────
// 종이결: 거의 안 보이는 미세 노이즈. 한지 흉내가 아닌 인쇄물의 톤 정돈.
export const TEXTURE_PAPER_NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 320 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.6' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.11 0 0 0 0 0.10 0 0 0 0 0.09 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.018'/%3E%3C/svg%3E\")";

// 캔버스 분위기: 따뜻한 누런/녹색 얼룩 제거. 종이 가장자리만 살짝 가라앉히는 중성 vignette.
export const TEXTURE_CANVAS_GRADIENT =
  'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.55) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(28,25,22,0.03) 0%, transparent 55%)';
