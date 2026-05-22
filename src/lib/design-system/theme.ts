import { colors, typography, spacing, layout, shadows, textures } from './tokens';

/**
 * 삿갓(Satgat) Theme Object
 * 컴포넌트/렌더러에서 일관되게 참조하는 진실원천
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
 * (Phase 4에서 brand.md 파싱 후 사용)
 */
export function createTheme(
  brandOverrides?: Partial<SatgatTheme['colors']>
): SatgatTheme {
  if (!brandOverrides) return satgatTheme;

  return {
    ...satgatTheme,
    colors: {
      ...satgatTheme.colors,
      ...brandOverrides,
    },
  };
}
