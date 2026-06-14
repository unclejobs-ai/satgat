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
  /** URL of the self-hosted @font-face stylesheet to inject for deterministic print. */
  fontsCssUrl?: string;
  /** Extra CSS injected after the fonts (e.g. font-var overrides) for deterministic print. */
  overrideCss?: string;
  /** Navigation/render timeout in ms. */
  timeoutMs?: number;
}

/**
 * Render the page at `url` to a PDF buffer. Throws (never returns a fabricated
 * empty/placeholder PDF) if the page does not load with a 2xx/3xx response.
 */
export async function renderDocumentPdf(url: string, options: RenderOptions = {}): Promise<Uint8Array> {
  const { fontsCssUrl, overrideCss, timeoutMs = 30000 } = options;
  const puppeteer = (await import('puppeteer-core')).default;
  const launcher = await resolveLauncher();
  const browser = await puppeteer.launch(launcher);
  try {
    const page = await browser.newPage();
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    // Status guard: a non-OK navigation must error, not silently print an error page.
    if (!response || !response.ok()) {
      const status = response ? response.status() : 'no response';
      throw new Error(`Preview navigation failed (HTTP ${status}) for ${url}`);
    }
    if (fontsCssUrl) {
      await page.addStyleTag({ url: fontsCssUrl });
    }
    if (overrideCss) {
      await page.addStyleTag({ content: overrideCss });
    }
    // The preview renders the document client-side (React.lazy); wait until the
    // Suspense loading fallback is replaced by the real document.
    await page.waitForFunction(
      () => {
        const stage = document.querySelector('.doc-stage');
        return Boolean(stage) && !(stage as HTMLElement).textContent?.includes('문서를 준비하는 중');
      },
      { timeout: timeoutMs }
    );
    // Wait for the self-hosted faces to load so glyphs never fall back to tofu.
    await page.evaluate(async () => {
      await (document as unknown as { fonts: { ready: Promise<unknown> } }).fonts.ready;
    });
    return await page.pdf({ printBackground: true, preferCSSPageSize: true });
  } finally {
    await browser.close();
  }
}
