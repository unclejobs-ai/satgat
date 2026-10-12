# Satgat Web Product Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the web app the truthful, accessible, privacy-safe source for creating and exporting all 14 Korean document templates, then align the design system, specimens, README, and CI around that runtime.

**Architecture:** Keep document genre composition in the existing React renderers. Move document metadata into a domain-only catalog, retain an exhaustive UI-only renderer adapter, and make runtime fixtures drive all specimens. Replace the static `/ko` rewrite with an App Router landing, replace content-bearing normal preview URLs with browser-local drafts, and enforce the product contract through catalog, browser, PDF, and CI checks.

**Tech Stack:** Next.js 16.2.6 App Router, React 19.2.4, TypeScript 5, Tailwind CSS 4 entrypoint, Zod 4, AI SDK Google, Bun test runner, Puppeteer Core + `@sparticuz/chromium`, self-hosted OFL WOFF2 fonts.

## Global Constraints

- Canvas is `#F7F7F2`; pure white is forbidden.
- The only default chromatic accent is Dancheong `#9B1B1B`, kept at or below 5% of a page. A template may select Jade or Gold instead, but never combines it with Dancheong on one page.
- Display uses a real Nanum Myeongjo 700/800 face; body uses Gowun Batang 400; labels use Gowun Dodum 400. Never synthesize 600 weight.
- Decorative Hanja, seal glyphs, Hanja-only template fields, and hard-coded fictive Hanja sample content are forbidden. A user-provided legal Hanja name may appear only adjacent to the Hangul name in parentheses.
- Domain modules under `src/lib/templates/` must not import React, browser APIs, filesystem APIs, or network APIs. React lazy renderer mapping belongs in `src/components/templates/`.
- Retain genre-specific React renderers; do not introduce a generic section-composition renderer.
- Normal preview URLs contain no user document body, email, phone, or encoded slots. Sharing is explicit and warns that the shared link contains document content.
- Do not add UI or test libraries. Use existing Bun, Zod, Puppeteer Core, and `@sparticuz/chromium` dependencies.
- No `as any`, `@ts-ignore`, broad eslint disables, placeholder implementation, or technical error details in user-facing responses.
- Print CSS remains single-owned by `SatgatPrintStyles`; PDF retains `printBackground: true` and `preferCSSPageSize: true`.
- Before editing Next code, install dependencies and read the relevant current App Router and Route Handler guides under `node_modules/next/dist/docs/`, as required by `AGENTS.md`.

---

## Phase 0: Documentation Discovery and Baseline

Run this phase before changing source. It is an execution prerequisite, not a substitute for the tests in later tasks.

| Source | Established API/constraint to preserve |
|---|---|
| `src/lib/templates/types.ts:8-60` | `TemplateSlot`, `SectionDef`, `SatgatDocumentData`; evolve without React in domain. |
| `src/lib/templates/registry.ts:17-93` | `getTemplate`, `listTemplates`, `getTemplateIds`; migrate all callers together. |
| `src/lib/engine/renderer.tsx:7-70` | Lazy renderer loading and `SatgatTemplateRenderer` Suspense boundary. |
| `src/components/document/SatgatDocument.tsx:12-177` | Page canvas and screen behavior. |
| `src/components/document/SatgatPrintStyles.tsx:24-111` | Sole print-rule owner. |
| `app/[lang]/preview/page.tsx:16-42` | Validate payload before rendering; replace query decoder, not validation. |
| `app/api/export/route.ts:67-109` and `src/lib/export/render-pdf.ts:50-91` | Preserve validated export, self-hosted fonts, Chromium wait, and PDF options. |
| `next.config.ts:16-21` | Remove only the `/ko` static rewrite after the React landing exists. |
| `scripts/verify-template-catalog.mjs:417-494` | Preserve blocking catalog failure semantics. |
| `scripts/design-guard.mjs:586-608,994-1060` | Replace narrow warning-only coverage with stated blocking/advisory tiers. |

- [ ] **Step 1: Install the repository’s declared dependencies**

Run:

```bash
npm ci
```

Expected: `node_modules/typescript`, Bun-compatible test source dependencies, Puppeteer Core, and `@sparticuz/chromium` resolve locally.

- [ ] **Step 2: Read current local Next App Router documentation before code changes**

Run:

```bash
read node_modules/next/dist/docs/
```

Then read the App Router page-routing, route-handler, metadata, and client-component/session browser API guidance that exists in that installed tree. Apply the documented `page.tsx` and `POST` handler conventions; do not reintroduce Pages Router APIs.

- [ ] **Step 3: Capture baseline evidence without changing code**

Run:

```bash
npm run verify:templates
node scripts/design-guard.mjs --check
node scripts/design-guard.mjs --check-density
bun test
```

Expected: record exact pass/fail output before changing source. If a command fails, diagnose its root cause before editing related code.

- [ ] **Step 4: Capture baseline product screenshots**

Use the repository’s existing browser/Puppeteer capability to capture `/ko`, `/ko/new?template=resume`, and a valid fixture preview at 1440px and 390px. Preserve the current defects as named baseline files outside tracked production assets.

Expected: evidence includes literal `\\uXXXX` landing text, the 390px grid width, current page height, and the pre-cutover preview URL containing `data=`.

---

### Task 1: Define physical PageSpec primitives without breaking the legacy catalog

**Files:**
- Modify: `src/lib/templates/types.ts:8-60`
- Modify: `src/lib/templates/registry.ts:1-93`
- Create: `src/lib/templates/page-spec.test.ts`

**Interfaces:**
- Consumes: current `DocumentFormat`, `SatgatTemplate`, `getTemplate`, `listTemplates`, and `getTemplateIds`.
- Produces: `PageSpecId`, `PageSpec`, `PAGE_SPEC_IDS`, `PAGE_SPECS`, and `getPageSpec`. This task deliberately leaves current `SatgatTemplate` definitions unchanged; Task 2 performs the one-shot catalog type migration.

- [ ] **Step 1: Write failing PageSpec tests**

Create `src/lib/templates/page-spec.test.ts`:

```ts
import { expect, test } from 'bun:test';
import { getPageSpec, PAGE_SPECS } from './registry';

test('defines all five physical page contracts', () => {
  expect(getPageSpec('a4Portrait').cssSize).toBe('210mm 297mm');
  expect(getPageSpec('a4Landscape').cssSize).toBe('297mm 210mm');
  expect(getPageSpec('slide16x9').cssSize).toBe('297mm 167mm');
  expect(getPageSpec('businessCard8Up').imposition).toEqual({
    columns: 2,
    rows: 4,
    cardWidthMm: 90,
    cardHeightMm: 55,
  });
  expect(PAGE_SPECS.postcardPortrait.canvas).toEqual({ widthMm: 105, heightMm: 148 });
});
```

- [ ] **Step 2: Run the test and confirm the physical contract is absent**

Run:

```bash
bun test src/lib/templates/page-spec.test.ts
```

Expected: FAIL because `getPageSpec` and `PAGE_SPECS` do not exist.

- [ ] **Step 3: Add PageSpec types alongside the old format type**

In `src/lib/templates/types.ts`, add this domain-only vocabulary above the existing `DocumentFormat`. Do not import React and do not remove the old `DocumentFormat` in this task:

```ts
export const PAGE_SPEC_IDS = [
  'a4Portrait',
  'a4Landscape',
  'slide16x9',
  'businessCard8Up',
  'postcardPortrait',
] as const;

export type PageSpecId = (typeof PAGE_SPEC_IDS)[number];

export interface PageCanvas {
  widthMm: number;
  heightMm: number;
}

export interface PageSpec {
  id: PageSpecId;
  label: string;
  canvas: PageCanvas;
  cssSize: `${number}mm ${number}mm`;
  imposition?: {
    columns: number;
    rows: number;
    cardWidthMm: number;
    cardHeightMm: number;
  };
}
```

- [ ] **Step 4: Implement the immutable registry of physical page contracts**

In `src/lib/templates/registry.ts`, add:

```ts
export const PAGE_SPECS: Record<PageSpecId, PageSpec> = {
  a4Portrait: {
    id: 'a4Portrait',
    label: 'A4 세로',
    canvas: { widthMm: 210, heightMm: 297 },
    cssSize: '210mm 297mm',
  },
  a4Landscape: {
    id: 'a4Landscape',
    label: 'A4 가로',
    canvas: { widthMm: 297, heightMm: 210 },
    cssSize: '297mm 210mm',
  },
  slide16x9: {
    id: 'slide16x9',
    label: '16:9 슬라이드',
    canvas: { widthMm: 297, heightMm: 167 },
    cssSize: '297mm 167mm',
  },
  businessCard8Up: {
    id: 'businessCard8Up',
    label: '명함 8-up',
    canvas: { widthMm: 210, heightMm: 297 },
    cssSize: '210mm 297mm',
    imposition: { columns: 2, rows: 4, cardWidthMm: 90, cardHeightMm: 55 },
  },
  postcardPortrait: {
    id: 'postcardPortrait',
    label: '엽서 세로',
    canvas: { widthMm: 105, heightMm: 148 },
    cssSize: '105mm 148mm',
  },
};

export function getPageSpec(id: PageSpecId): PageSpec {
  return PAGE_SPECS[id];
}
```

