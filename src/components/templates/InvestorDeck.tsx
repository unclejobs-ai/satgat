'use client';

import React from 'react';
import { SatgatDocument } from '@/components/document/SatgatDocument';
import { SatgatDivider } from '@/components/document/SatgatDivider';
import { normalizeListItems } from '@/lib/engine/slot-list';
import type { SatgatDocumentData } from '@/lib/templates/types';
import {
  FONT_MYEONGJO,
  FONT_BATANG,
  FONT_DODUM,
  INK,
  INK_MUTED,
  DANCHEONG,
  JADE,
  HAIRLINE,
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
 *  S4: Market
 *  S5: Traction (메트릭 그리드)
 *  S6: Business Model
 *  S7: Team
 *  S8: Ask
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

  const traction = normalizeListItems(s['traction'], {
    titleKeys: ['metric', 'label', 'title', 'name'],
    descriptionKeys: ['value', 'description', 'summary'],
  });
  const team = normalizeListItems(s['team'], {
    titleKeys: ['name', 'title'],
    descriptionKeys: ['role', 'background', 'description'],
  });

  return (
    <>
      {/* ─── S1: 타이틀 ───────────────────────────────────────────────── */}
      <SatgatDocument format="slide-16x9">
        <section
          className="investor-cover"
          style={{
            height: '100%',
            display: 'grid',
            gridTemplateColumns: '1.08fr 0.92fr',
            gap: 36,
            alignItems: 'stretch',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 11,
                letterSpacing: '0.13em',
                color: INK_MUTED,
                textTransform: 'uppercase',
                margin: '0 0 16px',
              }}
            >
              INVESTOR DECK
            </p>
            <h1
              className="investor-cover-title"
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 48,
                fontWeight: 800,
                lineHeight: 1.08,
                color: INK,
                textShadow: INK_BLEED_STRONG,
                margin: '0 0 12px',
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
                  lineHeight: 1.35,
                  color: INK_MUTED,
                  margin: '0 0 26px',
                  wordBreak: 'keep-all',
                }}
              >
                {deckTitle}
              </p>
            )}

            <div style={{ width: 62, height: 3, background: DANCHEONG, marginBottom: 30 }} />

            <div
              style={{
                marginTop: 'auto',
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 16,
              }}
            >
              {problem && (
                <section
                  style={{
                    paddingTop: 16,
                    borderTop: `1px solid ${HAIRLINE}`,
                  }}
                >
                  <p
                    style={{
                      fontFamily: FONT_DODUM,
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      color: DANCHEONG,
                      margin: '0 0 7px',
                    }}
                  >
                    PROBLEM
                  </p>
                  <p
                    style={{
                      fontFamily: FONT_BATANG,
                      fontSize: 15,
                      lineHeight: 1.62,
                      color: INK,
                      textShadow: INK_BLEED,
                      margin: 0,
                      wordBreak: 'keep-all',
                    }}
                  >
                    {problem}
                  </p>
                </section>
              )}

              {solution && (
                <section
                  style={{
                    paddingTop: 16,
                    borderTop: `1px solid ${HAIRLINE}`,
                  }}
                >
                  <p
                    style={{
                      fontFamily: FONT_DODUM,
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      color: JADE,
                      margin: '0 0 7px',
                    }}
                  >
                    SOLUTION
                  </p>
                  <p
                    style={{
                      fontFamily: FONT_BATANG,
                      fontSize: 15,
                      lineHeight: 1.62,
                      color: INK,
                      textShadow: INK_BLEED,
                      margin: 0,
                      wordBreak: 'keep-all',
                    }}
                  >
                    {solution}
                  </p>
                </section>
              )}
            </div>
          </div>

          <aside
            className="investor-cover-aside"
            style={{
              borderLeft: `1px solid ${HAIRLINE}`,
              paddingLeft: 30,
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
              minWidth: 0,
            }}
          >
            {marketSize && (
              <section
                style={{
                  paddingBottom: 20,
                  borderBottom: `1px solid ${HAIRLINE}`,
                }}
              >
                <p
                  style={{
                    fontFamily: FONT_DODUM,
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    color: INK_MUTED,
                    margin: '0 0 9px',
                  }}
                >
                  MARKET
                </p>
                <p
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 24,
                    fontWeight: 800,
                    lineHeight: 1.25,
                    color: INK,
                    textShadow: INK_BLEED,
                    margin: 0,
                    wordBreak: 'keep-all',
                  }}
                >
                  {marketSize}
                </p>
              </section>
            )}

            {traction.length > 0 && (
              <section>
                <p
                  style={{
                    fontFamily: FONT_DODUM,
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    color: INK_MUTED,
                    margin: '0 0 12px',
                  }}
                >
                  TRACTION
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${Math.min(traction.length, 2)}, minmax(0, 1fr))`,
                    gap: 18,
                  }}
                >
                  {traction.slice(0, 2).map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      style={{
                        paddingTop: 14,
                        borderTop: `1px solid ${index === 0 ? DANCHEONG : HAIRLINE}`,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: FONT_MYEONGJO,
                          fontSize: 30,
                          fontWeight: 800,
                          lineHeight: 1,
                          color: DANCHEONG,
                          textShadow: INK_BLEED,
                          margin: '0 0 8px',
                          wordBreak: 'keep-all',
                        }}
                      >
                        {item.description}
                      </p>
                      <p
                        style={{
                          fontFamily: FONT_DODUM,
                          fontSize: 11,
                          lineHeight: 1.45,
                          letterSpacing: '0.04em',
                          color: INK_MUTED,
                          margin: 0,
                          wordBreak: 'keep-all',
                        }}
                      >
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(businessModel || ask) && (
              <section
                style={{
                  marginTop: 'auto',
                  paddingTop: 18,
                  borderTop: `1px solid ${HAIRLINE}`,
                }}
              >
                {businessModel && (
                  <>
                    <p
                      style={{
                        fontFamily: FONT_DODUM,
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        color: JADE,
                        margin: '0 0 7px',
                      }}
                    >
                      MODEL
                    </p>
                    <p
                      style={{
                        fontFamily: FONT_BATANG,
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: INK_MUTED,
                        margin: '0 0 14px',
                        wordBreak: 'keep-all',
                      }}
                    >
                      {businessModel}
                    </p>
                  </>
                )}
                {ask && (
                  <p
                    style={{
                      fontFamily: FONT_MYEONGJO,
                      fontSize: 18,
                      fontWeight: 800,
                      lineHeight: 1.24,
                      color: DANCHEONG,
                      textShadow: INK_BLEED,
                      margin: 0,
                      wordBreak: 'keep-all',
                    }}
                  >
                    {ask}
                  </p>
                )}
              </section>
            )}
          </aside>
        </section>
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

      {/* ─── S4: Market ───────────────────────────────────────────────── */}
      {marketSize && (
        <SatgatDocument format="slide-16x9">
          <SlideSection kicker="03" title="Market" accent="dancheong">
            <p
              style={{
                fontFamily: FONT_MYEONGJO,
                fontSize: 34,
                fontWeight: 800,
                lineHeight: 1.25,
                color: DANCHEONG,
                textShadow: INK_BLEED,
                margin: 0,
                wordBreak: 'keep-all',
                textAlign: 'center',
              }}
            >
              {marketSize}
            </p>
          </SlideSection>
        </SatgatDocument>
      )}

      {/* ─── S5: Traction ─────────────────────────────────────────────── */}
      {traction.length > 0 && (
        <SatgatDocument format="slide-16x9">
          <SlideSection kicker="04" title="Traction" accent="dancheong">
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

      {/* ─── S6: Business Model ───────────────────────────────────────── */}
      {businessModel && (
        <SatgatDocument format="slide-16x9">
          <SlideSection kicker="05" title="Business Model" accent="jade">
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
                whiteSpace: 'pre-line',
              }}
            >
              {businessModel}
            </p>
          </SlideSection>
        </SatgatDocument>
      )}

      {/* ─── S7: Team ─────────────────────────────────────────────────── */}
      {team.length > 0 && (
        <SatgatDocument format="slide-16x9">
          <SlideSection kicker="06" title="Team" accent="jade">
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

      {/* ─── S8: Ask ──────────────────────────────────────────────────── */}
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
              07 / ASK
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
