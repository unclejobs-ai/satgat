import { expect, test } from 'bun:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getPageSpec, getTemplate, getTemplateIds } from '@/lib/templates/registry';
import {
  calculateDensityMeasurement,
  calculateNestedOffsetBottom,
  SatgatDocument,
} from './SatgatDocument';
import { SatgatPrintStyles } from './SatgatPrintStyles';
import {
  calculatePreviewScale,
  millimetersToCssPixels,
} from '../../../app/[lang]/preview/preview-scale';
import {
  getRuntimeRenderer,
  runtimeRendererIds,
} from '@/components/templates/runtime-catalog';
import BrandOnepager from '@/components/templates/BrandOnepager';
import BrandStorybook from '@/components/templates/BrandStorybook';
import BusinessCard from '@/components/templates/BusinessCard';
import CompanyProfile from '@/components/templates/CompanyProfile';
import InvestorDeck from '@/components/templates/InvestorDeck';
import Invitation from '@/components/templates/Invitation';
import NewYearCard from '@/components/templates/NewYearCard';
import Newsletter from '@/components/templates/Newsletter';
import Portfolio from '@/components/templates/Portfolio';
import ProductBrochure from '@/components/templates/ProductBrochure';
import Proposal from '@/components/templates/Proposal';
import Report from '@/components/templates/Report';
import Resume from '@/components/templates/Resume';
import SelfIntro from '@/components/templates/SelfIntro';
import {
  RendererLoadBoundary,
  RendererLoadFailure,
  SatgatTemplateRenderer,
} from '@/components/templates/SatgatTemplateRenderer';
import type {
  PageSpecId,
  SatgatDocumentData,
  TemplateId,
} from '@/lib/templates/types';

const STYLED_JSX_HARNESS_WARNING =
  'Received `%s` for a non-boolean attribute `%s`.';

function renderStyledJsxToStaticMarkup(element: React.ReactNode): string {
  const originalError = console.error;
  const unexpected: unknown[][] = [];
  console.error = (...args: unknown[]) => {
    const isStyledJsxHarnessWarning =
      String(args[0] ?? '').startsWith(STYLED_JSX_HARNESS_WARNING) &&
      (args[2] === 'jsx' || args[2] === 'global');
    if (!isStyledJsxHarnessWarning) {
      unexpected.push(args);
    }
  };

  try {
    const markup = renderToStaticMarkup(element);
    expect(unexpected).toEqual([]);
    return markup;
  } finally {
    console.error = originalError;
  }
}

test('UI renderer adapter is exhaustive for the domain catalog', () => {
  expect([...runtimeRendererIds].sort()).toEqual(getTemplateIds().sort());
  for (const id of getTemplateIds()) {
    expect(getRuntimeRenderer(id)).toBeDefined();
  }
});

test('runtime renderer lookup rejects unknown template IDs without unsafe catalog casts', () => {
  expect(getRuntimeRenderer('missing-renderer')).toBeUndefined();
});

test('physical page specs retain their intended geometry', () => {
  expect(getPageSpec('a4Portrait').cssSize).toBe('210mm 297mm');
  expect(getPageSpec('a4Landscape').cssSize).toBe('297mm 210mm');
  expect(getPageSpec('slide16x9').cssSize).toBe('297mm 167mm');
  expect(getPageSpec('postcardPortrait').cssSize).toBe('105mm 148mm');
  expect(getPageSpec('businessCard8Up')).toMatchObject({
    canvas: { widthMm: 210, heightMm: 297 },
    imposition: {
      columns: 2,
      rows: 4,
      cardWidthMm: 90,
      cardHeightMm: 55,
    },
  });
});

test('mobile preview scales landscape and slide canvases without clipping their height', () => {
  const availableWidth = 390 - 28;

  for (const pageSpec of ['a4Landscape', 'slide16x9'] as const) {
    const spec = getPageSpec(pageSpec);
    const pageWidth = millimetersToCssPixels(spec.canvas.widthMm);
    const pageHeight = millimetersToCssPixels(spec.canvas.heightMm);
    const scaled = calculatePreviewScale(availableWidth, pageWidth, pageHeight);

    expect(scaled.scale).toBeLessThan(1);
    expect(scaled.width).toBeCloseTo(availableWidth);
    expect(scaled.height).toBeCloseTo(pageHeight * scaled.scale);
    expect(scaled.width / scaled.height).toBeCloseTo(pageWidth / pageHeight);
  }
});

type RendererComponent = (props: { data: SatgatDocumentData }) => React.ReactNode;

