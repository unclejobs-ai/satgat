'use client';

import { SatgatDocument } from '../document/SatgatDocument';
import { SectionHeading, ProseSection } from '../document/SectionHeading';
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
  CANVAS,
} from '@/lib/design-system/constraint';

/**
 * 보고서 — 일의 기록
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
    <>
    <SatgatDocument pageSpec="a4Portrait">
      {/* 표제 */}
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
          보고서 · REPORT
        </p>
        <h1
          style={{
            fontFamily: FONT_MYEONGJO,
            fontSize: 34,
            fontWeight: 800,
            lineHeight: 1.15,
            color: INK,
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

      {/* 1. 개요 */}
      {summary && (
        <section style={{ marginBottom: 32 }}>
          <SectionHeading title="1. 개요" />
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

      {/* 2. 배경 */}
      {background && (
        <ProseSection title="2. 배경·목적">{background}</ProseSection>
      )}

      {/* 3. 추진 내용 */}
      {progress.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <SectionHeading title="3. 추진 내용" />
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

    </SatgatDocument>

    <SatgatDocument pageSpec="a4Portrait">
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingBottom: 14,
          borderBottom: `0.5pt solid ${HAIRLINE}`,
          marginBottom: 24,
        }}
      >
        <span style={{ fontFamily: FONT_MYEONGJO, fontSize: 18, fontWeight: 700, color: INK }}>
          {title}
        </span>
        <span style={{ fontFamily: FONT_DODUM, fontSize: 10.5, color: INK_MUTED, letterSpacing: '0.08em' }}>
          REPORT · CONTINUED
        </span>
      </header>
      {/* 4. 성과·지표 */}
      {results && (
        <section style={{ marginTop: 32 }}>
          <SectionHeading title="4. 성과·지표" />
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
                      color: CANVAS,
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

      {/* 5. 이슈·리스크 */}
      {issues && (
        <ProseSection title="5. 이슈·리스크(Issue)">{issues}</ProseSection>
      )}

      {/* 6. 향후 계획 */}
      {plan && (
        <ProseSection title="6. 향후 계획">{plan}</ProseSection>
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
    </>
  );
}