Import `PageSpec` and `PageSpecId` from `types.ts`. Leave `templates`, `getTemplate`, `listTemplates`, `getTemplateIds`, `TEMPLATE_SEAL`, and `TEMPLATE_VOICE` untouched until Task 2, so the repository remains type-correct at this review gate.

- [ ] **Step 5: Run focused tests**

Run:

```bash
bun test src/lib/templates/page-spec.test.ts
```

Expected: PASS. Existing `npm run verify:templates` must also remain green because no legacy definition shape changed.

- [ ] **Step 6: Commit the standalone PageSpec foundation**

```bash
git add src/lib/templates/types.ts src/lib/templates/registry.ts src/lib/templates/page-spec.test.ts
git commit -m "feat: define satgat physical page specs"
```

---

### Task 2: Atomically migrate all fourteen definitions, guidance, and fixtures into the domain catalog

**Files:**
- Modify: `src/lib/templates/types.ts:8-60`
- Modify: `src/lib/templates/registry.ts:1-93`
- Modify: all `src/lib/templates/definitions/*.ts`
- Modify: every `SatgatTemplate`/`DocumentFormat` callsite returned by LSP references
- Modify: `scripts/template-preview-fixtures.mjs:1-300`
- Modify: `app/[lang]/new/NewDocumentClient.tsx:8-499`
- Modify: `src/components/templates/BusinessCard.tsx` and `src/components/templates/Invitation.tsx`
- Modify: `scripts/verify-template-catalog.mjs:205-425`
- Create: `src/lib/templates/catalog.test.ts`

**Interfaces:**
- Consumes: Task 1 `PageSpecId`, existing slot IDs, `previewFixtures`, current prompt/checklist maps.
- Produces: `TemplateId`, `TemplateCategory`, `SpecimenMetadata`, `TemplateCatalogEntry`, one registry record, and fourteen definitions each carrying category, physical spec, content outline, prompt seeds, fact checklist, and specimen metadata.

- [ ] **Step 1: Write the failing catalog-completeness test**

Create `src/lib/templates/catalog.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { previewFixtures } from '../../../scripts/template-preview-fixtures.mjs';
import { getPageSpec, getTemplate, getTemplateIds, listTemplates } from './registry';

describe('template catalog', () => {
  test('has fourteen unique IDs distributed across every product category', () => {
    const templates = listTemplates();
    expect(templates).toHaveLength(14);
    expect(new Set(getTemplateIds()).size).toBe(14);
    expect(new Set(templates.map((template) => template.category))).toEqual(
      new Set(['personal', 'business', 'occasion']),
    );
  });

  test('assigns a physical page spec to every template', () => {
    for (const template of listTemplates()) {
      expect(getPageSpec(template.pageSpec)).toBeDefined();
    }
    expect(getTemplate('resume')?.name).toBe('이력서');
    expect(getTemplate('not-a-template')).toBeUndefined();
  });

  test('keeps guidance and canonical fixtures complete for every declared slot', () => {
    for (const template of listTemplates()) {
      expect(template.promptSeeds.length).toBeGreaterThan(0);
      expect(template.factChecklist.length).toBeGreaterThan(0);
      expect(template.specimen.alt).toContain(template.name);
      expect(Object.keys(previewFixtures[template.id])).toEqual(
        template.slots.map((slot) => slot.id),
      );
    }
  });
});
```

- [ ] **Step 2: Run the test and confirm metadata is still split across UI and static data**

Run:

```bash
bun test src/lib/templates/catalog.test.ts
```

Expected: FAIL because the current definition and registry types do not expose category, page spec, seeds, checklists, or specimen metadata.

- [ ] **Step 3: Replace the legacy catalog type in one source-compatible migration**

Before editing exported types, use LSP references for `SatgatTemplate`, `DocumentFormat`, `SectionDef`, `TEMPLATE_SEAL`, and `TEMPLATE_VOICE`. Update every reported import and property access in the same commit; do not add a compatibility type alias.

In `src/lib/templates/types.ts`, delete `DocumentFormat` and `SatgatTemplate`, add the following names after the Task 1 PageSpec types, and retain `TemplateSlot`, `SectionDef`, and `SatgatDocumentData`:

```ts
export const TEMPLATE_IDS = [
  'resume',
  'self-intro',
  'business-card',
  'brand-onepager',
  'product-brochure',
  'company-profile',
  'investor-deck',
  'brand-storybook',
  'invitation',
  'new-year-card',
  'proposal',
  'newsletter',
  'portfolio',
  'report',
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];
export type TemplateCategory = 'personal' | 'business' | 'occasion';

export interface SpecimenMetadata {
  title: string;
  alt: string;
  prompt: string;
}

export interface TemplateCatalogEntry {
  id: TemplateId;
  name: string;
  description: string;
  category: TemplateCategory;
  pageSpec: PageSpecId;
  slots: TemplateSlot[];
  contentOutline: SectionDef[];
  promptSeeds: readonly string[];
  factChecklist: readonly string[];
  specimen: SpecimenMetadata;
}
```

Convert `registry.ts` to `Record<TemplateId, TemplateCatalogEntry>`. Keep `getTemplate(id: string)`, `listTemplates()`, and `getTemplateIds()` public names, but return the new catalog type. Add `isTemplateId(id: string): id is TemplateId` for safe record indexing. Delete `TEMPLATE_SEAL` and `TEMPLATE_VOICE` only after every LSP-discovered consumer reads catalog metadata instead.

- [ ] **Step 4: Migrate all fourteen definitions with the exact category/PageSpec mapping**

For every definition, change `SatgatTemplate` to `TemplateCatalogEntry`, rename `sections` to `contentOutline`, and add the metadata from this table:

| Definition file | Category | PageSpec |
|---|---|---|
| `resume.ts` | `personal` | `a4Portrait` |
| `self-intro.ts` | `personal` | `a4Portrait` |
| `business-card.ts` | `personal` | `businessCard8Up` |
| `portfolio.ts` | `personal` | `a4Landscape` |
| `brand-onepager.ts` | `business` | `a4Landscape` |
| `product-brochure.ts` | `business` | `a4Portrait` |
| `company-profile.ts` | `business` | `a4Portrait` |
| `proposal.ts` | `business` | `a4Portrait` |
| `investor-deck.ts` | `business` | `slide16x9` |
| `brand-storybook.ts` | `business` | `a4Portrait` |
| `newsletter.ts` | `business` | `a4Portrait` |
| `report.ts` | `business` | `a4Portrait` |
| `invitation.ts` | `occasion` | `postcardPortrait` |
| `new-year-card.ts` | `occasion` | `postcardPortrait` |

Copy each template’s existing `TEMPLATE_PROMPTS` and `TEMPLATE_CHECKLIST` values from `NewDocumentClient.tsx:355-429` into that definition’s `promptSeeds` and `factChecklist`; do not invent alternate product copy. Copy each current static example’s title/prompt into that definition’s `specimen`, rewriting only its Hanja decoration to plain Hangul. Report receives a real `specimen.title`, `specimen.alt`, and `specimen.prompt`, not a missing/empty object.

- [ ] **Step 5: Remove decorative Hanja schema data at the source**

Delete `hanja_name` from `business-card.ts`; delete `groom_hanja`, `bride_hanja`, and `date_hanja` from `invitation.ts`; delete corresponding fixture properties and renderer reads. Rewrite any hard-coded Hanja example name/date in those fixture values and specimen prompts in Hangul. Do not retain removed slot aliases. Existing validation must use only the declared slots and must not gain a second compatibility parser.

- [ ] **Step 6: Keep canonical fixture data test-only and complete**

Retain `scripts/template-preview-fixtures.mjs` as the canonical fixture module. Its exported `previewFixtures` object must have this exact own-key set:

```js
[
  'resume', 'self-intro', 'business-card', 'brand-onepager',
  'product-brochure', 'company-profile', 'investor-deck', 'brand-storybook',
  'invitation', 'new-year-card', 'proposal', 'newsletter', 'portfolio', 'report',
]
```

Each existing fixture remains an explicit object literal keyed by that template ID. Do not import this module into client components. Update `verify-template-catalog.mjs` to compare catalog IDs, fixture IDs, and each fixture’s slot IDs directly.

- [ ] **Step 7: Delete duplicated client maps and read catalog metadata instead**

Delete `TEMPLATE_PROMPTS`, `TEMPLATE_CHECKLIST`, `TEMPLATE_SEAL`, and `TEMPLATE_VOICE`. In `NewDocumentClient`, derive the active data with:

```ts
const suggestions = selected?.promptSeeds ?? [];
const checklist = selected?.factChecklist ?? [];
const pageSpecLabel = selected ? getPageSpec(selected.pageSpec).label : null;
```

