'use client';

import React from 'react';
import {
  CANVAS,
  CANVAS_DARK,
  TEXTURE_CANVAS_GRADIENT,
  TEXTURE_PAPER_NOISE,
  SHADOW_BOOK,
  PAGE_MARGIN_X,
  PAGE_MARGIN_Y,
} from '@/lib/design-system/constraint';

interface SatgatDocumentProps {
  children: React.ReactNode;
  /** A4 | A4-Landscape | Slide-16x9 */
  format?: 'a4' | 'a4-landscape' | 'slide-16x9';
  className?: string;
  /** 개발용 baseline grid 표시 */
  showBaseline?: boolean;
}

const formatMap = {
  a4: { width: '210mm', height: '297mm' },
  'a4-landscape': { width: '297mm', height: '210mm' },
  'slide-16x9': { width: '297mm', height: '167mm' },
};

/**
 * 삿갓 문서 루트 — A4/16:9 캔버스
 *
 * 철학: "한지 위의 먹글씨"
 * - 한지색 배경 + 미세 노이즈 질감 + 따뜻한 그라데이션
 * - 8px baseline grid (문서의 기준선)
 * - 절대 pure white 금지
 * - 브라우저 프리뷰에서는 고정 크기 + 책자 그림자
 * - @media print에서는 전체 화면, 배경색 강제
 */
export function SatgatDocument({
  children,
  format = 'a4',
  className = '',
  showBaseline = false,
}: SatgatDocumentProps) {
  const dims = formatMap[format];

  const baselineGrid = showBaseline
    ? `repeating-linear-gradient(to bottom, transparent, transparent 7px, rgba(28,28,28,0.03) 7px, rgba(28,28,28,0.03) 8px), `
    : '';

  return (
    <>
      <div
        className={`satgat-document ${className}`}
        data-format={format}
        style={{
          width: dims.width,
          minHeight: dims.height,
          backgroundColor: CANVAS,
          backgroundImage: `${baselineGrid}${TEXTURE_CANVAS_GRADIENT}, ${TEXTURE_PAPER_NOISE}`,
          color: 'var(--near-black, #1C1916)',
          fontFamily: "var(--serif, 'Gowun Batang'), 'Nanum Myeongjo', 'Noto Serif KR', 'Batang', Georgia, serif",
          fontSize: '15px',
          lineHeight: 1.72,
          letterSpacing: '-0.005em',
          wordBreak: 'keep-all',
          padding: `${PAGE_MARGIN_Y} ${PAGE_MARGIN_X}`,
          boxSizing: 'border-box',
          position: 'relative',
          margin: '0 auto',
          boxShadow: SHADOW_BOOK,
          breakAfter: 'page',
        }}
      >
        {children}
      </div>

      <style jsx global>{`
        @media screen {
          .satgat-document {
            margin-bottom: 48px;
          }
          .satgat-document + .satgat-document {
            margin-top: 48px;
          }
        }

        @media print {
          @page {
            size: auto;
            margin: 0;
          }

          body * {
            visibility: hidden;
          }

          .satgat-document,
          .satgat-document * {
            visibility: visible;
          }

          .satgat-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            min-height: 100vh !important;
            margin: 0 !important;
            box-shadow: none !important;
            break-after: page;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
}
