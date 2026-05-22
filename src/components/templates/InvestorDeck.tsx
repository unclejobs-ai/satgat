'use client';

import React from 'react';
import { SatgatDocument } from '@/components/document/SatgatDocument';
import { SatgatDivider } from '@/components/document/SatgatDivider';
import type { SatgatDocumentData } from '@/lib/templates/types';
import {
  FONT_MYEONGJO,
  FONT_BATANG,
  FONT_DODUM,
  INK,
  INK_LIGHT,
  INK_MUTED,
  DANCHEONG,
  JADE,
  INK_BLEED,
  INK_BLEED_STRONG,
} from '@/lib/design-system/constraint';

/**
 * 투자 IR Deck — "설득문"
 *
 * 16:9 슬라이드 구조. 각 슬라이드는 하나의 메시지.
 *  S1: 회사명 + 덱 제목
 *  S2: Problem
 *  S3: Solution
 *  S4: Traction (메트릭 그리드)
 *  S5: Team
 *  S6: Ask
 *
 * 철학: 한 장, 한 메시지. 시각적 임팩트 + 정보 밀도의 균형.
 */

export default function InvestorDeckRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;

  const companyName = String(s['company_name'] ?? '회사명');
  const deckTitle = String(s['deck_title'] ?? '');
  const problem = String(s['problem'] ?? '');
  const solution = String(s['solution'] ?? '');
  const marketSize = String(s['market_size'] ?? '');
  const businessModel = String(s['business_model'] ?? '');
  const ask = String(s['ask'] ?? '');

  const traction = parseList(s['traction']);
  const team = parseList(s['team']);

  return (
    <>
      {/* ─── S1: 타이틀 ───────────────────────────────────────────────── */}
      <SatgatDocument format="slide-16x9">
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: FONT_DODUM,
              fontSize: 11,
              letterSpacing: '0.12em',
              color: INK_MUTED,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            INVESTOR DECK
          </p>
          <h1
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1.1,
              color: INK,
              textShadow: INK_BLEED_STRONG,
              margin: '0 0 12px 0',
              wordBreak: 'keep-all',
            }}
          >
            {companyName}
          </h1>
          {deckTitle && (
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 20,
                color: INK_MUTED,
                margin: 0,
                wordBreak: 'keep-all',
              }}
            >
              {deckTitle}
            </p>
          )}
          <SatgatDivider variant="dancheong" weight="medium" width="64px" />
        </div>
      </SatgatDocument>

      {/* ─── S2: Problem ──────────────────────────────────────────────── */}
      {problem && (
        <SatgatDocument format="slide-16x9">
          <SlideSection kicker="01" title="Problem" accent="dancheong">
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 20,
                lineHeight: 1.7,
                color: INK,
                textShadow: INK_BLEED,
                margin: 0,
                wordBreak: 'keep-all',
                textAlign: 'center',
              }}
            >
              {problem}
            </p>
          </SlideSection>
        </SatgatDocument>
      )}

      {/* ─── S3: Solution ─────────────────────────────────────────────── */}
      {solution && (
        <SatgatDocument format="slide-16x9">
          <SlideSection kicker="02" title="Solution" accent="jade">
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 20,
                lineHeight: 1.7,
                color: INK,
                textShadow: INK_BLEED,
                margin: 0,
                wordBreak: 'keep-all',
                textAlign: 'center',
              }}
            >
              {solution}
            </p>
          </SlideSection>
        </SatgatDocument>
      )}

      {/* ─── S4: Traction ─────────────────────────────────────────────── */}
      {traction.length > 0 && (
        <SatgatDocument format="slide-16x9">
          <SlideSection kicker="03" title="Traction" accent="dancheong">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(traction.length, 3)}, 1fr)`,
                gap: 32,
                width: '100%',
              }}
            >
              {traction.map((t, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <p
                    style={{
                      fontFamily: FONT_MYEONGJO,
                      fontSize: 36,
                      fontWeight: 800,
                      lineHeight: 1.1,
                      color: DANCHEONG,
                      textShadow: INK_BLEED,
                      margin: '0 0 8px 0',
                    }}
                  >
                    {t.description}
                  </p>
                  <p
                    style={{
                      fontFamily: FONT_DODUM,
                      fontSize: 13,
                      letterSpacing: '0.04em',
                      color: INK_MUTED,
                      margin: 0,
                    }}
                  >
                    {t.title}
                  </p>
                </div>
              ))}
            </div>
          </SlideSection>
        </SatgatDocument>
      )}

      {/* ─── S5: Team ─────────────────────────────────────────────────── */}
      {team.length > 0 && (
        <SatgatDocument format="slide-16x9">
          <SlideSection kicker="04" title="Team" accent="jade">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(team.length, 3)}, 1fr)`,
                gap: 32,
                width: '100%',
              }}
            >
              {team.map((m, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <h3
                    style={{
                      fontFamily: FONT_MYEONGJO,
                      fontSize: 18,
                      fontWeight: 700,
                      color: INK,
                      textShadow: INK_BLEED,
                      margin: '0 0 4px 0',
                      wordBreak: 'keep-all',
                    }}
                  >
                    {m.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: FONT_BATANG,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: INK_MUTED,
                      margin: 0,
                      wordBreak: 'keep-all',
                    }}
                  >
                    {m.description}
                  </p>
                </div>
              ))}
            </div>
          </SlideSection>
        </SatgatDocument>
      )}

      {/* ─── S6: Ask ──────────────────────────────────────────────────── */}
      {ask && (
        <SatgatDocument format="slide-16x9">
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 11,
                letterSpacing: '0.12em',
                color: INK_MUTED,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              05 / ASK
            </p>
            <h2
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 40,
                fontWeight: 800,
                lineHeight: 1.15,
                color: DANCHEONG,
                textShadow: INK_BLEED_STRONG,
                margin: '0 0 16px 0',
                wordBreak: 'keep-all',
              }}
            >
              {ask}
            </h2>
            <SatgatDivider variant="dancheong" weight="medium" width="64px" />
          </div>
        </SatgatDocument>
      )}
    </>
  );
}

function SlideSection({
  kicker,
  title,
  accent,
  children,
}: {
  kicker: string;
  title: string;
  accent: 'dancheong' | 'jade';
  children: React.ReactNode;
}) {
  const accentColor = accent === 'dancheong' ? DANCHEONG : JADE;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <p
        style={{
          fontFamily: FONT_DODUM,
          fontSize: 11,
          letterSpacing: '0.12em',
          color: INK_MUTED,
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        {kicker} / {title.toUpperCase()}
      </p>
      <h2
        style={{
          fontFamily: FONT_MYEONGJO,
          fontSize: 32,
          fontWeight: 700,
          lineHeight: 1.2,
          color: INK,
          textShadow: INK_BLEED,
          margin: '0 0 24px 0',
          wordBreak: 'keep-all',
        }}
      >
        {title}
      </h2>
      <div style={{ width: 40, height: 2, backgroundColor: accentColor, marginBottom: 32 }} />
      {children}
    </div>
  );
}

function parseList(raw: unknown): Array<{ title: string; description: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') {
        try {
          const parsed = JSON.parse(item);
          return { title: String(parsed.title ?? ''), description: String(parsed.description ?? '') };
        } catch {
          return { title: item, description: '' };
        }
      }
      if (item && typeof item === 'object') {
        return {
          title: String((item as Record<string, unknown>).title ?? ''),
          description: String((item as Record<string, unknown>).description ?? ''),
        };
      }
      return { title: '', description: '' };
    })
    .filter((i) => i.title);
}
