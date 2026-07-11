'use client';

import React from 'react';
import { getPageSpec } from '@/lib/templates/registry';

const A4_PORTRAIT = getPageSpec('a4Portrait');
const A4_LANDSCAPE = getPageSpec('a4Landscape');
const SLIDE_16X9 = getPageSpec('slide16x9');
const BUSINESS_CARD_8_UP = getPageSpec('businessCard8Up');
const POSTCARD_PORTRAIT = getPageSpec('postcardPortrait');

/**
 * 삿갓 문서 인쇄 — 단일 권위 전략 (SINGLE SOURCE OF TRUTH)
 *
 * 문서/PDF 인쇄(`@media print`) 규칙은 **이 컴포넌트가 단독으로 소유**한다.
 * 예전에는 print 규칙이 SatgatDocument · PreviewClient · globals.css 등 여러
 * 곳에 흩어져 body/@page/.satgat-document를 각자 따로 설정하며 충돌했다(M4).
 * 이제 다음 한 곳으로 통합한다:
 *   - @page (size/margin)
 *   - html/body 백자지 캔버스 색 보존 (#F7F7F2, color-adjust exact)
 *   - .satgat-document 화면용 그림자/여백 해제 + 페이지 분할
 *   - 본문 break-inside / 제목 break-after / orphans·widows
 *   - 링크 장식 제거
 *   - 프리뷰 chrome(.no-print/툴바/밀도배지) 숨김 + .doc-stage 인쇄 레이아웃
 *
 * 이 컴포넌트는 PreviewClient가 렌더하며, PreviewClient는 브라우저 인쇄와 서버
 * PDF(헤드리스 크로미움이 /preview로 이동) **양쪽 모두의 유일한 인쇄 진입점**이다.
 * 따라서 모든 인쇄 경로에서 항상 존재한다. 다른 컴포넌트는 print 규칙을 두지
 * 않는다(SatgatDocument는 @media screen 여백만 둔다).
 */
export function SatgatPrintStyles() {
  return (
    <style jsx global>{`
      @media print {
        /* Named pages bind each PageSpec canvas to its exact PDF sheet. */
        @page satgat-a4-portrait {
          size: ${A4_PORTRAIT.cssSize};
          margin: 0;
        }
        @page satgat-a4-landscape {
          size: ${A4_LANDSCAPE.cssSize};
          margin: 0;
        }
        @page satgat-slide-16x9 {
          size: ${SLIDE_16X9.cssSize};
          margin: 0;
        }
        @page satgat-business-card-8-up {
          size: ${BUSINESS_CARD_8_UP.cssSize};
          margin: 0;
        }
        @page satgat-postcard-portrait {
          size: ${POSTCARD_PORTRAIT.cssSize};
          margin: 0;
        }

        /* 백자지 캔버스 보존 — 순백으로 뒤집히지 않게 색 보존 강제. */
        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          min-width: 0 !important;
          min-height: 0 !important;
          background: #F7F7F2 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* 프리뷰 chrome 숨김 — 앱 헤더/툴바/밀도배지 등은 인쇄 제외. */
        .no-print,
        .preview-toolbar,
        .satgat-shell > header,
        .satgat-topbar,
        .density-warn {
          display: none !important;
        }

        /* 프리뷰 셸: 인쇄 시 문서를 자연스럽게 흐르게 한다. */
        .satgat-shell,
        .satgat-shell > main {
          margin: 0 !important;
          padding: 0 !important;
          min-width: 0 !important;
          min-height: 0 !important;
        }

        .preview-wrap {
          padding: 0 !important;
          max-width: none !important;
        }
        .preview-canvas {
          zoom: 1 !important;
        }
        .doc-stage {
          display: block !important;
          overflow: visible !important;
          padding: 0 !important;
          gap: 0 !important;
        }

        /* 링크 장식 제거 */
        a {
          text-decoration: none !important;
          color: inherit !important;
        }


        .doc-stage .satgat-document[data-page-spec='a4Portrait'] {
          page: satgat-a4-portrait;
          width: ${A4_PORTRAIT.canvas.widthMm}mm !important;
          height: ${A4_PORTRAIT.canvas.heightMm}mm !important;
        }
        .doc-stage .satgat-document[data-page-spec='a4Landscape'] {
          page: satgat-a4-landscape;
          width: ${A4_LANDSCAPE.canvas.widthMm}mm !important;
          height: ${A4_LANDSCAPE.canvas.heightMm}mm !important;
        }
        .doc-stage .satgat-document[data-page-spec='slide16x9'] {
          page: satgat-slide-16x9;
          width: ${SLIDE_16X9.canvas.widthMm}mm !important;
          height: ${SLIDE_16X9.canvas.heightMm}mm !important;
        }
        .doc-stage .satgat-document[data-page-spec='businessCard8Up'] {
          page: satgat-business-card-8-up;
          width: ${BUSINESS_CARD_8_UP.canvas.widthMm}mm !important;
          height: ${BUSINESS_CARD_8_UP.canvas.heightMm}mm !important;
        }
        .doc-stage .satgat-document[data-page-spec='postcardPortrait'] {
          page: satgat-postcard-portrait;
          width: ${POSTCARD_PORTRAIT.canvas.widthMm}mm !important;
          height: ${POSTCARD_PORTRAIT.canvas.heightMm}mm !important;
        }

        /* PageSpec 문서 페이지: 인라인 캔버스 치수를 보존하고 화면 장식만 해제한다. */
        .satgat-document[data-page-spec] {
          margin: 0 !important;
          box-shadow: none !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          break-after: page !important;
          page-break-after: always !important;
        }
        .satgat-document[data-page-spec] * {
          page: inherit !important;
          break-inside: auto !important;
          page-break-inside: auto !important;
        }
        /* Chromium은 figure의 기본 block fragmentation에서 named page를 잃을 수 있다. */
        .satgat-document[data-page-spec] .satgat-visual {
          display: flow-root !important;
        }
        .satgat-document[data-page-spec='businessCard8Up'] .card-preview-screen {
          display: none !important;
        }
        .satgat-document[data-page-spec='businessCard8Up'] .card-print-grid {
          display: grid !important;
        }
        .satgat-document[data-page-spec]:last-of-type {
          break-after: auto !important;
          page-break-after: auto !important;
        }
      }
    `}</style>
  );
}
