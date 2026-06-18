'use client';

import React from 'react';
import {
  FONT_MYEONGJO,
  FONT_BATANG,
  FONT_DODUM,
  INK,
  INK_LIGHT,
  DANCHEONG,
  HAIRLINE,
  INK_BLEED,
} from '@/lib/design-system/constraint';

interface SectionHeadingProps {
  title: string;
  /** 제목 옆 단청 보조 라벨 */
  subtitle?: string;
  /** 명조 H2 크기 (기본 16) */
  size?: number;
  /** 명조 H2 weight (기본 700) */
  weight?: number;
}

/**
 * 공유 섹션 헤더 — 명조 H2 + (옵션)단청 보조 라벨 + hairline 밑줄.
 *
 * Proposal/Report/SelfIntro가 각자 복사하던 동일한 `SectionHead`/`ReportSectionHead`/
 * 인라인 헤더 패턴을 단일 진실 원천으로 통합한다. 템플릿별 크기·weight 차이는
 * `size`/`weight` props로 흡수하여 비주얼 동등성을 유지한다.
 */
export function SectionHeading({ title, subtitle, size = 16, weight = 700 }: SectionHeadingProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 8,
        paddingBottom: 6,
        borderBottom: `0.5pt solid ${HAIRLINE}`,
      }}
    >
      <h2
        style={{
          fontFamily: FONT_MYEONGJO,
          fontSize: size,
          fontWeight: weight,
          color: INK,
          margin: 0,
          letterSpacing: '-0.005em',
          textShadow: INK_BLEED,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <span style={{ fontFamily: FONT_DODUM, fontSize: 10.5, color: DANCHEONG, letterSpacing: '0.06em' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}

interface ProseSectionProps extends SectionHeadingProps {
  children: React.ReactNode;
  /** 섹션 margin-top (기본 32) */
  marginTop?: number;
  /** 본문 문단 margin-top (기본 12) */
  bodyMarginTop?: number;
}

/**
 * 공유 산문 섹션 — 헤더 + 바탕체 본문 한 문단.
 *
 * Proposal의 `Section`과 Report의 `ReportTextSection`이 동일하게 복사하던
 * "헤더 + pre-line 본문" 묶음을 통합한다.
 */
export function ProseSection({
  title,
  subtitle,
  size,
  weight,
  marginTop = 32,
  bodyMarginTop = 12,
  children,
}: ProseSectionProps) {
  return (
    <section style={{ marginTop, breakInside: 'avoid' }}>
      <SectionHeading title={title} subtitle={subtitle} size={size} weight={weight} />
      <p
        style={{
          fontFamily: FONT_BATANG,
          fontSize: 13,
          lineHeight: 1.85,
          color: INK_LIGHT,
          margin: `${bodyMarginTop}px 0 0`,
          whiteSpace: 'pre-line',
          letterSpacing: '-0.003em',
          wordBreak: 'keep-all',
        }}
      >
        {children}
      </p>
    </section>
  );
}