Replace seal/voice UI with the selected template name, category, and `pageSpecLabel`. Do not add a replacement badge or mark.

- [ ] **Step 8: Extend the catalog verifier and run the migration checks**

Replace the legacy valid-format set in `scripts/verify-template-catalog.mjs` with `PAGE_SPEC_IDS`. Require non-empty category, page spec, prompt seeds, fact checklist, and specimen title/alt/prompt for every entry. Retain current required-slot, renderer-read, and `process.exit(1)` behavior.

Run:

```bash
bun test src/lib/templates/page-spec.test.ts src/lib/templates/catalog.test.ts
npm run verify:templates
```

Expected: PASS with fourteen definitions and fixtures, no legacy prompt/checklist/seal/voice maps, and no Hanja-only slots.

- [ ] **Step 9: Commit the atomic catalog migration**

```bash
git add src/lib/templates src/lib/engine src/lib/generation src/lib/bridge src/components/templates/BusinessCard.tsx src/components/templates/Invitation.tsx scripts/template-preview-fixtures.mjs app/[lang]/new/NewDocumentClient.tsx scripts/verify-template-catalog.mjs
git commit -m "refactor: consolidate template catalog metadata"
```

---

### Task 3: Keep renderer dispatch in the UI layer and make PageSpec drive canvases

**Files:**

- Create: `src/components/templates/runtime-catalog.tsx`
- Create: `src/components/templates/SatgatTemplateRenderer.tsx`
- Modify: every `SatgatTemplateRenderer` import returned by LSP references
- Delete after caller migration: `src/lib/engine/renderer.tsx`
- Modify: `src/components/document/SatgatDocument.tsx:13-175`
- Modify: `src/components/document/SatgatPrintStyles.tsx:24-111`
- Modify: all `src/components/templates/*.tsx`
- Create: `src/components/document/page-spec.test.ts`

**Interfaces:**
- Consumes: `TemplateId`, `PageSpecId`, `getPageSpec`, `SatgatDocumentData`, existing genre renderer components.
- Produces: `getRuntimeRenderer(id)`, `SatgatDocument({ pageSpec, ... })`, exact canvas geometry for all five PageSpecs, and one exhaustive UI renderer map.

- [ ] **Step 1: Write failing page-spec and renderer-adapter tests**

Create `src/components/document/page-spec.test.ts`:

```ts
import { expect, test } from 'bun:test';
import { getPageSpec, getTemplateIds } from '@/lib/templates/registry';
import { getRuntimeRenderer, runtimeRendererIds } from '@/components/templates/runtime-catalog';

test('UI renderer adapter is exhaustive for the domain catalog', () => {
  expect([...runtimeRendererIds].sort()).toEqual(getTemplateIds().sort());
  for (const id of getTemplateIds()) expect(getRuntimeRenderer(id)).toBeDefined();
});

test('physical page specs retain their intended geometry', () => {
  expect(getPageSpec('a4Portrait').cssSize).toBe('210mm 297mm');
  expect(getPageSpec('a4Landscape').cssSize).toBe('297mm 210mm');
  expect(getPageSpec('slide16x9').cssSize).toBe('297mm 167mm');
  expect(getPageSpec('postcardPortrait').cssSize).toBe('105mm 148mm');
});
```

- [ ] **Step 2: Run the test and confirm UI/domain adapter is absent**

Run:

```bash
bun test src/components/document/page-spec.test.ts
```

Expected: FAIL because `runtime-catalog.tsx`, `getRuntimeRenderer`, and `pageSpec` geometry are absent.

- [ ] **Step 3: Create the exhaustive UI-only lazy adapter**

Create `src/components/templates/runtime-catalog.tsx`:

```tsx
'use client';

import React from 'react';
import { TEMPLATE_IDS, type SatgatDocumentData, type TemplateId } from '@/lib/templates/types';
import { isTemplateId } from '@/lib/templates/registry';

export type RuntimeRenderer = React.LazyExoticComponent<
  React.ComponentType<{ data: SatgatDocumentData }>
>;

const RENDERERS = {
  resume: React.lazy(() => import('./Resume')),
  'self-intro': React.lazy(() => import('./SelfIntro')),
  'business-card': React.lazy(() => import('./BusinessCard')),
  'brand-onepager': React.lazy(() => import('./BrandOnepager')),
  'product-brochure': React.lazy(() => import('./ProductBrochure')),
  'company-profile': React.lazy(() => import('./CompanyProfile')),
  'investor-deck': React.lazy(() => import('./InvestorDeck')),
  'brand-storybook': React.lazy(() => import('./BrandStorybook')),
  invitation: React.lazy(() => import('./Invitation')),
  'new-year-card': React.lazy(() => import('./NewYearCard')),
  proposal: React.lazy(() => import('./Proposal')),
  newsletter: React.lazy(() => import('./Newsletter')),
  portfolio: React.lazy(() => import('./Portfolio')),
  report: React.lazy(() => import('./Report')),
} satisfies Record<TemplateId, RuntimeRenderer>;

export const runtimeRendererIds = TEMPLATE_IDS;

export function getRuntimeRenderer(id: string): RuntimeRenderer | undefined {
  return isTemplateId(id) ? RENDERERS[id] : undefined;
}
```

Create `src/components/templates/SatgatTemplateRenderer.tsx` beside the adapter. It imports React, `TemplateCatalogEntry`, `SatgatDocumentData`, and `getRuntimeRenderer`; it preserves the existing Suspense fallback and friendly missing-renderer state. Use LSP references for `SatgatTemplateRenderer`, update every consumer to import it from `@/components/templates/SatgatTemplateRenderer`, then delete `src/lib/engine/renderer.tsx`. This moves every React renderer concern out of `src/lib/engine/`; do not move the map into `src/lib/templates/`.

- [ ] **Step 4: Make `SatgatDocument` consume PageSpec**

Replace the local `formatMap` with `getPageSpec(pageSpec)`. Its public prop becomes:

```ts
interface SatgatDocumentProps {
  children: React.ReactNode;
  pageSpec: PageSpecId;
  className?: string;
  showBaseline?: boolean;
}
```

Set `const spec = getPageSpec(pageSpec)`, then derive the document `width` and `minHeight` style values from `spec.canvas.widthMm` and `spec.canvas.heightMm` in millimetres. Keep `data-page-spec={pageSpec}`, background, density behavior, and existing screen-only spacing. Do not introduce a second `@media print` block.

- [ ] **Step 5: Migrate every renderer to its catalog PageSpec**

At every `<SatgatDocument>` call site, replace its `format` property with the catalog-assigned `pageSpec` property. Specific non-A4 work is required:

- `BusinessCard.tsx`: preserve its 8-up grid but read `businessCard8Up` dimensions and imposition values from `getPageSpec` instead of hard-coded sheet/card dimensions.
- `Invitation.tsx` and `NewYearCard.tsx`: remove the A4 stage wrapper and render one `postcardPortrait` canvas directly. Delete A4-centering comments and all decorative Hanja display branches.
- `BrandOnepager.tsx` and `Portfolio.tsx`: use `a4Landscape`.
- `InvestorDeck.tsx`: use `slide16x9`.

- [ ] **Step 6: Preserve single print ownership and assert page markers**

Keep all `@media print` rules in `SatgatPrintStyles`. Update selectors from legacy `data-format` only if required by real callers; remove obsolete names rather than maintaining aliases. Add a test-visible `data-page-spec` attribute to every page root.

- [ ] **Step 7: Run focused checks**

Run:

```bash
bun test src/components/document/page-spec.test.ts
npm run verify:templates
```

Expected: PASS. Inspect the browser at 1440px and 390px for BusinessCard, Invitation, NewYearCard, BrandOnepager, Portfolio, and InvestorDeck before continuing.

- [ ] **Step 8: Commit renderer and physical-format cutover**

```bash
git add -u
git add app src/components src/lib/templates
git commit -m "refactor: drive document canvases from page specs"
```

---

### Task 4: Replace normal preview query payloads with private drafts and explicit shares

**Files:**
- Create: `src/lib/preview/draft-storage.ts`
- Create: `src/lib/preview/share-payload.ts`
- Create: `src/lib/preview/draft-storage.test.ts`
- Modify: `app/[lang]/new/NewDocumentClient.tsx:452-556`
- Modify: `app/[lang]/preview/page.tsx:1-51`
- Modify: `app/[lang]/preview/PreviewClient.tsx:1-199`
- Modify: `app/api/export/route.ts:18-98`
- Modify: `src/lib/export/render-pdf.ts:37-91`

**Interfaces:**
- Consumes: `SatgatDocumentData`, `validateDocumentData`, existing PDF POST body contract.
- Produces: `createDraft(data)`, `readDraft(id)`, `removeDraft(id)`, `encodeSharePayload(data)`, `decodeSharePayload(value)`, `PreviewClient({ lang, draftId })`, and a PDF renderer that injects a private draft into the headless browser origin.

- [ ] **Step 1: Write failing pure-helper tests**

Create `src/lib/preview/draft-storage.test.ts`:

