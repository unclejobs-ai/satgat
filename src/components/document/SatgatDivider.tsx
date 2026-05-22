'use client';

import React from 'react';
import { satgatTheme } from '@/lib/design-system/theme';

interface SatgatDividerProps {
  /** 먹색 | 단청红 | 취색 | 금박 */
  variant?: 'ink' | 'dancheong' | 'jade' | 'gold';
  /** thin | medium | thick */
  weight?: 'thin' | 'medium' | 'thick';
  /** 구분선 너비 (기본 100%) */
  width?: string;
  className?: string;
  /** 먹구름(ink wash) 스타일 — 번진 가장자리 */
  inkWash?: boolean;
}

const variantMap = {
  ink: satgatTheme.colors.ink,
  dancheong: satgatTheme.colors.dancheong,
  jade: satgatTheme.colors.jade,
  gold: satgatTheme.colors.gold,
};

const weightMap = {
  thin: satgatTheme.layout.divider.thin,
  medium: satgatTheme.layout.divider.medium,
  thick: satgatTheme.layout.divider.thick,
};

/**
 * 삿갓 구분선
 * 먹구름(ink wash) 옵션으로 전통 먹번짐 느낌
 */
export function SatgatDivider({
  variant = 'ink',
  weight = 'thin',
  width = '100%',
  className = '',
  inkWash = false,
}: SatgatDividerProps) {
  const color = variantMap[variant];
  const height = weightMap[weight];

  return (
    <div
      className={`satgat-divider ${className}`}
      style={{
        width,
        margin: `${satgatTheme.spacing.inline.lg} 0`,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height,
          backgroundColor: color,
          opacity: variant === 'ink' ? 0.12 : 0.85,
          borderRadius: inkWash ? '50%' : '0',
          filter: inkWash ? 'blur(0.5px)' : 'none',
        }}
      />
      {inkWash && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '10%',
            right: '10%',
            height: '1px',
            backgroundColor: color,
            opacity: 0.04,
            filter: 'blur(1.5px)',
            transform: 'translateY(-50%)',
          }}
        />
      )}
    </div>
  );
}
