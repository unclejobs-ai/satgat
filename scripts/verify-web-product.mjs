import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { previewFixtures } from './template-preview-fixtures.mjs';
import { readTemplateCatalogSource } from './template-catalog-source.mjs';
import {
  inspectPdfBytes,
  normalizeBaseUrl,
  resolveLauncher,
} from './render-template-specimens.mjs';

const READY_TIMEOUT_MS = 30_000;
const DOCUMENT_SELECTOR = '.satgat-document[data-page-spec]';
const DRAFT_STORAGE_PREFIX = 'satgat:draft:';
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAGE_SPEC_MM = {
  a4Portrait: { width: 210, height: 297 },
  a4Landscape: { width: 297, height: 210 },
  slide16x9: { width: 297, height: 167 },
  businessCard8Up: { width: 210, height: 297 },
  postcardPortrait: { width: 105, height: 148 },
};

function fail(message) {
  throw new Error(`Web product verification failed: ${message}`);
}

export function assertTemplateCardWidth(width) {
  if (!Number.isFinite(width) || width < 156) {
    fail(`template cards must be at least 156px wide; received ${width}px`);
  }
}

export function assertPreviewUrl(value) {
  let url;
  try {
    url = new URL(value, 'https://satgat.invalid');
  } catch {
    fail('preview URL must use an opaque draft identifier');
  }
  const keys = [...url.searchParams.keys()];
  const draft = url.searchParams.get('draft');
  if (
    !url.pathname.endsWith('/preview') ||
    keys.length !== 1 ||
    keys[0] !== 'draft' ||
    !UUID_V4.test(draft ?? '') ||
    url.hash
  ) {
    fail('preview URL must contain only an opaque draft UUID');
  }
}

export function assertLandingMetrics({ desktopHeight, mobileHeight }) {
  if (!Number.isFinite(desktopHeight) || desktopHeight > 7500) {
    fail(`desktop landing height must not exceed 7500px; received ${desktopHeight}px`);
  }
  if (!Number.isFinite(mobileHeight) || mobileHeight > 12000) {
    fail(`mobile landing height must not exceed 12000px; received ${mobileHeight}px`);
  }
}

const REQUIRED_README_HEADINGS = [
  '## 1분 안에 만들기',
  '## 웹앱 사용',
  '## 셀프호스팅',
  '## AI agent skill',
  '## 14개 문서와 실제 출력 형식',
  '## 데이터 처리와 공유',
  '## 개발·검증',
];
const REQUIRED_README_SNIPPETS = [
  'SATGAT_APP_ORIGIN',
  'app/satgat-tokens.css',
  '4쪽 PDF',
  '실제 `/api/export`',
  '선택한 템플릿의 실제 PNG/PDF',
];

export function assertReadmeContract(readme) {
  const errors = [];
  for (const heading of REQUIRED_README_HEADINGS) {
    if (!readme.split('\n').includes(heading)) errors.push(`missing heading "${heading}"`);
  }
  for (const snippet of REQUIRED_README_SNIPPETS) {
    if (!readme.includes(snippet)) errors.push(`missing runtime claim "${snippet}"`);
  }
  for (const stale of [
    '?data=',
    '13종 specimen',
    'TEMPLATE_SEAL',
    'satgat-ko.html',
    '자동 반영',
    'generated-tokens.ts',
    'CSS·TypeScript 토큰',
  ]) {
    if (readme.includes(stale)) errors.push(`contains stale claim "${stale}"`);
  }
  if (errors.length) fail(`README contract is stale: ${errors.join('; ')}`);
}

function parseArguments(argv) {
  if (argv.length === 2 && argv[0] === '--base-url') return { baseUrl: argv[1] };
  if (argv.length === 1 && argv[0].startsWith('--base-url=')) {
    return { baseUrl: argv[0].slice('--base-url='.length) };
  }
  throw new Error('Usage: verify-web-product.mjs --base-url <loopback-origin>');
}