```ts
import { expect, test } from 'bun:test';
import type { SatgatDocumentData } from '@/lib/templates/types';
import { decodeSharePayload, encodeSharePayload } from './share-payload';
import { draftStorageKey, isDraftId } from './draft-storage';

const data: SatgatDocumentData = {
  templateId: 'resume',
  slots: { name: '김수민', title: '프론트엔드 엔지니어', experiences: [{ title: '경력', description: '성과' }] },
};

test('share payload round-trips as URL-fragment-safe text', () => {
  const encoded = encodeSharePayload(data);
  expect(encoded).not.toContain('+');
  expect(encoded).not.toContain('/');
  expect(decodeSharePayload(encoded)).toEqual(data);
});

test('draft IDs use opaque UUID values and stable session keys', () => {
  const id = '8dc1d22e-95cb-4f36-83a8-0112d0f28647';
  expect(isDraftId(id)).toBe(true);
  expect(draftStorageKey(id)).toBe('satgat:draft:8dc1d22e-95cb-4f36-83a8-0112d0f28647');
  expect(isDraftId('eyJ0ZW1wbGF0ZUlkIjoicmVzdW1lIn0')).toBe(false);
});
```

- [ ] **Step 2: Run tests and confirm the private-preview helpers are absent**

Run:

```bash
bun test src/lib/preview/draft-storage.test.ts
```

Expected: FAIL because the preview helper modules do not exist.

- [ ] **Step 3: Implement browser draft storage without server or query content**

Create `src/lib/preview/draft-storage.ts`:

```ts
import type { SatgatDocumentData } from '@/lib/templates/types';

const PREFIX = 'satgat:draft:';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function draftStorageKey(id: string): string {
  return `${PREFIX}${id}`;
}

export function isDraftId(value: string | null | undefined): value is string {
  return typeof value === 'string' && UUID.test(value);
}

export function createDraft(data: SatgatDocumentData): string {
  const id = crypto.randomUUID();
  sessionStorage.setItem(draftStorageKey(id), JSON.stringify(data));
  return id;
}
export function readDraft(id: string): unknown | null {
  const raw = sessionStorage.getItem(draftStorageKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function isDocumentData(value: unknown): value is SatgatDocumentData {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && 'templateId' in value
    && typeof value.templateId === 'string'
    && 'slots' in value
    && typeof value.slots === 'object'
    && value.slots !== null
    && !Array.isArray(value.slots);
}

export function removeDraft(id: string): void {
  sessionStorage.removeItem(draftStorageKey(id));
}
```

Only call `createDraft`, `readDraft`, and `removeDraft` in client code or Puppeteer page evaluation. The module intentionally reads browser storage and must not be imported into server route logic.

- [ ] **Step 4: Implement explicit fragment sharing**

Create `src/lib/preview/share-payload.ts` with `TextEncoder`/`TextDecoder` and browser-safe base64url conversion. `encodeSharePayload` serializes `SatgatDocumentData`; `decodeSharePayload` returns `unknown | null` for malformed payloads. The preview client must pass its return through `isDocumentData` before it reads `templateId`. A shared URL is exactly:

```ts
`${window.location.origin}/${lang}/preview#share=${encodeSharePayload(data)}`
```

Do not add a `?data=` or `?share=` query parameter.

- [ ] **Step 5: Change generation success routing**

In `NewDocumentClient.handleGenerate`, replace `encodePreviewPayload(data)` with:

```ts
const draftId = createDraft(data);
const previewHref = `/${encodeURIComponent(lang)}/preview?draft=${encodeURIComponent(draftId)}`;
```

Delete `encodePreviewPayload`. Keep result focus and reduced-motion-aware scrolling. Do not use an effect for this event work.

- [ ] **Step 6: Make preview load browser-local drafts as external-system synchronization**

Change `app/[lang]/preview/page.tsx` to parse only `draft?: string` and pass a sanitized `draftId` to the client. The page no longer decodes document data on the server.

`PreviewClient` must begin in an explicit loading state, then use one `useEffect` solely to synchronize with `sessionStorage` and `window.location.hash`:

```tsx
React.useEffect(() => {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const shared = hash.get('share');
  const candidate = shared ? decodeSharePayload(shared) : draftId ? readDraft(draftId) : null;
  if (!isDocumentData(candidate)) {
    setPreview({ data: null, error: '문서를 찾을 수 없습니다. 새 문서를 만들거나 공유 링크를 확인해 주세요.' });
    return;
  }
  const template = getTemplate(candidate.templateId);
  const validation = template ? validateDocumentData(template, candidate) : { valid: false };
  setPreview(validation.valid ? { data: candidate, error: null } : { data: null, error: '문서 형식이 올바르지 않습니다.' });
}, [draftId]);
```

Keep the existing empty/error routes, but remove the infinite-looking `!data || !template` fallback once storage synchronization completes.

- [ ] **Step 7: Replace link-copy with explicit share confirmation**

Create a small `ShareDialog` within `PreviewClient` or a new local component. The first click opens text stating exactly: `이 링크에는 문서 내용이 포함됩니다. 개인정보가 있으면 공유하지 마세요.` The confirm action copies the fragment URL. The default toolbar action must not silently copy a document-bearing URL.

- [ ] **Step 8: Inject private draft data for headless PDF rendering**

Change `renderDocumentPdf` to receive `{ origin, lang, data, fontsCssUrl, overrideCss }`. It must:

1. Navigate to `${origin}/${lang}` to establish same-origin browser storage.
2. Generate a UUID draft ID inside Node.
3. Use `page.evaluate` to write `JSON.stringify(data)` to `sessionStorage` under `satgat:draft:<id>`.
4. Navigate to `${origin}/${lang}/preview?draft=${id}`.
5. Keep current response, real-document, font-ready, and `page.pdf` waits.

Update `/api/export` to pass request data directly; delete `encodePreviewPayload` and all construction of content-bearing preview URLs.

- [ ] **Step 9: Run focused tests and inspect URLs**

Run:

```bash
bun test src/lib/preview/draft-storage.test.ts
```

Then run the app and verify that a generated resume preview URL matches `?draft=<uuid>`, contains neither `김수민` nor `data=`, and the explicit share link uses `#share=` only after confirmation.

- [ ] **Step 10: Commit private preview and share behavior**

```bash
git add src/lib/preview app/[lang]/new/NewDocumentClient.tsx app/[lang]/preview app/api/export/route.ts src/lib/export/render-pdf.ts
git commit -m "feat: keep normal preview data out of URLs"
```

---

### Task 5: Connect optional brand profiles through a web-safe application boundary

**Files:**
- Modify: `src/lib/design-system/brand-resolver.ts:1-117`
- Create: `src/lib/generation/brand-profile.test.ts`
- Modify: `app/api/generate/route.ts:6-75`
- Create: `app/api/generate/route.test.ts`
- Modify: `src/lib/generation/document-generator.ts:193-256`
- Create: `app/[lang]/new/BrandProfilePanel.tsx`
- Modify: `app/[lang]/new/NewDocumentClient.tsx`

**Interfaces:**
- Consumes: existing `BrandProfile`, `buildGenerationPrompt(template, userPrompt, brandProfile?)`, `generateDocumentData` third argument.
- Produces: an explicitly applied browser-local `BrandProfile`, a validated optional API request field, and an end-to-end generation argument.

- [ ] **Step 1: Write the domain preservation test and failing API-boundary test**

Create `src/lib/generation/brand-profile.test.ts`:

```ts
import { expect, test } from 'bun:test';
import { generateDocumentData, type SlotGenerator } from './document-generator';
import { getTemplate } from '@/lib/templates/registry';

const resume = getTemplate('resume');
if (!resume) throw new Error('Resume template must exist for generation tests.');

test('passes an explicitly applied brand profile into the generation prompt', async () => {
  let receivedPrompt = '';
  const generator: SlotGenerator = async ({ prompt }) => {
    receivedPrompt = prompt;
    throw new Error('intentional generator stop');
  };

  await expect(
    generateDocumentData(
      resume,
      '이력서를 만들어 주세요.',
      { name: '결 스튜디오', tone: '단정하고 따뜻한 한국어' },
      { generateSlots: generator, maxRetries: 0 },
    ),
  ).rejects.toThrow('intentional generator stop');

  expect(receivedPrompt).toContain('결 스튜디오');
  expect(receivedPrompt).toContain('단정하고 따뜻한 한국어');
});
```

Create `app/api/generate/route.test.ts`:

```ts
import { expect, test } from 'bun:test';
import { GenerateRequestSchema } from './route';

test('accepts a bounded, explicit optional brand profile', () => {
  const body = GenerateRequestSchema.parse({
    templateId: 'resume',
    prompt: '이력서를 만들어 주세요.',
    brand: { name: '결 스튜디오', tone: '단정하고 따뜻한 한국어' },
  });

  expect(body.brand).toEqual({ name: '결 스튜디오', tone: '단정하고 따뜻한 한국어' });
});
```

- [ ] **Step 2: Run the test and confirm the web route has no profile path**

