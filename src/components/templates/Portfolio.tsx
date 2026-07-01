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
 * 포트폴리오 — 가로 A4 편집형 전시.
 * 좌측: 대표 프로젝트(큰 이미지+서사). 우측: 프로필+나머지 프로젝트 인덱스.
 */

export default function PortfolioRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;

  const name = String(s['name'] ?? '이름');
  const title = String(s['title'] ?? '');
  const bio = String(s['bio'] ?? '');
  const skills = String(s['skills'] ?? '');
  const contact = String(s['contact'] ?? '');

  const projects = normalizeListItems(s['projects'], {
    titleKeys: ['title', 'name', 'project'],
    descriptionKeys: ['description', 'summary', 'role', 'result'],
  });

  const monogram = name.trim().slice(0, 1) || '集';
  const lead = projects[0];
  const rest = projects.slice(1, 5);

  return (
    <SatgatDocument format="a4-landscape">
      <section
        className="portfolio-sheet"
        style={{
          minHeight: 720,
          display: 'grid',
          gridTemplateColumns: '1.18fr 0.82fr',
          gap: 40,
          alignItems: 'stretch',
        }}
      >
        <main
          className="portfolio-lead"
          style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
        >
          <p
            style={{
              fontFamily: FONT_DODUM,
              fontSize: 11,
              letterSpacing: '0.16em',
              color: INK_MUTED,
              textTransform: 'uppercase',
              margin: '0 0 14px',
            }}
          >
            SELECTED WORK
          </p>

          {lead ? (
            <>
              <h2
                className="portfolio-lead-title"
                style={{
                  fontFamily: FONT_MYEONGJO,
                  fontSize: 36,
                  fontWeight: 800,
                  lineHeight: 1.14,
                  color: INK,
                  textShadow: INK_BLEED_STRONG,
                  margin: '0 0 14px',
                  wordBreak: 'keep-all',
                }}
              >
                {lead.title}
              </h2>

              <div style={{ width: 64, height: 3, background: DANCHEONG, marginBottom: 22 }} />

              {lead.image ? (
                <figure
                  style={{
                    margin: '0 0 22px',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    border: `1px solid ${HAIRLINE}`,
                    background: '#E8E4DC',
                    overflow: 'hidden',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={lead.image}
                    alt={lead.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </figure>
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    border: `1px solid ${HAIRLINE}`,
                    background:
                      'linear-gradient(135deg, rgba(28,25,22,0.06), rgba(184,149,79,0.1)), #FFFFFB',
                    marginBottom: 22,
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 78,
                    fontWeight: 800,
                    color: 'rgba(28,25,22,0.18)',
                  }}
                >
                  01
                </div>
              )}

              {lead.description && (
                <p
                  style={{
                    fontFamily: FONT_BATANG,
                    fontSize: 15,
                    lineHeight: 1.78,
                    color: INK,
                    textShadow: INK_BLEED,
                    margin: 0,
                    wordBreak: 'keep-all',
                    maxWidth: 560,
                  }}
                >
                  {lead.description}
                </p>
              )}
            </>
          ) : (
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 15,
                lineHeight: 1.78,
                color: INK_LIGHT,
                margin: 0,
                wordBreak: 'keep-all',
              }}
            >
              {bio}
            </p>
          )}

          {skills && (
            <footer
              style={{
                marginTop: 'auto',
                paddingTop: 22,
                borderTop: `1px solid ${HAIRLINE}`,
                display: 'grid',
                gridTemplateColumns: '110px 1fr',
                gap: 18,
                alignItems: 'baseline',
              }}
            >
              <p
                style={{
                  fontFamily: FONT_DODUM,
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  color: GOLD,
                  margin: 0,
                }}
              >
                CRAFT &amp; TOOLS
              </p>
              <p
                style={{
                  fontFamily: FONT_BATANG,
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: INK_LIGHT,
                  margin: 0,
                  wordBreak: 'keep-all',
                }}
              >
                {skills}
              </p>
            </footer>
          )}
        </main>

        <aside
          className="portfolio-aside"
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
              gridTemplateColumns: '1fr 68px',
              gap: 16,
              alignItems: 'start',
              marginBottom: 26,
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
                PORTFOLIO
              </p>
              <h1
                className="portfolio-title"
                style={{
                  fontFamily: FONT_MYEONGJO,
                  fontSize: 42,
                  fontWeight: 800,
                  lineHeight: 1.06,
                  color: INK,
                  textShadow: INK_BLEED_STRONG,
                  margin: '0 0 8px',
                  wordBreak: 'keep-all',
                }}
              >
                {name}
              </h1>
              {title && (
                <p
                  style={{
                    fontFamily: FONT_BATANG,
                    fontSize: 15,
                    lineHeight: 1.45,
                    color: INK_LIGHT,
                    textShadow: INK_BLEED,
                    margin: 0,
                    wordBreak: 'keep-all',
                  }}
                >
                  {title}
                </p>
              )}
            </div>
            <div
              aria-hidden="true"
              style={{
                width: 68,
                height: 68,
                border: `1px solid ${GOLD}`,
                display: 'grid',
                placeItems: 'center',
                fontFamily: FONT_MYEONGJO,
                fontSize: 32,
                fontWeight: 800,
                lineHeight: 1,
                color: INK,
                textShadow: INK_BLEED,
              }}
            >
              {monogram}
            </div>
          </div>

          {bio && (
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 13.5,
                lineHeight: 1.72,
                color: INK_MUTED,
                margin: '0 0 26px',
                wordBreak: 'keep-all',
                paddingBottom: 22,
                borderBottom: `1px solid ${HAIRLINE}`,
              }}
            >
              {bio}
            </p>
          )}

          {rest.length > 0 && (
            <section style={{ marginBottom: 26 }}>
              <p
                style={{
                  fontFamily: FONT_DODUM,
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  color: DANCHEONG,
                  margin: '0 0 14px',
                }}
              >
                OTHER WORKS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {rest.map((project, index) => (
                  <article
                    key={`${project.title}-${index}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '30px 1fr',
                      gap: 12,
                      padding: '12px 0',
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
                      {String(index + 2).padStart(2, '0')}
                    </span>
                    <div>
                      <h3
                        style={{
                          fontFamily: FONT_MYEONGJO,
                          fontSize: 14,
                          fontWeight: 700,
                          lineHeight: 1.36,
                          color: INK,
                          margin: '0 0 4px',
                          wordBreak: 'keep-all',
                        }}
                      >
                        {project.title}
                      </h3>
                      {project.description && (
                        <p
                          style={{
                            fontFamily: FONT_BATANG,
                            fontSize: 12,
                            lineHeight: 1.6,
                            color: INK_MUTED,
                            margin: 0,
                            wordBreak: 'keep-all',
                          }}
                        >
                          {project.description}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {contact && (
            <footer
              style={{
                marginTop: 'auto',
                paddingTop: 18,
                borderTop: `1px solid ${GOLD}`,
              }}
            >
              <p
                style={{
                  fontFamily: FONT_DODUM,
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  color: INK_MUTED,
                  margin: '0 0 6px',
                }}
              >
                CONTACT
              </p>
              <p
                style={{
                  fontFamily: FONT_DODUM,
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: INK_LIGHT,
                  margin: 0,
                  overflowWrap: 'anywhere',
                }}
              >
                {contact}
              </p>
            </footer>
          )}
        </aside>
      </section>

      <style jsx global>{`
        @media (max-width: 760px) {
          .portfolio-sheet {
            display: flex !important;
            flex-direction: column !important;
            gap: 28px !important;
            min-height: 0 !important;
          }

          .portfolio-title {
            font-size: 32px !important;
            line-height: 1.2 !important;
          }

          .portfolio-lead-title {
            font-size: 28px !important;
            line-height: 1.18 !important;
          }

          .portfolio-aside {
            border-left: 0 !important;
            border-top: 1px solid ${HAIRLINE} !important;
            padding-left: 0 !important;
            padding-top: 24px !important;
            order: -1;
          }
        }
      `}</style>
    </SatgatDocument>
  );
}
