'use client';

import React from 'react';
import { SatgatDocument } from '../document/SatgatDocument';
import { SatgatDivider } from '../document/SatgatDivider';
import type { SatgatDocumentData } from '@/lib/templates/types';
import {
  FONT_MYEONGJO,
  FONT_BATANG,
  FONT_DODUM,
  INK,
  INK_LIGHT,
  INK_MUTED,
  DANCHEONG,
  HAIRLINE,
  INK_BLEED,
  INK_BLEED_STRONG,
} from '@/lib/design-system/constraint';

/**
 * 자기소개서(自己紹介書) — 4문항 표준
 * 지원동기 · 직무역량 · 성장과정 · 입사후포부
 */

const Q_LABELS = [
  { id: 'q1_motivation', label: '一. 지원 동기', sub: '왜 이곳에 지원합니까' },
  { id: 'q2_competence', label: '二. 직무 역량', sub: '내가 가진 강점과 경험' },
  { id: 'q3_growth', label: '三. 성장 과정', sub: '나를 만든 경험들' },
  { id: 'q4_aspiration', label: '四. 입사 후 포부', sub: '5년 뒤 내가 만들 가치' },
];

export default function SelfIntroRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;
  const name = String(s['name'] ?? '이름');
  const target = String(s['target'] ?? '');
  const role = String(s['role'] ?? '');

  return (
    <SatgatDocument format="a4">
      {/* Header */}
      <header style={{ marginBottom: 36 }}>
        <p
          style={{
            fontFamily: FONT_DODUM,
            fontSize: 11,
            letterSpacing: '0.22em',
            color: INK_MUTED,
            textTransform: 'uppercase',
            margin: '0 0 12px',
          }}
        >
          自己紹介書 · SELF INTRODUCTION
        </p>
        <h1
          style={{
            fontFamily: FONT_MYEONGJO,
            fontSize: 38,
            fontWeight: 800,
            lineHeight: 1.1,
            color: INK,
            textShadow: INK_BLEED_STRONG,
            margin: '0 0 8px',
            letterSpacing: '-0.018em',
          }}
        >
          {name}
        </h1>
        {(target || role) && (
          <p
            style={{
              fontFamily: FONT_BATANG,
              fontSize: 14,
              color: INK_LIGHT,
              margin: 0,
              letterSpacing: '0.01em',
            }}
          >
            {target}
            {target && role && ' · '}
            {role}
          </p>
        )}
      </header>

      <SatgatDivider variant="ink" weight="medium" />

      {/* 4 Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 28 }}>
        {Q_LABELS.map((q) => {
          const answer = String(s[q.id] ?? '');
          if (!answer) return null;
          return (
            <section key={q.id} style={{ breakInside: 'avoid' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                  marginBottom: 8,
                  paddingBottom: 6,
                  borderBottom: `0.5pt solid ${HAIRLINE}`,
                }}
              >
                <h2
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 16,
                    fontWeight: 800,
                    color: INK,
                    margin: 0,
                    letterSpacing: '-0.005em',
                    textShadow: INK_BLEED,
                  }}
                >
                  {q.label}
                </h2>
                <span style={{ fontFamily: FONT_DODUM, fontSize: 10.5, color: DANCHEONG, letterSpacing: '0.06em' }}>
                  {q.sub}
                </span>
              </div>
              <p
                style={{
                  fontFamily: FONT_BATANG,
                  fontSize: 13,
                  lineHeight: 1.85,
                  color: INK_LIGHT,
                  margin: 0,
                  whiteSpace: 'pre-line',
                  letterSpacing: '-0.003em',
                  wordBreak: 'keep-all',
                }}
              >
                {answer}
              </p>
            </section>
          );
        })}
      </div>
    </SatgatDocument>
  );
}
