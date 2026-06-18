'use client';

import React from 'react';
import { SatgatDocument } from '../document/SatgatDocument';
import type { SatgatDocumentData } from '@/lib/templates/types';
import {
  FONT_MYEONGJO,
  FONT_BATANG,
  FONT_DODUM,
  INK,
  INK_MUTED,
  DANCHEONG,
  HAIRLINE,
  INK_BLEED_STRONG,
} from '@/lib/design-system/constraint';

/**
 * 명함(名銜) — 한 사람의 표지
 *
 * 90×55mm 명함. 두 가지 모드:
 *  ① preview (큰 단일 카드 · 데스크탑 확인용)
 *  ② print-grid (A4에 8매 절취 · 인쇄용)
 *
 * @media print 시 자동으로 grid 모드로 전환.
 */

function CardFace({ data, scale = 1 }: { data: SatgatDocumentData; scale?: number }) {
  const s = data.slots;
  const name = String(s['name'] ?? '이름');
  const hanjaName = String(s['hanja_name'] ?? '');
  const title = String(s['title'] ?? '');
  const company = String(s['company'] ?? '');
  const email = String(s['email'] ?? '');
  const phone = String(s['phone'] ?? '');
  const website = String(s['website'] ?? '');
  const address = String(s['address'] ?? '');

  return (
    <div
      className="satgat-card-face"
      style={{
        width: `${90 * scale}mm`,
        height: `${55 * scale}mm`,
        background: '#FFFFFB',
        border: `0.4pt solid ${HAIRLINE}`,
        padding: `${5 * scale}mm ${6 * scale}mm`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* 단청 hairline 중앙 */}
      <div
        style={{
          position: 'absolute',
          top: '52%',
          left: `${6 * scale}mm`,
          right: `${6 * scale}mm`,
          height: '0.4pt',
          background: DANCHEONG,
          opacity: 0.85,
          transform: 'translateY(-50%)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: `${2 * scale}mm`, marginBottom: '1mm' }}>
        <span
          style={{
            fontFamily: FONT_MYEONGJO,
            fontSize: `${5 * scale}mm`,
            fontWeight: 800,
            lineHeight: 1.05,
            color: INK,
            textShadow: INK_BLEED_STRONG,
            letterSpacing: '-0.018em',
          }}
        >
          {name}
        </span>
        {hanjaName && (
          <span
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: `${2.2 * scale}mm`,
              fontWeight: 700,
              color: INK_MUTED,
              letterSpacing: '0.06em',
            }}
          >
            {hanjaName}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: FONT_BATANG,
          fontSize: `${2.4 * scale}mm`,
          color: INK_MUTED,
          letterSpacing: '0.02em',
        }}
      >
        {title}
        {company && <span> · {company}</span>}
      </span>

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: `${0.6 * scale}mm`,
        }}
      >
        {email && (
          <span style={{ fontFamily: FONT_DODUM, fontSize: `${1.9 * scale}mm`, color: INK_MUTED, letterSpacing: '0.04em' }}>
            {email}
          </span>
        )}
        {phone && (
          <span style={{ fontFamily: FONT_DODUM, fontSize: `${1.9 * scale}mm`, color: INK_MUTED, letterSpacing: '0.04em' }}>
            {phone}
          </span>
        )}
        {website && (
          <span style={{ fontFamily: FONT_DODUM, fontSize: `${1.9 * scale}mm`, color: INK_MUTED, letterSpacing: '0.04em' }}>
            {website}
          </span>
        )}
        {address && (
          <span
            style={{
              fontFamily: FONT_DODUM,
              fontSize: `${1.65 * scale}mm`,
              lineHeight: 1.35,
              color: INK_MUTED,
              letterSpacing: '0.02em',
              whiteSpace: 'pre-line',
            }}
          >
            {address}
          </span>
        )}
      </div>
    </div>
  );
}

export default function BusinessCardRenderer({ data }: { data: SatgatDocumentData }) {
  return (
    <SatgatDocument format="a4">
      {/* Preview 모드 — 화면용 큰 미리보기 (단일 명함 2× 스케일) */}
      <div className="card-preview-screen">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            className="card-preview-large"
            style={{
              boxShadow: '0 8pt 24pt rgba(28,25,22,0.08)',
              borderRadius: 4,
            }}
          >
            <CardFace data={data} scale={1.58} />
          </div>
          <div
            className="card-preview-compact"
            style={{
              boxShadow: '0 6pt 18pt rgba(28,25,22,0.08)',
              borderRadius: 4,
            }}
          >
            <CardFace data={data} scale={0.78} />
          </div>
        </div>

        <p
          className="card-preview-caption"
          style={{
            textAlign: 'center',
            fontFamily: FONT_DODUM,
            color: INK_MUTED,
            textTransform: 'uppercase',
          }}
        >
          90 × 55 mm · 인쇄 시 A4 한 장에 8매 자동 배치 · 절취선 표시
        </p>
      </div>

      {/* Print 모드 — A4에 8-up grid (2열 × 4행) */}
      <div
        className="card-print-grid"
        style={{
          gridTemplateColumns: '90mm 90mm',
          gridTemplateRows: 'repeat(4, 55mm)',
          gap: '0',
          justifyContent: 'center',
          alignContent: 'center',
          width: '180mm',
          margin: '0 auto',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              borderRight: i % 2 === 0 ? '0.4pt dashed #C9C3B4' : 'none',
              borderBottom: i < 6 ? '0.4pt dashed #C9C3B4' : 'none',
            }}
          >
            <CardFace data={data} scale={1} />
          </div>
        ))}
      </div>

      <style jsx>{`
        .card-preview-screen {
          display: block;
        }
        .card-preview-screen > div {
          padding-top: 30mm;
        }
        .card-preview-large {
          display: block;
        }
        .card-preview-compact {
          display: none;
        }
        .card-preview-caption {
          margin-top: 80mm;
          font-size: 11px;
          letter-spacing: 0.18em;
        }
        .card-print-grid {
          display: none;
        }
        @media screen and (max-width: 760px) {
          .card-preview-screen {
            overflow: hidden;
          }
          .card-preview-screen > div {
            padding-top: 10mm;
          }
          .card-preview-large {
            display: none;
          }
          .card-preview-compact {
            display: block;
          }
          .card-preview-caption {
            margin-top: 24mm;
            font-size: 8px;
            line-height: 1.6;
            letter-spacing: 0.08em;
          }
        }
        /* Print-scoped only: force the 8-up cut grid over the screen preview
           when rendering to PDF/paper. Not fighting any inline style. */
        @media print {
          .card-preview-screen {
            display: none !important;
          }
          .card-print-grid {
            display: grid !important;
          }
        }
      `}</style>
    </SatgatDocument>
  );
}
