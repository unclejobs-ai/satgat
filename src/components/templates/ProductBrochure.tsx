'use client';

import React from 'react';
import { SatgatDocument } from '@/components/document/SatgatDocument';
import { normalizeListItems } from '@/lib/engine/slot-list';
import { normalizeImageSlot } from '@/lib/engine/slot-image';
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
  const heroImage = normalizeImageSlot(s['hero_image']);
  const overview = String(s['overview'] ?? '');
  const usage = String(s['usage'] ?? '');
  const contact = String(s['contact'] ?? '');

  const features = normalizeListItems(s['features'], {
    titleKeys: ['title', 'name', 'feature'],
    descriptionKeys: ['description', 'summary', 'benefit', 'value'],
  });
  const certifications = normalizeListItems(s['certifications'], {
    titleKeys: ['title', 'name', 'certification', 'award'],
    descriptionKeys: ['description', 'summary', 'issuer', 'year'],
  });
  const specs = parseTable(s['specs']);
  const leadFeatures = features.slice(0, 2);
  const specPreview = specs.rows.slice(0, 2);

  return (
    <>
      {/* ─── P1: 히어로 ───────────────────────────────────────────────── */}
      <SatgatDocument format="a4">
        <section
          className="product-brochure-cover"
          style={{
            minHeight: 760,
            display: 'grid',
            gridTemplateColumns: heroImage ? '0.96fr 1.04fr' : '1fr',
            gap: 42,
            alignItems: 'stretch',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {category && (
              <p
                style={{
                  fontFamily: FONT_DODUM,
                  fontSize: 11,
                  letterSpacing: '0.13em',
                  color: INK_MUTED,
                  textTransform: 'uppercase',
                  margin: '0 0 18px',
                }}
              >
                {category}
              </p>
            )}
            <h1
              className="product-brochure-title"
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 52,
                fontWeight: 800,
                lineHeight: 1.08,
                color: INK,
                textShadow: INK_BLEED_STRONG,
                margin: '0 0 18px',
                wordBreak: 'keep-all',
              }}
            >
              {productName}
            </h1>
            <div style={{ width: 70, height: 3, background: DANCHEONG, marginBottom: 34 }} />

            {overview && (
              <p
                style={{
                  fontFamily: FONT_BATANG,
                  fontSize: 17,
                  lineHeight: 1.78,
                  color: INK,
                  textShadow: INK_BLEED,
                  margin: '0 0 34px',
                  wordBreak: 'keep-all',
                }}
              >
                {overview}
              </p>
            )}

            {leadFeatures.length > 0 && (
              <section style={{ marginTop: 'auto' }}>
                <h2
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1.35,
                    color: INK,
                    textShadow: INK_BLEED,
                    margin: '0 0 16px',
                    wordBreak: 'keep-all',
                  }}
                >
                  먼저 보이는 특징
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {leadFeatures.map((feature, index) => (
                    <div
                      key={`${feature.title}-${index}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '34px 1fr',
                        gap: 12,
                        padding: '14px 0',
                        borderTop: `1px solid ${index === 0 ? INK : HAIRLINE}`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONT_DODUM,
                          fontSize: 11,
                          letterSpacing: '0.08em',
                          color: DANCHEONG,
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3
                          style={{
                            fontFamily: FONT_MYEONGJO,
                            fontSize: 15,
                            fontWeight: 700,
                            lineHeight: 1.35,
                            color: INK,
                            margin: '0 0 4px',
                            wordBreak: 'keep-all',
                          }}
                        >
                          {feature.title}
                        </h3>
                        <p
                          style={{
                            fontFamily: FONT_BATANG,
                            fontSize: 13,
                            lineHeight: 1.62,
                            color: INK_MUTED,
                            margin: 0,
                            wordBreak: 'keep-all',
                          }}
                        >
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {heroImage && (
            <aside
              className="product-brochure-visual"
              style={{
                borderLeft: `1px solid ${HAIRLINE}`,
                paddingLeft: 30,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
              }}
            >
              <figure
                style={{
                  margin: 0,
                  width: '100%',
                  aspectRatio: '1 / 1',
                  border: `1px solid ${HAIRLINE}`,
                  borderRadius: 3,
                  overflow: 'hidden',
                  backgroundColor: '#E8E4DC',
                }}
              >
                {/* Raw img keeps generated/remote artwork printable without Next image constraints. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage.src}
                  alt={heroImage.alt || productName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </figure>

              {(specPreview.length > 0 || contact) && (
                <section
                  style={{
                    marginTop: 26,
                    paddingTop: 20,
                    borderTop: `1px solid ${HAIRLINE}`,
                  }}
                >
                  {specPreview.length > 0 && (
                    <>
                      <p
                        style={{
                          fontFamily: FONT_DODUM,
                          fontSize: 10,
                          letterSpacing: '0.12em',
                          color: JADE,
                          margin: '0 0 10px',
                        }}
                      >
                        SPEC SNAPSHOT
                      </p>
                      <dl style={{ margin: 0 }}>
                        {specPreview.map((row, index) => (
                          <div
                            key={`${row[0]}-${index}`}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '72px 1fr',
                              gap: 12,
                              padding: '9px 0',
                              borderTop: `1px solid ${index === 0 ? INK : HAIRLINE}`,
                            }}
                          >
                            <dt
                              style={{
                                fontFamily: FONT_DODUM,
                                fontSize: 11,
                                lineHeight: 1.45,
                                color: INK_MUTED,
                              }}
                            >
                              {row[0]}
                            </dt>
                            <dd
                              style={{
                                fontFamily: FONT_BATANG,
                                fontSize: 13,
                                lineHeight: 1.45,
                                color: INK_LIGHT,
                                margin: 0,
                                wordBreak: 'keep-all',
                              }}
                            >
                              {row[1]}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </>
                  )}
                  {contact && (
                    <p
                      style={{
                        fontFamily: FONT_DODUM,
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: INK_MUTED,
                        margin: specPreview.length > 0 ? '18px 0 0' : 0,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {contact}
                    </p>
                  )}
                </section>
              )}
            </aside>
          )}
        </section>

        <style jsx global>{`
          @media (max-width: 760px) {
            .product-brochure-cover {
              display: flex !important;
              flex-direction: column !important;
              gap: 28px !important;
              min-height: 0 !important;
            }

            .product-brochure-title {
              font-size: 38px !important;
              line-height: 1.12 !important;
            }

            .product-brochure-visual {
              border-left: 0 !important;
              border-top: 1px solid ${HAIRLINE} !important;
              padding-left: 0 !important;
              padding-top: 24px !important;
            }
          }
        `}</style>
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