async function waitForApplication(origin) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/ko`, {
        redirect: 'manual',
        signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())),
      });
      if (response.status >= 200 && response.status < 400) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out after ${READY_TIMEOUT_MS}ms waiting for ${origin}`, { cause: lastError });
}

function expectedTemplateHref(origin, id) {
  return `${origin}/ko/new?template=${encodeURIComponent(id)}`;
}

async function inspectLanding(page, origin, catalog) {
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  const response = await page.goto(`${origin}/ko`, { waitUntil: 'networkidle2', timeout: READY_TIMEOUT_MS });
  if (!response?.ok()) fail(`/ko returned HTTP ${response?.status() ?? 'unknown'}`);

  const desktop = await page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    mainCount: document.querySelectorAll('main').length,
    hasSkipLink: Boolean(document.querySelector('a[href="#main-content"]')),
    text: document.body.innerText,
    hrefs: [...document.querySelectorAll('a[href*="/new?template="]')].map((link) => link.href),
  }));
  if (desktop.mainCount !== 1) fail(`/ko must render one main landmark; found ${desktop.mainCount}`);
  if (!desktop.hasSkipLink) fail('/ko must render a skip link targeting #main-content');
  if (desktop.text.includes('\\u')) fail('/ko renders a literal Unicode escape');

  const actualRoutes = [...new Set(desktop.hrefs)].sort();
  const expectedRoutes = catalog.map(({ id }) => expectedTemplateHref(origin, id)).sort();
  if (actualRoutes.length !== 14 || JSON.stringify(actualRoutes) !== JSON.stringify(expectedRoutes)) {
    fail(`/ko must expose 14 unique canonical template routes; found ${actualRoutes.length}`);
  }

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.reload({ waitUntil: 'networkidle2', timeout: READY_TIMEOUT_MS });
  const mobile = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('a[href*="/new?template="]')];
    const textOverflow = [];
    for (const card of cards) {
      for (const element of [card, ...card.querySelectorAll('*')]) {
        if (
          element instanceof HTMLElement &&
          element.clientWidth > 0 &&
          element.scrollWidth > element.clientWidth + 1
        ) {
          textOverflow.push(element.textContent?.trim().slice(0, 80) || element.tagName);
        }
      }
    }
    return {
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      cardWidths: cards.map((card) => card.getBoundingClientRect().width),
      textOverflow,
      text: document.body.innerText,
    };
  });
  if (mobile.width !== 390) fail(`/ko mobile width must be 390px; received ${mobile.width}px`);
  if (mobile.cardWidths.length !== 14) fail(`/ko mobile must render 14 template cards`);
  for (const width of mobile.cardWidths) assertTemplateCardWidth(width);
  if (mobile.textOverflow.length) fail(`/ko mobile contains text overflow: ${mobile.textOverflow.join(', ')}`);
  if (mobile.text.includes('\\u')) fail('/ko mobile renders a literal Unicode escape');
  assertLandingMetrics({ desktopHeight: desktop.height, mobileHeight: mobile.height });

  return { desktopHeight: desktop.height, mobileHeight: mobile.height };
}

async function tabUntil(page, predicate, limit = 80) {
  for (let index = 0; index < limit; index += 1) {
    await page.keyboard.press('Tab');
    const active = await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) return null;
      return {
        tag: element.tagName,
        ariaLabel: element.getAttribute('aria-label'),
        type: element.getAttribute('type'),
      };
    });
    if (predicate(active)) return active;
  }
  return null;
}

