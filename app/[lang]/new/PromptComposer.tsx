import React from "react";
import { GENERATE_REQUEST_LIMITS } from "@/lib/generation/generate-request";
import type { TemplateCatalogEntry } from "@/lib/templates/types";
import styles from "./new-document.module.css";

type PromptComposerProps = {
  template: TemplateCatalogEntry;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSeedSelect: (seed: string) => void;
  onGenerate: () => void;
  generating: boolean;
  requestValid: boolean;
  error: string | null;
  errorRef: React.RefObject<HTMLDivElement | null>;
};

export function getPromptComposerView(
  template: TemplateCatalogEntry,
  prompt: string,
) {
  const length = prompt.trim().length;
  const minLength = GENERATE_REQUEST_LIMITS.promptMin;
  const maxLength = GENERATE_REQUEST_LIMITS.promptMax;

  return {
    seeds: template.promptSeeds.slice(0, 2),
    facts: template.factChecklist,
    minLength,
    maxLength,
    length,
    remaining: Math.max(0, minLength - length),
    ready: length >= minLength && length <= maxLength,
  } as const;
}

export default function PromptComposer({
  template,
  prompt,
  onPromptChange,
  onSeedSelect,
  onGenerate,
  generating,
  requestValid,
  error,
  errorRef,
}: PromptComposerProps) {
  const promptId = React.useId();
  const view = getPromptComposerView(template, prompt);
  const descriptionId = `${promptId}-description`;
  const countId = `${promptId}-count`;

  return (
    <form
      className={styles.promptComposer}
      onSubmit={(event) => {
        event.preventDefault();
        onGenerate();
      }}
    >
      <div className={styles.composerHeading}>
        <div>
          <p className={styles.eyebrow}>원고 작성</p>
          <h2>{template.name}에 담을 내용을 적으세요</h2>
        </div>
        <p id={descriptionId}>
          사실과 맥락을 자연스럽게 적어 주세요. 최소 {view.minLength.toLocaleString()}자입니다.
        </p>
      </div>

      <div className={styles.seedArea}>
        <p>원고 시작 예시</p>
        <div className={styles.seedButtons}>
          {view.seeds.map((seed, index) => (
            <button
              key={seed}
              type="button"
              className={styles.seedButton}
              disabled={generating}
              onClick={() => onSeedSelect(seed)}
            >
              예시 {index + 1} 넣기
            </button>
          ))}
        </div>
      </div>

      <label className={styles.promptField} htmlFor={promptId}>
        <span>문서 원고</span>
        <textarea
          id={promptId}
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          minLength={view.minLength}
          maxLength={view.maxLength}
          rows={11}
          disabled={generating}
          aria-describedby={`${descriptionId} ${countId}`}
          aria-invalid={error ? true : undefined}
          placeholder={`${template.name}에 담을 인물, 시기, 기관, 수치와 맥락을 적어 주세요.`}
        />
      </label>

      <div className={styles.composerFooter}>
        <p
          id={countId}
          className={`${styles.promptCount} ${view.ready ? styles.promptReady : ""}`}
          aria-live="polite"
        >
          {view.ready ? "생성 가능" : `${view.remaining.toLocaleString()}자 더 필요`} · {prompt.length.toLocaleString()} / {view.maxLength.toLocaleString()}자
        </p>
        <button
          type="submit"
          className={`${styles.generateButton} ${generating ? styles.loading : ""}`}
          disabled={generating || !view.ready || !requestValid}
          aria-busy={generating}
        >
          {generating ? "문서를 만드는 중…" : "문서 만들기"}
        </button>
      </div>

      {error ? (
        <div className={styles.errorBanner} role="alert" tabIndex={-1} ref={errorRef}>
          {error}
        </div>
      ) : null}
    </form>
  );
}
