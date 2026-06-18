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

// 단청 underline 규격 — 모든 섹션 헤더에서 동일하게 유지(8조 5: 위계는 크기로,
// 악센트 두께·색은 일정). 제목 크기는 템플릿별로 달라도 이 밑줄 motif는 같다.
const DANCHEONG_UNDERLINE_WIDTH = 36;
const DANCHEONG_UNDERLINE_HEIGHT = 2;

interface SectionHeadingProps {
  title: string;
  /** 제목 옆 단청 보조 라벨 */
  subtitle?: string;
  /** 명조 H2 크기 (기본 16) */
  size?: number;
  /** 명조 H2 weight (기본 700) */
  weight?: number;
  /** 헤더 아래 여백 (기본 8) */
  marginBottom?: number;
}

/**
 * 공유 섹션 헤더 — 14종 단일 패턴: 명조 H2 + 단청 밑줄 + hairline.
 *
 * 이것이 삿갓 섹션 헤더의 **단일 권위 패턴**이다(M4 통일). 구성:
 *   1. 명조(Nanum Myeongjo) H2 — 제목. 크기로 위계 표현(8조 5).
 *   2. (옵션) 단청 보조 라벨 — 제목 옆 작은 돋움 라벨.
 *   3. 단청 밑줄(#9B1B1B) — 짧은 강조 rule. 모든 헤더에서 동일 두께·색.
 *   4. hairline(#D2D6CB 0.5pt) — 전폭 가는 구분선. 단청 밑줄이 그 위에 겹친다.
 *
 * Proposal/Report/SelfIntro/ProductBrochure가 각자 복사하던 헤더 패턴
 * (`SectionHead`/`ReportSectionHead`/인라인 `2px solid INK` 헤더)을 이 컴포넌트로
 * 수렴한다. 템플릿별 제목 크기·weight·여백 차이는 props로 흡수하되, 단청 밑줄과
 * hairline 두께·색은 고정해 14종 전반에서 일관된 악센트를 보장한다.
 *
 * 주의: 표지(cover) 대형 타이틀은 별도의 의도적 masthead 요소이며 이 인라인 섹션
 * 헤더와 구분된다.
 */
export function SectionHeading({ title, subtitle, size = 16, weight = 700, marginBottom = 8 }: SectionHeadingProps) {
  return (
    <div style={{ marginBottom }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
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
      {/* 단청 밑줄 — hairline 위에 겹쳐 단청 강조를 만든다(모든 섹션 헤더 공통). */}
      <div
        aria-hidden="true"
        style={{
          width: DANCHEONG_UNDERLINE_WIDTH,
          height: DANCHEONG_UNDERLINE_HEIGHT,
          background: DANCHEONG,
          marginTop: -1,
        }}
      />
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
