import { expect, mock, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GENERATE_REQUEST_LIMITS } from "@/lib/generation/generate-request";
import { getPageSpec, listTemplates } from "@/lib/templates/registry";
import CreateResult, { buildPrivatePreviewHref } from "./CreateResult";
import PromptComposer, { getPromptComposerView } from "./PromptComposer";
import TemplatePicker, {
  TEMPLATE_GROUPS,
  groupTemplatesByCategory,
} from "./TemplatePicker";
import {
  templateCardLabel,
  templateCardMetadata,
} from "./TemplateCard";

const templates = listTemplates();

function countOccurrences(value: string, search: string): number {
  return value.split(search).length - 1;
}

test("groups all fourteen templates under exact ordered headings", () => {
  const groups = groupTemplatesByCategory(templates);

  expect(TEMPLATE_GROUPS.map((group) => group.heading)).toEqual([
    "개인 문서",
    "브랜드·업무",
    "초대·인사",
  ]);
  expect(TEMPLATE_GROUPS.flatMap((group) => groups[group.id])).toHaveLength(14);
  expect(groups.personal.map((template) => template.id)).toEqual([
    "resume",
    "self-intro",
    "business-card",
    "portfolio",
  ]);
  expect(groups.occasion.map((template) => template.id)).toEqual([
    "invitation",
    "new-year-card",
  ]);
  expect(groups.business.map((template) => template.id)).toEqual([
    "brand-onepager",
    "product-brochure",
    "company-profile",
    "investor-deck",
    "brand-storybook",
    "proposal",
    "newsletter",
    "report",
  ]);
});

test("derives concise action and page metadata from the catalog", () => {
  const resume = templates.find((template) => template.id === "resume");
  expect(resume).toBeDefined();

  expect(templateCardLabel(resume!)).toBe("이력서 템플릿 선택");
  expect(templateCardMetadata(resume!)).toEqual({
    category: "personal",
    pageSpecLabel: getPageSpec(resume!.pageSpec).label,
  });
});

test("uses two catalog seeds, the catalog checklist, and exact prompt limits", () => {
  const report = templates.find((template) => template.id === "report");
  expect(report).toBeDefined();

  const short = getPromptComposerView(report!, "아홉글자뿐");
  expect(short.seeds).toEqual(report!.promptSeeds.slice(0, 2));
  expect(short.facts).toEqual(report!.factChecklist);
  expect(short.minLength).toBe(10);
  expect(short.maxLength).toBe(8_000);
  expect(short.ready).toBe(false);

  const ready = getPromptComposerView(report!, "충분한 길이의 보고서 원고입니다.");
  expect(ready.ready).toBe(true);
  expect(ready.remaining).toBe(0);
  expect(GENERATE_REQUEST_LIMITS.promptMin).toBe(10);
  expect(GENERATE_REQUEST_LIMITS.promptMax).toBe(8_000);
});

test("renders all template choices with category and selection semantics", () => {
  const markup = renderToStaticMarkup(
    <TemplatePicker
      templates={templates}
      selectedId="resume"
      disabled={false}
      onSelect={() => {}}
    />,
  );

  expect(countOccurrences(markup, "<button")).toBe(14);
  expect(countOccurrences(markup, 'aria-label="')).toBe(14);
  expect(countOccurrences(markup, 'aria-pressed="true"')).toBe(1);
  expect(countOccurrences(markup, 'aria-pressed="false"')).toBe(13);
  expect(
    markup.match(/<button[^>]*>\s*<span aria-hidden="true">/g),
  ).toHaveLength(14);
  for (const group of TEMPLATE_GROUPS) {
    expect(markup).toContain(`>${group.heading}</h2>`);
  }
});

test("renders a category empty state instead of an empty button group", () => {
  const personalTemplates = templates.filter(
    (template) => template.category === "personal",
  );
  const markup = renderToStaticMarkup(
    <TemplatePicker
      templates={personalTemplates}
      selectedId={null}
      disabled={false}
      onSelect={() => {}}
    />,
  );

  expect(countOccurrences(markup, "<button")).toBe(4);
  expect(countOccurrences(markup, "표시할 템플릿이 없습니다.")).toBe(2);
});

