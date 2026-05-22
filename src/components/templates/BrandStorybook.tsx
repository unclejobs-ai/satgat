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
 * 브랜드 스토리북 — "서적"
 *
 * 페이지 구조:
 *  P1: 표지(브랜드명 + origin story)
 *  P2: 핵심 가치 (그리드)
 *  P3: 비주얼 컨셉 + 톤앤매너
 *  P4: milestone + 연락처
 *
 * 철학: 책을 읽듯이. 페이지를 넘기는 흐름.
 */

export default function BrandStorybookRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;

  const brandName = String(s['brand_name'] ?? '브랜드명');
  const originStory = String(s['origin_story'] ?? '');
  const visualConcept = String(s['visual_concept'] ?? '');
  const toneManner = String(s['tone_manner'] ?? '');
  const contact = String(s['contact'] ?? '');

  const values = parseList(s['values']);
  const milestones = parseList(s['milestones']);

  return (
    <>
      {/* ─── P1: 표지 ─────────────────────────────────────────────────── */}
      <SatgatDocument format="a4">
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            minHeight: '60vh',
          }}
        >
          <p
            style={{
              fontFamily: FONT_DODUM,
              fontSize: 12,
              letterSpacing: '0.12em',
              color: INK_MUTED,
              marginBottom: 24,
            }}
          >
            BRAND STORYBOOK
          </p>
          <h1
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1.1,
              color: INK,
              textShadow: INK_BLEED_STRONG,
              margin: '0 0 24px 0',
              wordBreak: 'keep-all',
            }}
          >
            {brandName}
          </h1>
          <SatgatDivider variant="dancheong" weight="medium" width="64px" />
        </div>

        {originStory && (
          <section style={{ marginTop: 48 }}>
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
              탄생 이야기
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
              {originStory}
            </p>
          </section>
        )}
      </SatgatDocument>

      {/* ─── P2: 핵심 가치 ────────────────────────────────────────────── */}
      {values.length > 0 && (
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
            핵심 가치
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 32,
            }}
          >
            {values.map((v, i) => (
              <div
                key={i}
                style={{
                  padding: '24px',
                  border: `1px solid ${HAIRLINE}`,
                  borderRadius: 5,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 2,
                    backgroundColor: JADE,
                    marginBottom: 16,
                  }}
                />
                <h3
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 18,
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
        </SatgatDocument>
      )}

      {/* ─── P3: 비주얼 컨셉 + 톤앤매너 ───────────────────────────────── */}
      <SatgatDocument format="a4">
        {visualConcept && (
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
              비주얼 컨셉
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
              {visualConcept}
            </p>
          </section>
        )}

        {toneManner && (
          <section>
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
              톤앤매너
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
              {toneManner}
            </p>
          </section>
        )}
      </SatgatDocument>

      {/* ─── P4: milestone + 연락처 ───────────────────────────────────── */}
      <SatgatDocument format="a4">
        {milestones.length > 0 && (
          <section style={{ marginBottom: 40 }}>
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
              주요 Milestone
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {milestones.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr',
                    gap: 24,
                    padding: '14px 0',
                    borderBottom: `1px solid ${HAIRLINE}`,
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_MYEONGJO,
                      fontSize: 14,
                      fontWeight: 700,
                      color: DANCHEONG,
                    }}
                  >
                    {m.title}
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
                    {m.description}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {contact && (
          <footer
            style={{
              marginTop: 48,
              paddingTop: 24,
              borderTop: `1px solid ${HAIRLINE}`,
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 13,
                letterSpacing: '0.04em',
                color: INK_MUTED,
                margin: 0,
              }}
            >
              {contact}
            </p>
          </footer>
        )}
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
          title: String(obj.title ?? obj.year ?? ''),
          description: String(obj.description ?? obj.event ?? ''),
        };
      }
      return { title: '', description: '' };
    })
    .filter((i) => i.title);
}
