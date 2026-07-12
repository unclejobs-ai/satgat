import { spawn, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { inflateSync } from 'node:zlib';

import { previewFixtures } from './template-preview-fixtures.mjs';
import { readTemplateCatalogSource } from './template-catalog-source.mjs';

const LOOPBACK_HOST = '127.0.0.1';
const CURRENT_DRAFT_ID_KEY = 'satgat:current-draft-id';
const DRAFT_STORAGE_PREFIX = 'satgat:draft:';
const DOCUMENT_SELECTOR = '.satgat-document[data-page-spec]';
const LOCAL_CHROMIUM_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
];
const SERVER_READY_TIMEOUT_MS = 60_000;
const RENDER_TIMEOUT_MS = 60_000;
const PDFINFO_TIMEOUT_MS = 10_000;
const REQUIRED_FONT_FACES = [
  ['Nanum Myeongjo', '400'],
  ['Nanum Myeongjo', '700'],
  ['Nanum Myeongjo', '800'],
  ['Gowun Batang', '400'],
  ['Gowun Batang', '700'],
  ['Noto Serif KR', '400'],
  ['Noto Serif KR', '700'],
  ['Gowun Dodum', '400'],
];
const PNG_SIGNATURE = Buffer.from('89504e470d0a1a0a', 'hex');
const PNG_MAX_CHUNK_BYTES = 64 * 1024 * 1024;
const DETERMINISTIC_CHROMIUM_ARGS = [
  '--disable-gpu',
  '--disable-lcd-text',
  '--font-render-hinting=none',
  '--force-color-profile=srgb',
  '--force-device-scale-factor=1',
];

function isLiveProcess(pid) {
  if (!Number.isSafeInteger(pid) || pid < 1) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error.code === 'ESRCH') return false;
    if (error.code === 'EPERM') return true;
    throw error;
  }
}

