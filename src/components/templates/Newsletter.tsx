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
  DANCHEONG,
  GOLD,
  INK_BLEED,
  INK_BLEED_STRONG,
} from '@/lib/design-system/constraint';

/**
 * 뉴스레터 — 편지의 정중함을 유지하되 한 장에서 핵심 소식이 바로 보이는 편집형 다이제스트.
 */

export default function NewsletterRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;

  const issueTitle = String(s['issue_title'] ?? '뉴스레터');
  const issueDate = String(s['issue_date'] ?? '');
  const greeting = String(s['greeting'] ?? '');
  const promotion = String(s['promotion'] ?? '');
  const cta = String(s['cta'] ?? '');
  const unsubscribe = String(s['unsubscribe'] ?? '');
  const issueChart = s['issue_chart'];

  const articles = normalizeListItems(s['articles'], {
    titleKeys: ['title', 'headline', 'name'],
    descriptionKeys: ['summary', 'description', 'body', 'content'],
  });
  const leadArticle = articles[0];
  const secondaryArticles = articles.slice(1, 5);

  return (
    <SatgatDocument format="a4">
      <section
        className="newsletter-sheet"
        style={{
          minHeight: 760,
          display: 'grid',
          gridTemplateColumns: '1.16fr 0.84fr',
          gap: 38,
          alignItems: 'stretch',
        }}
      >
        <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <p
            style={{
              fontFamily: FONT_DODUM,
              fontSize: 11,
              letterSpacing: '0.16em',
              color: INK_MUTED,
              margin: '0 0 18px',
            }}
          >
            MONTHLY LETTER
          </p>

          <h1
            className="newsletter-title"
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.08,
              color: INK,
              textShadow: INK_BLEED_STRONG,
              margin: '0 0 20px',
              wordBreak: 'keep-all',
              overflowWrap: 'anywhere',
            }}
          >
            {issueTitle}
          </h1>

          <div style={{ width: 86, height: 3, background: DANCHEONG, marginBottom: 30 }} />

          {greeting && (
            <p
              style={{
                maxWidth: 468,
                fontFamily: FONT_BATANG,
                fontSize: 17,
                lineHeight: 1.82,
                color: INK_LIGHT,
                textShadow: INK_BLEED,
                margin: '0 0 34px',
                wordBreak: 'keep-all',
              }}
            >
              {greeting}
            </p>
          )}

          {leadArticle && (
            <article
              style={{
                marginTop: 6,
                paddingTop: 24,
                borderTop: `2px solid ${INK}`,
              }}
            >
              <p
                style={{
                  fontFamily: FONT_DODUM,
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  color: DANCHEONG,
                  margin: '0 0 12px',
                }}
              >
                FEATURED
              </p>
              <h2
                style={{
                  fontFamily: FONT_MYEONGJO,
                  fontSize: 25,
                  fontWeight: 800,
                  lineHeight: 1.28,
                  color: INK,
                  textShadow: INK_BLEED,
                  margin: '0 0 10px',
                  wordBreak: 'keep-all',
                  overflowWrap: 'anywhere',
                }}
              >
                {leadArticle.title}
              </h2>
              <p
                style={{
                  fontFamily: FONT_BATANG,
                  fontSize: 15,
                  lineHeight: 1.72,
                  color: INK_MUTED,
                  margin: 0,
                  wordBreak: 'keep-all',
                }}
              >
                {leadArticle.description}
              </p>
            </article>
          )}

          <dl
            className="newsletter-digest-meta"
            style={{
              margin: '34px 0 0',
              paddingTop: 18,
              borderTop: `1px solid ${HAIRLINE}`,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
            }}
          >
            <div>
              <dt
                style={{
                  fontFamily: FONT_DODUM,
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  color: INK_MUTED,
                  marginBottom: 7,
                }}
              >
                ARTICLES
              </dt>
              <dd
                style={{
                  fontFamily: FONT_MYEONGJO,
                  fontSize: 18,
                  fontWeight: 800,
                  lineHeight: 1.25,
                  color: INK,
                  margin: 0,
                }}
              >
                {articles.length || 1}건의 소식
              </dd>
            </div>
            <div>
              <dt
                style={{
                  fontFamily: FONT_DODUM,
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  color: INK_MUTED,
                  marginBottom: 7,
                }}
              >
                FORMAT
              </dt>
              <dd
                style={{
                  fontFamily: FONT_BATANG,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: INK_LIGHT,
                  margin: 0,
                  wordBreak: 'keep-all',
                }}
              >
                편지형 다이제스트
              </dd>
            </div>
          </dl>
        </main>

        <aside
          className="newsletter-aside"
          style={{
            borderLeft: `1px solid ${HAIRLINE}`,
            paddingLeft: 30,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: issueDate ? '72px 1fr' : '1fr',
              gap: 16,
              alignItems: 'start',
              marginBottom: 34,
            }}
          >
            {issueDate && (
              <div
                style={{
                  minHeight: 72,
                  border: `1px solid ${GOLD}`,
                  display: 'grid',
                  placeItems: 'center',
                  padding: '10px 8px',
                  textAlign: 'center',
                }}
              >
                <p
                  className="newsletter-date"
                  style={{
                    fontFamily: FONT_DODUM,
                    fontSize: 11,
                    lineHeight: 1.55,
                    letterSpacing: '0.04em',
                    color: INK_LIGHT,
                    margin: 0,
                    wordBreak: 'keep-all',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {issueDate}
                </p>
              </div>
            )}
            <div>
              <p
                style={{
                  fontFamily: FONT_DODUM,
                  fontSize: 10,
                  letterSpacing: '0.16em',
                  color: INK_MUTED,
                  margin: '0 0 8px',
                }}
              >
                ISSUE NOTE
              </p>
              <p
                style={{
                  fontFamily: FONT_BATANG,
                  fontSize: 13,
                  lineHeight: 1.72,
                  color: INK_MUTED,
                  margin: 0,
                  wordBreak: 'keep-all',
                }}
              >
                이번 호에서 바로 실행할 수 있는 업데이트와 고객 사례를 간결하게 묶었습니다.
              </p>
            </div>
          </div>

          {Boolean(issueChart) && (
            <section style={{ marginBottom: 30 }}>
              <SatgatVisual visual={issueChart} compact />
            </section>
          )}

          {secondaryArticles.length > 0 && (
            <section style={{ marginBottom: 30 }}>
              <h2
                style={{
                  fontFamily: FONT_MYEONGJO,
                  fontSize: 18,
                  fontWeight: 700,
                  lineHeight: 1.35,
                  color: INK,
                  textShadow: INK_BLEED,
                  margin: '0 0 12px',
                  wordBreak: 'keep-all',
                }}
              >
                이번 달 소식
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {secondaryArticles.map((article, index) => (
                  <article
                    key={`${article.title}-${index}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '30px 1fr',
                      gap: 12,
                      padding: '14px 0',
                      borderTop: `1px solid ${index === 0 ? INK : HAIRLINE}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONT_DODUM,
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        color: DANCHEONG,
                      }}
                    >
                      {String(index + 2).padStart(2, '0')}
                    </span>
                    <div>
                      <h3
                        style={{
                          fontFamily: FONT_MYEONGJO,
                          fontSize: 15,
                          fontWeight: 700,
                          lineHeight: 1.36,
                          color: INK,
                          margin: '0 0 5px',
                          wordBreak: 'keep-all',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {article.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: FONT_BATANG,
                          fontSize: 12,
                          lineHeight: 1.62,
                          color: INK_MUTED,
                          margin: 0,
                          wordBreak: 'keep-all',
                        }}
                      >
                        {article.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {(promotion || cta) && (
            <section
              style={{
                marginTop: 'auto',
                borderTop: `1px solid ${GOLD}`,
                borderBottom: `1px solid ${GOLD}`,
                padding: '20px 0',
              }}
            >
              {promotion && (
                <p
                  style={{
                    fontFamily: FONT_BATANG,
                    fontSize: 14,
                    lineHeight: 1.72,
                    color: INK,
                    textShadow: INK_BLEED,
                    margin: cta ? '0 0 16px' : 0,
                    wordBreak: 'keep-all',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {promotion}
                </p>
              )}
              {cta && (
                <p
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 18,
                    fontWeight: 800,
                    lineHeight: 1.35,
                    color: DANCHEONG,
                    textShadow: INK_BLEED,
                    margin: 0,
                    wordBreak: 'keep-all',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {cta}
                </p>
              )}
            </section>
          )}

          {unsubscribe && (
            <footer
              style={{
                marginTop: 22,
                paddingTop: 14,
                borderTop: `1px solid ${HAIRLINE}`,
              }}
            >
              <p
                style={{
                  fontFamily: FONT_DODUM,
                  fontSize: 10,
                  lineHeight: 1.6,
                  letterSpacing: '0.04em',
                  color: INK_MUTED,
                  margin: 0,
                  overflowWrap: 'anywhere',
                }}
              >
                {unsubscribe}
              </p>
            </footer>
          )}
        </aside>
      </section>

      <style jsx global>{`
        @media (max-width: 760px) {
          .newsletter-sheet {
            display: flex !important;
            flex-direction: column !important;
            gap: 30px !important;
            min-height: 0 !important;
          }

          .newsletter-title {
            font-size: 38px !important;
            line-height: 1.2 !important;
          }

          .newsletter-aside {
            border-left: 0 !important;
            border-top: 1px solid ${HAIRLINE} !important;
            padding-left: 0 !important;
            padding-top: 24px !important;
          }

          .newsletter-date {
            font-size: 10px !important;
          }

          .newsletter-digest-meta {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
        }
      `}</style>
    </SatgatDocument>
  );
}
