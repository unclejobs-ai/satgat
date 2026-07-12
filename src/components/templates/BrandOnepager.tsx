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
  DANCHEONG,
  HAIRLINE,
} from '@/lib/design-system/constraint';

/**
 * 브랜드 원페이지 - 브랜드 선언과 상품 단서가 한 장에서 읽히는 편집형 시트.
 */

export default function BrandOnepagerRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;

  const brandName = String(s['brand_name'] ?? '브랜드명');
  const tagline = String(s['tagline'] ?? '');
  const description = String(s['description'] ?? '');
  const website = String(s['website'] ?? '');
  const contact = String(s['contact'] ?? '');
  const positioningMap = s['positioning_map'];

  const products = normalizeListItems(s['products'], {
    titleKeys: ['title', 'name', 'product_name', 'service'],
    descriptionKeys: ['description', 'summary', 'overview', 'value'],
  });

  const monogram = brandName.trim().slice(0, 1);
  const primaryProducts = products.slice(0, 3);

  return (
    <SatgatDocument pageSpec="a4Landscape">
      <section
        className="brand-onepager-sheet"
        style={{
          gridTemplateColumns: '1.08fr 0.92fr',
          alignItems: 'stretch',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <p
            style={{
              fontFamily: FONT_DODUM,
              fontSize: 11,
              letterSpacing: '0.14em',
              color: INK_MUTED,
              textTransform: 'uppercase',
              margin: '0 0 18px',
            }}
          >
            BRAND ONE-PAGER
          </p>

          <h1
            className="brand-onepager-title"
            style={{
              fontFamily: FONT_MYEONGJO,
              fontWeight: 800,
              color: INK,
              margin: '0 0 14px',
              wordBreak: 'keep-all',
            }}
          >
            {brandName}
          </h1>

          {tagline && (
            <p
              style={{
                maxWidth: 420,
                fontFamily: FONT_BATANG,
                fontSize: 20,
                lineHeight: 1.5,
                color: INK_LIGHT,
                margin: '0 0 32px',
                wordBreak: 'keep-all',
              }}
            >
              {tagline}
            </p>
          )}

          <div style={{ width: 78, height: 3, background: DANCHEONG, marginBottom: 44 }} />

          {description && (
            <section
              style={{
                marginTop: 'auto',
                paddingTop: 30,
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
                ESSENCE
              </p>
              <p
                style={{
                  fontFamily: FONT_BATANG,
                  fontSize: 17,
                  lineHeight: 1.82,
                  color: INK,
                  margin: 0,
                  wordBreak: 'keep-all',
                }}
              >
                {description}
              </p>
            </section>
          )}
        </div>

        <aside
          className="brand-onepager-aside"
          style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              alignSelf: 'flex-end',
              width: 58,
              height: 58,
              border: `1px solid ${DANCHEONG}`,
              display: 'grid',
              placeItems: 'center',
              fontFamily: FONT_MYEONGJO,
              fontSize: 30,
              fontWeight: 800,
              lineHeight: 1,
              color: INK,
              marginBottom: 18,
            }}
          >
            {monogram}
          </div>

          {primaryProducts.length > 0 && (
            <section>
              <h2
                style={{
                  fontFamily: FONT_MYEONGJO,
                  fontSize: 17,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: INK,
                  margin: '0 0 8px',
                  wordBreak: 'keep-all',
                }}
              >
                제품과 서비스
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {primaryProducts.map((item, index) => (
                  <article
                    key={`${item.title}-${index}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '30px 1fr',
                      gap: 10,
                      padding: '8px 0',
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
                          fontSize: 14,
                          fontWeight: 700,
                          lineHeight: 1.3,
                          color: INK,
                          margin: '0 0 3px',
                          wordBreak: 'keep-all',
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: FONT_BATANG,
                          fontSize: 11.5,
                          lineHeight: 1.45,
                          color: INK_MUTED,
                          margin: 0,
                          wordBreak: 'keep-all',
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {Boolean(positioningMap) && (
            <section
              className="brand-onepager-positioning"
              style={{
                marginTop: primaryProducts.length > 0 ? 10 : 0,
                paddingTop: primaryProducts.length > 0 ? 10 : 0,
                borderTop: primaryProducts.length > 0 ? `1px solid ${HAIRLINE}` : undefined,
              }}
            >
              <SatgatVisual visual={positioningMap} compact />
            </section>
          )}

          <section
            style={{
              marginTop: 'auto',
              paddingTop: 10,
              borderTop: `1px solid ${HAIRLINE}`,
            }}
          >
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 10,
                letterSpacing: '0.14em',
                color: DANCHEONG,
                margin: '0 0 10px',
              }}
            >
              CONNECT
            </p>
            <dl style={{ margin: 0 }}>
              {website && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '70px 1fr',
                    gap: 12,
                    padding: '8px 0',
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
                    WEB
                  </dt>
                  <dd
                    style={{
                      fontFamily: FONT_DODUM,
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: INK_LIGHT,
                      margin: 0,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {website}
                  </dd>
                </div>
              )}
              {contact && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '70px 1fr',
                    gap: 12,
                    padding: '8px 0',
                    borderTop: website ? `1px solid ${HAIRLINE}` : undefined,
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
                    CONTACT
                  </dt>
                  <dd
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
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </aside>
      </section>

      <style jsx global>{`
        .brand-onepager-sheet {
          display: grid;
          gap: 44px;
          height: 100%;
        }

        .brand-onepager-title {
          font-size: 56px;
          line-height: 1.08;
        }

        .brand-onepager-aside {
          border-left: 1px solid ${HAIRLINE};
          padding-left: 30px;
        }

        .brand-onepager-positioning .satgat-visual {
          width: 60%;
          margin-inline: auto !important;
        }

      `}</style>
    </SatgatDocument>
  );
}