```bash
bun test src/lib/generation/brand-profile.test.ts app/api/generate/route.test.ts
```

Expected: the existing domain test may pass, while the route test fails because `GenerateRequestSchema` is not exported and has no `brand` property.

- [ ] **Step 3: Separate pure profile type/parsing from environment adapters**

Keep `BrandProfile` and frontmatter parsing pure. Put `localStorage` reads/writes behind browser-only functions and filesystem reads behind server-only functions. Do not import `fs` into a client dependency graph. Preserve the current storage key only if active browser profiles must survive this cutover; otherwise migrate it once and delete the old key after reading it exactly once.

- [ ] **Step 4: Add validated optional API profile input**

Export `GenerateRequestSchema` from the route module and extend it with:

```ts
brand: z.object({
  name: z.string().trim().max(120).optional(),
  role: z.string().trim().max(120).optional(),
  email: z.string().trim().max(254).optional(),
  website: z.string().trim().max(2048).optional(),
  tone: z.string().trim().max(500).optional(),
}).strict().optional(),
```

Pass `parsed.data.brand ?? null` as the third argument to `generateDocumentData`. Return a friendly Korean message for invalid profile data; never return raw Zod or provider error text.

- [ ] **Step 5: Add the explicit browser panel**

`BrandProfilePanel` is a collapsed optional section below the selected-template facts. It exposes a checkbox labelled `이 문서에 브랜드 정보 적용`, then fields for name, role, website, and tone. It loads/saves browser-local data only after user interaction and passes a profile only when the checkbox is checked. It must not claim that `~/.config/satgat/brand.md` was automatically loaded in a hosted browser.

- [ ] **Step 6: Run focused behavior checks**

Run:

```bash
bun test src/lib/generation/brand-profile.test.ts app/api/generate/route.test.ts
bun test src/lib/generation/document-generator.test.ts

Then submit a browser request with and without the checkbox and inspect the JSON request body. Expected: no `brand` field without opt-in; valid profile payload with opt-in.

- [ ] **Step 7: Commit brand profile wiring**

```bash
git add src/lib/design-system/brand-resolver.ts src/lib/generation app/api/generate/route.ts app/[lang]/new
git commit -m "feat: apply optional web brand profiles to generation"
```

---

### Task 6: Rebuild the create flow around catalog-driven, accessible components

**Files:**
- Create: `app/[lang]/new/TemplatePicker.tsx`
- Create: `app/[lang]/new/TemplateCard.tsx`
- Create: `app/[lang]/new/TemplatePreview.tsx`
- Create: `app/[lang]/new/PromptComposer.tsx`
- Create: `app/[lang]/new/FactChecklist.tsx`
- Create: `app/[lang]/new/CreateResult.tsx`
- Create: `app/[lang]/new/new-document.module.css`
- Modify: `app/[lang]/new/NewDocumentClient.tsx:1-2410`
- Modify: `app/[lang]/new/page.tsx:1-19`
- Create: `app/[lang]/new/create-flow.test.tsx`

**Interfaces:**
- Consumes: `TemplateCatalogEntry`, `getPageSpec`, browser draft creation, optional applied brand profile.
- Produces: a small orchestration client, category-first picker, concise accessible cards, prompt form, result CTA, and local CSS module.

- [ ] **Step 1: Write failing component behavior tests**

Use the existing Bun/React test convention available after Phase 0. Test the exported pure helpers if a DOM runner is not already present, and cover browser behavior in Task 10’s Puppeteer script. At minimum, create pure assertions for the view model:

```ts
import { expect, test } from 'bun:test';
import { groupTemplatesByCategory, templateCardLabel } from './TemplatePicker';
import { listTemplates } from '@/lib/templates/registry';

test('groups all fourteen templates into three user-facing categories', () => {
  const groups = groupTemplatesByCategory(listTemplates());
  expect(groups.personal.map((template) => template.id)).toContain('resume');
  expect(groups.business.map((template) => template.id)).toContain('report');
  expect(groups.occasion.map((template) => template.id)).toEqual(['invitation', 'new-year-card']);
});

test('uses concise accessible template action labels', () => {
  expect(templateCardLabel(listTemplates().find((template) => template.id === 'resume')!)).toBe('이력서 템플릿 선택');
});
```

- [ ] **Step 2: Run tests and confirm current client owns the behavior inline**

Run:

```bash
bun test app/[lang]/new/create-flow.test.tsx
```

Expected: FAIL because the helper exports and component boundaries do not exist.

- [ ] **Step 3: Build a category-first picker**

`TemplatePicker` accepts:

```ts
interface TemplatePickerProps {
  templates: readonly TemplateCatalogEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}
```

Render category headings in this exact order: `개인 문서`, `브랜드·업무`, `초대·인사`. Use `TemplateCard` buttons with `aria-pressed`, `aria-label={templateCardLabel(template)}`, page-spec label, and a purely decorative thumbnail marked `aria-hidden="true"`. No seal, Hanja, fake work history, or full thumbnail text belongs in the accessibility tree.

- [ ] **Step 4: Build the prompt/fact stage**

`PromptComposer` receives `template`, `prompt`, `onPromptChange`, `onGenerate`, `generating`, and `error`. It must:

- render only after selection;
- use `template.promptSeeds.slice(0, 2)`;
- expose `template.factChecklist` instead of a 0–100 prompt score;
- keep 10-character minimum and 8,000-character maximum;
- use `role="alert"` for real generation errors;
- use existing reduced-motion-aware scrolling only in the select event handler.

- [ ] **Step 5: Shrink `NewDocumentClient` to orchestration**

Keep only state, selection, prompt, generation request, draft creation, scroll refs, and component composition. Delete `TemplatePreview` switch, prompt/checklist maps, fake example arrays, seal/voice branches, `getPromptQuality`, and the 1,574-line styled-jsx block. The final file should compose the new components and remain below 500 lines.

- [ ] **Step 6: Move styles into a module with mobile contract**

In `new-document.module.css`:

```css
.templateGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 720px) {
  .templateGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .templateGrid {
    grid-template-columns: 1fr;
  }
}
```

Ensure a 390px viewport never displays cards under 156px wide. Give every interactive state visible `:focus-visible`, hover, active, disabled, loading, error, and empty treatment using semantic CSS variables.

- [ ] **Step 7: Keep examples out of the primary creation path**

Delete the full 13-item `COMPLETE_EXAMPLE_GROUPS` gallery from `/ko/new`. The create flow may show a single text link to `/${lang}/examples`; it must not load 13 image assets before a user chooses to browse examples.

- [ ] **Step 8: Run focused checks**

Run:

```bash
bun test app/[lang]/new/create-flow.test.tsx
npm run verify:templates
```

Then verify at 390px: template selection, prompt input, disabled/enabled generation CTA, error alert, keyboard focus order, and no horizontal overflow.

- [ ] **Step 9: Commit create-flow redesign**

```bash
git add app/[lang]/new src/lib/templates
git commit -m "feat: simplify satgat document creation flow"
```

---

### Task 7: Replace the static landing rewrite with a React web-product landing

**Files:**
- Create: `app/[lang]/LandingPage.tsx`
- Create: `app/[lang]/landing-model.ts`
- Create: `app/[lang]/landing.module.css`
- Modify: `app/[lang]/page.tsx:1-15`
- Modify: `next.config.ts:16-21`
- Modify: `app/[lang]/layout.tsx:20-126`
- Create: `src/components/site/SiteHeader.tsx`
- Create: `src/components/site/site-header.module.css`
- Create: `app/[lang]/landing.test.ts`

**Interfaces:**
- Consumes: `listTemplates`, `getPageSpec`, generated specimen metadata, `/[lang]/new`, `/[lang]/examples` routes.
- Produces: React-rendered `/ko` landing, a non-decorative site header, no `/ko` static rewrite, and no static HTML landing authority.

- [ ] **Step 1: Write failing landing model tests**

Create `app/[lang]/landing.test.ts`:

```ts
import { expect, test } from 'bun:test';
import { buildLandingTemplateGroups, getLandingCtas } from './landing-model';
import { listTemplates } from '@/lib/templates/registry';

test('landing exposes every catalog template once across three product groups', () => {
  const groups = buildLandingTemplateGroups(listTemplates());
  const ids = groups.flatMap((group) => group.templates.map((template) => template.id));
  expect(ids).toHaveLength(14);
  expect(new Set(ids).size).toBe(14);
});

test('landing CTAs preserve locale and point to application routes', () => {
  expect(getLandingCtas('ko')).toEqual({
    primary: '/ko/new',
    secondary: '/ko/examples',
  });
});

- [ ] **Step 2: Run tests and confirm React landing exports are missing**

Run:

```bash
bun test app/[lang]/landing.test.ts
```

Expected: FAIL because the current `/[lang]/page.tsx` redirects to static HTML.

- [ ] **Step 3: Implement the six-block landing**

