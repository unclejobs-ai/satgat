#!/usr/bin/env node
/**
 * satgat PDF export feasibility spike / reference harness (G001 gate).
 *
 * Proves a headless-Chromium PDF of a satgat document embeds the self-hosted
 * 명조/바탕 faces (no fallback/tofu) and preserves the #F7F7F2 canvas + 단청
 * via printBackground. This is the same render→print pattern the production
 * export route (app/api/export) uses.
 *
 * Chromium resolution (the route will reuse this contract):
 *   - Vercel/serverless (Linux): `@sparticuz/chromium`
 *       const chromium = (await import('@sparticuz/chromium')).default;
 *       executablePath = await chromium.executablePath();
 *       args = chromium.args; headless = chromium.headless;
 *   - Local/dev: set CHROMIUM_PATH=/path/to/Chrome (puppeteer-core does not
 *     bundle a browser). On macOS that is typically
 *     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome".
 *
 * The font-embed correctness (Nanum Myeongjo present in the PDF font table) is
 * the hard GO/NO-GO criterion; serverless size/cold-start is a deploy-time note
 * (@sparticuz/chromium is purpose-built for the ~50MB Lambda/Vercel limit).
 *
 * Usage:
 *   CHROMIUM_PATH="…/Google Chrome" node scripts/spike-pdf.mjs [url] [out.pdf]
 *   (default url http://localhost:8899/_spike.html, out /tmp/spike.pdf)
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

async function resolveLauncher() {
  const local = process.env.CHROMIUM_PATH;
  if (local) {
    return { executablePath: local, args: ['--no-sandbox', '--font-render-hinting=none'], headless: true };
  }
  // Serverless path (Linux). Won't launch on macOS — Linux binary by design.
  const chromium = (await import('@sparticuz/chromium')).default;
  return {
    executablePath: await chromium.executablePath(),
    args: chromium.args,
    headless: chromium.headless,
  };
}

export async function renderPdf(url, outPath) {
  const puppeteer = (await import('puppeteer-core')).default;
  const launch = await resolveLauncher();
  const browser = await puppeteer.launch(launch);
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.evaluate(async () => {
      // @ts-ignore — browser API
      await document.fonts.ready;
    });
    const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true });
    if (outPath) writeFileSync(outPath, pdf);
    return pdf;
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const url = process.argv[2] || 'http://localhost:8899/_spike.html';
  const out = process.argv[3] || '/tmp/spike.pdf';
  renderPdf(url, out)
    .then(() => console.log(`spike-pdf: wrote ${out}`))
    .catch((err) => {
      console.error('spike-pdf failed:', err.message);
      process.exit(1);
    });
}
