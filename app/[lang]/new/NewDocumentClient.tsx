"use client";

import React from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { BrowserBrandProfile } from "@/lib/design-system/brand-resolver";
import { validateDocumentData } from "@/lib/engine/validator";
import {
  buildGenerateRequest,
  GENERATE_REQUEST_LIMITS,
} from "@/lib/generation/generate-request";
import {
  disposeGenerationOnRouteExit,
  GenerationRequestCoordinator,
} from "@/lib/generation/generation-request-coordinator";
import {
  DraftStorageError,
  isDocumentData,
  replaceCurrentDraft,
} from "@/lib/preview/draft-storage";
import { getTemplate, listTemplates } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";
import BrandProfilePanel from "./BrandProfilePanel";
import CreateResult, { buildPrivatePreviewHref } from "./CreateResult";
import FactChecklist from "./FactChecklist";
import PromptComposer from "./PromptComposer";
import TemplatePicker from "./TemplatePicker";
import styles from "./new-document.module.css";

const TEMPLATES = listTemplates();

type NewDocumentClientProps = {
  lang: string;
  preselectedTemplate: string | null;
};

export default function NewDocumentClient({
  lang,
  preselectedTemplate,
}: NewDocumentClientProps) {
  const pathname = usePathname();
  const initialTemplate = preselectedTemplate
    ? getTemplate(preselectedTemplate)?.id ?? null
    : null;
  const createPathnameRef = React.useRef(pathname);
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateId | null>(initialTemplate);
  const [prompt, setPrompt] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [brandProfile, setBrandProfile] = React.useState<BrowserBrandProfile | null>(null);
  const [brandProfileValid, setBrandProfileValid] = React.useState(true);
  const promptSectionRef = React.useRef<HTMLElement | null>(null);
  const resultLinkRef = React.useRef<HTMLAnchorElement | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);
  const requestCoordinatorRef = React.useRef<GenerationRequestCoordinator | null>(null);

  if (requestCoordinatorRef.current === null) {
    requestCoordinatorRef.current = new GenerationRequestCoordinator();
  }

  React.useEffect(() => {
    const coordinator = requestCoordinatorRef.current;
    const dispose = () => coordinator?.dispose();
    window.addEventListener("pagehide", dispose);
    window.addEventListener("beforeunload", dispose);
    return () => {
      window.removeEventListener("pagehide", dispose);
      window.removeEventListener("beforeunload", dispose);
      dispose();
    };
  }, []);

  React.useEffect(() => {
    const coordinator = requestCoordinatorRef.current;
    if (coordinator) {
      disposeGenerationOnRouteExit(coordinator, createPathnameRef.current, pathname);
    }
  }, [pathname]);

  const selected = selectedTemplate ? getTemplate(selectedTemplate) : undefined;

  const invalidateGeneration = () => {
    requestCoordinatorRef.current?.invalidate();
    setGenerating(false);
  };

  const clearOutcome = () => {
    setResult(null);
    setError(null);
  };

  const chooseTemplate = (id: TemplateId) => {
    if (generating) return;
    invalidateGeneration();
    flushSync(() => {
      setSelectedTemplate(id);
      clearOutcome();
    });
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    promptSectionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const changePrompt = (nextPrompt: string) => {
    if (generating) return;
    invalidateGeneration();
    setPrompt(nextPrompt);
    clearOutcome();
  };

  const appendPromptSeed = (seed: string) => {
    if (generating) return;
    invalidateGeneration();
    setPrompt((current) => {
      const joined = current.trim()
        ? `${current.trimEnd()}\n\n${seed}`
        : seed;
      return joined.slice(0, GENERATE_REQUEST_LIMITS.promptMax);
    });
    clearOutcome();
  };

  const handleBrandProfileChange = (
    profile: BrowserBrandProfile | null,
    valid: boolean,
  ) => {
    if (generating) return;
    invalidateGeneration();
    setBrandProfile(profile);
    setBrandProfileValid(valid);
    clearOutcome();
  };

  const handleGenerate = async () => {
    const coordinator = requestCoordinatorRef.current;
    if (!selectedTemplate || !selected || !brandProfileValid || !coordinator) return;

    const requestBody = buildGenerateRequest({
      templateId: selectedTemplate,
      prompt,
      brand: brandProfile ?? {},
      applyBrand: brandProfile !== null,
    });
    const request = coordinator.begin();
    const selectedAtStart = selected;
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: request.signal,
      });
      if (!coordinator.isCurrent(request.id)) return;
      if (!response.ok) throw new Error("generation request failed");

      const candidate = (await response.json()) as unknown;
      if (!coordinator.isCurrent(request.id)) return;
      if (
        !isDocumentData(candidate) ||
        !validateDocumentData(selectedAtStart, candidate).valid
      ) {
        throw new Error("invalid generated document");
      }

      const draftId = replaceCurrentDraft(candidate);
      const previewHref = buildPrivatePreviewHref(lang, draftId);
      flushSync(() => setResult(previewHref));
      resultLinkRef.current?.focus({ preventScroll: true });
    } catch (caught) {
      if (
        request.signal.aborted ||
        !coordinator.isCurrent(request.id) ||
        (caught instanceof DOMException && caught.name === "AbortError")
      ) {
        return;
      }
      const message = caught instanceof DraftStorageError
        ? caught.userMessage
        : "문서를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.";
      flushSync(() => setError(message));
      errorRef.current?.focus({ preventScroll: true });
    } finally {
      if (coordinator.finish(request.id)) {
        setGenerating(false);
      }
    }
  };

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.shell}>
        <TemplatePicker
          templates={TEMPLATES}
          selectedId={selectedTemplate}
          disabled={generating}
          onSelect={chooseTemplate}
        />

        <Link
          className={styles.examplesLink}
          href={`/${encodeURIComponent(lang)}/examples${selected ? `#${encodeURIComponent(selected.id)}` : ""}`}
          prefetch={false}
        >
          {selected ? `${selected.name} 완성 예시 보기` : "완성 문서 예시 보기"}
        </Link>

        {selected ? (
          <section className={styles.creationStage} ref={promptSectionRef} aria-label="문서 내용 작성">
            <div className={styles.creationGrid}>
              <PromptComposer
                template={selected}
                prompt={prompt}
                onPromptChange={changePrompt}
                onSeedSelect={appendPromptSeed}
                onGenerate={handleGenerate}
                generating={generating}
                requestValid={brandProfileValid}
                error={error}
                errorRef={errorRef}
              />
              <aside className={styles.sidebar} aria-label="선택한 템플릿 정보">
                <FactChecklist template={selected} />
                <BrandProfilePanel
                  disabled={generating}
                  onProfileChange={handleBrandProfileChange}
                />
              </aside>
            </div>
          </section>
        ) : null}

        {result ? (
          <CreateResult
            href={result}
            linkRef={resultLinkRef}
          />
        ) : null}
      </div>
    </main>
  );
}
