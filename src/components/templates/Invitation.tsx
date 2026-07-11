'use client';

import React from 'react';
import { SatgatDocument } from '../document/SatgatDocument';
import type { SatgatDocumentData } from '@/lib/templates/types';
import {
  FONT_MYEONGJO,
  FONT_BATANG,
  FONT_DODUM,
  FONT_LATIN,
  INK,
  INK_MUTED,
  DANCHEONG,
  HAIRLINE,
  INK_BLEED_STRONG,
  INK_BLEED,
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
    <SatgatDocument format="a4">
      {/* A5 모양 중앙 정렬 */}
      <div className="invitation-stage" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', paddingTop: 60 }}>
        <div
          className="invitation-card"
          style={{
            width: '148mm',
            maxWidth: '100%',
            minHeight: '210mm',
            background: '#FFFFFB',
            border: `0.5pt solid ${HAIRLINE}`,
            borderRadius: 4,
            padding: '64px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 8pt 24pt rgba(28,25,22,0.06)',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 14,
              fontWeight: 700,
              color: DANCHEONG,
              letterSpacing: '0.8em',
              paddingLeft: '0.8em',
              marginBottom: 24,
            }}
          >
            청 첩 장
          </div>

          <div
            style={{
              width: 48,
              height: 1,
              background: DANCHEONG,
              opacity: 0.85,
              marginBottom: 36,
            }}
          />

          {/* Message */}
          {message && (
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 13,
                lineHeight: 1.85,
                color: INK_MUTED,
                margin: '0 0 36px',
                maxWidth: 360,
              }}
            >
              {message}
            </p>
          )}

          {/* Couple */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 8 }}>
            <span
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 32,
                fontWeight: 800,
                color: INK,
                textShadow: INK_BLEED_STRONG,
                letterSpacing: '-0.015em',
              }}
            >
              {groomName}
            </span>
            <span style={{ fontFamily: FONT_LATIN, fontStyle: 'italic', fontSize: 22, color: DANCHEONG }}>·</span>
            <span
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 32,
                fontWeight: 800,
                color: INK,
                textShadow: INK_BLEED_STRONG,
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
                gap: 24,
                marginBottom: 32,
                fontFamily: FONT_BATANG,
                fontSize: 12,
                color: INK_MUTED,
                lineHeight: 1.7,
                maxWidth: 320,
              }}
            >
              <div style={{ textAlign: 'right' }}>{groomParents}</div>
              <div style={{ textAlign: 'left' }}>{brideParents}</div>
            </div>
          )}

          <div style={{ width: 32, height: 0.5, background: HAIRLINE, marginBottom: 28 }} />

          {/* Date */}
          {date && (
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 15,
                fontWeight: 700,
                color: INK,
                margin: '0 0 6px',
                textShadow: INK_BLEED,
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
                fontSize: 13.5,
                lineHeight: 1.75,
                color: INK,
                margin: '0 0 32px',
                maxWidth: 320,
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
                fontSize: 11,
                letterSpacing: '0.2em',
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
      </div>

      <style jsx>{`
        @media screen and (max-width: 760px) {
          .invitation-stage {
            padding-top: 12px;
          }
          .invitation-card {
            min-height: 0;
            padding: 40px 24px;
          }
        }
      `}</style>
    </SatgatDocument>
  );
}
