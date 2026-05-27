'use client';

import React from 'react';
import { SatgatDocument } from '../document/SatgatDocument';
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
  INK_BLEED,
  INK_BLEED_STRONG,
} from '@/lib/design-system/constraint';

/**
 * 제안서(提案書) — 사업의 길
 * 문제 · 해결안 · 메트릭 · 일정 · 비용 · 담당
 */

export default function ProposalRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;
  const title = String(s['title'] ?? '제안서');
  const subtitle = String(s['subtitle'] ?? '');
  const client = String(s['client'] ?? '');
  const date = String(s['date'] ?? '');
  const problem = String(s['problem'] ?? '');
  const solution = String(s['solution'] ?? '');
  const timeline = String(s['timeline'] ?? '');
  const cost = String(s['cost'] ?? '');
  const metrics = normalizeListItems(s['metrics'], {
    titleKeys: ['label', 'metric', 'title', 'name'],
    descriptionKeys: ['value', 'description', 'summary'],
  });
  const team = normalizeListItems(s['team'], {
    titleKeys: ['name', 'title'],
    descriptionKeys: ['role', 'background', 'description'],
  });

  return (
    <SatgatDocument format="a4">
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <p
          style={{
            fontFamily: FONT_DODUM,
            fontSize: 11,
            letterSpacing: '0.22em',
            color: INK_MUTED,
            textTransform: 'uppercase',
            margin: '0 0 14px',
          }}
        >
          提案書 · PROPOSAL
        </p>
        <h1
          style={{
            fontFamily: FONT_MYEONGJO,
            fontSize: 36,
            fontWeight: 800,
            lineHeight: 1.12,
            color: INK,
            textShadow: INK_BLEED_STRONG,
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontFamily: FONT_BATANG,
              fontSize: 16,
              color: INK_LIGHT,
              margin: '0 0 12px',
            }}
          >
            {subtitle}
          </p>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingTop: 12,
            borderTop: `0.5pt solid ${HAIRLINE}`,
            fontFamily: FONT_DODUM,
            fontSize: 11.5,
            color: INK_MUTED,
            letterSpacing: '0.04em',
          }}
        >
          <span>{client && `제출처 · ${client}`}</span>
          <span>{date}</span>
        </div>
      </header>

      <div style={{ width: 36, height: 2.5, background: DANCHEONG, margin: '0 0 28px' }} />

      {/* Problem */}
      {problem && (
        <Section title="一. 문제(問題)" subtitle="현재 무엇이 어려운가">
          {problem}
        </Section>
      )}

      {/* Solution */}
      {solution && (
        <Section title="二. 해결안(解決案)" subtitle="우리가 제안하는 방식">
          {solution}
        </Section>
      )}

      {/* Metrics */}
      {metrics.length > 0 && (
        <section style={{ margin: '32px 0' }}>
          <SectionHead title="三. 핵심 지표(指標)" subtitle="기대 효과 정량화" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(metrics.length, 4)}, 1fr)`,
              gap: 16,
              marginTop: 14,
            }}
          >
            {metrics.map((m, i) => (
              <div
                key={i}
                style={{
                  padding: '16px 14px',
                  background: '#FFFFFB',
                  border: `0.5pt solid ${HAIRLINE}`,
                  borderRadius: 6,
                  textAlign: 'left',
                }}
              >
                <p
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 28,
                    fontWeight: 800,
                    color: DANCHEONG,
                    margin: '0 0 4px',
                    lineHeight: 1,
                    letterSpacing: '-0.015em',
                  }}
                >
                  {m.description || m.title}
                </p>
                <p
                  style={{
                    fontFamily: FONT_DODUM,
                    fontSize: 10.5,
                    color: INK_MUTED,
                    margin: 0,
                    letterSpacing: '0.04em',
                  }}
                >
                  {m.description ? m.title : '핵심 지표'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Timeline */}
      {timeline && (
        <Section title="四. 추진 일정(日程)" subtitle="단계별 계획">
          {timeline}
        </Section>
      )}

      {/* Cost */}
      {cost && (
        <Section title="五. 비용·조건(費用)" subtitle="투자 규모와 조건">
          {cost}
        </Section>
      )}

      {/* Team */}
      {team.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <SectionHead title="六. 담당(擔當)" subtitle="추진 인력" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(team.length, 3)}, 1fr)`,
              gap: 16,
              marginTop: 14,
            }}
          >
            {team.map((p, i) => (
              <div
                key={i}
                style={{
                  paddingTop: 10,
                  borderTop: `1pt solid ${INK}`,
                }}
              >
                <p style={{ fontFamily: FONT_MYEONGJO, fontSize: 14, fontWeight: 800, color: INK, margin: '0 0 2px' }}>
                  {p.title}
                </p>
                {p.description && (
                  <p style={{ fontFamily: FONT_DODUM, fontSize: 10.5, color: INK_MUTED, margin: 0, letterSpacing: '0.04em' }}>
                    {p.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </SatgatDocument>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 8,
        paddingBottom: 6,
        borderBottom: `0.5pt solid ${HAIRLINE}`,
      }}
    >
      <h2
        style={{
          fontFamily: FONT_MYEONGJO,
          fontSize: 17,
          fontWeight: 800,
          color: INK,
          margin: 0,
          letterSpacing: '-0.005em',
          textShadow: INK_BLEED,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <span style={{ fontFamily: FONT_DODUM, fontSize: 10.5, color: DANCHEONG, letterSpacing: '0.06em' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 32, breakInside: 'avoid' }}>
      <SectionHead title={title} subtitle={subtitle} />
      <p
        style={{
          fontFamily: FONT_BATANG,
          fontSize: 13,
          lineHeight: 1.85,
          color: INK_LIGHT,
          margin: '14px 0 0',
          whiteSpace: 'pre-line',
          letterSpacing: '-0.003em',
          wordBreak: 'keep-all',
        }}
      >
        {children}
      </p>
    </section>
  );
}
