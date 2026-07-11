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
  const greeting = String(s['greeting'] ?? '새해 복 많이 받으세요');
  const message = String(s['message'] ?? '');
  const senderFamily = String(s['sender_family'] ?? '');
  const recipient = String(s['recipient'] ?? '');

  return (
    <SatgatDocument pageSpec="postcardPortrait">
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gold corner accent */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 18,
            height: 18,
            borderTop: `1.5pt solid ${GOLD}`,
            borderRight: `1.5pt solid ${GOLD}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            width: 18,
            height: 18,
            borderBottom: `1.5pt solid ${GOLD}`,
            borderLeft: `1.5pt solid ${GOLD}`,
          }}
        />

        {/* Recipient (옵션) */}
        {recipient && (
          <p
            style={{
              fontFamily: FONT_BATANG,
              fontSize: 10,
              color: INK_MUTED,
              margin: '0 0 8px',
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
            fontSize: 36,
            fontWeight: 800,
            lineHeight: 1.08,
            color: INK,
            textShadow: INK_BLEED_STRONG,
            margin: '0 0 6px',
            letterSpacing: '-0.025em',
          }}
        >
          {greeting}
        </h1>
        {occasion && (
          <p
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 12,
              color: GOLD,
              letterSpacing: '0.14em',
              margin: '0 0 14px',
              fontWeight: 700,
            }}
          >
            {occasion}
          </p>
        )}

        {/* Message */}
        {message && (
          <p
            style={{
              fontFamily: FONT_BATANG,
              fontSize: 11.5,
              lineHeight: 1.58,
              color: INK,
              margin: '0 0 auto',
              maxWidth: '88mm',
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
              paddingTop: 12,
              borderTop: `0.5pt solid ${HAIRLINE}`,
              textAlign: 'right',
            }}
          >
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 8.5,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: INK_MUTED,
                margin: '0 0 2px',
              }}
            >
              FROM
            </p>
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 11.5,
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
    </SatgatDocument>
  );
}
