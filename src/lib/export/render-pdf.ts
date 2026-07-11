/**
 * satgat — server-side PDF render (headless Chromium).
 *
 * Navigates Chromium to a satgat preview URL on the SAME origin, injects the
 * self-hosted OFL faces (font-display: block) so the print is deterministic
 * (no CDN swap timing / no tofu — see public/fonts/satgat-fonts.css), waits for
 * the fonts to actually load, then prints A4 with backgrounds so the #F7F7F2
 * canvas and 단청 survive.
 *
 * Chromium resolution:
 *   - Vercel / serverless (Linux): `@sparticuz/chromium` (devDependency; the
 *     binary is bundled into the function via next.config outputFileTracingIncludes).
 *   - Local / dev: set CHROMIUM_PATH to a Chrome/Chromium executable
 *     (puppeteer-core does not bundle a browser).
 */

import type { Browser } from 'puppeteer-core';

import type { SatgatDocumentData } from '@/lib/templates/types';
import { draftStorageKey } from '@/lib/preview/draft-id';
import { assertTrustedNavigation, isTrustedPdfRequestUrl } from './trusted-origin';
import { isPdfDocumentBytes, isRenderablePreviewState, type PreviewRenderState } from './render-readiness';
import { createRenderDeadline, withBoundedCleanup } from './render-deadline';

interface Launcher {
  executablePath: string;
  args: string[];
  headless: boolean | 'shell';
}

async function resolveLauncher(): Promise<Launcher> {
  const local = process.env.CHROMIUM_PATH;
  if (local) {
    return { executablePath: local, args: ['--no-sandbox', '--font-render-hinting=none'], headless: true };
  }
  const chromium = (await import('@sparticuz/chromium')).default;
  return {
    executablePath: await chromium.executablePath(),
    args: chromium.args,
    // `headless` was removed from newer @sparticuz/chromium typings; read it defensively.
    headless: (chromium as { headless?: boolean | 'shell' }).headless ?? true,
  };
}

export interface RenderOptions {
  origin: string;
  lang: string;
  data: SatgatDocumentData;
  /** URL of the self-hosted @font-face stylesheet to inject for deterministic print. */
  fontsCssUrl?: string;
  /** Extra CSS injected after the fonts (e.g. font-var overrides) for deterministic print. */
  overrideCss?: string;
  /** Absolute timeout for the complete render lifecycle in ms. */
  timeoutMs?: number;
}

interface PreviewReadiness {
  hasDocument: boolean;
  renderState: PreviewRenderState;
}

const BROWSER_CLOSE_TIMEOUT_MS = 2_000;

function closeBrowser(browser: Browser, signal: AbortSignal): Promise<void> {
  signal.addEventListener('abort', () => {
    browser.process()?.kill('SIGKILL');
  }, { once: true });
  return browser.close();
}

function closeLateBrowser(browser: Browser): Promise<void> {
  return withBoundedCleanup(
    async () => undefined,
    (signal) => closeBrowser(browser, signal),
    BROWSER_CLOSE_TIMEOUT_MS,
  );
}

/**
 * Render a private browser-local draft to a PDF buffer. Throws (never returns a
 * fabricated empty/placeholder PDF) if the preview does not load with a 2xx/3xx
 * response.
 */
export async function renderDocumentPdf(options: RenderOptions): Promise<Uint8Array> {
  const {
    origin,
    lang,
    data,
    fontsCssUrl,
    overrideCss,
    timeoutMs = 45_000,
  } = options;
  const deadline = createRenderDeadline(timeoutMs);
  let browser: Browser | null = null;

  return withBoundedCleanup(async () => {
    const puppeteer = (
      await deadline.run(() => import('puppeteer-core'))
    ).default;
    const launcher = await deadline.run(resolveLauncher);
    const activeBrowser = await deadline.run((signal) => puppeteer.launch({
      ...launcher,
      timeout: deadline.remainingMs(),
      signal,
    }), {
      onLateResolve: closeLateBrowser,
    });
    browser = activeBrowser;

    const page = await deadline.run(() => activeBrowser.newPage());
    await deadline.run(() => page.setRequestInterception(true));
    page.on('request', (request) => {
      if (!isTrustedPdfRequestUrl(request.url(), origin)) {
        void request.abort('blockedbyclient');
        return;
      }
      void request.continue();
    });
    const encodedLang = encodeURIComponent(lang);
    await deadline.run((signal) => page.goto(`${origin}/${encodedLang}`, {
      waitUntil: 'domcontentloaded',
      timeout: deadline.remainingMs(),
      signal,
    }));
    assertTrustedNavigation(page.url(), origin);

    const draftId = crypto.randomUUID();
    await deadline.run(() => page.evaluate(
      ({ key, value }) => sessionStorage.setItem(key, value),
      {
        key: draftStorageKey(draftId),
        value: JSON.stringify(data),
      },
    ));

    const previewUrl = `${origin}/${encodedLang}/preview?draft=${encodeURIComponent(draftId)}`;
    const response = await deadline.run((signal) => page.goto(previewUrl, {
      waitUntil: 'domcontentloaded',
      timeout: deadline.remainingMs(),
      signal,
    }));
    // Status guard: a non-OK navigation must error, not silently print an error page.
    if (!response || !response.ok()) {
      const status = response ? response.status() : 'no response';
      throw new Error(`Preview navigation failed (HTTP ${status}) for ${previewUrl}`);
    }
    assertTrustedNavigation(page.url(), origin);
    if (fontsCssUrl) {
      await deadline.run(() => page.addStyleTag({ url: fontsCssUrl }));
    }
    if (overrideCss) {
      await deadline.run(() => page.addStyleTag({ content: overrideCss }));
    }
    const readinessHandle = await deadline.run((signal) => page.waitForFunction(
      () => {
        const failed = document.querySelector<HTMLElement>(
          '[data-render-state="error"], [data-render-state="missing"]',
        );
        const renderState = failed?.dataset.renderState ?? (
          document.querySelector('[data-render-state="loading"]') ? 'loading' : null
        );
        const hasDocument = document.querySelector('.satgat-document') !== null;
        return hasDocument || renderState === 'error' || renderState === 'missing'
          ? { hasDocument, renderState }
          : false;
      },
      { timeout: deadline.remainingMs(), signal },
    ));
    const readinessValue = await deadline.run(
      async (): Promise<unknown> => readinessHandle.jsonValue(),
    );
    const readiness = readinessValue as PreviewReadiness;
    if (!isRenderablePreviewState(readiness)) {
      throw new Error(`Preview renderer is not printable (${readiness.renderState ?? 'no document'})`);
    }
    await deadline.run(() => page.evaluate(async () => {
      const images = Array.from(document.querySelectorAll<HTMLImageElement>(
        '.satgat-document img',
      ));
      await Promise.all(images.map(async (image) => {
        if (!image.complete) {
          await new Promise<void>((resolve, reject) => {
            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener('error', () => reject(new Error('Document image failed to load')), {
              once: true,
            });
          });
        }
        await image.decode();
        if (image.naturalWidth === 0) throw new Error('Document image failed to decode');
      }));
      await document.fonts.ready;
    }));
    const pdf = await deadline.run(() => page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      timeout: deadline.remainingMs(),
    }));
    if (!isPdfDocumentBytes(pdf)) {
      throw new Error('Chromium did not produce a complete PDF document');
    }
    return pdf;
  }, (signal) => (
    browser ? closeBrowser(browser, signal) : Promise.resolve()
  ), BROWSER_CLOSE_TIMEOUT_MS);
}
