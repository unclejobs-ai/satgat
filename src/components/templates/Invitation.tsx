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
} from '@/lib/design-system/constraint';

/**
 * 청첩장 — 두 사람의 시작
 * 엽서 · 날짜 + 장소 + RSVP
 */

export default function InvitationRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;
  const groomName = String(s['groom_name'] ?? '신랑');
  const groomParents = String(s['groom_parents'] ?? '');
  const brideName = String(s['bride_name'] ?? '신부');
  const brideParents = String(s['bride_parents'] ?? '');
  const date = String(s['date'] ?? '');
  const venue = String(s['venue'] ?? '');
  const message = String(s['message'] ?? '');
  const rsvpUrl = String(s['rsvp_url'] ?? '');

  return (
    <SatgatDocument pageSpec="postcardPortrait">
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: FONT_MYEONGJO,
            fontSize: 12,
            fontWeight: 700,
            color: DANCHEONG,
            letterSpacing: '0.65em',
            paddingLeft: '0.65em',
            marginBottom: 10,
          }}
        >
          청 첩 장
        </div>

        <div
          style={{
            width: 36,
            height: 1,
            background: DANCHEONG,
            marginBottom: 14,
          }}
        />

        {/* Message */}
        {message && (
          <p
            style={{
              fontFamily: FONT_BATANG,
              fontSize: 11,
              lineHeight: 1.55,
              color: INK_MUTED,
              margin: '0 0 12px',
              maxWidth: '82mm',
            }}
          >
            {message}
          </p>
        )}

        {/* Couple */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 5 }}>
          <span
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 24,
              fontWeight: 800,
              color: INK,
              letterSpacing: '-0.015em',
            }}
          >
            {groomName}
          </span>
          <span style={{ fontSize: 17, color: DANCHEONG }}>·</span>
          <span
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 24,
              fontWeight: 800,
              color: INK,
              letterSpacing: '-0.015em',
            }}
          >
            {brideName}
          </span>
        </div>

        {/* Parents */}
        {(groomParents || brideParents) && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginBottom: 10,
              fontFamily: FONT_BATANG,
              fontSize: 10,
              color: INK_MUTED,
              lineHeight: 1.45,
              maxWidth: '82mm',
            }}
          >
            <div style={{ textAlign: 'right' }}>{groomParents}</div>
            <div style={{ textAlign: 'left' }}>{brideParents}</div>
          </div>
        )}

        <div style={{ width: 28, height: 0.5, background: HAIRLINE, marginBottom: 10 }} />

        {/* Date */}
        {date && (
          <p
            style={{
              fontFamily: FONT_BATANG,
              fontSize: 12,
              fontWeight: 700,
              color: INK,
              margin: '0 0 3px',
            }}
          >
            {date}
          </p>
        )}

        {/* Venue */}
        {venue && (
          <p
            style={{
              fontFamily: FONT_BATANG,
              fontSize: 11,
              lineHeight: 1.5,
              color: INK,
              margin: '0 0 12px',
              maxWidth: '82mm',
              whiteSpace: 'pre-line',
            }}
          >
            {venue}
          </p>
        )}

        {/* RSVP */}
        {rsvpUrl && (
          <a
            href={rsvpUrl}
            style={{
              fontFamily: FONT_DODUM,
              fontSize: 9,
              letterSpacing: '0.14em',
              color: DANCHEONG,
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderBottom: `0.5pt solid ${DANCHEONG}`,
              paddingBottom: 2,
              marginTop: 'auto',
            }}
          >
            참석 의사 전하기 → RSVP
          </a>
        )}
      </div>
    </SatgatDocument>
  );
}
