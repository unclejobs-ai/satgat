import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import LandingPage from "./LandingPage";
import { expect, test } from "bun:test";
import { listTemplates } from "@/lib/templates/registry";
import {
  buildLandingTemplateGroups,
  buildRepresentativeResults,
  getLandingCtas,
  getLandingTemplateHref,
} from "./landing-model";

function renderLanding(): string {
  return renderToStaticMarkup(createElement(LandingPage, { lang: "ko" }));
}

function matches(markup: string, pattern: RegExp): RegExpMatchArray[] {
  return [...markup.matchAll(pattern)];
}

test("landing renders its complete accessible document contract", () => {
  const markup = renderLanding();
  const main = matches(markup, /<main\b[^>]*>/g);
  const mainContent = markup.match(/<main\b[^>]*>([\s\S]*)<\/main>/)?.[1] ?? "";
  const directSections = matches(mainContent, /(?:^|<\/section>)<section\b/g);
  const catalogLinks = matches(markup, /<a\b[^>]*href="\/ko\/new\?template=[^"]+"/g);
  const groups = matches(markup, /<div\b[^>]*aria-labelledby="catalog-group-[^"]+"/g);
  const resultLinks = matches(markup, /<a\b[^>]*href="\/ko\/examples#[^"]+"/g);

  expect(main).toHaveLength(1);
  expect(main[0]?.[0]).toContain('id="main-content"');
  expect(main[0]?.[0]).toContain('tabindex="-1"');
  expect(directSections).toHaveLength(6);
  expect(groups).toHaveLength(3);
  expect(catalogLinks).toHaveLength(14);
  expect(resultLinks).toHaveLength(3);
  expect(markup).toContain(">14가지 문서 보기</a>");
});

test("landing renders specimen loading and catalog-owned alternative text", () => {
  const markup = renderLanding();
  const images = matches(markup, /<img\b[^>]*>/g).map(([image]) => image);
  const imagePreloads = matches(markup, /<link\b[^>]*>/g)
    .map(([link]) => link)
    .filter((link) => link.includes('rel="preload"') && link.includes('as="image"'));

  expect(images).toHaveLength(4);
  expect(imagePreloads).toHaveLength(1);
  expect(images.filter((image) => image.includes('loading="lazy"'))).toHaveLength(3);
  expect(images.every((image) => image.includes('data-page-spec="'))).toBe(true);
  expect(images.every((image) => /\bwidth="\d+"/.test(image))).toBe(true);
  expect(images.every((image) => /\bheight="\d+"/.test(image))).toBe(true);

  const representatives = buildRepresentativeResults(
    buildLandingTemplateGroups(listTemplates()),
    "ko",
  );
  const representativeAlts = representatives.map((result) => result.template.specimen.alt);
  const renderedAlts = images.map((image) => image.match(/\balt="([^"]*)"/)?.[1]);
  expect(renderedAlts).toEqual([
    representativeAlts[0],
    ...representativeAlts,
  ]);
});

test("landing renders only navigable localized hrefs", () => {
  const markup = renderLanding();
  const hrefs = matches(markup, /<a\b[^>]*href="([^"]+)"/g).map((match) => match[1]);

  expect(hrefs).toHaveLength(19);
  expect(hrefs.every((href) => href?.startsWith("/ko/"))).toBe(true);
});

test("landing exposes every catalog template once in ordered product groups", () => {
  const groups = buildLandingTemplateGroups(listTemplates());
  const ids = groups.flatMap((group) => group.templates.map((template) => template.id));

  expect(groups.map((group) => group.id)).toEqual(["personal", "business", "occasion"]);
  expect(ids).toHaveLength(14);
  expect(new Set(ids).size).toBe(14);
  expect(groups.map((group) => group.templates.length)).toEqual([4, 8, 2]);
});

test("landing derives format labels from page specs", () => {
  const groups = buildLandingTemplateGroups(listTemplates());

  for (const template of groups.flatMap((group) => group.templates)) {
    expect(template.format).toBeTruthy();
  }
});

test("landing CTAs preserve locale and point to application routes", () => {
  expect(getLandingCtas("ko")).toEqual({
    primary: "/ko/new",
    secondary: "/ko/examples",
  });
});

test("every catalog card links to its localized create route", () => {
  const hrefs = listTemplates().map((template) =>
    getLandingTemplateHref("ko", template.id),
  );

  expect(hrefs).toEqual(
    listTemplates().map((template) => `/ko/new?template=${template.id}`),
  );
});

test("landing chooses exactly one representative from each ordered group", () => {
  const representatives = buildRepresentativeResults(
    buildLandingTemplateGroups(listTemplates()),
    "ko",
  );

  expect(representatives).toHaveLength(3);
  expect(representatives.map((result) => result.category)).toEqual([
    "personal",
    "business",
    "occasion",
  ]);
  expect(representatives.every((result) => result.href.startsWith("/ko/examples#"))).toBe(true);
});