const RENDERERS = {
  resume: Resume,
  'self-intro': SelfIntro,
  'business-card': BusinessCard,
  'brand-onepager': BrandOnepager,
  'product-brochure': ProductBrochure,
  'company-profile': CompanyProfile,
  'investor-deck': InvestorDeck,
  'brand-storybook': BrandStorybook,
  invitation: Invitation,
  'new-year-card': NewYearCard,
  proposal: Proposal,
  newsletter: Newsletter,
  portfolio: Portfolio,
  report: Report,
} satisfies Record<TemplateId, RendererComponent>;

const EXPECTED_PAGE_SPECS = {
  resume: 'a4Portrait',
  'self-intro': 'a4Portrait',
  'business-card': 'businessCard8Up',
  'brand-onepager': 'a4Landscape',
  'product-brochure': 'a4Portrait',
  'company-profile': 'a4Portrait',
  'investor-deck': 'slide16x9',
  'brand-storybook': 'a4Portrait',
  invitation: 'postcardPortrait',
  'new-year-card': 'postcardPortrait',
  proposal: 'a4Portrait',
  newsletter: 'a4Portrait',
  portfolio: 'a4Landscape',
  report: 'a4Portrait',
} satisfies Record<TemplateId, PageSpecId>;

const EXPECTED_PAGE_COUNTS = {
  resume: 1,
  'self-intro': 1,
  'business-card': 1,
  'brand-onepager': 1,
  'product-brochure': 3,
  'company-profile': 2,
  'investor-deck': 1,
  'brand-storybook': 3,
  invitation: 1,
  'new-year-card': 1,
  proposal: 2,
  newsletter: 1,
  portfolio: 1,
  report: 2,
} satisfies Record<TemplateId, number>;

function collectPageSpecs(node: React.ReactNode): string[] {
  if (!React.isValidElement<{ children?: React.ReactNode; pageSpec?: unknown }>(node)) {
    return [];
  }

  const pageSpecs =
    node.type === SatgatDocument && typeof node.props.pageSpec === 'string'
      ? [node.props.pageSpec]
      : [];
  React.Children.forEach(node.props.children, (child) => {
    pageSpecs.push(...collectPageSpecs(child));
  });
  return pageSpecs;
}

test('all genre renderers select their catalog PageSpec', () => {
  for (const id of getTemplateIds()) {
    const rendered = RENDERERS[id]({ data: { templateId: id, slots: {} } });
    const pageSpecs = collectPageSpecs(rendered);

    expect(pageSpecs).toHaveLength(EXPECTED_PAGE_COUNTS[id]);
    expect(pageSpecs.every((pageSpec) => pageSpec === EXPECTED_PAGE_SPECS[id])).toBe(true);
  }
});

