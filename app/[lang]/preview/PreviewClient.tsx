"use client";

import React from "react";
import Link from "next/link";
import { Check, Link2, Printer, RotateCcw } from "lucide-react";
import { SatgatTemplateRenderer } from "@/lib/engine/renderer";
import { getTemplate, TEMPLATE_SEAL, TEMPLATE_VOICE } from "@/lib/templates/registry";
import type { SatgatDocumentData } from "@/lib/templates/types";
import { SatgatPrintStyles } from "@/components/document";

type PreviewPayload =
  | { data: SatgatDocumentData; error: null }
  | { data: null; error: string };

type PreviewClientProps = {
  lang: string;
  preview: PreviewPayload;
};

function hasSlotValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

const FORMAT_LABEL: Record<string, string> = {
  a4: "A4 세로",
  "a4-landscape": "A4 가로",
  "slide-16x9": "16:9 슬라이드",
};

export default function PreviewClient({ lang, preview }: PreviewClientProps) {
  const [copyStatus, setCopyStatus] = React.useState<"idle" | "copied" | "failed">("idle");
  const { data, error } = preview;
  const template = data ? getTemplate(data.templateId) : undefined;
  const langPath = `/${encodeURIComponent(lang)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    window.setTimeout(() => setCopyStatus("idle"), 1500);
  };

  if (error) {
    return (
      <div className="empty-state">
        <p className="empty-mark">!</p>
        <h1>{error}</h1>
        <p className="empty-sub">새 문서를 만들거나, 처음으로 돌아가세요.</p>
        <div className="empty-actions">
          <Link href={`${langPath}/new`} className="empty-cta primary">새 문서 생성</Link>
          <Link href={langPath} className="empty-cta">처음으로</Link>
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
  const requiredSlots = template.slots.filter((slot) => slot.required);
  const readinessSlots = requiredSlots.length > 0 ? requiredSlots : template.slots;
  const filledSlots = readinessSlots.filter((slot) => hasSlotValue(data.slots[slot.id])).length;
  const completion = Math.round((filledSlots / Math.max(readinessSlots.length, 1)) * 100);

  return (
    <div className={`preview-wrap preview-format-${template.format}`}>
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
            <p className="tb-voice">
              {voice && <span>{voice}</span>}
              {voice && <span aria-hidden> · </span>}
              <span>{FORMAT_LABEL[template.format] ?? template.format}</span>
            </p>
          </div>
        </div>
        <div className="doc-readiness" aria-label="문서 완성도">
          <span className="readiness-label">{requiredSlots.length > 0 ? "필수 칸" : "채운 칸"}</span>
          <strong>{filledSlots}/{readinessSlots.length}</strong>
          <span
            className="readiness-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={readinessSlots.length}
            aria-valuenow={filledSlots}
          >
            <span style={{ width: `${completion}%` }} />
          </span>
        </div>
        <div className="actions">
          <Link href={`${langPath}/new?template=${template.id}`} className="tb-link">
            <RotateCcw size={14} strokeWidth={1.8} aria-hidden />
            <span>다시 만들기</span>
          </Link>
          <button onClick={copyLink} className="tb-link tb-copy" type="button">
            {copyStatus === "copied" ? <Check size={14} strokeWidth={1.9} aria-hidden /> : <Link2 size={14} strokeWidth={1.8} aria-hidden />}
            <span>{copyStatus === "copied" ? "복사됨" : copyStatus === "failed" ? "복사 실패" : "링크 복사"}</span>
          </button>
          <button onClick={() => window.print()} className="tb-print">
            <Printer size={15} strokeWidth={1.8} aria-hidden />
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
      .preview-format-a4-landscape,
      .preview-format-slide-16x9 {
        max-width: 1240px;
      }
      .preview-toolbar {
        max-width: 960px;
        margin: 0 auto 24px;
        display: grid;
        grid-template-columns: minmax(190px, 1fr) auto auto;
        align-items: center;
        gap: 18px;
        padding: 16px 20px;
        background:
          linear-gradient(180deg, rgba(255,255,251,0.88), rgba(248,244,232,0.78)),
          rgba(248, 244, 232, 0.84);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid var(--border-soft, #E8E2D0);
        border-radius: 8px;
        box-shadow: 0 18px 48px rgba(28,25,22,0.07), inset 0 1px 0 rgba(255,255,255,0.55);
      }
      .preview-format-a4-landscape .preview-toolbar,
      .preview-format-slide-16x9 .preview-toolbar {
        max-width: 1120px;
      }
      .preview-toolbar .meta {
        display: inline-flex;
        align-items: center;
        gap: 14px;
        min-width: 0;
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .preview-toolbar .actions {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        flex-wrap: nowrap;
        justify-content: flex-end;
      }
      .doc-readiness {
        display: grid;
        grid-template-columns: auto auto minmax(86px, 120px);
        align-items: center;
        gap: 9px;
        padding: 8px 14px;
        border-left: 1px solid var(--border-soft, #E8E2D0);
        border-right: 1px solid var(--border-soft, #E8E2D0);
      }
      .readiness-label {
        font-family: var(--sans);
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--stone, #6B6862);
      }
      .doc-readiness strong {
        font-family: var(--serif-display);
        font-size: 16px;
        line-height: 1;
        color: var(--near-black);
      }
      .readiness-track {
        display: block;
        height: 5px;
        overflow: hidden;
        border-radius: 999px;
        background: var(--border-soft, #E8E2D0);
      }
      .readiness-track span {
        display: block;
        height: 100%;
        min-width: 8px;
        border-radius: inherit;
        background: var(--jade, #2E6B5E);
      }
      .tb-link {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        font-family: var(--sans);
        font-size: 12.5px;
        font-weight: 500;
        letter-spacing: 0.06em;
        color: var(--olive);
        text-decoration: none;
        padding: 10px 16px;
        border-radius: 4px;
        white-space: nowrap;
        transition: color 0.18s ease, background 0.18s ease, transform 0.18s ease;
      }
      .tb-link:focus-visible,
      .tb-print:focus-visible,
      .empty-cta:focus-visible {
        outline: 2px solid var(--brand);
        outline-offset: 3px;
      }
      .tb-copy {
        min-width: 80px;
      }
      .tb-link:hover {
        color: var(--brand);
        background: rgba(155, 27, 27, 0.04);
        transform: translateY(-1px);
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
        white-space: nowrap;
        transition: background 0.18s ease, transform 0.18s ease;
      }
      .tb-print svg { color: var(--gold); }
      .tb-print:hover {
        background: #0E0C0A;
        transform: translateY(-1px);
      }
      .tb-link:active,
      .tb-print:active {
        transform: translateY(1px);
      }
      .doc-stage {
        display: grid;
        justify-items: center;
        gap: 48px;
        overflow-x: auto;
        padding: 4px 0 12px;
      }
      .doc-stage .satgat-document {
        flex: 0 0 auto;
        margin-bottom: 0 !important;
      }
      .doc-stage .satgat-document + .satgat-document {
        margin-top: 0 !important;
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

      @media (max-width: 980px) {
        .preview-toolbar {
          grid-template-columns: minmax(0, 1fr);
          align-items: stretch;
        }
        .doc-readiness {
          width: auto;
          border-left: none;
          border-right: none;
          border-top: 1px solid var(--border-soft, #E8E2D0);
          border-bottom: 1px solid var(--border-soft, #E8E2D0);
          grid-template-columns: auto auto minmax(120px, 1fr);
        }
        .preview-toolbar .actions {
          justify-content: stretch;
        }
        .tb-link,
        .tb-print {
          box-sizing: border-box;
        }
      }

      @media (max-width: 760px) {
        .preview-wrap {
          padding: 18px 14px 72px;
          --mobile-doc-width: calc(100vw - 28px);
          --mobile-doc-min-height: calc(var(--mobile-doc-width) * 1.414);
          --mobile-doc-padding: 48px 28px;
          --mobile-doc-font-size: 14px;
        }
        .preview-format-a4-landscape {
          --mobile-doc-min-height: calc(var(--mobile-doc-width) * 0.707);
          --mobile-doc-padding: 30px 24px;
          --mobile-doc-font-size: 12.75px;
        }
        .preview-format-slide-16x9 {
          --mobile-doc-min-height: calc(var(--mobile-doc-width) * 0.5625);
          --mobile-doc-padding: 28px 24px;
          --mobile-doc-font-size: 12.5px;
        }
        .preview-toolbar {
          align-items: stretch;
          gap: 12px;
          padding: 14px;
        }
        .preview-toolbar .meta {
          width: 100%;
        }
        .doc-readiness {
          width: 100%;
          padding: 12px 0;
          grid-template-columns: auto auto 1fr;
        }
        .preview-toolbar .actions {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .tb-link,
        .tb-print {
          min-height: 40px;
          box-sizing: border-box;
        }
        .tb-print {
          grid-column: 1 / -1;
          justify-content: center;
        }
        .doc-stage {
          padding-bottom: 8px;
          gap: 28px;
        }
        .doc-stage .satgat-document {
          width: min(100%, var(--mobile-doc-width)) !important;
          min-width: 0 !important;
          min-height: var(--mobile-doc-min-height) !important;
          padding: var(--mobile-doc-padding) !important;
          font-size: var(--mobile-doc-font-size) !important;
        }
        .preview-format-slide-16x9 .doc-stage {
          gap: 22px;
        }
      }

      @media print {
        .preview-toolbar { display: none !important; }
        .preview-wrap { padding: 0; max-width: none; }
        .doc-stage {
          display: block !important;
          overflow: visible !important;
          padding: 0 !important;
        }
      }
    `}} />
  );
}