Implement `landing-model.ts` as a pure module. `buildLandingTemplateGroups` returns one ordered group each for `personal`, `business`, and `occasion`; `getLandingCtas(lang)` returns primary and secondary URLs formed by appending `/new` and `/examples` to the locale path. `LandingPage` imports these helpers rather than re-declaring catalog grouping or route strings.

`LandingPage` must have these semantic sections and no others:

1. Hero with one runtime-derived specimen image, `문서 만들기` primary link, and `14가지 문서 보기` secondary link.
2. Three template groups backed by `buildLandingTemplateGroups`.
3. Three-step generation explanation.
4. Exactly three representative result links.
5. Trust block: Korean documents, PDF/print, OFL fonts, privacy/share behavior.
6. FAQ plus footer.

Use `<main id="main-content">`, insert a visible-on-focus skip link before the header, and ensure all cards link to `/${lang}/new?template=<id>`.

- [ ] **Step 4: Make static routing disappear only after the page exists**

Replace `app/[lang]/page.tsx` redirect with:

```tsx
import LandingPage from './LandingPage';

export default async function LangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <LandingPage lang={lang} />;
}
```

Delete the `/ko` rewrite in `next.config.ts`. Preserve Chromium output tracing and image configuration.

- [ ] **Step 5: Replace the locale header’s decorative glyphs and inline CSS**

Move the header into `src/components/site/SiteHeader.tsx`. Use Hangul-only brand text `삿갓` and the factual description `한국 문서 생성기`. Remove `笠`, `良紙良文`, and its `dangerouslySetInnerHTML` style. The new header CSS module contains its focus and responsive styles.

- [ ] **Step 6: Enforce the landing size and mobile layout contract**

`landing.module.css` must lazy-load non-hero specimen images, use a 3/2/1 or 4/2/1 grid that never falls below 156px card width, and avoid the static `overrides.css` cascade. Keep the desktop page below 7,500px and the 390px page below 12,000px using Task 10 browser assertions.

- [ ] **Step 7: Deactivate static landing authority and defer file deletion to the specimen cutover**

After `/ko`, `/ko/new`, and `/ko/preview` load in a production build, confirm no route or stylesheet imports `public/satgat/satgat-ko.html`. Leave the unreferenced file in place only until Task 8 adds `/ko/examples` and generates the replacement runtime artifacts; Task 8 deletes it in the same clean cutover as the demo stack.

- [ ] **Step 8: Run focused checks**

Run:

```bash
bun test app/[lang]/landing.test.ts
npm run build
```

Expected: build succeeds with no `/ko` rewrite and no static landing dependency.

- [ ] **Step 9: Commit landing cutover**

```bash
git add app/[lang] src/components/site next.config.ts
git commit -m "feat: make satgat landing web-app first"
```

---

### Task 8: Generate all public specimens from the runtime renderer

**Files:**
- Create: `scripts/render-template-specimens.mjs`
- Create: `scripts/render-template-specimens.test.mjs`
- Create: `scripts/template-catalog-source.mjs`
- Modify: `package.json:43-52`
- Modify: `scripts/verify-template-catalog.mjs`
- Create: `app/[lang]/examples/page.tsx`
- Create: `app/[lang]/examples/examples.module.css`
- Delete after output verification: `public/satgat/satgat-ko.html`, `scripts/generate-korean-demo-pack.mjs`, `scripts/demo/`
- Delete after output verification: generated static specimen HTML under `public/satgat/assets/examples/ko/*.html`
- Retain/generated: `public/satgat/assets/examples/ko/*.png`, `public/satgat/assets/examples/ko/*.pdf`, `manifest.json`

**Interfaces:**
- Consumes: `previewFixtures`, registry IDs, browser-local draft key contract, runtime `/[lang]/preview` route.
- Produces: 14 PNG/PDF runtime-derived artifacts and a 14-entry manifest consumed by `/[lang]/examples` and the landing.

- [ ] **Step 1: Write failing generator metadata tests**

Create `scripts/render-template-specimens.test.mjs`:

```js
import { expect, test } from 'bun:test';
import { buildSpecimenManifest } from './render-template-specimens.mjs';

const catalog = [
  { id: 'resume', name: '이력서', pageSpec: 'a4Portrait', specimen: { title: '김수민 이력서', alt: '김수민 이력서 완성 예시', prompt: '이력서' } },
  { id: 'report', name: '보고서', pageSpec: 'a4Portrait', specimen: { title: '2026년 1분기 운영 보고서', alt: '2026년 1분기 운영 보고서 완성 예시', prompt: '보고서' } },
];

test('manifest emits runtime artifact paths and physical specs for every catalog entry', () => {
  expect(buildSpecimenManifest(catalog)).toEqual([
    expect.objectContaining({ id: 'resume', pageSpec: 'a4Portrait', png: 'resume.png', pdf: 'resume.pdf' }),
    expect.objectContaining({ id: 'report', pageSpec: 'a4Portrait', png: 'report.png', pdf: 'report.pdf' }),
  ]);
});
```

- [ ] **Step 2: Run the test and confirm no runtime generator exists**

Run:

```bash
bun test scripts/render-template-specimens.test.mjs
```

Expected: FAIL because `render-template-specimens.mjs` does not exist.

- [ ] **Step 3: Read catalog metadata once from TypeScript source and build manifest data**

Create `scripts/template-catalog-source.mjs` using the existing `typescript` parser dependency. It reads the fourteen definition files and returns only the literal metadata needed by Node scripts: `id`, `name`, `pageSpec`, and `specimen`. It rejects missing/nonliteral values and duplicate IDs. Refactor `verify-template-catalog.mjs` to use this reader instead of maintaining a second AST extraction path.

`buildSpecimenManifest` receives those source records and returns:

```js
{
  id: template.id,
  name: template.name,
  pageSpec: template.pageSpec,
  title: template.specimen.title,
  alt: template.specimen.alt,
  prompt: template.specimen.prompt,
  png: `${template.id}.png`,
  pdf: `${template.id}.pdf`,
}
```

The manifest has 14 entries. No `seal`, `layout`, `form`, static HTML path, or separate demo payload exists.

- [ ] **Step 4: Implement runtime capture through the private preview contract**

`render-template-specimens.mjs` accepts an optional `--base-url`. With that argument it uses the already-running origin. Without it, it requires a built `.next` directory, starts `npm run start -- --hostname 127.0.0.1 --port 3100`, waits for `http://127.0.0.1:3100/ko`, and terminates its child process in `finally`.

For each catalog ID:

1. Launch existing Chromium through the same launcher behavior used by `render-pdf`.
2. Establish the selected same-origin `baseUrl`.
3. Write that template’s `previewFixtures[id]` document into page `sessionStorage` with a new UUID draft ID.
4. Navigate to the locale preview route with that opaque draft ID.
5. Wait for `.satgat-document[data-page-spec]`, `document.fonts.ready`, and no `문서를 준비하는 중` text.
6. Capture the document element to `public/satgat/assets/examples/ko/${id}.png`.
7. Capture PDF using `printBackground: true` and `preferCSSPageSize: true` to `public/satgat/assets/examples/ko/${id}.pdf`.

Use only runtime renderer output. Do not call `scripts/demo/layouts.mjs` or write sample HTML documents.

- [ ] **Step 5: Create a React examples route**

`app/[lang]/examples/page.tsx` reads generated `manifest.json`, displays 14 image cards with the generated `alt`, and links each card to `/${lang}/new?template=${id}`. It must not link to obsolete static specimen HTML files.

- [ ] **Step 6: Replace the package script and delete the parallel demo authoring stack**

Replace `demo:ko` with:

```json
"specimens:render": "node scripts/render-template-specimens.mjs"
```

Delete `public/satgat/satgat-ko.html`, `scripts/generate-korean-demo-pack.mjs`, `scripts/demo/`, and generated static specimen HTML pages after successful artifact creation. Update all callers in landing, README, verifier, and CI to use `/ko/examples` and the manifest.

- [ ] **Step 7: Run focused generator checks**

Run:
```bash
bun test scripts/render-template-specimens.test.mjs
npm run build
npm run specimens:render
node -e "const m=require('./public/satgat/assets/examples/ko/manifest.json'); if(m.length!==14) process.exit(1); console.log('14 runtime specimens')"
```

Expected: all 14 PNG/PDF artifacts and 14 manifest entries, including Report.

- [ ] **Step 8: Commit runtime specimen ownership**

```bash
git add -u
git add scripts app/[lang]/examples public/satgat/assets/examples/ko package.json
git commit -m "refactor: generate satgat specimens from runtime renderers"
```

---

### Task 9: Consolidate tokens and remove static style authority

**Files:**
- Modify: `src/lib/design-system/constraint.ts:1-132`
- Create: `scripts/generate-design-tokens.mjs`
- Create: `scripts/generate-design-tokens.test.mjs`
- Create: `app/satgat-tokens.css`
- Modify: `app/globals.css:1-76`
- Modify or delete after caller migration: `src/lib/design-system/tokens.ts`, `src/lib/design-system/theme.ts`
- Modify or delete after caller migration: `public/satgat/overrides.css`, `public/satgat/satgat.css`
- Modify: component CSS modules and document components that consume legacy variable names