test('genre renderer output is invariant to preview viewport width', () => {
  for (const id of getTemplateIds()) {
    const markup = renderStyledJsxToStaticMarkup(
      React.createElement(RENDERERS[id], {
        data: { templateId: id, slots: {} },
      }),
    );

    expect(markup).not.toMatch(/@media\s+(?:screen\s+and\s+)?\(max-width:/);
  }
});

test('business-card preview renders one canonical card face', () => {
  const markup = renderStyledJsxToStaticMarkup(
    React.createElement(BusinessCard, {
      data: { templateId: 'business-card', slots: {} },
    }),
  );

  expect(markup).not.toContain('card-preview-compact');
});

test('density measurement uses invariant nested layout coordinates', () => {
  expect(calculateNestedOffsetBottom([36, 120, 18], 64)).toBe(238);

  const desktop = calculateDensityMeasurement({
    contentInsetTop: 106,
    contentHeight: 911,
    lowestLayoutBottom: 647,
  });
  const mobile = calculateDensityMeasurement({
    contentInsetTop: 106,
    contentHeight: 911,
    lowestLayoutBottom: 658,
  });

  expect(desktop).toEqual({ state: 'ok', fill: 60 });
  expect(mobile).toEqual(desktop);
  expect(
    calculateDensityMeasurement({
      contentInsetTop: 100,
      contentHeight: 800,
      lowestLayoutBottom: 500,
    }),
  ).toEqual({ state: 'ok', fill: 50 });
  expect(
    calculateDensityMeasurement({
      contentInsetTop: 100,
      contentHeight: 0,
      lowestLayoutBottom: 600,
    }),
  ).toEqual({ state: 'unknown', fill: 0 });
});

test('SatgatDocument renders exact PageSpec height with format-aware padding', () => {
  const cases: Array<[PageSpecId, string]> = [
    ['a4Portrait', 'satgat-page-padding-standard'],
    ['a4Landscape', 'satgat-page-padding-standard'],
    ['slide16x9', 'satgat-page-padding-standard'],
    ['businessCard8Up', 'satgat-page-padding-full-sheet'],
    ['postcardPortrait', 'satgat-page-padding-compact'],
  ];

  for (const [pageSpec, paddingClass] of cases) {
    const spec = getPageSpec(pageSpec);
    const markup = renderStyledJsxToStaticMarkup(
      React.createElement(
        SatgatDocument,
        { pageSpec },
        React.createElement('p', null, '내용'),
      ),
    );

    expect(markup).toContain(`data-page-spec="${pageSpec}"`);
    expect(markup).toContain(`data-page-padding="${paddingClass}"`);
    expect(markup).toContain(`height:${spec.canvas.heightMm}mm`);
    expect(markup).not.toContain(`min-height:${spec.canvas.heightMm}mm`);
  }
});

test('central print owner covers every named PageSpec and shell chrome', () => {
  const markup = renderStyledJsxToStaticMarkup(React.createElement(SatgatPrintStyles));
  const namedPages: Array<[PageSpecId, string]> = [
    ['a4Portrait', 'satgat-a4-portrait'],
    ['a4Landscape', 'satgat-a4-landscape'],
    ['slide16x9', 'satgat-slide-16x9'],
    ['businessCard8Up', 'satgat-business-card-8-up'],
    ['postcardPortrait', 'satgat-postcard-portrait'],
  ];

  for (const [pageSpec, pageName] of namedPages) {
    const spec = getPageSpec(pageSpec);
    expect(markup).toContain(`@page ${pageName}`);
    expect(markup).toContain(`size: ${spec.cssSize}`);
    expect(markup).toContain(`page: ${pageName}`);
    expect(markup).toContain(`.doc-stage .satgat-document[data-page-spec='${pageSpec}']`);
    expect(markup).toContain(`width: ${spec.canvas.widthMm}mm !important`);
    expect(markup).toContain(`height: ${spec.canvas.heightMm}mm !important`);
  }
  expect(markup).toContain('.satgat-shell > header');
  expect(markup).toContain('.satgat-topbar');
  expect(markup).toContain('.satgat-shell > main');
});

test('business-card imposition exposes the centered full-sheet origin and count', () => {
  const markup = renderStyledJsxToStaticMarkup(
    React.createElement(BusinessCard, {
      data: { templateId: 'business-card', slots: {} },
    }),
  );

  expect(markup).toContain('data-imposition-origin="15mm 38.5mm"');
  expect(markup).toContain('data-imposition-count="8"');
  expect(markup).toContain('left:15mm');
  expect(markup).toContain('top:38.5mm');
  expect(markup).toContain('grid-template-columns:repeat(2, 90mm)');
  expect(markup).toContain('grid-template-rows:repeat(4, 55mm)');
  expect(markup).toContain('width:90mm');
  expect(markup).toContain('height:55mm');
});

test('async renderer states expose status and alert semantics', () => {
  const template = getTemplate('resume');
  expect(template).toBeDefined();
  if (!template) return;

  const loadingMarkup = renderStyledJsxToStaticMarkup(
    React.createElement(SatgatTemplateRenderer, {
      template,
      data: { templateId: template.id, slots: {} },
    }),
  );
  expect(loadingMarkup).toContain('role="status"');
  expect(loadingMarkup).toContain('aria-live="polite"');
  expect(loadingMarkup).toContain('data-render-state="loading"');

  const failureMarkup = renderStyledJsxToStaticMarkup(React.createElement(RendererLoadFailure));
  expect(failureMarkup).toContain('role="alert"');
  expect(failureMarkup).toContain('data-render-state="error"');
  expect(failureMarkup).toContain('문서를 불러오지 못했습니다');
});

test('renderer load boundary resets its failure state for new document data', () => {
  const previousData = { templateId: 'resume', slots: { name: '이전 문서' } } as const;
  const nextData = { templateId: 'resume', slots: { name: '새 문서' } } as const;
  const failedState = { failed: true, resetKey: previousData };

  expect(
    RendererLoadBoundary.getDerivedStateFromProps(
      { resetKey: previousData, children: null },
      failedState,
    ),
  ).toBeNull();
  expect(
    RendererLoadBoundary.getDerivedStateFromProps(
      { resetKey: nextData, children: null },
      failedState,
    ),
  ).toEqual({ failed: false, resetKey: nextData });
});