test("renders prompt bounds, disabled and loading states", () => {
  const report = templates.find((template) => template.id === "report");
  expect(report).toBeDefined();
  const errorRef = React.createRef<HTMLDivElement>();
  const readyPrompt = "충분한 길이의 보고서 원고입니다.";

  const idleMarkup = renderToStaticMarkup(
    <PromptComposer
      template={report!}
      prompt={readyPrompt}
      onPromptChange={() => {}}
      onSeedSelect={() => {}}
      onGenerate={() => {}}
      generating={false}
      requestValid={true}
      error={null}
      errorRef={errorRef}
    />,
  );
  expect(idleMarkup).toContain('minLength="10"');
  expect(idleMarkup).toContain('maxLength="8000"');
  expect(idleMarkup).toContain(">생성 가능 · ");
  expect(idleMarkup).not.toContain("disabled");

  const loadingMarkup = renderToStaticMarkup(
    <PromptComposer
      template={report!}
      prompt={readyPrompt}
      onPromptChange={() => {}}
      onSeedSelect={() => {}}
      onGenerate={() => {}}
      generating={true}
      requestValid={true}
      error={null}
      errorRef={errorRef}
    />,
  );
  expect(loadingMarkup).toContain('aria-busy="true"');
  expect(loadingMarkup).toContain("문서를 만드는 중…");
  expect(countOccurrences(loadingMarkup, "disabled")).toBe(4);
});

test("announces the complete friendly generation error exactly once", () => {
  const report = templates.find((template) => template.id === "report");
  expect(report).toBeDefined();
  const friendlyError =
    "문서를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.";
  const markup = renderToStaticMarkup(
    <PromptComposer
      template={report!}
      prompt="충분한 길이의 보고서 원고입니다."
      onPromptChange={() => {}}
      onSeedSelect={() => {}}
      onGenerate={() => {}}
      generating={false}
      requestValid={true}
      error={friendlyError}
      errorRef={React.createRef<HTMLDivElement>()}
    />,
  );

  expect(countOccurrences(markup, 'role="alert"')).toBe(1);
  expect(countOccurrences(markup, friendlyError)).toBe(1);
  expect(countOccurrences(markup, "문서를 만들지 못했습니다.")).toBe(1);
  expect(markup).toContain('tabindex="-1"');
});

test("renders a private result as a polite status with an opaque draft URL", () => {
  const href = buildPrivatePreviewHref("ko", "draft/id?unsafe");
  const markup = renderToStaticMarkup(
    <CreateResult
      href={href}
      linkRef={React.createRef<HTMLAnchorElement>()}
    />,
  );

  expect(markup).toContain('aria-live="polite"');
  expect(markup).toContain(
    'href="/ko/preview?draft=draft%2Fid%3Funsafe"',
  );
  expect(markup).toContain(">비공개 초안 미리보기</a>");
  expect(markup).not.toContain("draft/id?unsafe");
});

test("keeps the create flow root neutral inside the language main landmark", async () => {
  mock.module("next/navigation", () => ({
    usePathname: () => "/ko/new",
  }));
  const { default: NewDocumentClient } = await import("./NewDocumentClient");
  const markup = renderToStaticMarkup(
    <NewDocumentClient lang="ko" preselectedTemplate={null} />,
  );

  expect(markup).not.toContain("<main");
  expect(markup).toContain("<div");
});

test("builds a private draft-only preview URL", () => {
  expect(buildPrivatePreviewHref("ko", "draft-id-123")).toBe(
    "/ko/preview?draft=draft-id-123",
  );
  expect(buildPrivatePreviewHref("ko-KR", "draft/id?unsafe")).toBe(
    "/ko-KR/preview?draft=draft%2Fid%3Funsafe",
  );
});