async function inspectCreateFlow(page, origin) {
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  const response = await page.goto(`${origin}/ko/new?template=resume`, {
    waitUntil: 'networkidle2',
    timeout: READY_TIMEOUT_MS,
  });
  if (!response?.ok()) fail(`/ko/new returned HTTP ${response?.status() ?? 'unknown'}`);

  const initial = await page.evaluate(() => {
    const card = document.querySelector('[aria-label="이력서 템플릿 선택"]');
    const submit = document.querySelector('button[type="submit"]');
    const example = document.querySelector('a[href$="/examples#resume"]');
    return {
      selected: card?.getAttribute('aria-pressed'),
      cardLabel: card?.getAttribute('aria-label'),
      submitDisabled: submit instanceof HTMLButtonElement ? submit.disabled : null,
      exampleHref: example?.getAttribute('href'),
      exampleText: example?.textContent?.trim(),
    };
  });
  if (initial.selected !== 'true' || initial.cardLabel !== '이력서 템플릿 선택') {
    fail('resume query must select a concise accessible resume card');
  }
  if (initial.submitDisabled !== true) fail('generation CTA must begin disabled');
  if (
    initial.exampleHref !== '/ko/examples#resume' ||
    initial.exampleText !== '이력서 완성 예시 보기'
  ) {
    fail('selected template must link directly to its matching runtime example');
  }

  await page.evaluate(() => document.body.focus());
  const cardFocus = await tabUntil(page, (active) => active?.ariaLabel === '이력서 템플릿 선택');
  if (!cardFocus) fail('keyboard tab order does not reach the resume card');
  const textareaFocus = await tabUntil(page, (active) => active?.tag === 'TEXTAREA');
  if (!textareaFocus) fail('keyboard tab order does not reach the prompt textarea');

  await page.keyboard.type('2026년 경력과 핵심 역량을 중심으로 이력서를 작성해 주세요.');
  const enabled = await page.evaluate(() => {
    const submit = document.querySelector('button[type="submit"]');
    return submit instanceof HTMLButtonElement && !submit.disabled;
  });
  if (!enabled) fail('generation CTA must enable after a valid prompt');

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(`${origin}/ko/new?template=resume`, {
    waitUntil: 'networkidle2',
    timeout: READY_TIMEOUT_MS,
  });
  const mobile = await page.evaluate(() => {
    const controls = [...document.querySelectorAll('textarea, button, input')];
    return {
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      clippedControls: controls
        .map((control) => control.getBoundingClientRect())
        .filter((rect) => rect.width > 0 && (rect.left < -1 || rect.right > window.innerWidth + 1))
        .length,
    };
  });
  if (mobile.scrollWidth !== mobile.viewportWidth || mobile.clippedControls > 0) {
    fail('/ko/new mobile layout must not overflow or clip controls');
  }
}

function pointsFromMm(value) {
  return value * 72 / 25.4;
}

