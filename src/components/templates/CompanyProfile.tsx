'use client';

import React from 'react';
import { SatgatDocument } from '@/components/document/SatgatDocument';
import { SatgatVisual } from '@/components/diagrams';
import { normalizeListItems } from '@/lib/engine/slot-list';
import type { SatgatDocumentData } from '@/lib/templates/types';
import {
  FONT_MYEONGJO,
  FONT_BATANG,
  FONT_DODUM,
  INK,
  INK_LIGHT,
  INK_MUTED,
  HAIRLINE,
  JADE,
  GOLD,
  INK_BLEED,
  INK_BLEED_STRONG,
} from '@/lib/design-system/constraint';

/**
 * 회사 소개서 - 압축형 서사
 *
 * P1: 회사의 첫인상, 비전/미션, 핵심 가치, 연락 메타
 * P2: 연혁과 팀을 한 장 안에서 연결해 현재의 실행력으로 마무리
 */

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value);
}

export default function CompanyProfileRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;

  const companyName = String(s['company_name'] ?? '회사명');
  const tagline = String(s['tagline'] ?? '');
  const vision = String(s['vision'] ?? '');
  const mission = String(s['mission'] ?? '');
  const contact = String(s['contact'] ?? '');
  const website = String(s['website'] ?? '');
  const growthChart = s['growth_chart'];

  const values = normalizeListItems(s['values']);
  const history = normalizeListItems(s['history'], {
    titleKeys: ['year', 'title', 'date'],
    descriptionKeys: ['event', 'description', 'summary'],
  });
  const rawTeam = Array.isArray(s['team']) ? s['team'] : [];
  const team = normalizeListItems(rawTeam, {
    titleKeys: ['name', 'title'],
    descriptionKeys: ['role', 'background', 'description'],
  }).map((member, index) => {
    const record = asRecord(rawTeam[index]);
    if (!record) return member;

    const role = textValue(record.role);
    const background = textValue(record.background);
    const description = [role, background].filter(Boolean).join(' · ');

    return description ? { ...member, description } : member;
  });

  const metaItems = [
    { label: 'WEB', value: website },
    { label: 'CONTACT', value: contact },
  ].filter((item) => item.value);
  const primaryValues = values.slice(0, 4);
  const monogram = companyName.trim().slice(0, 1) || '社';

  return (
    <>
      <SatgatDocument format="a4">
        <section
          className="company-profile-hero"
          style={{
            minHeight: 660,
            display: 'grid',
            gridTemplateColumns: '1.05fr 0.95fr',
            gap: 40,
            alignItems: 'stretch',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 11,
                letterSpacing: '0.12em',
                color: INK_MUTED,
                textTransform: 'uppercase',
                margin: '0 0 20px 0',
              }}
            >
              COMPANY PROFILE
            </p>
            <h1
              className="company-profile-title"
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 52,
                fontWeight: 800,
                lineHeight: 1.08,
                color: INK,
                textShadow: INK_BLEED_STRONG,
                margin: '0 0 18px 0',
                wordBreak: 'keep-all',
              }}
            >
              {companyName}
            </h1>
            {tagline && (
              <p
                style={{
                  maxWidth: 420,
                  fontFamily: FONT_BATANG,
                  fontSize: 19,
                  lineHeight: 1.62,
                  color: INK_LIGHT,
                  textShadow: INK_BLEED,
                  margin: '0 0 34px 0',
                  wordBreak: 'keep-all',
                }}
              >
                {tagline}
              </p>
            )}

            <div
              style={{
                width: 72,
                height: 3,
                background: JADE,
                marginBottom: 40,
              }}
            />

            {vision && (
              <section
                style={{
                  marginTop: 'auto',
                  paddingTop: 32,
                  borderTop: `1px solid ${HAIRLINE}`,
                }}
              >
                <p
                  style={{
                    fontFamily: FONT_DODUM,
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    color: JADE,
                    margin: '0 0 10px 0',
                  }}
                >
                  VISION
                </p>
                <h2
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1.28,
                    color: INK,
                    textShadow: INK_BLEED,
                    margin: '0 0 14px 0',
                    wordBreak: 'keep-all',
                  }}
                >
                  비전
                </h2>
                <p
                  style={{
                    fontFamily: FONT_BATANG,
                    fontSize: 16,
                    lineHeight: 1.82,
                    color: INK,
                    textShadow: INK_BLEED,
                    margin: 0,
                    wordBreak: 'keep-all',
                  }}
                >
                  {vision}
                </p>
              </section>
            )}
          </div>

          <aside
            className="company-profile-aside"
            style={{
              position: 'relative',
              borderLeft: `1px solid ${HAIRLINE}`,
              paddingLeft: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
            }}
          >
            <div
              aria-hidden="true"
              style={{
                alignSelf: 'flex-end',
                width: 74,
                height: 74,
                border: `1px solid ${GOLD}`,
                display: 'grid',
                placeItems: 'center',
                fontFamily: FONT_MYEONGJO,
                fontSize: 36,
                fontWeight: 800,
                color: INK,
                textShadow: INK_BLEED,
              }}
            >
              {monogram}
            </div>

            {mission && (
              <section>
                <p
                  style={{
                    fontFamily: FONT_DODUM,
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    color: JADE,
                    margin: '0 0 10px 0',
                  }}
                >
                  MISSION
                </p>
                <h2
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 20,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: INK,
                    textShadow: INK_BLEED,
                    margin: '0 0 12px 0',
                    wordBreak: 'keep-all',
                  }}
                >
                  미션
                </h2>
                <p
                  style={{
                    fontFamily: FONT_BATANG,
                    fontSize: 15,
                    lineHeight: 1.76,
                    color: INK_LIGHT,
                    textShadow: INK_BLEED,
                    margin: 0,
                    wordBreak: 'keep-all',
                  }}
                >
                  {mission}
                </p>
              </section>
            )}

            {primaryValues.length > 0 && (
              <section style={{ marginTop: 8 }}>
                <h2
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1.35,
                    color: INK,
                    textShadow: INK_BLEED,
                    margin: '0 0 16px 0',
                    wordBreak: 'keep-all',
                  }}
                >
                  핵심 가치
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {primaryValues.map((v, i) => (
                    <div
                      key={`${v.title}-${i}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '34px 1fr',
                        gap: 12,
                        paddingTop: 14,
                        borderTop: `1px solid ${HAIRLINE}`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONT_DODUM,
                          fontSize: 11,
                          letterSpacing: '0.08em',
                          color: JADE,
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3
                          style={{
                            fontFamily: FONT_MYEONGJO,
                            fontSize: 15,
                            fontWeight: 700,
                            lineHeight: 1.35,
                            color: INK,
                            margin: '0 0 4px 0',
                            wordBreak: 'keep-all',
                          }}
                        >
                          {v.title}
                        </h3>
                        {v.description && (
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
                            {v.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {metaItems.length > 0 && (
              <dl
                style={{
                  margin: 'auto 0 0 0',
                  paddingTop: 20,
                  borderTop: `1px solid ${HAIRLINE}`,
                }}
              >
                {metaItems.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '54px 1fr',
                      gap: 10,
                      marginTop: 8,
                    }}
                  >
                    <dt
                      style={{
                        fontFamily: FONT_DODUM,
                        fontSize: 10,
                        letterSpacing: '0.08em',
                        color: INK_MUTED,
                      }}
                    >
                      {item.label}
                    </dt>
                    <dd
                      style={{
                        fontFamily: FONT_DODUM,
                        fontSize: 11,
                        lineHeight: 1.5,
                        color: INK_LIGHT,
                        margin: 0,
                        wordBreak: 'normal',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </aside>
        </section>
      </SatgatDocument>

      <SatgatDocument format="a4">
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 78,
            bottom: 132,
            fontFamily: FONT_MYEONGJO,
            fontSize: 172,
            fontWeight: 800,
            lineHeight: 0.95,
            height: 190,
            color: 'rgba(46,107,94,0.055)',
            pointerEvents: 'none',
          }}
        >
          {monogram}
        </div>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 32,
            alignItems: 'flex-start',
            paddingBottom: 24,
            borderBottom: `2px solid ${INK}`,
            marginBottom: 36,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 11,
                letterSpacing: '0.12em',
                color: INK_MUTED,
                margin: '0 0 10px 0',
              }}
            >
              COMPANY RECORD
            </p>
            <h2
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 30,
                fontWeight: 800,
                lineHeight: 1.18,
                color: INK,
                textShadow: INK_BLEED_STRONG,
                margin: 0,
                wordBreak: 'keep-all',
              }}
            >
              운영의 발자취와 현재의 팀
            </h2>
          </div>
          <span
            style={{
              fontFamily: FONT_DODUM,
              fontSize: 12,
              lineHeight: 1.5,
              color: INK_MUTED,
              textAlign: 'right',
              wordBreak: 'keep-all',
              maxWidth: 160,
            }}
          >
            {companyName}
          </span>
        </header>

        {Boolean(growthChart) && (
          <section style={{ margin: '0 0 34px', breakInside: 'avoid' }}>
            <SatgatVisual visual={growthChart} />
          </section>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: history.length > 0 && team.length > 0 ? '1.08fr 0.92fr' : '1fr',
            gap: 40,
            minHeight: 430,
          }}
        >
          <section>
            <h3
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 19,
                fontWeight: 700,
                lineHeight: 1.35,
                color: INK,
                textShadow: INK_BLEED,
                margin: '0 0 18px 0',
                wordBreak: 'keep-all',
              }}
            >
              연혁
            </h3>

            {history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {history.map((h, i) => (
                  <div
                    key={`${h.title}-${i}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '78px 1fr',
                      gap: 18,
                      padding: '16px 0',
                      borderTop: `1px solid ${i === 0 ? INK : HAIRLINE}`,
                      alignItems: 'baseline',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONT_DODUM,
                        fontSize: 12,
                        letterSpacing: '0.04em',
                        color: JADE,
                        wordBreak: 'keep-all',
                      }}
                    >
                      {h.title}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_BATANG,
                        fontSize: 15,
                        lineHeight: 1.7,
                        color: INK_LIGHT,
                        textShadow: INK_BLEED,
                        wordBreak: 'keep-all',
                      }}
                    >
                      {h.description}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontFamily: FONT_BATANG,
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: INK_LIGHT,
                  margin: 0,
                  wordBreak: 'keep-all',
                }}
              >
                {vision || tagline}
              </p>
            )}
          </section>

          <section>
            <h3
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 19,
                fontWeight: 700,
                lineHeight: 1.35,
                color: INK,
                textShadow: INK_BLEED,
                margin: '0 0 18px 0',
                wordBreak: 'keep-all',
              }}
            >
              팀
            </h3>

            {team.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {team.map((m, i) => (
                  <article
                    key={`${m.title}-${i}`}
                    style={{
                      padding: '18px 0',
                      borderTop: `1px solid ${i === 0 ? INK : HAIRLINE}`,
                    }}
                  >
                    <h4
                      style={{
                        fontFamily: FONT_MYEONGJO,
                        fontSize: 18,
                        fontWeight: 700,
                        lineHeight: 1.3,
                        color: INK,
                        margin: '0 0 7px 0',
                        wordBreak: 'keep-all',
                      }}
                    >
                      {m.title}
                    </h4>
                    <p
                      style={{
                        fontFamily: FONT_BATANG,
                        fontSize: 14,
                        lineHeight: 1.68,
                        color: INK_MUTED,
                        margin: 0,
                        wordBreak: 'keep-all',
                      }}
                    >
                      {m.description}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontFamily: FONT_BATANG,
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: INK_LIGHT,
                  margin: 0,
                  wordBreak: 'keep-all',
                }}
              >
                {mission || vision}
              </p>
            )}
          </section>
        </div>

        <section
          style={{
            marginTop: 40,
            padding: '22px 0',
            borderTop: `1px solid ${HAIRLINE}`,
            borderBottom: `1px solid ${HAIRLINE}`,
            display: 'grid',
            gridTemplateColumns: '1fr 0.72fr',
            gap: 34,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 10,
                letterSpacing: '0.12em',
                color: JADE,
                margin: '0 0 8px 0',
              }}
            >
              OPERATING NOTE
            </p>
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 15,
                lineHeight: 1.72,
                color: INK_LIGHT,
                textShadow: INK_BLEED,
                margin: 0,
                wordBreak: 'keep-all',
              }}
            >
              {mission || vision || tagline}
            </p>
          </div>
          <div>
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 10,
                letterSpacing: '0.12em',
                color: INK_MUTED,
                margin: '0 0 8px 0',
              }}
            >
              CONTACT POINT
            </p>
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 12,
                lineHeight: 1.6,
                color: INK_LIGHT,
                margin: 0,
                whiteSpace: 'pre-line',
                overflowWrap: 'anywhere',
              }}
            >
              {[website, contact].filter(Boolean).join('\n')}
            </p>
          </div>
        </section>

        <footer
          style={{
            marginTop: 30,
            paddingTop: 18,
            borderTop: `1px solid ${HAIRLINE}`,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 24,
            alignItems: 'baseline',
          }}
        >
          <span
            style={{
              fontFamily: FONT_DODUM,
              fontSize: 11,
              letterSpacing: '0.08em',
              color: INK_MUTED,
            }}
          >
            COMPANY PROFILE
          </span>
          <span
            style={{
              fontFamily: FONT_DODUM,
              fontSize: 12,
              lineHeight: 1.5,
              color: INK_MUTED,
              textAlign: 'right',
              wordBreak: 'break-word',
            }}
          >
            {[website, contact].filter(Boolean).join(' / ')}
          </span>
        </footer>
      </SatgatDocument>

      <style jsx global>{`
        @media (max-width: 760px) {
          .company-profile-hero {
            display: flex !important;
            flex-direction: column !important;
            gap: 28px !important;
            min-height: 0 !important;
          }

          .company-profile-title {
            font-size: 38px !important;
            line-height: 1.12 !important;
          }

          .company-profile-aside {
            border-left: 0 !important;
            border-top: 1px solid ${HAIRLINE} !important;
            padding-left: 0 !important;
            padding-top: 24px !important;
          }
        }
      `}</style>
    </>
  );
}
