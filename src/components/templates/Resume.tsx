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
  INK_LIGHT,
  INK_MUTED,
  INK_BLEED,
  INK_BLEED_STRONG,
} from '@/lib/design-system/constraint';

/**
 * 이력서 — "자기소개서"
 *
 * 페이지 구조:
 *  ┌─────────────────────────────┐
 *  │  이름              연락처   │  12%
 *  │  직함                       │
 *  ├─────────────────────────────┤
 *  │  자기소개 (선택)            │  10%
 *  ├─────────────────────────────┤
 *  │  경력                       │  45%
 *  │  ├─ 회사/기간    역할/설명  │
 *  │  └─ ...                     │
 *  ├─────────────────────────────┤
 *  │  스킬                       │  18%
 *  ├─────────────────────────────┤
 *  │  학력                       │  15%
 *  └─────────────────────────────┘
 *
 * 철학: 간결함과 정직함. 과장 없이 사실만.
 * 2-col layout으로 정보 밀도와 가독성의 균형.
 */

export default function ResumeRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;

  const name = String(s['name'] ?? '이름');
  const title = String(s['title'] ?? '');
  const email = String(s['email'] ?? '');
  const github = String(s['github'] ?? '');
  const summary = String(s['summary'] ?? '');
  const skills = String(s['skills'] ?? '');

  const experiences = parseRecordList(s['experiences']);
  const education = parseRecordList(s['education']);

  return (
    <SatgatDocument format="a4">
      {/* ─── 헤더: 이름 + 연락처 ───────────────────────────────────────── */}
      <header style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 8,
          }}
        >
          <h1
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 36,
              fontWeight: 800,
              lineHeight: 1.15,
              color: INK,
              textShadow: INK_BLEED_STRONG,
              margin: 0,
              wordBreak: 'keep-all',
            }}
          >
            {name}
          </h1>
          <div style={{ textAlign: 'right' }}>
            {email && (
              <p
                style={{
                  fontFamily: FONT_DODUM,
                  fontSize: 12,
                  color: INK_MUTED,
                  margin: '0 0 4px 0',
                  letterSpacing: '0.02em',
                }}
              >
                {email}
              </p>
            )}
            {github && (
              <p
                style={{
                  fontFamily: FONT_DODUM,
                  fontSize: 12,
                  color: INK_MUTED,
                  margin: 0,
                  letterSpacing: '0.02em',
                }}
              >
                {github}
              </p>
            )}
          </div>
        </div>

        {title && (
          <p
            style={{
              fontFamily: FONT_BATANG,
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.5,
              color: INK_MUTED,
              margin: 0,
              wordBreak: 'keep-all',
            }}
          >
            {title}
          </p>
        )}
      </header>

      <SatgatDivider variant="ink" weight="thin" />

      {/* ─── 자기소개 ──────────────────────────────────────────────────── */}
      {summary && (
        <section style={{ margin: '28px 0' }}>
          <p
            style={{
              fontFamily: FONT_BATANG,
              fontSize: 15,
              lineHeight: 1.75,
              color: INK_LIGHT,
              margin: 0,
              wordBreak: 'keep-all',
              textAlign: 'justify',
            }}
          >
            {summary}
          </p>
        </section>
      )}

      {/* ─── 경력 ──────────────────────────────────────────────────────── */}
      {experiences.length > 0 && (
        <section style={{ marginTop: 36 }}>
          <h2
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1.3,
              color: INK,
              textShadow: INK_BLEED,
              margin: '0 0 20px 0',
              wordBreak: 'keep-all',
              paddingBottom: 8,
              borderBottom: `2px solid ${INK}`,
            }}
          >
            경력
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {experiences.map((exp, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: 24,
                  alignItems: 'start',
                }}
              >
                <div>
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
                    {exp.title}
                  </h3>
                  {exp.description && (
                    <p
                      style={{
                        fontFamily: FONT_DODUM,
                        fontSize: 12,
                        color: INK_MUTED,
                        margin: 0,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {exp.description.split('\n')[0]}
                    </p>
                  )}
                </div>
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
                  {exp.description.split('\n').slice(1).join('\n') || exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── 스킬 ──────────────────────────────────────────────────────── */}
      {skills && (
        <section style={{ marginTop: 36 }}>
          <h2
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1.3,
              color: INK,
              textShadow: INK_BLEED,
              margin: '0 0 16px 0',
              wordBreak: 'keep-all',
              paddingBottom: 8,
              borderBottom: `2px solid ${INK}`,
            }}
          >
            스킬
          </h2>
          <p
            style={{
              fontFamily: FONT_BATANG,
              fontSize: 14,
              lineHeight: 1.75,
              color: INK_LIGHT,
              margin: 0,
              wordBreak: 'keep-all',
            }}
          >
            {skills}
          </p>
        </section>
      )}

      {/* ─── 학력 ──────────────────────────────────────────────────────── */}
      {education.length > 0 && (
        <section style={{ marginTop: 36 }}>
          <h2
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1.3,
              color: INK,
              textShadow: INK_BLEED,
              margin: '0 0 16px 0',
              wordBreak: 'keep-all',
              paddingBottom: 8,
              borderBottom: `2px solid ${INK}`,
            }}
          >
            학력
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {education.map((edu, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_BATANG,
                    fontSize: 14,
                    color: INK,
                    wordBreak: 'keep-all',
                  }}
                >
                  {edu.title}
                </span>
                <span
                  style={{
                    fontFamily: FONT_DODUM,
                    fontSize: 12,
                    color: INK_MUTED,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {edu.description}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </SatgatDocument>
  );
}

function parseRecordList(raw: unknown): Array<{ title: string; description: string }> {
  return normalizeListItems(raw, {
    titleKeys: ['title', 'company', 'school', 'name'],
    descriptionKeys: ['description', 'role', 'degree', 'period', 'summary'],
  });
}
