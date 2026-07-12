'use client';

import React from 'react';
import { SatgatDocument } from '../document/SatgatDocument';
import { getPageSpec } from '@/lib/templates/registry';
import type { SatgatDocumentData } from '@/lib/templates/types';
import {
  FONT_MYEONGJO,
  FONT_BATANG,
  FONT_DODUM,
  INK,
  INK_MUTED,
  DANCHEONG,
  HAIRLINE,
  IVORY,
} from '@/lib/design-system/constraint';

const BUSINESS_CARD_SPEC = getPageSpec('businessCard8Up');

function requireBusinessCardImposition() {
  const { imposition } = BUSINESS_CARD_SPEC;
  if (!imposition) {
    throw new Error('businessCard8Up PageSpec requires imposition dimensions');
  }
  return imposition;
}

const BUSINESS_CARD_IMPOSITION = requireBusinessCardImposition();
const BUSINESS_CARD_GRID_WIDTH =
  BUSINESS_CARD_IMPOSITION.columns * BUSINESS_CARD_IMPOSITION.cardWidthMm;
const BUSINESS_CARD_GRID_HEIGHT =
  BUSINESS_CARD_IMPOSITION.rows * BUSINESS_CARD_IMPOSITION.cardHeightMm;
const BUSINESS_CARD_ORIGIN_X =
  (BUSINESS_CARD_SPEC.canvas.widthMm - BUSINESS_CARD_GRID_WIDTH) / 2;
const BUSINESS_CARD_ORIGIN_Y =
  (BUSINESS_CARD_SPEC.canvas.heightMm - BUSINESS_CARD_GRID_HEIGHT) / 2;

/**
 * 명함 — 한 사람의 표지
 *
 * PageSpec의 imposition 기하를 사용해 화면 미리보기와 8-up 인쇄판을 만든다.
 * 인쇄 전환과 용지 선택은 SatgatPrintStyles가 단독 소유한다.
 */

function CardFace({ data, scale = 1 }: { data: SatgatDocumentData; scale?: number }) {
  const s = data.slots;
  const name = String(s['name'] ?? '이름');
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
        width: `${BUSINESS_CARD_IMPOSITION.cardWidthMm * scale}mm`,
        height: `${BUSINESS_CARD_IMPOSITION.cardHeightMm * scale}mm`,
        background: IVORY,
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
            letterSpacing: '-0.018em',
          }}
        >
          {name}
        </span>
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
    <SatgatDocument pageSpec="businessCard8Up">
      {/* Screen preview — one canonical enlarged card composition */}
      <div className="card-preview-screen">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              boxShadow: `0 0 0 1px ${HAIRLINE}`,
              borderRadius: 4,
            }}
          >
            <CardFace data={data} scale={1.58} />
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
          {BUSINESS_CARD_IMPOSITION.cardWidthMm} × {BUSINESS_CARD_IMPOSITION.cardHeightMm} mm · 인쇄 시 A4 한 장에{' '}
          {BUSINESS_CARD_IMPOSITION.columns * BUSINESS_CARD_IMPOSITION.rows}매 자동 배치 · 절취선 표시
        </p>
      </div>

      {/* Print 모드 — A4에 8-up grid (2열 × 4행) */}
      <div
        className="card-print-grid"
        data-imposition-origin={`${BUSINESS_CARD_ORIGIN_X}mm ${BUSINESS_CARD_ORIGIN_Y}mm`}
        data-imposition-count={BUSINESS_CARD_IMPOSITION.columns * BUSINESS_CARD_IMPOSITION.rows}
        style={{
          gridTemplateColumns: `repeat(${BUSINESS_CARD_IMPOSITION.columns}, ${BUSINESS_CARD_IMPOSITION.cardWidthMm}mm)`,
          gridTemplateRows: `repeat(${BUSINESS_CARD_IMPOSITION.rows}, ${BUSINESS_CARD_IMPOSITION.cardHeightMm}mm)`,
          gap: '0',
          position: 'absolute',
          left: `${BUSINESS_CARD_ORIGIN_X}mm`,
          top: `${BUSINESS_CARD_ORIGIN_Y}mm`,
          width: `${BUSINESS_CARD_GRID_WIDTH}mm`,
          height: `${BUSINESS_CARD_GRID_HEIGHT}mm`,
        }}
      >
        {Array.from({ length: BUSINESS_CARD_IMPOSITION.columns * BUSINESS_CARD_IMPOSITION.rows }).map((_, i) => (
          <div
            key={i}
            style={{
              borderRight:
                i % BUSINESS_CARD_IMPOSITION.columns < BUSINESS_CARD_IMPOSITION.columns - 1
                  ? `0.4pt dashed ${HAIRLINE}`
                  : 'none',
              borderBottom:
                i < BUSINESS_CARD_IMPOSITION.columns * (BUSINESS_CARD_IMPOSITION.rows - 1)
                  ? `0.4pt dashed ${HAIRLINE}`
                  : 'none',
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
        .card-preview-caption {
          margin-top: 80mm;
          font-size: 11px;
          letter-spacing: 0.18em;
        }
        .card-print-grid {
          display: none;
        }
      `}</style>
    </SatgatDocument>
  );
}
