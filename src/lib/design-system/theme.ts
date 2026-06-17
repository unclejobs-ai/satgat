import { colors, typography, spacing, layout, shadows, textures } from './tokens';

/**
 * 삿갓(Satgat) Theme Object
 * 컴포넌트/렌더러에서 일관되게 참조하는 진실원천.
 *
 * NOTE: 색 토큰의 단일 권위원천은 constraint.ts 입니다. tokens.ts(colors)는
 * constraint.ts 값을 미러링하며, 본 theme 번들의 colors 는 tokens.colors 입니다.
 * 색 값을 바꿀 때는 constraint.ts 를 먼저 고치고 tokens.ts 로 전파하세요.
 */
export const satgatTheme = {
  colors,
  typography,
  spacing,
  layout,
  shadows,
  textures,
} as const;

export type SatgatTheme = typeof satgatTheme;

/**
 * Brand profile override를 적용한 theme 생성기
 *
 * TODO(unimplemented, Phase 4): NOT IMPLEMENTED.
 * 현재 Phase 4 brand.md 파싱이 연결되지 않아 brandOverrides 가 전달되더라도
 * 기본 satgatTheme 을 그대로 반환하는 stub 입니다. 동작하는 brand-override
 * 로직이 아님 — 호출하지 말 것. Phase 4 완성 시 본 함수를 구현하거나 제거.
 */
export function createTheme(
  brandOverrides?: Partial<SatgatTheme['colors']>
): SatgatTheme {
  // NOT IMPLEMENTED (Phase 4). 현재 항상 기본 theme 반환.
  void brandOverrides; // 매개변수 사용 표시 (lint 회피) — Phase 4 에서 사용 예정.
  return satgatTheme;
}
