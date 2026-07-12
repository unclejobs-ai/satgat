import { afterEach, describe, expect, test } from 'bun:test';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  acquireRenderLock,
  allocateLoopbackPort,
  assertDirectChildPath,
  buildSpecimenManifest,
  normalizeBaseUrl,
  parseArguments,
  resolveLauncher,
  releaseRenderLock,
  settleCleanup,
  stopProductionServer,
  startProductionServer,
  validatePng,
} from './render-template-specimens.mjs';
import {
  readTemplateCatalogSource,
  readTemplateDefinitionSources,
} from './template-catalog-source.mjs';
import { isSafeFixtureImageSource } from './verify-template-catalog.mjs';

const catalog = [
  {
    id: 'resume',
    name: '이력서',
    pageSpec: 'a4Portrait',
    specimen: {
      title: '김수민 이력서',
      alt: '김수민 이력서 완성 예시',
      prompt: '이력서',
    },
  },
  {
    id: 'report',
    name: '보고서',
    pageSpec: 'a4Portrait',
    specimen: {
      title: '2026년 1분기 운영 보고서',
      alt: '2026년 1분기 운영 보고서 완성 예시',
      prompt: '보고서',
    },
  },
];

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

async function temporaryCatalog(files) {
  const directory = await mkdtemp(join(tmpdir(), 'satgat-catalog-'));
  temporaryDirectories.push(directory);
  await Promise.all(
    Object.entries(files).map(([name, source]) => writeFile(join(directory, name), source)),
  );
  return directory;
}

function definition(id, overrides = '') {
  return `export const template = {
    id: '${id}',
    name: '${id} 이름',
    pageSpec: 'a4Portrait',
    specimen: { title: '${id} 제목', alt: '${id} 대체 텍스트', prompt: '${id} 프롬프트' },
    ${overrides}
  };`;
}

function validationDefinition(required = 'true') {
  return `export const template = {
    id: 'resume',
    name: '이력서',
    category: 'personal',
    pageSpec: 'a4Portrait',
    slots: [{ id: 'name', type: 'text', required: ${required} }],
    contentOutline: [{ type: 'text', slots: ['name'] }],
    promptSeeds: ['이력서를 작성해줘'],
    factChecklist: ['이름'],
    specimen: { title: '제목', alt: '대체 텍스트', prompt: '프롬프트' },
  };`;
}

describe('buildSpecimenManifest', () => {
  test('emits only canonical runtime artifact metadata', () => {
    expect(buildSpecimenManifest(catalog)).toEqual([
      {
        id: 'resume',
        name: '이력서',
        pageSpec: 'a4Portrait',
        title: '김수민 이력서',
        alt: '김수민 이력서 완성 예시',
        prompt: '이력서',
        png: 'resume.png',
        pdf: 'resume.pdf',
      },
      {
        id: 'report',
        name: '보고서',
        pageSpec: 'a4Portrait',
        title: '2026년 1분기 운영 보고서',
        alt: '2026년 1분기 운영 보고서 완성 예시',
        prompt: '보고서',
        png: 'report.png',
        pdf: 'report.pdf',
      },
    ]);
  });

  test('adds measured dimensions and page count only when capture metadata is supplied', () => {
    const captures = new Map([
      ['resume', { width: 794, height: 1123, pageCount: 1 }],
      ['report', { width: 794, height: 2246, pageCount: 2 }],
    ]);

    expect(buildSpecimenManifest(catalog, captures).map((entry) => ({
      id: entry.id,
      width: entry.width,
      height: entry.height,
      pageCount: entry.pageCount,
    }))).toEqual([
      { id: 'resume', width: 794, height: 1123, pageCount: 1 },
      { id: 'report', width: 794, height: 2246, pageCount: 2 },
    ]);
  });
});

