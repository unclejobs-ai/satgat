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
  GOLD,
  HAIRLINE,
  INK_BLEED_STRONG,
} from '@/lib/design-system/constraint';

/**
 * 연하장(年賀狀) — 한 해의 인사
 * 엽서 비율 · 인사말 + 메시지 + 보내는 사람
 */

export default function NewYearCardRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;
  const occasion = String(s['occasion'] ?? '신년');
  const yearHanja = String(s['year_hanja'] ?? '');
  const greeting = String(s['greeting'] ?? '謹賀新年');
  const message = String(s['message'] ?? '');
  const senderFamily = String(s['sender_family'] ?? '');
  const recipient = String(s['recipient'] ?? '');

  return (
    <SatgatDocument format="a4">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', paddingTop: 60 }}>
        <div
          style={{
            width: '180mm',
            aspectRatio: '148 / 105', // 엽서 가로
            background: '#F8F4E8',
            border: `0.5pt solid ${HAIRLINE}`,
            borderRadius: 4,
            padding: '48px 56px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: '0 8pt 24pt rgba(28,25,22,0.06)',
          }}
        >
          {/* Gold corner accent */}
          <div
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 24,
              height: 24,
              borderTop: `1.5pt solid ${GOLD}`,
              borderRight: `1.5pt solid ${GOLD}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 24,
              width: 24,
              height: 24,
              borderBottom: `1.5pt solid ${GOLD}`,
              borderLeft: `1.5pt solid ${GOLD}`,
            }}
          />

          {/* Recipient (옵션) */}
          {recipient && (
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 12,
                color: INK_MUTED,
                margin: '0 0 12px',
                letterSpacing: '0.04em',
              }}
            >
              {recipient} 귀하
            </p>
          )}

          {/* Greeting */}
          <h1
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.1,
              color: INK,
              textShadow: INK_BLEED_STRONG,
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}
          >
            {greeting}
          </h1>
          {yearHanja && (
            <p
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 14,
                color: GOLD,
                letterSpacing: '0.16em',
                margin: '0 0 24px',
                fontWeight: 700,
              }}
            >
              {yearHanja} · {occasion}
            </p>
          )}

          {/* Message */}
          {message && (
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 13.5,
                lineHeight: 1.85,
                color: INK,
                margin: '0 0 auto',
                maxWidth: 480,
                whiteSpace: 'pre-line',
              }}
            >
              {message}
            </p>
          )}

          {/* Sender */}
          {senderFamily && (
            <div
              style={{
                marginTop: 'auto',
                paddingTop: 24,
                borderTop: `0.5pt solid ${HAIRLINE}`,
                textAlign: 'right',
              }}
            >
              <p
                style={{
                  fontFamily: FONT_DODUM,
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: INK_MUTED,
                  margin: '0 0 4px',
                }}
              >
                FROM
              </p>
              <p
                style={{
                  fontFamily: FONT_BATANG,
                  fontSize: 13,
                  fontWeight: 700,
                  color: INK,
                  margin: 0,
                  letterSpacing: '0.02em',
                }}
              >
                {senderFamily}
              </p>
            </div>
          )}
        </div>
      </div>
    </SatgatDocument>
  );
}
