"use client";

import React from "react";
import Link from "next/link";
import { Check, Download, Link2, Printer, RotateCcw } from "lucide-react";
import { SatgatTemplateRenderer } from "@/components/templates/SatgatTemplateRenderer";
import { getPageSpec, getTemplate } from "@/lib/templates/registry";
import { validateDocumentData } from "@/lib/engine/validator";
import {
  DraftStorageError,
  isDocumentData,
  readDraft,
} from "@/lib/preview/draft-storage";
import {
  encodeSharePayload,
  SharePayloadTooLargeError,
  SHARE_PAYLOAD_TOO_LARGE_MESSAGE,
  resolvePreviewSource,
} from "@/lib/preview/share-payload";
import {
  calculatePreviewScale,
  millimetersToCssPixels,
} from "./preview-scale";
import { finishPdfAttempt, invalidatePdfAttempt, startPdfAttempt, type PdfAttemptState } from "@/lib/preview/pdf-attempt";
import type { SatgatDocumentData } from "@/lib/templates/types";
import { SatgatPrintStyles } from "@/components/document";

type PreviewPayload =
  | { data: SatgatDocumentData; error: null; sourceKey: string }
  | { data: null; error: string; sourceKey: string };

type PreviewClientProps = {
  lang: string;
  draftId: string | null;
};

function hasSlotValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function subscribeToHashChange(onStoreChange: () => void): () => void {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function currentHash(): string {
  return window.location.hash;
}


export default function PreviewClient({ lang, draftId }: PreviewClientProps) {
  const hash = React.useSyncExternalStore(subscribeToHashChange, currentHash, () => "");
  const sourceKey = `${draftId ?? ""}:${hash}`;
  const [preview, setPreview] = React.useState<PreviewPayload | null>(null);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [copyStatus, setCopyStatus] = React.useState<"idle" | "copied" | "failed" | "too-large">("idle");
  const [pdfState, setPdfState] = React.useState<PdfAttemptState>({ attempt: 0, status: "idle" });
  const pdfStatus = pdfState.status;
  const pdfAttemptRef = React.useRef(0);
  const pdfAbortRef = React.useRef<AbortController | null>(null);
  const copyAttemptRef = React.useRef(0);
  const shareTriggerRef = React.useRef<HTMLButtonElement>(null);
  const shareDialogRef = React.useRef<HTMLDivElement>(null);
  const shareCancelRef = React.useRef<HTMLButtonElement>(null);
  const currentPreview = preview?.sourceKey === sourceKey ? preview : null;
  const data = currentPreview?.data ?? null;
  const error = currentPreview?.error ?? null;
  const template = data ? getTemplate(data.templateId) : undefined;
  const langPath = `/${encodeURIComponent(lang)}`;
  const pageSpec = template ? getPageSpec(template.pageSpec) : undefined;
  const pageWidth = pageSpec
    ? millimetersToCssPixels(pageSpec.canvas.widthMm)
    : 0;
  const pageHeight = pageSpec
    ? millimetersToCssPixels(pageSpec.canvas.heightMm)
    : 0;
  const docStageRef = React.useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = React.useState(1);

  React.useEffect(() => {
    pdfAbortRef.current?.abort();
    pdfAbortRef.current = null;
    const invalidatedPdf = invalidatePdfAttempt(pdfAttemptRef.current);
    pdfAttemptRef.current = invalidatedPdf.attempt;
    setPdfState(invalidatedPdf);
    copyAttemptRef.current += 1;
    setShareOpen(false);
    setCopyStatus("idle");
    setPreview(null);
    try {
      const resolved = resolvePreviewSource(hash, draftId, readDraft);
      const candidate = resolved.value;
      if (resolved.source === "invalid-share") {
        setPreview({ data: null, error: "공유 링크의 문서 형식이 올바르지 않습니다.", sourceKey });
        return;
      }
      if (!isDocumentData(candidate)) {
        setPreview({
          data: null,
          error: "문서를 찾을 수 없습니다. 새 문서를 만들거나 공유 링크를 확인해 주세요.",
          sourceKey,
        });
        return;
      }

      const candidateTemplate = getTemplate(candidate.templateId);
      const validation = candidateTemplate
        ? validateDocumentData(candidateTemplate, candidate)
        : { valid: false };
      setPreview(
        validation.valid
          ? { data: candidate, error: null, sourceKey }
          : { data: null, error: "문서 형식이 올바르지 않습니다.", sourceKey },
      );
    } catch (caught) {
      setPreview({
        data: null,
        error: caught instanceof DraftStorageError
          ? caught.userMessage
          : "문서를 찾을 수 없습니다. 새 문서를 만들거나 공유 링크를 확인해 주세요.",
        sourceKey,
      });
    }
  }, [draftId, hash, sourceKey]);
  React.useEffect(() => {
    const stage = docStageRef.current;
    if (!stage || pageWidth === 0 || pageHeight === 0) return;

    const updateScale = () => {
      if (stage.clientWidth === 0) return;
      const nextScale = calculatePreviewScale(
        stage.clientWidth,
        pageWidth,
        pageHeight,
      ).scale;
      setPreviewScale((currentScale) =>
        currentScale === nextScale ? currentScale : nextScale,
      );
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [pageHeight, pageWidth]);

  // Render-time density hint (VAL-DENSITY-005) now lives inside each
  // `SatgatDocument` page (src/components/document/SatgatDocument.tsx): the page
  // self-measures after paint and renders its own `data-density` attribute +
  // preview-only `.density-warn` badge as React state. It was moved out of this
  // client's useLayoutEffect because the old version imperatively appendChild'd
  // the badge during the lazy Suspense renderer's hydration window, which threw
  // a hydration-mismatch error on templates with a sparse page (M4 visual-qa).
  // The `.density-warn` styling below still applies to that React-rendered badge.

  const closeShareDialog = () => {
    copyAttemptRef.current += 1;
    setShareOpen(false);
  };

  React.useEffect(() => {
    if (!shareOpen) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : shareTriggerRef.current;
    shareCancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeShareDialog();
        return;
      }
      if (event.key !== "Tab" || !shareDialogRef.current) return;
      const controls = Array.from(
        shareDialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (controls.length === 0) {
        event.preventDefault();
        return;
      }
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      copyAttemptRef.current += 1;
      previouslyFocused?.focus();
    };
  }, [shareOpen]);

  React.useEffect(() => () => {
    copyAttemptRef.current += 1;
    pdfAbortRef.current?.abort();
  }, []);

  const copyShareLink = async () => {
    if (!data) return;
    const attempt = copyAttemptRef.current + 1;
    copyAttemptRef.current = attempt;

    try {
      const shareUrl = `${window.location.origin}${langPath}/preview#share=${encodeSharePayload(data)}`;
      await navigator.clipboard.writeText(shareUrl);
      if (copyAttemptRef.current !== attempt) return;
      setCopyStatus("copied");
      closeShareDialog();
    } catch (caught) {
      if (copyAttemptRef.current !== attempt) return;
      setCopyStatus(
        caught instanceof SharePayloadTooLargeError ? "too-large" : "failed",
      );
    }
  };

  const downloadPdf = async () => {
    if (!data) return;
    pdfAbortRef.current?.abort();
    const controller = new AbortController();
    pdfAbortRef.current = controller;
    const next = startPdfAttempt({ attempt: pdfAttemptRef.current, status: pdfStatus });
    pdfAttemptRef.current = next.attempt;
    setPdfState(next);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: data.templateId, slots: data.slots, lang }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`export failed: ${res.status}`);
      const blob = await res.blob();
      if (controller.signal.aborted || pdfAttemptRef.current !== next.attempt) return;
      const url = URL.createObjectURL(blob);
      try {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `satgat-${data.templateId}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } finally {
        URL.revokeObjectURL(url);
      }
      setPdfState((state) => finishPdfAttempt(state, next.attempt, "idle"));
    } catch {
      if (!controller.signal.aborted) {
        setPdfState((state) => finishPdfAttempt(state, next.attempt, "error"));
      }
    } finally {
      if (pdfAbortRef.current === controller) pdfAbortRef.current = null;
    }
  };

  if (!currentPreview) {
    return (
      <main id="main-content" className="empty-state" data-render-state="loading" aria-live="polite" aria-busy="true">
        <p className="empty-mark loading">…</p>
        <h1>한지를 펴는 중…</h1>
        <PreviewStyles />
      </main>
    );
  }

  if (error) {
    return (
      <main id="main-content" className="empty-state" data-render-state="error" role="alert">
        <p className="empty-mark">!</p>
        <h1>{error}</h1>
        <p className="empty-sub">새 문서를 만들거나, 처음으로 돌아가세요.</p>
        <div className="empty-actions">
          <Link href={`${langPath}/new`} className="empty-cta primary" prefetch={false}>새 문서 생성</Link>
          <Link href={langPath} className="empty-cta" prefetch={false}>처음으로</Link>
        </div>
        <PreviewStyles />
      </main>
    );
  }

  if (!data || !template || !pageSpec) {
    return <main id="main-content" />;
  }

  const pageSpecLabel = pageSpec.label;
  const requiredSlots = template.slots.filter((slot) => slot.required);
  const readinessSlots = requiredSlots.length > 0 ? requiredSlots : template.slots;
  const filledSlots = readinessSlots.filter((slot) => hasSlotValue(data.slots[slot.id])).length;
  const completion = Math.round((filledSlots / Math.max(readinessSlots.length, 1)) * 100);

  return (
    <main id="main-content" className={`preview-wrap preview-format-${template.pageSpec}`}>
      <SatgatPrintStyles />

      {/* Toolbar */}
      <div className="preview-toolbar no-print" inert={shareOpen} aria-hidden={shareOpen}>
        <div className="meta">
          <div>
            <p className="tb-name">{template.name}</p>
            <p className="tb-voice">
              <span>{template.category}</span>
              <span aria-hidden> · </span>
              <span>{pageSpecLabel}</span>
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
          <Link href={`${langPath}/new?template=${template.id}`} className="tb-link" prefetch={false}>
            <RotateCcw size={14} strokeWidth={1.8} aria-hidden />
            <span>다시 만들기</span>
          </Link>
          <button
            ref={shareTriggerRef}
            onClick={() => {
              copyAttemptRef.current += 1;
              setCopyStatus("idle");
              setShareOpen(true);
            }}
            className="tb-link tb-copy"
            type="button"
          >
            {copyStatus === "copied" ? <Check size={14} strokeWidth={1.9} aria-hidden /> : <Link2 size={14} strokeWidth={1.8} aria-hidden />}
            <span>{copyStatus === "copied" ? "복사됨" : copyStatus === "failed" ? "복사 실패" : "공유 링크"}</span>
          </button>
          <button
            onClick={downloadPdf}
            className="tb-link tb-pdf"
            type="button"
            disabled={pdfStatus === "loading"}
          >
            <Download size={14} strokeWidth={1.8} aria-hidden />
            <span>
              {pdfStatus === "loading" ? "내보내는 중…" : pdfStatus === "error" ? "다시 시도" : "PDF 내려받기"}
            </span>
          </button>
          <button onClick={() => window.print()} className="tb-print">
            <Printer size={15} strokeWidth={1.8} aria-hidden />
            <span>인쇄 / PDF 저장</span>
          </button>
        </div>
      </div>
      {shareOpen ? (
        <div className="share-backdrop no-print">
          <div
            ref={shareDialogRef}
            className="share-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            aria-describedby="share-dialog-description"
          >
            <h2 id="share-dialog-title">문서 내용이 담긴 링크 공유</h2>
            <p id="share-dialog-description">이 링크에는 문서 내용이 포함됩니다. 개인정보가 있으면 공유하지 마세요.</p>
            {copyStatus === "failed" || copyStatus === "too-large" ? (
              <p className="share-error" role="alert">
                {copyStatus === "too-large"
                  ? SHARE_PAYLOAD_TOO_LARGE_MESSAGE
                  : "링크를 복사하지 못했습니다. 다시 시도해 주세요."}
              </p>
            ) : null}
            <div className="share-actions">
              <button ref={shareCancelRef} type="button" className="empty-cta" onClick={closeShareDialog}>
                취소
              </button>
              <button type="button" className="empty-cta primary" onClick={copyShareLink}>
                확인하고 복사
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Document */}
      <div className="doc-stage" ref={docStageRef} inert={shareOpen} aria-hidden={shareOpen}>
        <div
          className="preview-canvas"
          style={{
            width: `${pageSpec.canvas.widthMm}mm`,
            zoom: previewScale,
          }}
        >
          <SatgatTemplateRenderer template={template} data={data} />
        </div>
      </div>

      <PreviewStyles />
    </main>
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
      .preview-format-a4Landscape,
      .preview-format-slide16x9 {
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
      .preview-format-a4Landscape .preview-toolbar,
      .preview-format-slide16x9 .preview-toolbar {
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
      .share-backdrop {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: grid;
        place-items: center;
        padding: 24px;
        background: rgba(28, 25, 22, 0.48);
      }
      .share-dialog {
        width: min(100%, 460px);
        box-sizing: border-box;
        padding: 28px;
        border: 1px solid var(--border-soft, #E8E2D0);
        border-radius: 8px;
        background: var(--parchment, #FFFFFB);
        box-shadow: 0 24px 72px rgba(28, 25, 22, 0.2);
      }
      .share-dialog h2 {
        margin: 0 0 12px;
        font-family: var(--serif-display);
        font-size: 20px;
      }
      .share-dialog p {
        margin: 0;
        color: var(--olive);
        font-size: 14px;
        line-height: 1.7;
      }
      .share-dialog .share-error {
        margin-top: 12px;
        color: var(--brand);
      }
      .share-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 24px;
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
        width: 100%;
        padding: 4px 0 12px;
      }
      .preview-canvas {
        display: grid;
        justify-items: center;
        gap: 48px;
        margin: 0 auto;
      }
      .preview-canvas .satgat-document {
        flex: 0 0 auto;
        margin-bottom: 0 !important;
      }
      .preview-canvas .satgat-document + .satgat-document {
        margin-top: 0 !important;
      }
      /* Render-time density hint (VAL-DENSITY-005). Preview-only badge injected
         onto .satgat-document[data-density="sparse"] pages. Never printed. */
      .satgat-document[data-density="sparse"] {
        position: relative;
      }
      .density-warn {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 5;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 10px;
        background: var(--brand, #9B1B1B);
        color: var(--parchment, #FFFFFB);
        font-family: var(--sans);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.04em;
        border-radius: 4px;
        pointer-events: none;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(28,25,22,0.16);
      }
      .density-warn::before {
        content: "△";
        font-size: 10px;
        line-height: 1;
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
      .empty-cta.primary:hover { background: #B92D2D; }

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
        }
        .preview-canvas {
          gap: 28px;
        }
        .preview-format-slide16x9 .preview-canvas {
          gap: 22px;
        }
      }

    `}} />
  );
}
