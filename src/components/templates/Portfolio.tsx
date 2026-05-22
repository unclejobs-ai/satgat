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
  INK_BLEED,
  INK_BLEED_STRONG,
} from '@/lib/design-system/constraint';

/**
 * 포트폴리오 — "전시"
 *
 * A4 가로. 이미지 중심의 그리드 레이아웃.
 *  상단 20%: 이름 + 직함 + 소개
 *  중간 60%: 프로젝트 그리드 (2×2 또는 3×2)
 *  하단 20%: 스킬 + 연락처
 *
 * 철학: 작품이 말한다. 여백과 배치로 작품의 존엄성을 살린다.
 */

export default function PortfolioRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;

  const name = String(s['name'] ?? '이름');
  const title = String(s['title'] ?? '');
  const bio = String(s['bio'] ?? '');
  const skills = String(s['skills'] ?? '');
  const contact = String(s['contact'] ?? '');

  const projects = parseList(s['projects']);

  return (
    <SatgatDocument format="a4-landscape">
      {/* ─── 상단: 프로필 ─────────────────────────────────────────────── */}
      <header
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 48,
          marginBottom: 36,
          paddingBottom: 24,
          borderBottom: `2px solid ${INK}`,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 36,
              fontWeight: 800,
              lineHeight: 1.15,
              color: INK,
              textShadow: INK_BLEED_STRONG,
              margin: '0 0 8px 0',
              wordBreak: 'keep-all',
            }}
          >
            {name}
          </h1>
          {title && (
            <p
              style={{
                fontFamily: FONT_BATANG,
                fontSize: 16,
                color: INK_MUTED,
                margin: '0 0 16px 0',
                wordBreak: 'keep-all',
              }}
            >
              {title}
            </p>
          )}
          {bio && (
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
              {bio}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right', alignSelf: 'end' }}>
          {contact && (
            <p
              style={{
                fontFamily: FONT_DODUM,
                fontSize: 12,
                letterSpacing: '0.04em',
                color: INK_MUTED,
                margin: '0 0 4px 0',
              }}
            >
              {contact}
            </p>
          )}
        </div>
      </header>

      {/* ─── 중간: 프로젝트 그리드 ────────────────────────────────────── */}
      {projects.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(projects.length, 3)}, 1fr)`,
              gap: 24,
            }}
          >
            {projects.map((p, i) => (
              <div key={i}>
                {p.image ? (
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '4/3',
                      backgroundColor: '#E8E4DC',
                      borderRadius: 3,
                      marginBottom: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={p.image}
                      alt={p.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '4/3',
                      backgroundColor: '#E8E4DC',
                      borderRadius: 3,
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONT_MYEONGJO,
                        fontSize: 24,
                        color: INK_MUTED,
                        opacity: 0.3,
                      }}
                    >
                      {i + 1}
                    </span>
                  </div>
                )}
                <h3
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    color: INK,
                    margin: '0 0 4px 0',
                    wordBreak: 'keep-all',
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontFamily: FONT_BATANG,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: INK_MUTED,
                    margin: 0,
                    wordBreak: 'keep-all',
                  }}
                >
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── 하단: 스킬 ───────────────────────────────────────────────── */}
      {skills && (
        <footer
          style={{
            marginTop: 'auto',
            paddingTop: 24,
            borderTop: `1px solid ${HAIRLINE}`,
          }}
        >
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
    </SatgatDocument>
  );
}

function parseList(raw: unknown): Array<{ title: string; description: string; image?: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') {
        try {
          const parsed = JSON.parse(item);
          return {
            title: String(parsed.title ?? ''),
            description: String(parsed.description ?? ''),
            image: String(parsed.image ?? ''),
          };
        } catch {
          return { title: item, description: '', image: '' };
        }
      }
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        return {
          title: String(obj.title ?? ''),
          description: String(obj.description ?? ''),
          image: String(obj.image ?? ''),
        };
      }
      return { title: '', description: '', image: '' };
    })
    .filter((i) => i.title);
}