**Interfaces:**
- Consumes: `constraint.ts` literal color/font/spacing constants, self-hosted `public/fonts/satgat-fonts.css`.
- Produces: checked generated `app/satgat-tokens.css`, `--satgat-*` variables, no duplicate external font imports, and no legacy static token dictionary.

- [ ] **Step 1: Use LSP before removing exported token symbols**

Run LSP references for `colors`, `fonts`, `spacing`, `satgatTheme`, `typography`, and `createTheme` before touching `tokens.ts` or `theme.ts`. Record every caller in the task branch and migrate all of them; do not preserve compatibility re-exports.

- [ ] **Step 2: Write a failing generated-token test**

Create `scripts/generate-design-tokens.test.mjs`:

```js
import { expect, test } from 'bun:test';
import { renderTokenCss } from './generate-design-tokens.mjs';

test('renders the semantic canvas and ink variables from constraints', () => {
  const css = renderTokenCss({
    CANVAS: '#F7F7F2', INK: '#1C1916', DANCHEONG: '#9B1B1B',
    FONT_MYEONGJO: 'Nanum Myeongjo', FONT_BATANG: 'Gowun Batang', FONT_DODUM: 'Gowun Dodum',
  });
  expect(css).toContain('--satgat-canvas: #F7F7F2;');
  expect(css).toContain('--satgat-ink: #1C1916;');
  expect(css).toContain('--satgat-accent: #9B1B1B;');
});
```

- [ ] **Step 3: Run the test and confirm token generation is absent**

Run:

```bash
bun test scripts/generate-design-tokens.test.mjs
```

Expected: FAIL because no generator exists.

- [ ] **Step 4: Implement checked token generation from `constraint.ts`**

Use the existing TypeScript parser dependency rather than regexing source. `scripts/generate-design-tokens.mjs` exports `renderTokenCss(values)` for tests and supports:

```bash
node scripts/generate-design-tokens.mjs --write
node scripts/generate-design-tokens.mjs --check
```

Run `node scripts/generate-design-tokens.mjs --write` once to create `app/satgat-tokens.css`, then run `--check`; the checked-in file is a generated artifact and must never be hand-edited.

It emits only semantic variables needed by product CSS:

```css
:root {
  --satgat-canvas: #F7F7F2;
  --satgat-surface: #FFFFFB;
  --satgat-ink: #1C1916;
  --satgat-ink-body: #3A3833;
  --satgat-ink-muted: #4D4B46;
  --satgat-line: #D2D6CB;
  --satgat-accent: #9B1B1B;
  --satgat-font-display: 'Nanum Myeongjo', 'Noto Serif KR', 'Batang', Georgia, serif;
  --satgat-font-body: 'Gowun Batang', 'Nanum Myeongjo', 'Noto Serif KR', 'Batang', Georgia, serif;
  --satgat-font-label: 'Gowun Dodum', 'Nanum Myeongjo', 'Noto Serif KR', sans-serif;
}
```

- [ ] **Step 5: Make self-hosted font faces the single web and PDF source**

Remove Google Fonts and Pretendard CDN imports from `app/globals.css` and `public/satgat/overrides.css`. Import `public/fonts/satgat-fonts.css` and generated `app/satgat-tokens.css` once from `app/globals.css`. Retain the print override only where Chromium requires it, but make its font-family values match generated token names.

- [ ] **Step 6: Remove duplicate token/style authorities cleanly**

Migrate all references from legacy `--parchment`, `--brand`, `--serif`, and JavaScript token facades to `--satgat-*` or `constraint.ts` imports. Delete `src/lib/design-system/tokens.ts` and `theme.ts` after LSP confirms zero callers. Delete `public/satgat/overrides.css` and `public/satgat/satgat.css` only after the React landing, examples route, and all active app styles no longer import them. Do not leave aliases or compatibility CSS variables.

- [ ] **Step 7: Remove non-solid texture and shadow tokens**

Delete `TEXTURE_PAPER_NOISE`, `TEXTURE_CANVAS_GRADIENT`, and all color values expressed with `rgba()` from `constraint.ts`. Replace document texture/background overlays with the flat semantic canvas color and replace translucent drop shadows with a one-pixel solid semantic line where separation is needed. Use LSP references before removal and update every consumer. The final active CSS and TypeScript visual tokens must use solid hex colors only; do not add an exception for a data-URI or print surface.

- [ ] **Step 8: Remove decorative Hanja across active application surfaces**

Search `app/` and `src/` for CJK Unified Ideographs in JSX/string literals. Remove menu glyphs, seal glyphs, hard-coded demo characters, and Hanja slot labels. Do not introduce a Hanja-specific schema field; if a future renderer deliberately displays a user-provided legal Hanja name, it must place it parenthetically beside Hangul body text rather than as an ornament.

- [ ] **Step 9: Run focused checks**

Run:

```bash
bun test scripts/generate-design-tokens.test.mjs
node scripts/generate-design-tokens.mjs --check
```

Then run a targeted browser check that verifies no active styles load Google Fonts/Pretendard CDN and the document canvas resolves to `rgb(247, 247, 242)`.

- [ ] **Step 10: Commit token authority cutover**

```bash
git add -u
git add src/lib/design-system app scripts public/fonts public/satgat
git commit -m "refactor: centralize satgat design tokens"
```

---

### Task 10: Turn product contracts into blocking browser, PDF, and CI checks

**Files:**
- Create: `scripts/verify-web-product.mjs`
- Create: `scripts/verify-web-product.test.mjs`
- Modify: `scripts/design-guard.mjs:1-1061`
- Modify: `scripts/design-guard.test.mjs:1-363`
- Modify: `scripts/verify-template-catalog.mjs:1-495`
- Modify: `.github/workflows/ci.yml:1-79`
- Modify: `package.json:43-52`

**Interfaces:**
- Consumes: catalog, manifest, runtime preview, `data-page-spec`, `SatgatPrintStyles`, generated tokens.
- Produces: `npm run verify:web`, strict design guard, 14-template runtime/PDF smoke tests, CI execution of Bun tests and browser product checks.

- [ ] **Step 1: Write failing web-product verifier tests**

Create `scripts/verify-web-product.test.mjs`:

```js
import { expect, test } from 'bun:test';
import { assertLandingMetrics, assertPreviewUrl, assertTemplateCardWidth } from './verify-web-product.mjs';

test('rejects a mobile card under the minimum readable width', () => {
  expect(() => assertTemplateCardWidth(155)).toThrow('156px');
  expect(() => assertTemplateCardWidth(156)).not.toThrow();
});

test('rejects content-bearing or non-opaque normal preview URLs', () => {
  expect(() => assertPreviewUrl('/ko/preview?data=eyJ0ZW1wbGF0ZUlkIjoicmVzdW1lIn0')).toThrow('opaque draft');
  expect(() => assertPreviewUrl('/ko/preview?draft=resume')).toThrow('opaque draft');
  expect(() => assertPreviewUrl('/ko/preview?draft=8dc1d22e-95cb-4f36-83a8-0112d0f28647')).not.toThrow();
});

test('rejects landing dimensions above approved budgets', () => {
  expect(() => assertLandingMetrics({ desktopHeight: 7501, mobileHeight: 12000 })).toThrow('7500px');
  expect(() => assertLandingMetrics({ desktopHeight: 7500, mobileHeight: 12000 })).not.toThrow();
});
```

- [ ] **Step 2: Run the test and confirm verifier helpers are absent**

Run:

```bash
bun test scripts/verify-web-product.test.mjs
```

Expected: FAIL because the web verifier module does not exist.

- [ ] **Step 3: Implement the side-effect-safe Puppeteer product verifier**

`verify-web-product.mjs` exports the three assertion helpers for its Bun test and invokes browser work only when executed as the program entrypoint. It accepts `--base-url`, waits up to 30 seconds for that same-origin application URL, then launches existing Chromium and verifies:

1. `/ko` at 1440×1000: `scrollHeight <= 7500`, no literal `\\u` text, one `main`, skip link, and 14 unique template routes.
2. `/ko` at 390×844: `scrollWidth === 390`, `scrollHeight <= 12000`, every template card width is at least 156px, no text overflow.
3. `/ko/new?template=resume`: keyboard tab order reaches a concise `이력서 템플릿 선택` card, textarea, and disabled/enabled generation CTA.
4. Every catalog fixture: storage-inject a private draft, visit preview, wait for `.satgat-document[data-page-spec]`, ensure the Suspense fallback text is gone, and assert the root page spec matches catalog metadata.
5. Every injected private-draft preview URL contains `draft=` and contains neither `data=` nor fixture text.
6. A PDF generated from every PageSpec has a non-empty byte buffer, the expected CSS page dimensions, and a non-fallback document root.

- [ ] **Step 4: Split design guard into blocking and advisory rules**

