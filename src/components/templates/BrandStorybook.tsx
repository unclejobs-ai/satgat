'use client';

import React from 'react';
import { SatgatDocument } from '@/components/document/SatgatDocument';
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
  DANCHEONG,
  GOLD,
  INK_BLEED,
  INK_BLEED_STRONG,
} from '@/lib/design-system/constraint';

/**
 * 브랜드 스토리북 - 편집형 브랜드 서사
 *
 * P1: 표지이자 브랜드 브리프
 * P2: 핵심 가치와 언어의 원칙
 * P3: 비주얼 컨셉, 마일스톤, 연락처
 */

export default function BrandStorybookRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;

  const brandName = String(s['brand_name'] ?? '브랜드명');
  const originStory = String(s['origin_story'] ?? '');
  const visualConcept = String(s['visual_concept'] ?? '');
  const toneManner = String(s['tone_manner'] ?? '');
  const contact = String(s['contact'] ?? '');

  const values = normalizeListItems(s['values']);
  const milestones = normalizeListItems(s['milestones'], {
    titleKeys: ['year', 'title', 'date'],
    descriptionKeys: ['event', 'description', 'summary'],
  });

  const monogram = brandName.trim().slice(0, 1) || '書';
  const coverValues = values.slice(0, 3);
  const firstValue = values[0];
  const secondValue = values[1];

  return (
    <>
      <SatgatDocument format="a4">
        <section
          className="brand-story-cover"
          style={{
            minHeight: 760,
            display: 'grid',
            gridTemplateColumns: '1.12fr 0.88fr',
            gap: 44,
            alignItems: 'stretch',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 11,
                letterSpacing: '0.14em',
                color: INK_MUTED,
                margin: '0 0 20px',
              }}
            >
              BRAND STORYBOOK
            </p>

            <h1
              className="brand-story-title"
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 58,
                fontWeight: 800,
                lineHeight: 1.12,
                color: INK,
                textShadow: INK_BLEED_STRONG,
                margin: '0 0 18px',
                wordBreak: 'keep-all',
              }}
            >
              {brandName}
            </h1>

            <div style={{ width: 78, height: 3, background: DANCHEONG, marginBottom: 44 }} />

            {originStory && (
              <section
                style={{
                  marginTop: 'auto',
                  paddingTop: 28,
                  borderTop: `1px solid ${HAIRLINE}`,
                }}
              >
                <p
                  style={{
                    fontFamily: FONT_DODUM,
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    color: DANCHEONG,
                    margin: '0 0 10px',
                  }}
                >
                  ORIGIN
                </p>
                <h2
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 21,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: INK,
                    textShadow: INK_BLEED,
                    margin: '0 0 12px',
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
                    color: INK_LIGHT,
                    textShadow: INK_BLEED,
                    margin: 0,
                    wordBreak: 'keep-all',
                  }}
                >
                  {originStory}
                </p>
              </section>
            )}
          </div>

          <aside
            className="brand-story-cover-aside"
            style={{
              borderLeft: `1px solid ${HAIRLINE}`,
              paddingLeft: 30,
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 86,
                height: 86,
                border: `1px solid ${GOLD}`,
                display: 'grid',
                placeItems: 'center',
                alignSelf: 'flex-end',
                fontFamily: FONT_MYEONGJO,
                fontSize: 42,
                fontWeight: 800,
                lineHeight: 1,
                color: INK,
                textShadow: INK_BLEED,
              }}
            >
              {monogram}
            </div>

            {coverValues.length > 0 && (
              <section>
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
                  브랜드의 중심값
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {coverValues.map((value, index) => (
                    <div
                      key={`${value.title}-${index}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '34px 1fr',
                        gap: 12,
                        paddingTop: 14,
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
                          {value.title}
                        </h3>
                        {value.description && (
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
                            {value.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(visualConcept || toneManner) && (
              <dl
                style={{
                  margin: 'auto 0 0',
                  paddingTop: 18,
                  borderTop: `1px solid ${HAIRLINE}`,
                }}
              >
                {visualConcept && (
                  <div style={{ marginBottom: 14 }}>
                    <dt
                      style={{
                        fontFamily: FONT_DODUM,
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        color: INK_MUTED,
                        marginBottom: 5,
                      }}
                    >
                      VISUAL
                    </dt>
                    <dd
                      style={{
                        fontFamily: FONT_BATANG,
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: INK_LIGHT,
                        margin: 0,
                        wordBreak: 'keep-all',
                      }}
                    >
                      {visualConcept}
                    </dd>
                  </div>
                )}
                {toneManner && (
                  <div>
                    <dt
                      style={{
                        fontFamily: FONT_DODUM,
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        color: INK_MUTED,
                        marginBottom: 5,
                      }}
                    >
                      TONE
                    </dt>
                    <dd
                      style={{
                        fontFamily: FONT_BATANG,
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: INK_LIGHT,
                        margin: 0,
                        wordBreak: 'keep-all',
                      }}
                    >
                      {toneManner}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </aside>
        </section>
      </SatgatDocument>

      <SatgatDocument format="a4">
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 150px',
            gap: 32,
            alignItems: 'end',
            paddingBottom: 24,
            borderBottom: `2px solid ${INK}`,
            marginBottom: 38,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 11,
                letterSpacing: '0.14em',
                color: INK_MUTED,
                margin: '0 0 10px',
              }}
            >
              BRAND PRINCIPLES
            </p>
            <h2
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 31,
                fontWeight: 800,
                lineHeight: 1.16,
                color: INK,
                textShadow: INK_BLEED_STRONG,
                margin: 0,
                wordBreak: 'keep-all',
              }}
            >
              머무는 감각을 만드는 원칙
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
            }}
          >
            {brandName}
          </span>
        </header>

        {values.length > 0 && (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(values.length, 2)}, minmax(0, 1fr))`,
              gap: 34,
              marginBottom: 42,
            }}
          >
            {values.map((value, index) => (
              <article
                key={`${value.title}-${index}`}
                style={{
                  paddingTop: 20,
                  borderTop: `1px solid ${index === 0 ? DANCHEONG : HAIRLINE}`,
                }}
              >
                <p
                  style={{
                    fontFamily: FONT_DODUM,
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    color: DANCHEONG,
                    margin: '0 0 12px',
                  }}
                >
                  VALUE {String(index + 1).padStart(2, '0')}
                </p>
                <h3
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1.25,
                    color: INK,
                    textShadow: INK_BLEED,
                    margin: '0 0 12px',
                    wordBreak: 'keep-all',
                  }}
                >
                  {value.title}
                </h3>
                <p
                  style={{
                    fontFamily: FONT_BATANG,
                    fontSize: 15,
                    lineHeight: 1.74,
                    color: INK_LIGHT,
                    margin: 0,
                    wordBreak: 'keep-all',
                  }}
                >
                  {value.description}
                </p>
              </article>
            ))}
          </section>
        )}

        <section
          style={{
            marginTop: 44,
            padding: '28px 0',
            borderTop: `1px solid ${HAIRLINE}`,
            borderBottom: `1px solid ${HAIRLINE}`,
            display: 'grid',
            gridTemplateColumns: '0.8fr 1.2fr',
            gap: 34,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 10,
                letterSpacing: '0.14em',
                color: DANCHEONG,
                margin: '0 0 9px',
              }}
            >
              LANGUAGE
            </p>
            <h3
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 20,
                fontWeight: 700,
                lineHeight: 1.3,
                color: INK,
                textShadow: INK_BLEED,
                margin: 0,
                wordBreak: 'keep-all',
              }}
            >
              말투의 기준
            </h3>
          </div>
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
            {toneManner || firstValue?.description || originStory}
          </p>
        </section>
      </SatgatDocument>

      <SatgatDocument format="a4">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: milestones.length > 0 ? '1fr 0.86fr' : '1fr',
            gap: 42,
            minHeight: 660,
          }}
        >
          <section>
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 11,
                letterSpacing: '0.14em',
                color: INK_MUTED,
                margin: '0 0 12px',
              }}
            >
              VISUAL SYSTEM
            </p>
            <h2
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 30,
                fontWeight: 800,
                lineHeight: 1.18,
                color: INK,
                textShadow: INK_BLEED_STRONG,
                margin: '0 0 24px',
                wordBreak: 'keep-all',
              }}
            >
              보이는 분위기와 기억되는 결
            </h2>
            <div style={{ width: 54, height: 2, background: DANCHEONG, marginBottom: 34 }} />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 18,
                marginBottom: 34,
              }}
            >
              <div
                style={{
                  height: 128,
                  border: `1px solid ${HAIRLINE}`,
                  background:
                    'linear-gradient(135deg, rgba(28,25,22,0.06), rgba(184,149,79,0.1)), #FFFFFB',
                }}
              />
              <div
                style={{
                  height: 128,
                  border: `1px solid ${HAIRLINE}`,
                  background:
                    'linear-gradient(135deg, rgba(155,27,27,0.09), rgba(28,25,22,0.04)), #F7F7F2',
                }}
              />
            </div>

            {visualConcept && (
              <p
                style={{
                  fontFamily: FONT_BATANG,
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: INK_LIGHT,
                  textShadow: INK_BLEED,
                  margin: 0,
                  wordBreak: 'keep-all',
                }}
              >
                {visualConcept}
              </p>
            )}
          </section>

          {(milestones.length > 0 || contact) && (
            <aside
              style={{
                borderLeft: `1px solid ${HAIRLINE}`,
                paddingLeft: 28,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {milestones.length > 0 && (
                <section>
                  <h3
                    style={{
                      fontFamily: FONT_MYEONGJO,
                      fontSize: 19,
                      fontWeight: 700,
                      lineHeight: 1.35,
                      color: INK,
                      textShadow: INK_BLEED,
                      margin: '0 0 18px',
                      wordBreak: 'keep-all',
                    }}
                  >
                    주요 Milestone
                  </h3>
                  <div>
                    {milestones.map((milestone, index) => (
                      <div
                        key={`${milestone.title}-${index}`}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '68px 1fr',
                          gap: 14,
                          padding: '15px 0',
                          borderTop: `1px solid ${index === 0 ? INK : HAIRLINE}`,
                          alignItems: 'baseline',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: FONT_DODUM,
                            fontSize: 12,
                            letterSpacing: '0.04em',
                            color: DANCHEONG,
                            wordBreak: 'keep-all',
                          }}
                        >
                          {milestone.title}
                        </span>
                        <span
                          style={{
                            fontFamily: FONT_BATANG,
                            fontSize: 14,
                            lineHeight: 1.65,
                            color: INK_LIGHT,
                            wordBreak: 'keep-all',
                          }}
                        >
                          {milestone.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section
                style={{
                  marginTop: 'auto',
                  paddingTop: 22,
                  borderTop: `1px solid ${HAIRLINE}`,
                }}
              >
                <p
                  style={{
                    fontFamily: FONT_DODUM,
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    color: INK_MUTED,
                    margin: '0 0 8px',
                  }}
                >
                  CLOSING NOTE
                </p>
                <p
                  style={{
                    fontFamily: FONT_BATANG,
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: INK_LIGHT,
                    margin: '0 0 16px',
                    wordBreak: 'keep-all',
                  }}
                >
                  {secondValue?.description || toneManner || originStory}
                </p>
                {contact && (
                  <p
                    style={{
                      fontFamily: FONT_DODUM,
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: INK_MUTED,
                      margin: 0,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {contact}
                  </p>
                )}
              </section>
            </aside>
          )}
        </div>
      </SatgatDocument>

      <style jsx global>{`
        @media (max-width: 760px) {
          .brand-story-cover {
            display: flex !important;
            flex-direction: column !important;
            gap: 30px !important;
            min-height: 0 !important;
          }

          .brand-story-title {
            font-size: 40px !important;
            line-height: 1.12 !important;
          }

          .brand-story-cover-aside {
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
