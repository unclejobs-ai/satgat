#!/usr/bin/env node
/**
 * satgat CLI
 *
 * 사용:
 *   npx satgat                 도움말
 *   npx satgat init <dir>      새 satgat 워크스페이스 스캐폴드
 *   npx satgat skill <dir>     Claude Code/일반 AI 에이전트용 skill 폴더 출력
 *   npx satgat dev             로컬 dev 서버 (이 패키지 안에서)
 *   npx satgat build           프로덕션 빌드
 *
 * 철학: 의존성 가볍게. node 표준 라이브러리만 사용.
 */

import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile, readdir, copyFile } from 'node:fs/promises';
// readFile, writeFile used by init flow
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, basename } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), '..');

const HELP = `\n  satgat — 한지 위에 먹글씨. AI가 옮겨 적는 한국형 문서 디자인 시스템.\n\n  사용:\n    npx satgat init <dir>     새 satgat 워크스페이스 만들기 (next 앱 + 13종 템플릿)\n    npx satgat skill <dir>    AI 에이전트용 satgat skill 폴더 내보내기\n    npx satgat dev            로컬 dev 서버 시작 (next dev)\n    npx satgat build          프로덕션 빌드 (next build)\n    npx satgat start          프로덕션 서버 (next start)\n    npx satgat help           이 도움말\n\n  Claude/Codex/Gemini 호출 예시:\n    "이력서 한 장 만들어 주세요. 7년차 프론트엔드, 카카오·무신사·29CM."\n    "신년 연하장 — 박상세 가족, 단정한 톤으로."\n    "스타트업 IR 덱 한 벌, 시드 단계, 단청 강조."\n\n  문서: https://github.com/EungjePark/satgat\n`;

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function runNext(args) {
  const next = spawn('npx', ['next', ...args], { stdio: 'inherit', cwd: process.cwd() });
  next.on('exit', (code) => process.exit(code ?? 0));
}

function git(args, opts = {}) {
  return new Promise((resolveP, rejectP) => {
    const p = spawn('git', args, { stdio: 'inherit', ...opts });
    p.on('exit', (code) => (code === 0 ? resolveP() : rejectP(new Error(`git ${args[0]} exited ${code}`))));
  });
}

async function init(target) {
  if (!target) {
    console.error('Error: target 디렉토리 필요. 예: npx satgat init my-satgat');
    process.exit(1);
  }
  const dest = resolve(process.cwd(), target);
  if (existsSync(dest)) {
    console.error(`Error: ${dest} 이미 존재합니다.`);
    process.exit(1);
  }
  console.log(`satgat 워크스페이스를 ${dest}에 git clone 합니다...`);
  try {
    await git(['clone', '--depth', '1', 'https://github.com/EungjePark/satgat.git', dest]);
  } catch (err) {
    console.error('git clone 실패:', err.message);
    console.error('git 설치 + 네트워크 확인 후 다시 시도하세요.');
    process.exit(1);
  }
  // package.json 정리
  const pkgPath = join(dest, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    pkg.name = basename(dest);
    pkg.private = true;
    delete pkg.bin;
    delete pkg.files;
    await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }
  console.log(`\n완료. 다음 단계:\n  cd ${target}\n  npm install\n  echo "GOOGLE_GENERATIVE_AI_API_KEY=<키>" > .env.local\n  npm run dev\n`);
}

async function skill(target) {
  if (!target) {
    console.error('Error: target 디렉토리 필요. 예: npx satgat skill ~/.claude/skills/satgat');
    process.exit(1);
  }
  const dest = resolve(process.cwd(), target);
  await mkdir(dest, { recursive: true });

  const skillSrc = join(ROOT, 'skills', 'satgat');
  if (existsSync(skillSrc)) {
    await copyDir(skillSrc, dest);
  }

  // references 동봉
  const refSrc = join(ROOT, 'references');
  if (existsSync(refSrc)) {
    await copyDir(refSrc, join(dest, 'references'));
  }

  console.log(`satgat skill을 ${dest}에 설치했습니다.`);
  console.log(`\nClaude Code: ~/.claude/skills/satgat 경로에 두면 자동 로드.\nCursor/Codex: AGENTS.md에서 이 폴더를 참조하세요.\n`);
}

const [, , cmd, ...args] = process.argv;

switch (cmd) {
  case 'init':
    await init(args[0]);
    break;
  case 'skill':
    await skill(args[0]);
    break;
  case 'dev':
    await runNext(['dev', ...args]);
    break;
  case 'build':
    await runNext(['build', ...args]);
    break;
  case 'start':
    await runNext(['start', ...args]);
    break;
  case undefined:
  case 'help':
  case '--help':
  case '-h':
    console.log(HELP);
    break;
  default:
    console.error(`Unknown command: ${cmd}\n`);
    console.log(HELP);
    process.exit(1);
}
