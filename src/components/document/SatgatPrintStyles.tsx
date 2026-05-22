'use client';

import React from 'react';

/**
 * 삿갓 전역 인쇄 스타일
 * @media print 규칙을 한 곳에서 관리
 */
export function SatgatPrintStyles() {
  return (
    <style jsx global>{`
      /* ─── Print Base ─────────────────────────────────────────────── */

      @media print {
        html,
        body {
          background: #F8F4E8 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* 링크 스타일 제거 */
        a {
          text-decoration: none !important;
          color: inherit !important;
        }

        /* 페이지 나누기 방지 */
        .satgat-section,
        .satgat-text,
        table,
        figure,
        img {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        /* 제목 뒤 페이지 나누기 방지 */
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

        /* 여러 페이지 문서일 때 각 satgat-document 사이 페이지 나누기 */
        .satgat-document {
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
