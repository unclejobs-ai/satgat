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
// 회녹 중성 계열. cool blue-gray 절대 금지.
export const HAIRLINE = '#D2D6CB';
export const BORDER = '#BEC5BA';
export const MUTED = '#73786F';
export const PLACEHOLDER = '#969B91';

// ─── 7. SERIF HIERARCHY ─────────────────────────────────────────────────────
// 화면과 PDF가 같은 self-hosted OFL 명조·바탕·돋움 서체를 사용한다.
export const FONT_MYEONGJO = "'Nanum Myeongjo', 'Noto Serif KR', 'Batang', Georgia, serif";
export const FONT_BATANG = "'Gowun Batang', 'Nanum Myeongjo', 'Noto Serif KR', 'Batang', Georgia, serif";
export const FONT_DODUM = "'Gowun Dodum', 'Noto Serif KR', sans-serif";

// Weight 규칙:
// - Display/H1: 800 (extra bold) — 장중한 무게감
// - H2: 700 (bold)
// - H3-H4: 700 (bold) — 바탕체는 bold만 사용, synthetic bold 금지
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

// ─── 12. SEPARATION ──────────────────────────────────────────────────────────
// 종이 표면은 투명 그림자 대신 HAIRLINE 1px로만 구분한다.
export const DIVIDER_WEIGHT = {
  thin: 1,
  medium: 2,
  thick: 3,
} as const;
// ─── 13. BORDER-RADIUS ──────────────────────────────────────────────────────
// 전통지(傳統紙)의 직선미. 큰 둥근 모서리 금지.
export const RADIUS_SM = 3;
export const RADIUS_MD = 5;
export const RADIUS_LG = 8;

// ─── 14. IMAGE ──────────────────────────────────────────────────────────────
// 이미지는 문서의 일부. 장식이 아닌 정보.
// rounded corners 최소화. border는 HAIRLINE 1px.
// caption은 고울바탕 italic 또는 고울돋움 caption size.

// ─── 15. TABLE ──────────────────────────────────────────────────────────────
// 상단: 먹색 2px 굵은 선. header는 나눔명조 semibold.
// 나머지 구분선: hairline 1px. 행 구분은 zebra 금지.
// cell padding: 12px 16px. 숫자는 우측 정렬, 텍스트는 좌측 정렬.

// 시각 효과는 불투명 색과 1px 선만 사용한다. 텍스처·그라데이션·먹 번짐은 없다.