describe('generator input boundaries', () => {
  test('accepts only the documented CLI shapes', () => {
    expect(parseArguments([])).toEqual({ baseUrl: null });
    expect(parseArguments(['--base-url', 'http://localhost:3100'])).toEqual({
      baseUrl: 'http://localhost:3100',
    });
    expect(parseArguments(['--base-url=http://127.0.0.1:3100'])).toEqual({
      baseUrl: 'http://127.0.0.1:3100',
    });

    for (const argv of [
      ['positional'],
      ['--unknown'],
      ['--base-url'],
      ['--base-url', 'http://localhost:3100', '--base-url=http://localhost:3100'],
      ['--base-url=http://localhost:3100', 'extra'],
    ]) {
      expect(() => parseArguments(argv)).toThrow();
    }
  });

  test('accepts only credential-free loopback origins', () => {
    for (const value of [
      'http://localhost:3100',
      'https://127.0.0.1:3100',
      'http://[::1]:3100',
    ]) {
      expect(normalizeBaseUrl(value)).toBe(new URL(value).origin);
    }
    for (const value of [
      'https://example.com',
      'http://0.0.0.0:3100',
      'http://user:pass@localhost:3100',
      'http://localhost:3100/ko',
      'http://localhost:3100/?query=1',
      'http://localhost:3100/#hash',
    ]) {
      expect(() => normalizeBaseUrl(value)).toThrow();
    }
  });

  test('resolves artifacts only as direct staging children', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'satgat-artifacts-'));
    temporaryDirectories.push(directory);
    expect(assertDirectChildPath(directory, 'resume.png')).toBe(join(directory, 'resume.png'));
    for (const name of ['../escaped.png', '/tmp/escaped.png', '.', 'nested/file.png']) {
      expect(() => assertDirectChildPath(directory, name)).toThrow();
    }
    expect(await readFile(join(directory, '..', 'escaped.png')).catch(() => null)).toBeNull();
  });

  test('fully validates PNG chunks and compressed image data', () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    );
    expect(validatePng(png)).toEqual({ width: 1, height: 1 });
    expect(() => validatePng(png.subarray(0, png.length - 4))).toThrow();
    const badCrc = Buffer.from(png);
    badCrc[29] ^= 1;
    expect(() => validatePng(badCrc)).toThrow(/CRC/);
    const missingIend = png.subarray(0, png.length - 12);
    expect(() => validatePng(missingIend)).toThrow(/IEND/);
    expect(() => validatePng(Buffer.concat([png, Buffer.from([0])]))).toThrow(/trailing/);
  });

  test('keeps sandboxing enabled for an ordinary local Chromium executable', async () => {
    const previousPath = process.env.CHROMIUM_PATH;
    process.env.CHROMIUM_PATH = '/bin/sh';
    try {
      expect((await resolveLauncher()).args).toEqual([
        '--disable-gpu',
        '--disable-lcd-text',
        '--font-render-hinting=none',
        '--force-color-profile=srgb',
        '--force-device-scale-factor=1',
      ]);
    } finally {
      if (previousPath === undefined) delete process.env.CHROMIUM_PATH;
      else process.env.CHROMIUM_PATH = previousPath;
    }
  });

  test('fails fast for a live render lock and recovers a dead owner lock', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'satgat-render-lock-'));
    temporaryDirectories.push(directory);
    const first = await acquireRenderLock(directory);
    await expect(acquireRenderLock(directory)).rejects.toThrow(
      `Specimen render is already running (PID ${process.pid}`,
    );
    await releaseRenderLock(first);

    const lockDirectory = join(directory, '.render-template-specimens.lock');
    await mkdir(lockDirectory);
    await writeFile(join(lockDirectory, 'owner.json'), JSON.stringify({
      pid: 2_147_483_647,
      token: 'dead-owner',
      startedAt: '2000-01-01T00:00:00.000Z',
      root: directory,
    }));
    const recovered = await acquireRenderLock(directory);
    expect(recovered.token).not.toBe('dead-owner');
    await releaseRenderLock(recovered);
    expect(await readFile(join(lockDirectory, 'owner.json')).catch(() => null)).toBeNull();
  });

  test('scopes locks to a repository root', async () => {
    const firstRoot = await mkdtemp(join(tmpdir(), 'satgat-render-root-a-'));
    const secondRoot = await mkdtemp(join(tmpdir(), 'satgat-render-root-b-'));
    temporaryDirectories.push(firstRoot, secondRoot);
    const [first, second] = await Promise.all([
      acquireRenderLock(firstRoot),
      acquireRenderLock(secondRoot),
    ]);
    expect(first.lockDirectory).not.toBe(second.lockDirectory);
    const [firstPort, secondPort] = await Promise.all([
      allocateLoopbackPort(),
      allocateLoopbackPort(),
    ]);
    expect(firstPort).not.toBe(secondPort);
    await Promise.all([releaseRenderLock(first), releaseRenderLock(second)]);
  });

  test('allocates an ephemeral loopback port and passes it through server startup', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'satgat-server-port-'));
    temporaryDirectories.push(directory);
    await mkdir(join(directory, '.next'), { recursive: true });
    await writeFile(join(directory, '.next', 'BUILD_ID'), 'test');
    const fakeStream = { on() {} };
    const child = { stdout: fakeStream, stderr: fakeStream };
    let invocation;
    let readinessOrigin;
    const server = await startProductionServer(directory, {
      allocatePort: async () => 43_219,
      spawnProcess: (...args) => {
        invocation = args;
        return child;
      },
      waitUntilReady: async (origin) => {
        readinessOrigin = origin;
      },
    });
    expect(invocation[1]).toEqual([
      'run', 'start', '--', '--hostname', '127.0.0.1', '--port', '43219',
    ]);
    expect(server).toEqual({
      child,
      origin: 'http://127.0.0.1:43219',
      port: 43_219,
    });
    expect(readinessOrigin).toBe(server.origin);
    expect(await allocateLoopbackPort()).toBeGreaterThan(0);
  });

  test('attempts every cleanup and preserves a primary render failure', async () => {
    const calls = [];
    const primary = new Error('render failed');
    await expect(settleCleanup(primary, [
      () => {
        calls.push('browser');
        throw new Error('browser close failed');
      },
      async () => {
        calls.push('server');
      },
      async () => {
        calls.push('staging');
      },
    ])).rejects.toBe(primary);
    expect(calls.sort()).toEqual(['browser', 'server', 'staging']);

    await expect(settleCleanup(undefined, [
      async () => {
        throw new Error('browser close failed');
      },
      async () => {
        throw new Error('server stop failed');
      },
    ])).rejects.toBeInstanceOf(AggregateError);
  });

  test('awaits the shared shutdown path after startup readiness fails', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'satgat-server-start-'));
    temporaryDirectories.push(directory);
    await mkdir(join(directory, '.next'), { recursive: true });
    await writeFile(join(directory, '.next', 'BUILD_ID'), 'test');
    const fakeStream = { on() {} };
    const child = { stdout: fakeStream, stderr: fakeStream };
    let stopped = false;

    await expect(startProductionServer(directory, {
      spawnProcess: () => child,
      waitUntilReady: async () => {
        throw new Error('readiness failed');
      },
      stopProcess: async (stoppedChild) => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        stopped = stoppedChild === child;
      },
    })).rejects.toThrow('readiness failed');
    expect(stopped).toBe(true);
  });

  test('terminates and awaits a detached server process group', async () => {
    if (process.platform === 'win32') return;
    const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
      detached: true,
      stdio: 'ignore',
    });
    await new Promise((resolve, reject) => {
      child.once('spawn', resolve);
      child.once('error', reject);
    });
    await stopProductionServer(child);
    expect(child.exitCode ?? child.signalCode).not.toBeNull();
  });
});