Keep advisory: accent-area proxy and density estimator. Make blocking: raw Unicode escape in rendered source, pure white, cool-gray, `rgba()` color usage, unsupported synthetic font weight, dual accent, decorative literal Hanja in active UI source, and unmanaged token literals outside `constraint.ts`/generated CSS.

Replace bare permit handling with this exact comment grammar:

```text
// satgat-allow: RULE_ID ticket=SATGAT-123 reason=print-font-override
```

Reject an exception without all three fields. Extend `design-guard.test.mjs` with positive and negative parser cases and a failure-exit assertion for a blocking rule.

- [ ] **Step 5: Extend catalog verifier for runtime artifacts**

Require exactly 14 manifest entries, 14 PNG paths, 14 PDF paths, matching catalog IDs, matching `pageSpec` values, and no `html`/`layout` legacy fields. Preserve existing required-slot and renderer-read checks. Make missing Report artifact a blocking verifier failure.

- [ ] **Step 6: Make CI run all real gates**

Add Bun setup before `npm test`:

```yaml
- name: Bun 환경 준비
  uses: oven-sh/setup-bun@v2

- name: 단위 테스트
  run: npm test
```

After `npm run build`, add this workflow step:

```yaml
- name: 브라우저·PDF 제품 계약
  run: |
    npm run start -- --hostname 127.0.0.1 > /tmp/satgat-next.log 2>&1 &
    app_pid=$!
    trap 'kill "$app_pid"' EXIT
    npm run verify:web
```

`verify:web` waits for the application before opening Chromium. Add these package scripts:

```json
"tokens:check": "node scripts/generate-design-tokens.mjs --check",
"verify:web": "node scripts/verify-web-product.mjs --base-url http://127.0.0.1:3000"
```

Run `tokens:check`, `verify:templates`, strict design guard, unit tests, and `verify:web` in CI.

- [ ] **Step 7: Run the full quality sequence locally**

Run in this order:

```bash
node scripts/generate-design-tokens.mjs --check
npm run lint
npx tsc --noEmit
npm test
npm run verify:templates
node scripts/design-guard.mjs --check
node scripts/design-guard.mjs --check-density
npm run build
(
  npm run start -- --hostname 127.0.0.1 > /tmp/satgat-next.log 2>&1 &
  app_pid=$!
  trap 'kill "$app_pid"' EXIT
  npm run verify:web
)
```

Expected: all blocking checks pass; advisory output may remain only for explicitly documented heuristic findings.

- [ ] **Step 8: Commit executable product contracts**

```bash
git add scripts .github/workflows/ci.yml package.json
git commit -m "test: enforce satgat web product contracts"
```

---

### Task 11: Complete README, architecture, skill, and obsolete-file cutover

**Files:**
- Modify: `README.md:1-239`
- Modify: `docs/ARCHITECTURE.md:1-300`
- Modify: `skills/satgat/SKILL.md:1-225`
- Modify: `bin/satgat.mjs:1-137` only if help text contradicts the new documented behavior
- Delete: obsolete static-demo documentation references and files identified by Tasks 7–9
- Test: `scripts/verify-web-product.mjs` README command assertion

**Interfaces:**
- Consumes: final catalog, PageSpec labels, examples route, normal-preview/share privacy contract, actual package scripts, CI behavior, brand profile flow.
- Produces: web-app-first truthful documentation with no stale static/demo, Hanja/seal, format, brand, or CI claims.

- [ ] **Step 1: Write a failing README command/claim check**

Extend `scripts/verify-web-product.mjs` with a README reader that asserts these exact headings exist:

```text
## 1분 안에 만들기
## 웹앱 사용
## 셀프호스팅
## AI agent skill
## 14개 문서와 실제 출력 형식
## 데이터 처리와 공유
## 개발·검증
```

Assert README contains no active Markdown link, CLI command, or code sample that uses `?data=`, and does not contain `13종 specimen`, `TEMPLATE_SEAL`, `satgat-ko.html`, or an unqualified `자동 반영` brand claim.

- [ ] **Step 2: Run the assertion and confirm current documentation fails**

Run:

```bash
npm run build
(
  npm run start -- --hostname 127.0.0.1 > /tmp/satgat-next.log 2>&1 &
  app_pid=$!
  trap 'kill "$app_pid"' EXIT
  npm run verify:web
)
```

Expected: FAIL at README checks until the documentation is rewritten.

- [ ] **Step 3: Rewrite README in web-product order**

Use this fixed section order:

```md
# 삿갓
[웹에서 문서 만들기] [14가지 예시] [셀프호스팅] [AI agent skill]

## 1분 안에 만들기
## 오늘 가능한 것
## 웹앱 사용
## 셀프호스팅
## AI agent skill
## 14개 문서와 실제 출력 형식
## 데이터 처리와 공유
## 품질 계약
## 개발·검증
## 구조와 기여
```

Document these facts exactly:

- Web app is the primary no-install path.
- `npx satgat init <dir>` clones the Git repository and requires Git.
- Self-hosting requires Node version declared in `package.json`, a Google AI API key for generation, and Chromium/PDF conditions described by the export route.
- Bun is the test runtime while npm remains the install/CI package manager, unless Task 10 changes the selected command.
- All 14 templates use the final PageSpec labels.
- Normal preview is browser-local; explicit share links contain document content in their fragment and require a user warning.
- Brand information applies only when a user explicitly enables the profile panel.
- Blocking checks and advisory design heuristics are distinct.

In the README format table, list every template exactly once: `a4Portrait` — resume, self-intro, product brochure, company profile, proposal, brand storybook, newsletter, report; `a4Landscape` — brand one-pager, portfolio; `slide16x9` — investor deck; `businessCard8Up` — business card; `postcardPortrait` — invitation, new year card. Display the Korean labels (`A4 세로`, `A4 가로`, `16:9 슬라이드`, `명함 8-up`, `엽서 세로`) beside the stable PageSpec IDs.

- [ ] **Step 4: Rewrite architecture and skill around current runtime truth**

`docs/ARCHITECTURE.md` must describe the React landing, catalog/page-spec/renderer-adapter boundary, private preview, runtime specimen pipeline, self-hosted fonts, and current CI gates. Move the old Freemium/Phase 2/12-week roadmap to a dated history section or delete it.

`skills/satgat/SKILL.md` must keep the Korean document visual brief, but remove all seal tables, decorative Hanja instructions, Hanja date/name requirements, and automatic filesystem brand claims. Its format table must use the same five PageSpec labels as README and catalog.

- [ ] **Step 5: Remove obsolete code and stale references**

Use LSP references for exported symbols and `grep` for static paths before deletion. Remove only files with zero active runtime/test/documentation callers: static landing HTML, parallel demo layout code, legacy token facades, obsolete static CSS, and generated static HTML specimen pages. Do not retain deprecated aliases, routes, or re-exports.

- [ ] **Step 6: Run documentation and final regression checks**

```bash
npm run verify:templates
node scripts/generate-design-tokens.mjs --check
npm test
npm run build
(
  npm run start -- --hostname 127.0.0.1 > /tmp/satgat-next.log 2>&1 &
  app_pid=$!
  trap 'kill "$app_pid"' EXIT
  npm run verify:web
)
```

Expected: all commands pass and README assertions confirm web-first, 14-template, privacy-safe current behavior.

- [ ] **Step 7: Commit the documentation and cleanup cutover**

```bash
git add -u
git add README.md docs/ARCHITECTURE.md skills/satgat/SKILL.md bin/satgat.mjs
git commit -m "docs: align satgat with web product runtime"
```

---

## Final Verification Checklist

- [ ] Catalog has exactly 14 IDs, three categories, five PageSpecs, complete prompt/checklist/specimen metadata, and complete canonical fixture coverage.
- [ ] Domain catalog has no React import; runtime renderer map is a UI-only exhaustive adapter.
- [ ] `/ko` is React-rendered; `next.config.ts` no longer rewrites it to static HTML.
- [ ] 390px has no horizontal overflow, card width is at least 156px, and page height is at most 12,000px.
- [ ] 1440px landing height is at most 7,500px; no literal `\\uXXXX` text is rendered.
- [ ] All 14 runtime fixtures render actual document pages; all 14 PNG/PDF specimen artifacts exist; Report is present.
- [ ] Normal preview uses an opaque draft ID; PII is absent from query strings; share is explicit and warned.
- [ ] Brand profiles affect generation only after user opt-in and API validation.
- [ ] One semantic token authority (`constraint.ts`) generates CSS; no duplicate remote font imports, static token dictionaries, decorative Hanja, or legacy aliases remain.
- [ ] Active visual CSS and TypeScript use solid hex colors only; paper-noise/gradient texture and translucent shadow tokens are removed.
- [ ] Static landing HTML, parallel demo layouts, and generated static specimen HTML have zero active callers and are deleted.
- [ ] `SatgatPrintStyles` remains the sole print CSS owner; PDF canvas/page size matches each PageSpec.
- [ ] CI runs lint, typecheck, Bun unit tests, catalog/design/token checks, production build, and browser/PDF product checks.
- [ ] README, architecture, skill, CLI help, and application behavior make identical current claims.
