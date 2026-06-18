'use client';

import React from 'react';

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
 * 않는다(SatgatDocument는 @media screen 여백만, BusinessCard는 절취 grid 토글만).
 */
export function SatgatPrintStyles() {
  return (
    <style jsx global>{`
      @media print {
        /* @page — 문서 자체 크기를 따른다(a4/landscape/slide 혼재).
           preferCSSPageSize와 맞물려 각 포맷이 제 크기로 인쇄된다. */
        @page {
          size: auto;
          margin: 0;
        }

        /* 백자지 캔버스 보존 — 순백으로 뒤집히지 않게 색 보존 강제. */
        html,
        body {
          background: #F7F7F2 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* 프리뷰 chrome 숨김 — 툴바/밀도배지 등은 인쇄 제외. */
        .no-print,
        .preview-toolbar,
        .density-warn {
          display: none !important;
        }

        /* 프리뷰 셸: 인쇄 시 문서를 자연스럽게 흐르게 한다. */
        .preview-wrap {
          padding: 0 !important;
          max-width: none !important;
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

        /* 본문/표/도판 페이지 중간 분할 방지 */
        .satgat-document section,
        table,
        figure,
        img {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        /* 제목 뒤 페이지 분할 방지 */
        h1,
        h2,
        h3,
        h4 {
          break-after: avoid !important;
          page-break-after: avoid !important;
          orphans: 3;
          widows: 3;
        }

        /* 본문 단락 orphans/widows */
        p {
          orphans: 2;
          widows: 2;
        }

        /* 문서 페이지: 화면용 그림자/여백 해제 + 페이지마다 분할 */
        .satgat-document {
          width: 100% !important;
          min-height: 100vh !important;
          margin: 0 !important;
          box-shadow: none !important;
          break-after: page !important;
          page-break-after: always !important;
        }
        .satgat-document:last-child {
          break-after: auto !important;
          page-break-after: auto !important;
        }
      }
    `}</style>
  );
}
