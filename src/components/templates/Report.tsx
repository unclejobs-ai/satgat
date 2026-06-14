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
  JADE,
  HAIRLINE,
  INK_BLEED,
  INK_BLEED_STRONG,
} from '@/lib/design-system/constraint';

/**
 * 보고서(報告書) — 일의 기록
 * 제목 · 개요 · 배경 · 추진내용 · 성과 · 이슈 · 계획 · 맺음말
 */

export default function ReportRenderer({ data }: { data: SatgatDocumentData }) {
  const s = data.slots;
  const title = String(s['title'] ?? '보고서');
  const report_no = String(s['report_no'] ?? '');
  const date = String(s['date'] ?? '');
  const author = String(s['author'] ?? '');
  const period = String(s['period'] ?? '');
  const summary = String(s['summary'] ?? '');
  const background = String(s['background'] ?? '');
  const issues = String(s['issues'] ?? '');
  const plan = String(s['plan'] ?? '');
  const closing = String(s['closing'] ?? '');
  const progress = normalizeListItems(s['progress'], {
    titleKeys: ['title', 'name', 'label'],
    descriptionKeys: ['description', 'summary', 'content'],
  });

  const resultsRaw = s['results'];
  const results =
    resultsRaw &&
    typeof resultsRaw === 'object' &&
    !Array.isArray(resultsRaw) &&
    Array.isArray((resultsRaw as Record<string, unknown>).headers) &&
    Array.isArray((resultsRaw as Record<string, unknown>).rows)
      ? (resultsRaw as { headers: string[]; rows: string[][] })
      : null;

  return (
    <SatgatDocument format="a4">
      {/* 표제(表題) */}
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
          報告書 · REPORT
        </p>
        <h1
          style={{
            fontFamily: FONT_MYEONGJO,
            fontSize: 34,
            fontWeight: 800,
            lineHeight: 1.15,
            color: INK,
            textShadow: INK_BLEED_STRONG,
            margin: '0 0 14px',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '5px 24px',
            paddingTop: 12,
            borderTop: `0.5pt solid ${HAIRLINE}`,
            fontFamily: FONT_DODUM,
            fontSize: 11,
            color: INK_MUTED,
            letterSpacing: '0.04em',
          }}
        >
          {report_no && <span>문서번호 · {report_no}</span>}
          {date && <span style={{ textAlign: 'right' }}>{date}</span>}
          {author && <span>작성 · {author}</span>}
          {period && <span style={{ textAlign: 'right' }}>기간 · {period}</span>}
        </div>
      </header>

      <div style={{ width: 32, height: 2.5, background: DANCHEONG, margin: '0 0 28px' }} />

      {/* 一. 개요 */}
      {summary && (
        <section style={{ marginBottom: 32 }}>
          <ReportSectionHead title="一. 개요(槪要)" />
          <p
            style={{
              fontFamily: FONT_BATANG,
              fontSize: 13.5,
              lineHeight: 1.85,
              color: INK_LIGHT,
              margin: '12px 0 0',
              whiteSpace: 'pre-line',
              wordBreak: 'keep-all',
              letterSpacing: '-0.003em',
            }}
          >
            {summary}
          </p>
        </section>
      )}

      {/* 二. 배경 */}
      {background && (
        <ReportTextSection title="二. 배경·목적(背景)" body={background} />
      )}

      {/* 三. 추진 내용 */}
      {progress.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <ReportSectionHead title="三. 추진 내용(推進)" />
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {progress.map((item, i) => (
              <div
                key={i}
                style={{
                  paddingLeft: 14,
                  borderLeft: `2.5px solid ${JADE}`,
                }}
              >
                <p
                  style={{
                    fontFamily: FONT_MYEONGJO,
                    fontSize: 13,
                    fontWeight: 700,
                    color: INK,
                    margin: '0 0 3px',
                    letterSpacing: '-0.005em',
                    textShadow: INK_BLEED,
                  }}
                >
                  {item.title}
                </p>
                {item.description && (
                  <p
                    style={{
                      fontFamily: FONT_BATANG,
                      fontSize: 12,
                      lineHeight: 1.75,
                      color: INK_LIGHT,
                      margin: 0,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 四. 성과·지표 */}
      {results && (
        <section style={{ marginTop: 32 }}>
          <ReportSectionHead title="四. 성과·지표(成果)" />
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: 14,
              fontFamily: FONT_DODUM,
              fontSize: 11.5,
            }}
          >
            <thead>
              <tr>
                {results.headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '8px 12px',
                      background: JADE,
                      color: '#F7F7F2',
                      fontFamily: FONT_MYEONGJO,
                      fontSize: 11,
                      fontWeight: 700,
                      textAlign: i === 0 ? 'left' : 'right',
                      borderBottom: `2pt solid ${INK}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: '7px 12px',
                        borderBottom: `0.5pt solid ${HAIRLINE}`,
                        color: INK_LIGHT,
                        textAlign: ci === 0 ? 'left' : 'right',
                        fontFamily: ci === 0 ? FONT_BATANG : FONT_DODUM,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* 五. 이슈·리스크 */}
      {issues && (
        <ReportTextSection title="五. 이슈·리스크(Issue)" body={issues} />
      )}

      {/* 六. 향후 계획 */}
      {plan && (
        <ReportTextSection title="六. 향후 계획(計劃)" body={plan} />
      )}

      {/* 맺음말 */}
      {closing && (
        <section
          style={{
            marginTop: 40,
            paddingTop: 16,
            borderTop: `0.5pt solid ${HAIRLINE}`,
          }}
        >
          <p
            style={{
              fontFamily: FONT_BATANG,
              fontSize: 12.5,
              lineHeight: 1.85,
              color: INK_MUTED,
              margin: 0,
              whiteSpace: 'pre-line',
              wordBreak: 'keep-all',
              letterSpacing: '-0.003em',
            }}
          >
            {closing}
          </p>
        </section>
      )}
    </SatgatDocument>
  );
}

function ReportSectionHead({ title }: { title: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        marginBottom: 8,
        paddingBottom: 6,
        borderBottom: `0.5pt solid ${HAIRLINE}`,
      }}
    >
      <h2
        style={{
          fontFamily: FONT_MYEONGJO,
          fontSize: 16,
          fontWeight: 700,
          color: INK,
          margin: 0,
          letterSpacing: '-0.005em',
          textShadow: INK_BLEED,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function ReportTextSection({ title, body }: { title: string; body: string }) {
  return (
    <section style={{ marginTop: 32, breakInside: 'avoid' }}>
      <ReportSectionHead title={title} />
      <p
        style={{
          fontFamily: FONT_BATANG,
          fontSize: 13,
          lineHeight: 1.85,
          color: INK_LIGHT,
          margin: '12px 0 0',
          whiteSpace: 'pre-line',
          letterSpacing: '-0.003em',
          wordBreak: 'keep-all',
        }}
      >
        {body}
      </p>
    </section>
  );
}