export async function acquireRenderLock(root) {
  const lockDirectory = path.join(root, '.render-template-specimens.lock');
  const metadataPath = path.join(lockDirectory, 'owner.json');
  const token = crypto.randomUUID();
  const candidateDirectory = `${lockDirectory}.candidate-${token}`;
  const candidateMetadataPath = path.join(candidateDirectory, 'owner.json');
  const metadata = {
    pid: process.pid,
    token,
    startedAt: new Date().toISOString(),
    root: path.resolve(root),
  };

  await mkdir(candidateDirectory);
  try {
    await writeFile(candidateMetadataPath, `${JSON.stringify(metadata, null, 2)}\n`, { flag: 'wx' });
    for (;;) {
      try {
        await rename(candidateDirectory, lockDirectory);
        return { lockDirectory, metadataPath, token };
      } catch (error) {
        if (!['EEXIST', 'ENOTEMPTY'].includes(error.code)) throw error;
      }

      let owner;
      try {
        owner = JSON.parse(await readFile(metadataPath, 'utf8'));
      } catch (error) {
        if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error;
      }
      if (owner && isLiveProcess(owner.pid)) {
        throw new Error(
          `Specimen render is already running (PID ${owner.pid}, started ${owner.startedAt ?? 'unknown'})`,
        );
      }

      const staleDirectory = `${lockDirectory}.stale-${crypto.randomUUID()}`;
      try {
        await rename(lockDirectory, staleDirectory);
        await rm(staleDirectory, { recursive: true, force: true });
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
  } finally {
    await rm(candidateDirectory, { recursive: true, force: true });
  }
}

export async function releaseRenderLock(lock) {
  if (!lock) return;
  let owner;
  try {
    owner = JSON.parse(await readFile(lock.metadataPath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  if (owner.token !== lock.token || owner.pid !== process.pid) {
    throw new Error('Refusing to release a specimen render lock owned by another process');
  }
  await rm(lock.lockDirectory, { recursive: true });
}

export async function allocateLoopbackPort() {
  const server = net.createServer();
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, LOOPBACK_HOST, resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Failed to allocate a loopback port');
    }
    return address.port;
  } finally {
    await new Promise((resolve, reject) => {
      if (!server.listening) {
        resolve();
        return;
      }
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function remainingMs(deadline) {
  const remaining = deadline - Date.now();
  if (remaining <= 0) throw new Error('Operation deadline exceeded');
  return remaining;
}

async function runBeforeDeadline(deadline, operation, label) {
  const timeoutMs = remainingMs(deadline);
  let timer;
  try {
    return await Promise.race([
      operation(timeoutMs),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function captureFields(captures, id) {
  if (!captures) return {};
  const capture = captures.get(id);
  if (!capture) throw new Error(`Missing capture metadata for template "${id}"`);
  for (const field of ['width', 'height', 'pageCount']) {
    if (!Number.isInteger(capture[field]) || capture[field] < 1) {
      throw new Error(`Invalid ${field} for template "${id}"`);
    }
  }
  return capture;
}

export function buildSpecimenManifest(catalog, captures) {
  const ids = new Set();
  return catalog.map((template) => {
    if (ids.has(template.id)) throw new Error(`Duplicate template id "${template.id}"`);
    ids.add(template.id);
    return {
      id: template.id,
      name: template.name,
      pageSpec: template.pageSpec,
      title: template.specimen.title,
      alt: template.specimen.alt,
      prompt: template.specimen.prompt,
      png: `${template.id}.png`,
      pdf: `${template.id}.pdf`,
      ...captureFields(captures, template.id),
    };
  });
}

export function parseArguments(argv) {
  if (argv.length === 0) return { baseUrl: null };
  if (argv.length === 1 && argv[0].startsWith('--base-url=')) {
    const value = argv[0].slice('--base-url='.length);
    if (!value) throw new Error('--base-url requires a URL');
    return { baseUrl: value };
  }
  if (argv.length === 2 && argv[0] === '--base-url') {
    if (!argv[1] || argv[1].startsWith('--')) throw new Error('--base-url requires a URL');
    return { baseUrl: argv[1] };
  }
  throw new Error('Usage: render-template-specimens.mjs [--base-url <loopback-origin>]');
}

export function normalizeBaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch (error) {
    throw new Error('Base URL must be a valid loopback HTTP(S) origin', { cause: error });
  }
  const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    !loopbackHosts.has(url.hostname) ||
    url.username ||
    url.password
  ) {
    throw new Error('Base URL must be a credential-free loopback HTTP(S) origin');
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Base URL must not include a path, query, or fragment');
  }
  return url.origin;
}

export async function resolveLauncher() {
  if (process.env.CHROMIUM_PATH) {
    await access(process.env.CHROMIUM_PATH, fs.constants.X_OK);
    return {
      executablePath: process.env.CHROMIUM_PATH,
      args: DETERMINISTIC_CHROMIUM_ARGS,
      headless: true,
    };
  }
  for (const executablePath of LOCAL_CHROMIUM_PATHS) {
    try {
      await access(executablePath, fs.constants.X_OK);
      return {
        executablePath,
        args: DETERMINISTIC_CHROMIUM_ARGS,
        headless: true,
      };
    } catch {
      // Continue to the next known local executable.
    }
  }
  const chromium = (await import('@sparticuz/chromium')).default;
  return {
    executablePath: await chromium.executablePath(),
    args: [...new Set([...chromium.args, ...DETERMINISTIC_CHROMIUM_ARGS])],
    headless: chromium.headless ?? true,
  };
}

async function waitForServer(origin, child) {
  const deadline = Date.now() + SERVER_READY_TIMEOUT_MS;
  let lastError;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Production server exited before becoming ready (code ${child.exitCode})`);
    }
    try {
      const response = await fetch(`${origin}/ko`, {
        redirect: 'manual',
        signal: AbortSignal.timeout(remainingMs(deadline)),
      });
      if (response.status >= 200 && response.status < 400) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    const delay = Math.min(250, Math.max(0, deadline - Date.now()));
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error('Timed out waiting for production server', { cause: lastError });
}

export async function startProductionServer(
  root,
  {
    spawnProcess = spawn,
    waitUntilReady = waitForServer,
    stopProcess = stopProductionServer,
    allocatePort = allocateLoopbackPort,
  } = {},
) {
  try {
    await access(path.join(root, '.next', 'BUILD_ID'));
  } catch {
    throw new Error('A production .next build is required; run npm run build first');
  }
  const port = await allocatePort();
  const origin = `http://${LOOPBACK_HOST}:${port}`;
  const child = spawnProcess(
    'npm',
    ['run', 'start', '--', '--hostname', LOOPBACK_HOST, '--port', String(port)],
    { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' },
  );
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk.toString(); });
  child.stderr.on('data', (chunk) => { output += chunk.toString(); });
  try {
    await waitUntilReady(origin, child);
    return { child, origin, port };
  } catch (error) {
    let shutdownError;
    try {
      await stopProcess(child);
    } catch (cleanupError) {
      shutdownError = cleanupError;
    }
    const startupError = new Error(`${error.message}\n${output.trim()}`, { cause: error });
    if (shutdownError) {
      throw new AggregateError([startupError, shutdownError], 'Server startup and shutdown failed');
    }
    throw startupError;
  }
}

export async function stopProductionServer(child) {
  if (!child || child.exitCode !== null) return;
  const exited = new Promise((resolve) => child.once('exit', resolve));
  const signal = (name) => {
    try {
      if (process.platform !== 'win32') process.kill(-child.pid, name);
      else child.kill(name);
    } catch (error) {
      if (error.code !== 'ESRCH') throw error;
    }
  };
  signal('SIGTERM');
  const stopped = await Promise.race([
    exited.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 3_000)),
  ]);
  if (!stopped && child.exitCode === null) {
    signal('SIGKILL');
    await exited;
  }
}

function assertSameOrigin(actual, expectedOrigin) {
  const url = new URL(actual);
  if (url.origin !== expectedOrigin) {
    throw new Error(`Unexpected cross-origin navigation to ${url.origin}`);
  }
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function validatePng(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 8 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('Chromium did not produce a PNG signature');
  }
  let offset = 8;
  let width;
  let height;
  let bitDepth;
  let colorType;
  let sawIhdr = false;
  let sawIdat = false;
  let sawIend = false;
  const idat = [];
  while (offset < bytes.length) {
    if (bytes.length - offset < 12) throw new Error('PNG chunk is truncated before IEND');
    const length = bytes.readUInt32BE(offset);
    if (length > PNG_MAX_CHUNK_BYTES || offset + 12 + length > bytes.length) {
      throw new Error('PNG chunk length exceeds file bounds');
    }
    const type = bytes.subarray(offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    const expectedCrc = bytes.readUInt32BE(offset + 8 + length);
    const actualCrc = crc32(bytes.subarray(offset + 4, offset + 8 + length));
    if (actualCrc !== expectedCrc) throw new Error(`PNG ${type.toString('ascii')} chunk CRC mismatch`);
    const name = type.toString('ascii');
    if (!sawIhdr && name !== 'IHDR') throw new Error('PNG IHDR must be the first chunk');
    if (name === 'IHDR') {
      if (sawIhdr || length !== 13) throw new Error('PNG has an invalid IHDR chunk');
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      [bitDepth, colorType] = data.subarray(8, 10);
      const [, , compression, filter, interlace] = data.subarray(8);
      if (
        width < 1 ||
        height < 1 ||
        !new Map([
          [0, [1, 2, 4, 8, 16]],
          [2, [8, 16]],
          [3, [1, 2, 4, 8]],
          [4, [8, 16]],
          [6, [8, 16]],
        ]).get(colorType)?.includes(bitDepth) ||
        compression !== 0 ||
        filter !== 0 ||
        interlace !== 0
      ) {
        throw new Error('PNG uses an unsupported screenshot format');
      }
      sawIhdr = true;
    } else if (name === 'IDAT') {
      if (!sawIhdr || sawIend) throw new Error('PNG IDAT chunk is out of order');
      sawIdat = true;
      idat.push(data);
    } else if (name === 'IEND') {
      if (length !== 0 || !sawIdat) throw new Error('PNG has an invalid IEND chunk');
      sawIend = true;
      offset += 12;
      if (offset !== bytes.length) throw new Error('PNG has trailing garbage after IEND');
      break;
    }
    offset += 12 + length;
  }
  if (!sawIend) throw new Error('PNG is missing terminal IEND');
  try {
    const channels = new Map([[0, 1], [2, 3], [3, 1], [4, 2], [6, 4]]).get(colorType);
    const rowBytes = Math.ceil((width * channels * bitDepth) / 8);
    const expectedLength = (rowBytes + 1) * height;
    if (!Number.isSafeInteger(expectedLength) || expectedLength > PNG_MAX_CHUNK_BYTES) {
      throw new Error('PNG dimensions exceed validation bounds');
    }
    const pixels = inflateSync(Buffer.concat(idat), { maxOutputLength: expectedLength });
    if (pixels.length !== expectedLength) throw new Error('PNG image data has an invalid length');
    for (let row = 0; row < height; row += 1) {
      if (pixels[row * (rowBytes + 1)] > 4) throw new Error('PNG scanline uses an invalid filter');
    }
  } catch (error) {
    throw new Error('PNG IDAT stream is not valid compressed image data', { cause: error });
  }
  return { width, height };
}

export function assertDirectChildPath(directory, filename) {
  if (!filename || path.basename(filename) !== filename) {
    throw new Error(`Artifact name must be a direct child: ${filename}`);
  }
  const root = path.resolve(directory);
  const candidate = path.resolve(root, filename);
  if (path.dirname(candidate) !== root) {
    throw new Error(`Artifact path escapes staging directory: ${filename}`);
  }
  return candidate;
}

function inspectPdf(pdfPath) {
  const bytes = fs.readFileSync(pdfPath);
  if (bytes.length < 100 || !bytes.subarray(0, 5).equals(Buffer.from('%PDF-')) || !bytes.includes(Buffer.from('%%EOF'))) {
    throw new Error(`Chromium did not produce a complete PDF: ${pdfPath}`);
  }
  const result = spawnSync('pdfinfo', [pdfPath], {
    encoding: 'utf8',
    timeout: PDFINFO_TIMEOUT_MS,
  });
  if (result.error?.code === 'ETIMEDOUT') throw new Error(`pdfinfo timed out for ${pdfPath}`);
  if (result.error) throw new Error(`pdfinfo could not inspect ${pdfPath}`, { cause: result.error });
  if (result.status !== 0) {
    throw new Error(`pdfinfo failed for ${pdfPath}: ${result.stderr.trim()}`);
  }
  const match = result.stdout.match(/^Pages:\s+(\d+)$/m);
  const pageCount = Number(match?.[1]);
  if (!Number.isInteger(pageCount) || pageCount < 1) throw new Error(`Invalid PDF page count: ${pdfPath}`);
  return pageCount;
}

async function renderTemplate({ browser, origin, outputDirectory, template }) {
  const slots = previewFixtures[template.id];
  if (!slots) throw new Error(`Missing preview fixture for template "${template.id}"`);
  const deadline = Date.now() + RENDER_TIMEOUT_MS;
  const page = await runBeforeDeadline(deadline, () => browser.newPage(), 'Opening render page');
  let primaryError;
  let result;
  try {
    await runBeforeDeadline(
      deadline,
      () => page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 }),
      'Setting viewport',
    );
    await runBeforeDeadline(
      deadline,
      () => page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]),
      'Emulating reduced motion',
    );
    await runBeforeDeadline(
      deadline,
      () => page.emulateMediaType('screen'),
      'Enabling screen media',
    );
    await runBeforeDeadline(
      deadline,
      () => page.setRequestInterception(true),
      'Enabling request interception',
    );
    page.on('request', (request) => {
      const url = request.url();
      if (url === 'about:blank' || /^data:image\/(?:avif|gif|jpeg|png|webp);base64,/i.test(url)) {
        void request.continue();
        return;
      }
      try {
        if (new URL(url).origin === origin) {
          void request.continue();
          return;
        }
      } catch {
        // Block malformed and non-URL requests.
      }
      void request.abort('blockedbyclient');
    });

    const bootstrap = await runBeforeDeadline(
      deadline,
      (timeout) => page.goto(`${origin}/ko`, {
        waitUntil: 'domcontentloaded',
        timeout,
        signal: AbortSignal.timeout(timeout),
      }),
      'Bootstrap navigation',
    );
    if (!bootstrap?.ok()) throw new Error(`Bootstrap navigation failed for ${template.id}`);
    assertSameOrigin(page.url(), origin);

    const draftId = crypto.randomUUID();
    await runBeforeDeadline(
      deadline,
      () => page.evaluate(
        ({ currentKey, draftKey, id, value }) => {
          sessionStorage.setItem(draftKey, value);
          sessionStorage.setItem(currentKey, id);
        },
        {
          currentKey: CURRENT_DRAFT_ID_KEY,
          draftKey: `${DRAFT_STORAGE_PREFIX}${draftId}`,
          id: draftId,
          value: JSON.stringify({ templateId: template.id, slots }),
        },
      ),
      'Writing private draft',
    );

    const previewUrl = `${origin}/ko/preview?draft=${encodeURIComponent(draftId)}`;
    const response = await runBeforeDeadline(
      deadline,
      (timeout) => page.goto(previewUrl, {
        waitUntil: 'domcontentloaded',
        timeout,
        signal: AbortSignal.timeout(timeout),
      }),
      'Preview navigation',
    );
    if (!response?.ok()) {
      throw new Error(
        `Preview navigation failed for ${template.id} (HTTP ${response?.status() ?? 'none'})`,
      );
    }
    assertSameOrigin(page.url(), origin);
    await runBeforeDeadline(
      deadline,
      () => page.addStyleTag({ url: `${origin}/fonts/satgat-fonts.css` }),
      'Loading bundled font stylesheet',
    );
    await runBeforeDeadline(
      deadline,
      () => page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation: none !important;
            caret-color: transparent !important;
            transition: none !important;
          }
          body > a[href="#main-content"] { display: none !important; }
        `,
      }),
      'Disabling capture-only motion',
    );

    await runBeforeDeadline(
      deadline,
      (timeout) => page.waitForFunction(
        (selector) => {
          const stateError = document.querySelector(
            '[data-render-state="error"], [data-render-state="missing"]',
          );
          if (stateError) return { error: stateError.textContent?.trim() || 'preview error' };
          const documentElement = document.querySelector(selector);
          const text = document.body.textContent ?? '';
          return documentElement && !text.includes('문서를 준비하는 중')
            ? { ready: true }
            : false;
        },
        { timeout, signal: AbortSignal.timeout(timeout) },
        DOCUMENT_SELECTOR,
      ),
      'Waiting for preview renderer',
    );
    const readiness = await runBeforeDeadline(
      deadline,
      () => page.evaluate(async (selector, requiredFaces) => {
        const stateError = document.querySelector(
          '[data-render-state="error"], [data-render-state="missing"]',
        );
        if (stateError) return { error: stateError.textContent?.trim() || 'preview error' };
        const images = Array.from(document.querySelectorAll(`${selector} img`));
        await Promise.all(images.map(async (image) => {
          if (!image.complete) {
            await new Promise((resolve, reject) => {
              image.addEventListener('load', resolve, { once: true });
              image.addEventListener(
                'error',
                () => reject(new Error('Document image failed to load')),
                { once: true },
              );
            });
          }
          await image.decode();
          if (image.naturalWidth === 0) throw new Error('Document image failed to decode');
        }));
        await Promise.all(
          requiredFaces.map(([family, weight]) => document.fonts.load(
            `${weight} 16px "${family}"`,
            '한글漢字',
          )),
        );
        await document.fonts.ready;
        const loaded = Array.from(document.fonts).map((face) => ({
          family: face.family.replaceAll('"', ''),
          weight: face.weight,
          status: face.status,
        }));
        const missingFonts = requiredFaces.filter(([family, weight]) => !loaded.some(
          (face) => (
            face.family === family &&
            face.weight === weight &&
            face.status === 'loaded' &&
            document.fonts.check(`${weight} 16px "${family}"`, '한글漢字')
          ),
        ));
        return missingFonts.length
          ? { error: `Required bundled fonts are not loaded: ${missingFonts.join(', ')}` }
          : { ready: true };
      }, DOCUMENT_SELECTOR, REQUIRED_FONT_FACES),
      'Waiting for images and bundled fonts',
    );
    if (!readiness.ready) throw new Error(`Preview failed for ${template.id}: ${readiness.error}`);
    await runBeforeDeadline(
      deadline,
      () => page.evaluate(async () => {
        await new Promise((resolve) => requestAnimationFrame(
          () => requestAnimationFrame(resolve),
        ));
      }),
      'Settling deterministic frames',
    );

    const documentElement = await runBeforeDeadline(
      deadline,
      () => page.$(DOCUMENT_SELECTOR),
      'Locating runtime document',
    );
    if (!documentElement) throw new Error(`Runtime document missing for ${template.id}`);
    const pngPath = assertDirectChildPath(outputDirectory, `${template.id}.png`);
    const pdfPath = assertDirectChildPath(outputDirectory, `${template.id}.pdf`);
    await runBeforeDeadline(
      deadline,
      () => documentElement.screenshot({ type: 'png', path: pngPath }),
      'Capturing PNG',
    );
    const dimensions = validatePng(fs.readFileSync(pngPath));

    await runBeforeDeadline(deadline, () => page.emulateMediaType('print'), 'Enabling print media');
    await runBeforeDeadline(
      deadline,
      (timeout) => page.pdf({
        path: pdfPath,
        printBackground: true,
        preferCSSPageSize: true,
        timeout,
      }),
      'Capturing PDF',
    );
    const pageCount = inspectPdf(pdfPath);
    result = { ...dimensions, pageCount };
  } catch (error) {
    primaryError = error;
  }

  const [pageClose] = await Promise.allSettled([
    runBeforeDeadline(Date.now() + 5_000, () => page.close(), 'Closing render page'),
  ]);
  if (primaryError) throw primaryError;
  if (pageClose.status === 'rejected') throw pageClose.reason;
  return result;
}

async function replaceArtifactDirectory(outputDirectory, stagedDirectory) {
  const backupDirectory = `${outputDirectory}.backup-${crypto.randomUUID()}`;
  let backedUp = false;
  try {
    try {
      await rename(outputDirectory, backupDirectory);
      backedUp = true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    await rename(stagedDirectory, outputDirectory);
    if (backedUp) await rm(backupDirectory, { recursive: true, force: true });
  } catch (error) {
    if (backedUp) {
      await rm(outputDirectory, { recursive: true, force: true });
      await rename(backupDirectory, outputDirectory);
    }
    throw error;
  }
}

export async function settleCleanup(primaryError, cleanupOperations) {
  const results = await Promise.allSettled(
    cleanupOperations.map((operation) => Promise.resolve().then(operation)),
  );
  const cleanupErrors = results
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason);
  if (primaryError) throw primaryError;
  if (cleanupErrors.length) throw new AggregateError(cleanupErrors, 'Specimen cleanup failed');
}

export async function renderTemplateSpecimens({ baseUrl } = {}) {
  const root = process.cwd();
  const lock = await acquireRenderLock(root);
  const outputDirectory = path.join(root, 'public/satgat/assets/examples/ko');
  const stagedDirectory = path.join(
    path.dirname(outputDirectory),
    `.ko-specimens-${crypto.randomUUID()}`,
  );
  let server;
  let browser;
  let primaryError;
  let manifest;
  try {
    const catalog = readTemplateCatalogSource();
    if (catalog.length !== 14) {
      throw new Error(`Expected 14 catalog templates, found ${catalog.length}`);
    }
    await mkdir(stagedDirectory, { recursive: true });
    const origin = baseUrl
      ? normalizeBaseUrl(baseUrl)
      : (server = await startProductionServer(root)).origin;
    const puppeteer = (await import('puppeteer-core')).default;
    browser = await puppeteer.launch(await resolveLauncher());
    const captures = new Map();
    for (const template of catalog) {
      const capture = await renderTemplate({
        browser,
        origin,
        outputDirectory: stagedDirectory,
        template,
      });
      captures.set(template.id, capture);
      console.log(
        `Rendered ${template.id}: ${capture.width}x${capture.height}, ${capture.pageCount} page(s)`,
      );
    }
    manifest = buildSpecimenManifest(catalog, captures);
    const manifestPath = assertDirectChildPath(stagedDirectory, 'manifest.json');
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await replaceArtifactDirectory(outputDirectory, stagedDirectory);
  } catch (error) {
    primaryError = error;
  }

  let cleanupError;
  try {
    await settleCleanup(primaryError, [
      () => browser
        ? runBeforeDeadline(Date.now() + 5_000, () => browser.close(), 'Closing browser')
        : Promise.resolve(),
      () => runBeforeDeadline(
        Date.now() + 5_000,
        () => stopProductionServer(server?.child),
        'Stopping production server',
      ),
      () => runBeforeDeadline(
        Date.now() + 5_000,
        () => rm(stagedDirectory, { recursive: true, force: true }),
        'Removing specimen staging directory',
      ),
    ]);
  } catch (error) {
    cleanupError = error;
  }

  try {
    await releaseRenderLock(lock);
  } catch (lockError) {
    if (cleanupError) {
      throw new AggregateError([cleanupError, lockError], 'Specimen cleanup and lock release failed');
    }
    throw lockError;
  }
  if (cleanupError) throw cleanupError;
  return manifest;
}

async function main() {
  const { baseUrl } = parseArguments(process.argv.slice(2));
  await renderTemplateSpecimens({ baseUrl });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