describe('fixture image privacy', () => {
  test('matches runtime safe local/raster policy', () => {
    expect(isSafeFixtureImageSource('/uploads/photo.webp')).toBe(true);
    expect(isSafeFixtureImageSource('data:image/png;base64,aGVsbG8=')).toBe(true);
    for (const value of [
      'http://localhost/photo.png',
      'https://tracker.example/pixel.png',
      '//tracker.example/pixel.png',
      'blob:https://localhost/id',
      'file:///tmp/photo.png',
      'data:image/svg+xml,<svg/>',
      '/uploads/payload.svg',
      '../photo.png',
      './photo.png',
    ]) {
      expect(isSafeFixtureImageSource(value)).toBe(false);
    }
    expect(isSafeFixtureImageSource(`data:image/png;base64,${'a'.repeat(1_500_000)}`)).toBe(false);
  });
});

describe('readTemplateCatalogSource', () => {
  test('extracts literal catalog metadata in stable file order', async () => {
    const directory = await temporaryCatalog({
      'b.ts': definition('report'),
      'a.ts': definition('resume'),
    });

    expect(readTemplateCatalogSource({ definitionDir: directory })).toEqual([
      {
        id: 'resume',
        name: 'resume 이름',
        pageSpec: 'a4Portrait',
        specimen: {
          title: 'resume 제목',
          alt: 'resume 대체 텍스트',
          prompt: 'resume 프롬프트',
        },
      },
      {
        id: 'report',
        name: 'report 이름',
        pageSpec: 'a4Portrait',
        specimen: {
          title: 'report 제목',
          alt: 'report 대체 텍스트',
          prompt: 'report 프롬프트',
        },
      },
    ]);
  });

  test('rejects duplicate IDs', async () => {
    const directory = await temporaryCatalog({
      'a.ts': definition('resume'),
      'b.ts': definition('resume'),
    });

    expect(() => readTemplateCatalogSource({ definitionDir: directory })).toThrow('Duplicate template id');
  });

  test('rejects nonliteral required metadata', async () => {
    const directory = await temporaryCatalog({
      'a.ts': `const name = '이력서'; export const template = {
        id: 'resume', name, pageSpec: 'a4Portrait',
        specimen: { title: '제목', alt: '대체 텍스트', prompt: '프롬프트' },
      };`,
    });

    expect(() => readTemplateCatalogSource({ definitionDir: directory })).toThrow('literal string');
  });

  test('rejects non-boolean or missing required initializers', async () => {
    for (const required of ['flag', "'false'", '0', '']) {
      const directory = await temporaryCatalog({
        'a.ts': validationDefinition(required),
      });
      expect(() => readTemplateDefinitionSources({ definitionDir: directory })).toThrow(
        'required must be a literal boolean',
      );
    }
    const trueDirectory = await temporaryCatalog({ 'a.ts': validationDefinition('true') });
    const falseDirectory = await temporaryCatalog({ 'a.ts': validationDefinition('false') });
    expect(readTemplateDefinitionSources({ definitionDir: trueDirectory })[0].slots[0].required).toBe(true);
    expect(readTemplateDefinitionSources({ definitionDir: falseDirectory })[0].slots[0].required).toBe(false);
  });

  test('rejects unsafe catalog identifiers', async () => {
    for (const id of ['../escaped', '/absolute', 'Uppercase', '']) {
      const directory = await temporaryCatalog({ 'a.ts': definition(id) });
      expect(() => readTemplateCatalogSource({ definitionDir: directory })).toThrow(
        'canonical lowercase slug',
      );
    }
  });
});
