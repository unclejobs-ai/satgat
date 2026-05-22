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
 * 뉴스레터 — "편지"
 *
 * 페이지 구조:
 *  상단 15%: 발행일 + 제목
 *  중간 15%: 인사말
 *  중간 50%: 아티클 목록
 *  하단 20%: 프로모션 + CTA + 구독 해지
 *
 * 철학: 친근함과 정중함의 균형. 편지를 읽듯이.
 */

export default function NewsletterRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;

  const issueTitle = String(s['issue_title'] ?? '뉴스레터');
  const issueDate = String(s['issue_date'] ?? '');
  const greeting = String(s['greeting'] ?? '');
  const promotion = String(s['promotion'] ?? '');
  const cta = String(s['cta'] ?? '');
  const unsubscribe = String(s['unsubscribe'] ?? '');

  const articles = parseList(s['articles']);

  return (
    <SatgatDocument format="a4">
      {/* ─── 헤더: 발행일 + 제목 ──────────────────────────────────────── */}
      <header style={{ marginBottom: 32, textAlign: 'center' }}>
        {issueDate && (
          <p
            style={{
              fontFamily: FONT_DODUM,
              fontSize: 12,
              letterSpacing: '0.08em',
              color: INK_MUTED,
              marginBottom: 12,
            }}
          >
            {issueDate}
          </p>
        )}
        <h1
          style={{
            fontFamily: FONT_MYEONGJO,
            fontSize: 32,
            fontWeight: 800,
            lineHeight: 1.2,
            color: INK,
            textShadow: INK_BLEED_STRONG,
            margin: 0,
            wordBreak: 'keep-all',
          }}
        >
          {issueTitle}
        </h1>
        <SatgatDivider variant="ink" weight="thin" inkWash />
      </header>

      {/* ─── 인사말 ───────────────────────────────────────────────────── */}
      {greeting && (
        <section style={{ marginBottom: 32 }}>
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
            {greeting}
          </p>
        </section>
      )}

      {/* ─── 아티클 목록 ──────────────────────────────────────────────── */}
      {articles.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {articles.map((a, i) => (
              <div
                key={i}
                style={{
                  padding: '20px 0',
                  borderBottom: `1px solid ${HAIRLINE}`,
                }}
              >
                <h3
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 17,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    color: INK,
                    textShadow: INK_BLEED,
                    margin: '0 0 8px 0',
                    wordBreak: 'keep-all',
                  }}
                >
                  {a.title}
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
                  {a.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── 프로모션 ─────────────────────────────────────────────────── */}
      {promotion && (
        <section
          style={{
            marginBottom: 32,
            padding: '20px',
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 5,
            backgroundColor: 'rgba(184,149,79,0.04)',
          }}
        >
          <p
            style={{
              fontFamily: FONT_BATANG,
              fontSize: 15,
              lineHeight: 1.75,
              color: INK,
              textShadow: INK_BLEED,
              margin: 0,
              wordBreak: 'keep-all',
            }}
          >
            {promotion}
          </p>
        </section>
      )}

      <SatgatDivider variant="dancheong" weight="thin" />

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      {cta && (
        <section style={{ margin: '24px 0', textAlign: 'center' }}>
          <p
            style={{
              fontFamily: FONT_MYEONGJO,
              fontSize: 18,
              fontWeight: 700,
              color: DANCHEONG,
              textShadow: INK_BLEED,
              margin: 0,
              wordBreak: 'keep-all',
            }}
          >
            {cta}
          </p>
        </section>
      )}

      {/* ─── 푸터: 구독 해지 ──────────────────────────────────────────── */}
      {unsubscribe && (
        <footer
          style={{
            marginTop: 32,
            paddingTop: 16,
            borderTop: `1px solid ${HAIRLINE}`,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: FONT_DODUM,
              fontSize: 11,
              letterSpacing: '0.04em',
              color: INK_MUTED,
              margin: 0,
            }}
          >
            {unsubscribe}
          </p>
        </footer>
      )}
    </SatgatDocument>
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
