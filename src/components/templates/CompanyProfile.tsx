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
  HAIRLINE,
  DANCHEONG,
  JADE,
  INK_BLEED,
  INK_BLEED_STRONG,
} from '@/lib/design-system/constraint';

/**
 * 회사 소개서 — "서사"
 *
 * 페이지 구조:
 *  P1: 히어로(회사명 + 비전)
 *  P2: 미션 + 핵심 가치 (그리드)
 *  P3: 연혁 (timeline)
 *  P4: 팀 + 연락처
 *
 * 철학: 이야기의 흐름. 시작 → 발전 → 현재 → 미래.
 */

export default function CompanyProfileRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;

  const companyName = String(s['company_name'] ?? '회사명');
  const tagline = String(s['tagline'] ?? '');
  const vision = String(s['vision'] ?? '');
  const mission = String(s['mission'] ?? '');
  const contact = String(s['contact'] ?? '');
  const website = String(s['website'] ?? '');

  const values = parseList(s['values']);
  const history = parseList(s['history']);
  const team = parseList(s['team']);

  return (
    <>
      {/* ─── P1: 히어로 ───────────────────────────────────────────────── */}
      <SatgatDocument format="a4">
        <header style={{ marginBottom: 40 }}>
          <p
            style={{
              fontFamily: FONT_DODUM,
              fontSize: 12,
              letterSpacing: '0.08em',
              color: INK_MUTED,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            COMPANY PROFILE
          </p>
          <h1
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 42,
              fontWeight: 800,
              lineHeight: 1.15,
              color: INK,
              textShadow: INK_BLEED_STRONG,
              margin: '0 0 12px 0',
              wordBreak: 'keep-all',
            }}
          >
            {companyName}
          </h1>
          {tagline && (
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 18,
                color: INK_MUTED,
                margin: '0 0 24px 0',
                wordBreak: 'keep-all',
              }}
            >
              {tagline}
            </p>
          )}
          <SatgatDivider variant="dancheong" weight="medium" width="48px" />
        </header>

        {vision && (
          <section style={{ marginTop: 32 }}>
            <h2
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 20,
                fontWeight: 700,
                lineHeight: 1.3,
                color: INK,
                textShadow: INK_BLEED,
                margin: '0 0 16px 0',
                wordBreak: 'keep-all',
              }}
            >
              비전
            </h2>
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 16,
                lineHeight: 1.8,
                color: INK,
                textShadow: INK_BLEED,
                margin: 0,
                wordBreak: 'keep-all',
                textAlign: 'justify',
              }}
            >
              {vision}
            </p>
          </section>
        )}
      </SatgatDocument>

      {/* ─── P2: 미션 + 핵심 가치 ─────────────────────────────────────── */}
      <SatgatDocument format="a4">
        {mission && (
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 20,
                fontWeight: 700,
                lineHeight: 1.3,
                color: INK,
                textShadow: INK_BLEED,
                margin: '0 0 16px 0',
                wordBreak: 'keep-all',
              }}
            >
              미션
            </h2>
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 16,
                lineHeight: 1.8,
                color: INK,
                textShadow: INK_BLEED,
                margin: 0,
                wordBreak: 'keep-all',
                textAlign: 'justify',
              }}
            >
              {mission}
            </p>
          </section>
        )}

        {values.length > 0 && (
          <section>
            <h2
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 20,
                fontWeight: 700,
                lineHeight: 1.3,
                color: INK,
                textShadow: INK_BLEED,
                margin: '0 0 24px 0',
                wordBreak: 'keep-all',
                paddingBottom: 8,
                borderBottom: `2px solid ${INK}`,
              }}
            >
              핵심 가치
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 28,
              }}
            >
              {values.map((v, i) => (
                <div key={i} style={{ padding: '20px 0', borderTop: `2px solid ${JADE}` }}>
                  <h3
                    style={{
                      fontFamily: FONT_MYEONGJO,
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: 1.4,
                      color: INK,
                      margin: '0 0 8px 0',
                      wordBreak: 'keep-all',
                    }}
                  >
                    {v.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: FONT_BATANG,
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: INK_MUTED,
                      margin: 0,
                      wordBreak: 'keep-all',
                    }}
                  >
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </SatgatDocument>

      {/* ─── P3: 연혁 ─────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <SatgatDocument format="a4">
          <h2
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.25,
              color: INK,
              textShadow: INK_BLEED,
              margin: '0 0 32px 0',
              wordBreak: 'keep-all',
              paddingBottom: 12,
              borderBottom: `2px solid ${INK}`,
            }}
          >
            연혁
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: 24,
                  padding: '16px 0',
                  borderBottom: `1px solid ${HAIRLINE}`,
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 15,
                    fontWeight: 700,
                    color: DANCHEONG,
                    wordBreak: 'keep-all',
                  }}
                >
                  {h.title}
                </span>
                <span
                  style={{
                    fontFamily: FONT_BATANG,
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: INK_LIGHT,
                    wordBreak: 'keep-all',
                  }}
                >
                  {h.description}
                </span>
              </div>
            ))}
          </div>
        </SatgatDocument>
      )}

      {/* ─── P4: 팀 + 연락처 ──────────────────────────────────────────── */}
      <SatgatDocument format="a4">
        {team.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 24,
                fontWeight: 700,
                lineHeight: 1.25,
                color: INK,
                textShadow: INK_BLEED,
                margin: '0 0 24px 0',
                wordBreak: 'keep-all',
                paddingBottom: 12,
                borderBottom: `2px solid ${INK}`,
              }}
            >
              팀
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
              }}
            >
              {team.map((m, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '16px 0' }}>
                  <h3
                    style={{
                      fontFamily: FONT_MYEONGJO,
                      fontSize: 16,
                      fontWeight: 700,
                      color: INK,
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
          </section>
        )}

        <footer
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: `1px solid ${HAIRLINE}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <span
            style={{
              fontFamily: FONT_DODUM,
              fontSize: 12,
              letterSpacing: '0.04em',
              color: INK_MUTED,
            }}
          >
            {website}
          </span>
          <span
            style={{
              fontFamily: FONT_DODUM,
              fontSize: 12,
              letterSpacing: '0.04em',
              color: INK_MUTED,
            }}
          >
            {contact}
          </span>
        </footer>
      </SatgatDocument>
    </>
  );
}

function parseList(raw: unknown): Array<{ title: string; description: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') {
        try {
          const parsed = JSON.parse(item);
          return { title: String(parsed.title ?? parsed.year ?? ''), description: String(parsed.description ?? parsed.event ?? '') };
        } catch {
          return { title: item, description: '' };
        }
      }
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        return {
          title: String(obj.title ?? obj.year ?? obj.name ?? ''),
          description: String(obj.description ?? obj.event ?? obj.role ?? ''),
        };
      }
      return { title: '', description: '' };
    })
    .filter((i) => i.title);
}
