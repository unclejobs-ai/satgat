'use client';

import React from 'react';
import { satgatTheme } from '@/lib/design-system/theme';

interface SatgatSealProps {
  children: React.ReactNode;
  /** 원형 | 사각 */
  shape?: 'circle' | 'square';
  /** 단청红 | 취색 | 금박 | 먹색 */
  variant?: 'dancheong' | 'jade' | 'gold' | 'ink';
  size?: number;
  className?: string;
}

const variantMap = {
  dancheong: { bg: satgatTheme.colors.dancheong, color: '#F3EFE6' },
  jade: { bg: satgatTheme.colors.jade, color: '#F3EFE6' },
  gold: { bg: satgatTheme.colors.gold, color: '#1C1C1C' },
  ink: { bg: satgatTheme.colors.ink, color: '#F3EFE6' },
};

/**
 * 삿갓 도장(인장) 컴포넌트
 * 전통적인 인장/도장의 느낌을 현대적으로 재해석
 */
export function SatgatSeal({
  children,
  shape = 'circle',
  variant = 'dancheong',
  size = 56,
  className = '',
}: SatgatSealProps) {
  const { bg, color } = variantMap[variant];

  return (
    <div
      className={`satgat-seal ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color,
        borderRadius: shape === 'circle' ? '50%' : satgatTheme.layout.radius.sm,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: satgatTheme.typography.fontMyeongjo,
        fontWeight: satgatTheme.typography.weights.bold,
        fontSize: size * 0.35,
        lineHeight: 1,
        letterSpacing: '0.08em',
        textShadow: satgatTheme.typography.inkBleed,
        boxShadow: `${satgatTheme.shadows.paper}, inset 0 0 0 1.5px rgba(255,255,255,0.15)`,
        flexShrink: 0,
        wordBreak: 'keep-all',
      }}
    >
      {children}
    </div>
  );
}
