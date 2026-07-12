'use client';

import {
  BASELINE,
  DANCHEONG,
  DIVIDER_WEIGHT,
  GOLD,
  INK,
  JADE,
} from '@/lib/design-system/constraint';

interface SatgatDividerProps {
  /** 먹색 | 단청 | 취색 | 금박 */
  variant?: 'ink' | 'dancheong' | 'jade' | 'gold';
  /** thin | medium | thick */
  weight?: 'thin' | 'medium' | 'thick';
  /** 구분선 너비 (기본 100%) */
  width?: string;
  className?: string;
}

const variantMap = {
  ink: INK,
  dancheong: DANCHEONG,
  jade: JADE,
  gold: GOLD,
} as const;

/** 삿갓 구분선 — 불투명 단색과 정확한 두께만 사용한다. */
export function SatgatDivider({
  variant = 'ink',
  weight = 'thin',
  width = '100%',
  className = '',
}: SatgatDividerProps) {

  return (
    <div
      className={`satgat-divider ${className}`}
      style={{
        width,
        margin: `${BASELINE * 3}px 0`,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: DIVIDER_WEIGHT[weight],
          backgroundColor: variantMap[variant],
        }}
      />
    </div>
  );
}
