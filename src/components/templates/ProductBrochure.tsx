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
 * 제품 소개서 — "설명서"
 *
 * 다중 페이지 구조:
 *  P1: 히어로(제품명+카테고리+개요)
 *  P2: 주요 특징 (3열 카드)
 *  P3: 스펙 테이블 + 사용법
 *  P4: 인증 + 연락처
 *
 * 철학: 정보의 위계. 사용자가 궁금해하는 순서대로.
 */

export default function ProductBrochureRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;

  const productName = String(s['product_name'] ?? '제품명');
  const category = String(s['category'] ?? '');
  const overview = String(s['overview'] ?? '');
  const usage = String(s['usage'] ?? '');
  const contact = String(s['contact'] ?? '');

  const features = parseList(s['features']);
  const certifications = parseList(s['certifications']);
  const specs = parseTable(s['specs']);

  return (
    <>
      {/* ─── P1: 히어로 ───────────────────────────────────────────────── */}
      <SatgatDocument format="a4">
        <header style={{ marginBottom: 40 }}>
          {category && (
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
              {category}
            </p>
          )}
          <h1
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 40,
              fontWeight: 800,
              lineHeight: 1.15,
              color: INK,
              textShadow: INK_BLEED_STRONG,
              margin: '0 0 20px 0',
              wordBreak: 'keep-all',
            }}
          >
            {productName}
          </h1>
          <SatgatDivider variant="dancheong" weight="medium" width="48px" />
        </header>

        {overview && (
          <section style={{ marginTop: 32 }}>
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
              {overview}
            </p>
          </section>
        )}
      </SatgatDocument>

      {/* ─── P2: 주요 특징 ────────────────────────────────────────────── */}
      {features.length > 0 && (
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
            주요 특징
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 28,
            }}
          >
            {features.map((f, i) => (
              <div key={i}>
                <div
                  style={{
                    width: 32,
                    height: 2,
                    backgroundColor: DANCHEONG,
                    marginBottom: 16,
                  }}
                />
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
                  {f.title}
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
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </SatgatDocument>
      )}

      {/* ─── P3: 스펙 + 사용법 ────────────────────────────────────────── */}
      <SatgatDocument format="a4">
        {specs.rows.length > 0 && (
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
              제품 스펙
            </h2>

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: FONT_BATANG,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              <thead>
                <tr>
                  {specs.headers.map((h, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        borderBottom: `2px solid ${INK}`,
                        fontFamily: FONT_MYEONGJO,
                        fontWeight: 700,
                        fontSize: 14,
                        color: INK,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specs.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        style={{
                          padding: '10px 16px',
                          borderBottom: `1px solid ${HAIRLINE}`,
                          color: INK_LIGHT,
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {usage && (
          <section>
            <h2
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 24,
                fontWeight: 700,
                lineHeight: 1.25,
                color: INK,
                textShadow: INK_BLEED,
                margin: '0 0 20px 0',
                wordBreak: 'keep-all',
                paddingBottom: 12,
                borderBottom: `2px solid ${INK}`,
              }}
            >
              사용법
            </h2>
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 15,
                lineHeight: 1.8,
                color: INK,
                textShadow: INK_BLEED,
                margin: 0,
                wordBreak: 'keep-all',
                whiteSpace: 'pre-line',
              }}
            >
              {usage}
            </p>
          </section>
        )}
      </SatgatDocument>

      {/* ─── P4: 인증 + 연락처 ────────────────────────────────────────── */}
      <SatgatDocument format="a4">
        {certifications.length > 0 && (
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
              인증 및 수상
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {certifications.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 16,
                    padding: '12px 0',
                    borderBottom: `1px solid ${HAIRLINE}`,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: JADE,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <span
                      style={{
                        fontFamily: FONT_MYEONGJO,
                        fontSize: 15,
                        fontWeight: 700,
                        color: INK,
                        wordBreak: 'keep-all',
                      }}
                    >
                      {c.title}
                    </span>
                    {c.description && (
                      <span
                        style={{
                          fontFamily: FONT_BATANG,
                          fontSize: 14,
                          color: INK_MUTED,
                          marginLeft: 8,
                        }}
                      >
                        — {c.description}
                      </span>
                    )}
                  </div>
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

function parseTable(raw: unknown): { headers: string[]; rows: string[][] } {
  if (raw && typeof raw === 'object' && 'headers' in (raw as object) && 'rows' in (raw as object)) {
    const obj = raw as { headers?: unknown; rows?: unknown };
    return {
      headers: Array.isArray(obj.headers) ? obj.headers.map(String) : [],
      rows: Array.isArray(obj.rows) ? obj.rows.map((r) => (Array.isArray(r) ? r.map(String) : [])) : [],
    };
  }
  return { headers: [], rows: [] };
}