function assertPdfGeometry(pdfBytes, pageSpec, expectedPageCount) {
  if (pdfBytes.byteLength < 1000) fail(`${pageSpec} PDF is empty`);
  const geometry = PAGE_SPEC_MM[pageSpec];
  if (!geometry) fail(`unknown page spec ${pageSpec}`);
  let pdf;
  try {
    pdf = inspectPdfBytes(Buffer.from(pdfBytes));
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
  if (pdf.pageCount !== expectedPageCount) {
    fail(`${pageSpec} PDF page count ${pdf.pageCount} does not match ${expectedPageCount}`);
  }
  const expectedWidth = pointsFromMm(geometry.width);
  const expectedHeight = pointsFromMm(geometry.height);
  for (const [index, box] of pdf.mediaBoxes.entries()) {
    if (
      Math.abs(box.width - expectedWidth) > 1 ||
      Math.abs(box.height - expectedHeight) > 1
    ) {
      fail(
        `${pageSpec} PDF page ${index + 1} MediaBox ${box.width}x${box.height}pt ` +
        `does not match ${expectedWidth.toFixed(2)}x${expectedHeight.toFixed(2)}pt`,
      );
    }
  }
}

async function inspectTemplatePreview(page, origin, template) {
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  const fixture = previewFixtures[template.id];
  if (!fixture) fail(`missing preview fixture for ${template.id}`);
  const draftId = crypto.randomUUID();
  const draftUrl = `/ko/preview?draft=${draftId}`;
  assertPreviewUrl(draftUrl);
  if (draftUrl.includes('data=') || draftUrl.includes(template.specimen.prompt)) {
    fail(`${template.id} preview URL exposes fixture content`);
  }

  await page.goto(`${origin}/ko/new`, { waitUntil: 'domcontentloaded', timeout: READY_TIMEOUT_MS });
  await page.evaluate(
    ({ key, data }) => sessionStorage.setItem(key, JSON.stringify(data)),
    {
      key: `${DRAFT_STORAGE_PREFIX}${draftId}`,
      data: { templateId: template.id, slots: fixture },
    },
  );
  const response = await page.goto(`${origin}${draftUrl}`, {
    waitUntil: 'networkidle2',
    timeout: READY_TIMEOUT_MS,
  });
  if (!response?.ok()) fail(`${template.id} preview returned HTTP ${response?.status() ?? 'unknown'}`);
  await page.waitForSelector(DOCUMENT_SELECTOR, { timeout: READY_TIMEOUT_MS });
  await page.waitForFunction(
    () => !document.body.innerText.includes('문서를 준비하는 중'),
    { timeout: READY_TIMEOUT_MS },
  );
  await page.evaluate(() => document.fonts.ready);

  const state = await page.evaluate(() => {
    const roots = [...document.querySelectorAll('.satgat-document[data-page-spec]')];
    return {
      pageSpecs: roots.map((root) => root.getAttribute('data-page-spec')),
      renderStates: [...document.querySelectorAll('[data-render-state]')].map((node) => node.getAttribute('data-render-state')),
      text: document.body.innerText,
      dimensions: roots.map((root) => {
        const rect = root.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }),
    };
  });

  if (!state.pageSpecs.length || state.pageSpecs.some((value) => value !== template.pageSpec)) {
    fail(`${template.id} preview page spec does not match ${template.pageSpec}: ${state.pageSpecs.join(', ')}`);
  }
  if (state.renderStates.some((value) => value === 'loading' || value === 'error' || value === 'missing')) {
    fail(`${template.id} preview retained a fallback render state`);
  }
  if (state.text.includes('\\u')) fail(`${template.id} preview renders a literal Unicode escape`);

  const expected = PAGE_SPEC_MM[template.pageSpec];
  for (const dimension of state.dimensions) {
    const expectedWidth = expected.width * 96 / 25.4;
    const expectedHeight = expected.height * 96 / 25.4;
    if (Math.abs(dimension.width - expectedWidth) > 2 || Math.abs(dimension.height - expectedHeight) > 2) {
      fail(`${template.id} screen canvas ${dimension.width}x${dimension.height}px does not match ${template.pageSpec}`);
    }
  }

  await page.emulateMediaType('print');
  const pdfBytes = await page.pdf({
    printBackground: true,
    preferCSSPageSize: true,
    timeout: READY_TIMEOUT_MS,
  });
  assertPdfGeometry(pdfBytes, template.pageSpec, state.pageSpecs.length);
  await page.emulateMediaType('screen');

  return { id: template.id, pages: state.pageSpecs.length, pdfBytes: pdfBytes.byteLength };
}

async function inspectMobilePreview(page, origin, template, inspectShareDialog) {
  const fixture = previewFixtures[template.id];
  const draftId = crypto.randomUUID();
  await page.goto(`${origin}/ko/new`, { waitUntil: 'domcontentloaded', timeout: READY_TIMEOUT_MS });
  await page.evaluate(
    ({ key, data }) => sessionStorage.setItem(key, JSON.stringify(data)),
    {
      key: `${DRAFT_STORAGE_PREFIX}${draftId}`,
      data: { templateId: template.id, slots: fixture },
    },
  );
  await page.goto(`${origin}/ko/preview?draft=${draftId}`, {
    waitUntil: 'networkidle2',
    timeout: READY_TIMEOUT_MS,
  });
  await page.waitForSelector(DOCUMENT_SELECTOR, { timeout: READY_TIMEOUT_MS });
  await page.waitForFunction(
    () => !document.body.innerText.includes('문서를 준비하는 중'),
    { timeout: READY_TIMEOUT_MS },
  );
  const mobile = await page.evaluate(() => {
    const roots = [...document.querySelectorAll('.satgat-document[data-page-spec]')];
    const toolbar = document.querySelector('.preview-toolbar');
    const bounds = [toolbar, ...roots]
      .filter((node) => node instanceof HTMLElement)
      .map((node) => node.getBoundingClientRect());
    return {
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      clipped: bounds.filter((rect) => rect.left < -1 || rect.right > window.innerWidth + 1).length,
    };
  });
  if (mobile.scrollWidth !== mobile.viewportWidth || mobile.clipped > 0) {
    fail(`${template.id} mobile preview must fit the viewport`);
  }
  if (inspectShareDialog) {
    await page.click('.tb-copy');
    const dialogFits = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!(dialog instanceof HTMLElement)) return false;
      const rect = dialog.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= window.innerWidth;
    });
    if (!dialogFits) fail('mobile share dialog must fit the viewport');
    await page.keyboard.press('Escape');
    const focusReturned = await page.evaluate(
      () => document.activeElement?.classList.contains('tb-copy') ?? false,
    );
    if (!focusReturned) fail('mobile share dialog must restore trigger focus after Escape');
  }
}

