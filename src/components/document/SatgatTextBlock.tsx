'use client';

import React from 'react';
import { satgatTheme } from '@/lib/design-system/theme';

export type TextLevel = 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'label';

interface SatgatTextBlockProps {
  children: React.ReactNode;
  level?: TextLevel;
  /** accent 색상 (단청红) 적용 */
  accent?: boolean;
  /** muted 색상 적용 */
  muted?: boolean;
  /** 금박 색상 적용 */
  gold?: boolean;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  style?: React.CSSProperties;
}

/**
 * 레벨별 폰트 설정
 * - display, h1, h2 → Nanum Myeongjo (나눔명조) — 장중한 먹글씨
 * - h3, h4 → Gowun Batang (고울 바탕) — 따뜻한 제목
 * - body, caption, label → Gowun Batang / Gowun Dodum
 */
const levelConfig: Record<
  TextLevel,
  {
    fontFamily: string;
    fontWeight: number;
    size: string;
    lineHeight: number;
    letterSpacing: string;
    tag: keyof React.JSX.IntrinsicElements;
    inkBleed?: boolean;
  }
> = {
  display: {
    fontFamily: satgatTheme.typography.fontMyeongjo,
    fontWeight: satgatTheme.typography.weights.extraBold,
    size: satgatTheme.typography.sizes.display.size,
    lineHeight: satgatTheme.typography.sizes.display.lineHeight,
    letterSpacing: satgatTheme.typography.sizes.display.letterSpacing,
    tag: 'h1',
    inkBleed: true,
  },
  h1: {
    fontFamily: satgatTheme.typography.fontMyeongjo,
    fontWeight: satgatTheme.typography.weights.extraBold,
    size: satgatTheme.typography.sizes.h1.size,
    lineHeight: satgatTheme.typography.sizes.h1.lineHeight,
    letterSpacing: satgatTheme.typography.sizes.h1.letterSpacing,
    tag: 'h1',
    inkBleed: true,
  },
  h2: {
    fontFamily: satgatTheme.typography.fontMyeongjo,
    fontWeight: satgatTheme.typography.weights.bold,
    size: satgatTheme.typography.sizes.h2.size,
    lineHeight: satgatTheme.typography.sizes.h2.lineHeight,
    letterSpacing: satgatTheme.typography.sizes.h2.letterSpacing,
    tag: 'h2',
    inkBleed: true,
  },
  h3: {
    fontFamily: satgatTheme.typography.fontBatang,
    fontWeight: satgatTheme.typography.weights.bold,
    size: satgatTheme.typography.sizes.h3.size,
    lineHeight: satgatTheme.typography.sizes.h3.lineHeight,
    letterSpacing: satgatTheme.typography.sizes.h3.letterSpacing,
    tag: 'h3',
    inkBleed: true,
  },
  h4: {
    fontFamily: satgatTheme.typography.fontBatang,
    fontWeight: satgatTheme.typography.weights.semibold,
    size: satgatTheme.typography.sizes.h4.size,
    lineHeight: satgatTheme.typography.sizes.h4.lineHeight,
    letterSpacing: satgatTheme.typography.sizes.h4.letterSpacing,
    tag: 'h4',
  },
  body: {
    fontFamily: satgatTheme.typography.fontBatang,
    fontWeight: satgatTheme.typography.weights.regular,
    size: satgatTheme.typography.sizes.body.size,
    lineHeight: satgatTheme.typography.sizes.body.lineHeight,
    letterSpacing: satgatTheme.typography.sizes.body.letterSpacing,
    tag: 'p',
  },
  bodySmall: {
    fontFamily: satgatTheme.typography.fontBatang,
    fontWeight: satgatTheme.typography.weights.regular,
    size: satgatTheme.typography.sizes.bodySmall.size,
    lineHeight: satgatTheme.typography.sizes.bodySmall.lineHeight,
    letterSpacing: satgatTheme.typography.sizes.bodySmall.letterSpacing,
    tag: 'p',
  },
  caption: {
    fontFamily: satgatTheme.typography.fontDodum,
    fontWeight: satgatTheme.typography.weights.regular,
    size: satgatTheme.typography.sizes.caption.size,
    lineHeight: satgatTheme.typography.sizes.caption.lineHeight,
    letterSpacing: satgatTheme.typography.sizes.caption.letterSpacing,
    tag: 'span',
  },
  label: {
    fontFamily: satgatTheme.typography.fontDodum,
    fontWeight: satgatTheme.typography.weights.medium,
    size: satgatTheme.typography.sizes.label.size,
    lineHeight: satgatTheme.typography.sizes.label.lineHeight,
    letterSpacing: satgatTheme.typography.sizes.label.letterSpacing,
    tag: 'span',
  },
};

/**
 * 삿갓 타이포그래피 블록
 * level에 따라 명조/바탕/돋움, weight, size가 자동 결정
 * display/h1/h2/h3에는 먹 번짐(ink bleed) 효과 적용
 */
export function SatgatTextBlock({
  children,
  level = 'body',
  accent = false,
  muted = false,
  gold = false,
  className = '',
  as,
  style: extraStyle,
}: SatgatTextBlockProps) {
  const config = levelConfig[level];
  const Tag = (as || config.tag) as React.ElementType;

  const color = accent
    ? satgatTheme.colors.dancheong
    : gold
      ? satgatTheme.colors.gold
      : muted
        ? satgatTheme.colors.muted
        : satgatTheme.colors.ink;

  const textShadow = config.inkBleed ? satgatTheme.typography.inkBleed : undefined;

  return (
    <Tag
      className={`satgat-text ${className}`}
      style={{
        fontFamily: config.fontFamily,
        fontWeight: config.fontWeight,
        fontSize: config.size,
        lineHeight: config.lineHeight,
        letterSpacing: config.letterSpacing,
        color,
        textShadow,
        margin: 0,
        wordBreak: 'keep-all',
        overflowWrap: 'break-word',
        ...extraStyle,
      }}
    >
      {children}
    </Tag>
  );
}
