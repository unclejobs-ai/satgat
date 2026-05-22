"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SatgatTemplateRenderer } from "@/lib/engine/renderer";
import { getTemplate, TEMPLATE_SEAL, TEMPLATE_VOICE } from "@/lib/templates/registry";
import type { SatgatDocumentData } from "@/lib/templates/types";
import { SatgatPrintStyles } from "@/components/document";

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");
  const preview = React.useMemo((): {
    data: SatgatDocumentData | null;
    template: ReturnType<typeof getTemplate>;
    error: string | null;
  } => {
    if (!dataParam) {
      return { data: null, template: undefined, error: "불러올 문서가 없습니다." };
    }

    try {
      const json = decodeURIComponent(escape(atob(decodeURIComponent(dataParam))));
      const parsed = JSON.parse(json) as SatgatDocumentData;
      const parsedTemplate = getTemplate(parsed.templateId);

      if (!parsedTemplate) {
        return { data: null, template: undefined, error: "지원하지 않는 문서입니다." };
      }

      return { data: parsed, template: parsedTemplate, error: null };
    } catch {
      return { data: null, template: undefined, error: "문서를 읽지 못했습니다." };
    }
  }, [dataParam]);
  const { data, template, error } = preview;

  if (error) {
    return (
      <div className="empty-state">
        <p className="empty-mark">!</p>
        <h1>{error}</h1>
        <p className="empty-sub">새 문서를 만들거나, 처음으로 돌아가세요.</p>
        <div className="empty-actions">
          <Link href="/ko/new" className="empty-cta primary">새 문서 생성</Link>
          <Link href="/ko" className="empty-cta">처음으로</Link>
        </div>
        <PreviewStyles />
      </div>
    );
  }

  if (!data || !template) {
    return (
      <div className="empty-state">
        <p className="empty-mark loading">…</p>
        <h1>한지를 펴는 중…</h1>
        <PreviewStyles />
      </div>
    );
  }

  const seal = TEMPLATE_SEAL[template.id];
  const voice = TEMPLATE_VOICE[template.id];

  return (
    <div className="preview-wrap">
      <SatgatPrintStyles />

      {/* Toolbar */}
      <div className="preview-toolbar no-print">
        <div className="meta">
          {seal && (
            <span className={`tb-seal v-${seal.variant}`} aria-hidden>
              {seal.glyph}
            </span>
          )}
          <div>
            <p className="tb-name">{template.name}</p>
            {voice && <p className="tb-voice">{voice}</p>}
          </div>
        </div>
        <div className="actions">
          <Link href="/ko/new" className="tb-link">다시 만들기</Link>
          <button onClick={() => window.print()} className="tb-print">
            <span className="print-glyph">印</span>
            <span>인쇄 / PDF 저장</span>
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="doc-stage">
        <SatgatTemplateRenderer template={template} data={data} />
      </div>

      <PreviewStyles />
    </div>
  );
}

function PreviewStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      .preview-wrap {
        max-width: 1080px;
        margin: 0 auto;
        padding: 32px 24px 96px;
        font-family: var(--serif);
        color: var(--near-black, #1C1916);
        word-break: keep-all;
      }
      .preview-toolbar {
        max-width: 210mm;
        margin: 0 auto 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        padding: 16px 20px;
        background: rgba(248, 244, 232, 0.85);
        backdrop-filter: blur(8px);
        border: 1px solid var(--border-soft, #E8E2D0);
        border-radius: 8px;
      }
      .preview-toolbar .meta {
        display: inline-flex;
        align-items: center;
        gap: 14px;
      }
      .tb-seal {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 4px;
        font-family: var(--serif-display);
        font-size: 18px;
        font-weight: 800;
        color: var(--parchment);
        box-shadow: inset 0 0 0 1.2px rgba(255,255,255,0.18);
      }
      .v-ink { background: var(--near-black); }
      .v-dancheong { background: var(--brand); }
      .v-jade { background: var(--jade, #2E6B5E); }
      .v-gold { background: var(--gold, #B8954F); color: var(--near-black); }
      .tb-name {
        font-family: var(--serif-display);
        font-size: 17px;
        font-weight: 800;
        color: var(--near-black);
        margin: 0 0 2px;
        letter-spacing: -0.012em;
      }
      .tb-voice {
        font-family: var(--serif);
        font-size: 12.5px;
        color: var(--olive, #4D4B46);
        margin: 0;
      }
      .preview-toolbar .actions {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      .tb-link {
        font-family: var(--sans);
        font-size: 12.5px;
        font-weight: 500;
        letter-spacing: 0.06em;
        color: var(--olive);
        text-decoration: none;
        padding: 10px 16px;
        border-radius: 4px;
        transition: color 0.18s ease, background 0.18s ease;
      }
      .tb-link:hover {
        color: var(--brand);
        background: rgba(155, 27, 27, 0.04);
      }
      .tb-print {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 18px;
        background: var(--near-black);
        color: var(--parchment);
        border-radius: 6px;
        font-family: var(--serif-display);
        font-size: 13.5px;
        font-weight: 700;
        letter-spacing: -0.005em;
        transition: background 0.18s ease, transform 0.18s ease;
      }
      .tb-print:hover {
        background: #0E0C0A;
        transform: translateY(-1px);
      }
      .print-glyph {
        font-size: 16px;
        font-weight: 800;
        color: var(--gold);
      }
      .doc-stage {
        display: flex;
        justify-content: center;
      }
      .empty-state {
        max-width: 520px;
        margin: 80px auto;
        padding: 56px 32px;
        text-align: center;
        font-family: var(--serif);
        color: var(--near-black);
      }
      .empty-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        background: var(--brand);
        color: var(--parchment);
        font-family: var(--serif-display);
        font-size: 32px;
        font-weight: 800;
        border-radius: 8px;
        margin: 0 auto 24px;
      }
      .empty-mark.loading {
        background: var(--olive);
        color: var(--parchment);
        font-size: 28px;
      }
      .empty-state h1 {
        font-family: var(--serif-display);
        font-size: 26px;
        font-weight: 800;
        margin: 0 0 12px;
        letter-spacing: -0.015em;
      }
      .empty-sub {
        font-size: 14.5px;
        line-height: 1.72;
        color: var(--olive);
        margin: 0 0 32px;
      }
      .empty-actions {
        display: inline-flex;
        gap: 12px;
        justify-content: center;
      }
      .empty-cta {
        font-family: var(--serif-display);
        font-size: 14px;
        font-weight: 700;
        padding: 12px 24px;
        border-radius: 6px;
        text-decoration: none;
        transition: background 0.18s ease, transform 0.18s ease;
        background: var(--ivory);
        color: var(--near-black);
        border: 1px solid var(--border);
      }
      .empty-cta.primary {
        background: var(--brand);
        color: var(--parchment);
        border-color: var(--brand);
      }
      .empty-cta:hover { transform: translateY(-1px); }
      .empty-cta.primary:hover { background: #B53030; }

      @media print {
        .preview-toolbar { display: none !important; }
        .preview-wrap { padding: 0; max-width: none; }
      }
    `}} />
  );
}
