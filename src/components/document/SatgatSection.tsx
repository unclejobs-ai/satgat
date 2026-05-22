'use client';

import React from 'react';
import { satgatTheme } from '@/lib/design-system/theme';

interface SatgatSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** 섹션 구분선 상단 추가 */
  topDivider?: boolean;
  /** 제목 옆 도장(seal) 텍스트 */
  seal?: string;
}

const spacingMap = {
  sm: satgatTheme.spacing.section.sm,
  md: satgatTheme.spacing.section.md,
  lg: satgatTheme.spacing.section.lg,
  xl: satgatTheme.spacing.section.xl,
};

/**
 * 삿갓 섹션 컨테이너
 * 여백이 곧 디자인 — 섹션 간격을 일관되게 유지
 * 제목은 나눔명조로 장중함을 살림
 */
export function SatgatSection({
  children,
  title,
  subtitle,
  spacing = 'lg',
  className = '',
  topDivider = false,
  seal,
}: SatgatSectionProps) {
  const gap = spacingMap[spacing];

  return (
    <section
      className={`satgat-section ${className}`}
      style={{
        marginTop: gap,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      {topDivider && (
        <div
          style={{
            width: '100%',
            height: satgatTheme.layout.divider.thin,
            backgroundColor: satgatTheme.colors.ink,
            opacity: 0.08,
            marginBottom: gap,
            filter: 'blur(0.3px)',
          }}
        />
      )}

      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: satgatTheme.spacing.inline.md, marginBottom: subtitle ? satgatTheme.spacing.inline.sm : satgatTheme.spacing.inline.lg }}>
          <h2
            style={{
              fontFamily: satgatTheme.typography.fontMyeongjo,
              fontSize: satgatTheme.typography.sizes.h2.size,
              lineHeight: satgatTheme.typography.sizes.h2.lineHeight,
              fontWeight: satgatTheme.typography.weights.bold,
              color: satgatTheme.colors.ink,
              textShadow: satgatTheme.typography.inkBleed,
              wordBreak: 'keep-all',
              margin: 0,
            }}
          >
            {title}
          </h2>
          {seal && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                backgroundColor: satgatTheme.colors.dancheong,
                color: satgatTheme.colors.canvas,
                borderRadius: '50%',
                fontFamily: satgatTheme.typography.fontMyeongjo,
                fontSize: '11px',
                fontWeight: satgatTheme.typography.weights.bold,
                letterSpacing: '0.05em',
                flexShrink: 0,
              }}
            >
              {seal}
            </span>
          )}
        </div>
      )}

      {subtitle && (
        <p
          style={{
            fontFamily: satgatTheme.typography.fontBatang,
            fontSize: satgatTheme.typography.sizes.bodySmall.size,
            lineHeight: satgatTheme.typography.sizes.bodySmall.lineHeight,
            color: satgatTheme.colors.muted,
            marginBottom: satgatTheme.spacing.inline.lg,
            wordBreak: 'keep-all',
            letterSpacing: '0.02em',
          }}
        >
          {subtitle}
        </p>
      )}

      {children}
    </section>
  );
}