async function inspectServerExport(origin, template, expectedPageCount) {
  const response = await fetch(`${origin}/api/export`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      templateId: template.id,
      slots: previewFixtures[template.id],
    }),
    signal: AbortSignal.timeout(READY_TIMEOUT_MS),
  });
  if (!response.ok) fail(`/api/export returned HTTP ${response.status}`);
  if (!response.headers.get('content-type')?.includes('application/pdf')) {
    fail('/api/export must return application/pdf');
  }
  assertPdfGeometry(await response.arrayBuffer(), template.pageSpec, expectedPageCount);
}

export async function verifyWebProduct(baseUrl) {
  const origin = normalizeBaseUrl(baseUrl);
  assertReadmeContract(fs.readFileSync(path.join(process.cwd(), 'README.md'), 'utf8'));
  await waitForApplication(origin);
  const catalog = readTemplateCatalogSource();
  if (catalog.length !== 14) fail(`catalog must contain 14 templates; found ${catalog.length}`);

  const puppeteer = (await import('puppeteer-core')).default;
  const browser = await puppeteer.launch(await resolveLauncher());
  try {
    const page = await browser.newPage();
    const landing = await inspectLanding(page, origin, catalog);
    await inspectCreateFlow(page, origin);
    const templates = [];
    for (const template of catalog) {
      templates.push(await inspectTemplatePreview(page, origin, template));
    }
    const exportTemplate = catalog.find(({ id }) => id === 'resume');
    const exportResult = templates.find(({ id }) => id === 'resume');
    if (!exportTemplate || !exportResult) fail('resume export fixture is unavailable');
    await inspectServerExport(origin, exportTemplate, exportResult.pages);

    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    const representatives = new Map();
    for (const template of catalog) {
      if (!representatives.has(template.pageSpec)) representatives.set(template.pageSpec, template);
    }
    let firstMobile = true;
    for (const template of representatives.values()) {
      await inspectMobilePreview(page, origin, template, firstMobile);
      firstMobile = false;
    }
    await page.close();
    return { landing, templates };
  } finally {
    await browser.close();
  }
}

async function main() {
  const { baseUrl } = parseArguments(process.argv.slice(2));
  const result = await verifyWebProduct(baseUrl);
  const pageCount = result.templates.reduce((sum, template) => sum + template.pages, 0);
  console.log(
    `Web product verified: 14 templates, ${pageCount} rendered page(s), ` +
    `${result.landing.desktopHeight}px desktop landing, ${result.landing.mobileHeight}px mobile landing`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
