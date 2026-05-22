'use client';

import React from 'react';
import { SatgatDocument } from '@/components/document/SatgatDocument';
import { SatgatSeal } from '@/components/document/SatgatSeal';
import { SatgatDivider } from '@/components/document/SatgatDivider';
import type { SatgatDocumentData } from '@/lib/templates/types';
import {
  FONT_MYEONGJO,
  FONT_BATANG,
  FONT_DODUM,
  INK,
  INK_MUTED,
  DANCHEONG,
  HAIRLINE,
  LH_DISPLAY,
  LH_BODY,
  LH_CAPTION,
  INK_BLEED,
  INK_BLEED_STRONG,
  SHADOW_PAPER,
} from '@/lib/design-system/constraint';

/**
 * 브랜드 원페이지 — "선언문"
 *
 * 페이지 구조:
 *  ┌─────────────────────────────┐
 *  │  label                      │  8%
 *  │  DISPLAY TITLE              │  18%
 *  │  tagline                    │  8%
 *  │  [도장]                     │  6%
 *  ├─────────────────────────────┤
 *  │  먹구름 구분선              │  4%
 *  │  본문 (핵심 가치)           │  24%
 *  │  먹구름 구분선              │  4%
 *  ├─────────────────────────────┤
 *  │  제품/서비스 (3열)          │  18%
 *  │  연락처                     │  10%
 *  └─────────────────────────────┘
 *
 * 철학: 한 장의 종이에 브랜드의 정수를 담는다.
 * 여백이 말한다. 글자는 적게, 여백은 많게.
 */

export default function BrandOnepagerRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;

  const brandName = String(s['brand_name'] ?? '브랜드명');
  const tagline = String(s['tagline'] ?? '');
  const description = String(s['description'] ?? '');
  const website = String(s['website'] ?? '');
  const contact = String(s['contact'] ?? '');

  const products = parseList(s['products']);

  return (
    <SatgatDocument format="a4">
      {/* ─── 상단: 선언 ───────────────────────────────────────────────── */}
      <header style={{ marginBottom: 48 }}>
        <p
          style={{
            fontFamily: FONT_DODUM,
            fontSize: 12,
            letterSpacing: '0.08em',
            color: INK_MUTED,
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          BRAND ONE-PAGER
        </p>

        <h1
          style={{
            fontFamily: FONT_MYEONGJO,
            fontSize: 44,
            fontWeight: 800,
            lineHeight: LH_DISPLAY,
            color: INK,
            textShadow: INK_BLEED_STRONG,
            margin: '0 0 16px 0',
            wordBreak: 'keep-all',
          }}
        >
          {brandName}
        </h1>

        {tagline && (
          <p
            style={{
              fontFamily: FONT_BATANG,
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.5,
              color: INK_MUTED,
              margin: '0 0 24px 0',
              wordBreak: 'keep-all',
            }}
          >
            {tagline}
          </p>
        )}

        <SatgatSeal shape="circle" variant="dancheong" size={48}>
          上
        </SatgatSeal>
      </header>

      {/* ─── 중간: 핵심 가치 ───────────────────────────────────────────── */}
      <SatgatDivider variant="ink" weight="thin" inkWash />

      <section style={{ margin: '36px 0' }}>
        <p
          style={{
            fontFamily: FONT_BATANG,
            fontSize: 16,
            lineHeight: LH_BODY,
            color: INK,
            textShadow: INK_BLEED,
            margin: 0,
            wordBreak: 'keep-all',
            textAlign: 'justify',
          }}
        >
          {description}
        </p>
      </section>

      <SatgatDivider variant="ink" weight="thin" inkWash />

      {/* ─── 하단: 제품/서비스 ─────────────────────────────────────────── */}
      {products.length > 0 && (
        <section style={{ marginTop: 36 }}>
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
            }}
          >
            제품과 서비스
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
            }}
          >
            {products.slice(0, 3).map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '20px 0',
                  borderTop: `2px solid ${DANCHEONG}`,
                }}
              >
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
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: FONT_BATANG,
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: INK_MUTED,
                    margin: 0,
                    wordBreak: 'keep-all',
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── 푸터: 연락처 ──────────────────────────────────────────────── */}
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
