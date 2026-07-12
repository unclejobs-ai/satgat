<div align="center">

# 삿갓 · satgat

**한지 위에 먹글씨. AI가 옮겨 적는 한국형 문서 디자인 시스템.**

양피지의 누런 따뜻함이 아니라, 백자지의 맑은 단정함.
자연어 한 문장이면, 한국 문서 한 장이 인쇄물로 완성됩니다.

[웹앱](https://satgat.vercel.app) · [데모팩](public/satgat/assets/examples/ko/) · [skill 설치](#설치) · [라이브 미리보기](https://satgat.vercel.app)

[![License: MIT](https://img.shields.io/badge/License-MIT-9B1B1B.svg)](LICENSE)
[![npm](https://img.shields.io/badge/npm-satgat-1C1916.svg)](https://www.npmjs.com/package/satgat)
[![Next.js](https://img.shields.io/badge/Next.js-16-1C1916.svg)](https://nextjs.org)

<img src="public/satgat/assets/readme/satgat-home.png" alt="삿갓 홈" width="92%">

</div>

---

## 설치

### Claude Code · Codex · Gemini CLI 등 AI 에이전트용 skill

```bash
npx satgat skill ~/.claude/skills/satgat
```

`SKILL.md`와 한국어 디자인 brief가 그대로 풀립니다. 이후 자연어로 호출하면 끝.

### 새 워크스페이스 (Next.js 풀스택)

```bash
npx satgat init my-satgat
cd my-satgat
npm install
echo "GOOGLE_GENERATIVE_AI_API_KEY=<키>" > .env.local
npm run dev
```

`http://localhost:3000` 열림. 14종 한국 문서 즉시 생성 가능.
제안서·IR 덱·회사 소개서 등 비즈니스 문서에는 차트와 도표 슬롯도 함께 생성됩니다.

### 원본 저장소에서

```bash
git clone https://github.com/unclejobs-ai/satgat.git
cd satgat
npm install
npm run dev
```

---

## 호출 예시

자연어 한 문장. AI 에이전트(Claude/GPT/Gemini)에 그대로 던집니다.

```text
이력서 한 장 만들어 주세요. 7년차 프론트엔드, 카카오·무신사·29CM.

신년 연하장 — 박상세 가족, 단정한 톤으로.

스타트업 IR 덱 한 벌, 시드 단계, 단청 강조.

회사 소개서 — 북촌랩스, 로컬 문화 공간 SaaS. 비전·미션·핵심 가치·연혁·팀.

한지 리테일 제안서 — 도입 효과는 폭포 차트로, 12주 일정은 타임라인으로 보여 주세요.

청첩장 — 민호와 지수, 2026년 10월 17일, 정동 예식당.
```

14종 문서: 이력서 · 자기소개서 · 명함 · 브랜드 원페이지 · 제품 소개서 · 회사 소개서 · 투자 IR 덱 · 브랜드 스토리북 · 청첩장 · 연하장 · 제안서 · 뉴스레터 · 포트폴리오 · 보고서.
지원 도표: 막대 · 선 · 도넛 · 폭포 · 타임라인 · 흐름도 · 구성도 · 사분면 · 벤 도표 · 레이어 스택.

---

## 디자인 한 줄

| 항목 | 값 |
|---|---|
| Canvas | 백자지 `#F7F7F2` |
| Accent | 단청 `#9B1B1B` (≤ 5%/page) |
| Ink | 먹 `#1C1916` |
| Serif | 나눔명조 · 고운바탕 |
| Sans | 고운돋움 · Pretendard |

규칙 8개: `references/design.ko.md` 또는 `skills/satgat/SKILL.md` 참조.

---

## 한글 무료 폰트 (OFL)

satgat이 쓰는 한글 폰트. 웹앱은 Google Fonts로 로드하고, **서버 PDF 내려받기**는 `public/fonts/`에 셀프호스팅한 OFL woff2(한자는 Noto Serif KR)를 임베드해 폰트 누락·두부(tofu) 없이 인쇄급으로 떨어집니다. 모두 무료, 상업 사용 가능.

| 폰트 | 역할 | 출처 |
|---|---|---|
| **나눔명조** | 표지 · H1 · 인장 | Google Fonts |
| **고운바탕** | 본문 · 인용 | Google Fonts |
| **고운돋움** | 라벨 · 메타 | Google Fonts |
| **Pretendard** | UI · sans 본문 | orioncactus/pretendard |
| **Noto Serif KR** | 명조 fallback | Google Fonts |
| **Noto Sans KR** | 다국어 페어링 | Google Fonts |
| **Hahmlet** | 두꺼운 명조 디스플레이 | Google Fonts |
| **IBM Plex Sans KR** | 기술 문서 sans | Google Fonts |
| **Black Han Sans** | 강한 헤드라인 (선택) | Google Fonts |

Latin 페어링: Cormorant Garamond italic, JetBrains Mono.

---

## 완성 예시 — 14종 specimen

열네 가지 예시는 제품의 React 미리보기 렌더러에서 PNG와 PDF로 생성됩니다.

[완성 예시 보기](https://satgat.vercel.app/ko/examples) · [생성 manifest](public/satgat/assets/examples/ko/manifest.json) · 재생성 `npm run specimens:render`

## 스크립트

```bash
npm run dev               # 로컬 개발 서버
npm run build             # 프로덕션 빌드
npm run start             # 프로덕션 서버
npm run lint              # ESLint
npm run verify:templates  # 14종 템플릿·렌더러·UI 일치 계약 검증 (CI 게이트)
npm run specimens:render  # 빌드된 런타임에서 14종 PNG/PDF/manifest 재생성
npm test                  # bun 단위 테스트 (문서 생성기)
```

디자인 강제기 (design-guard) — 디자인 8조를 코드로 검증하는 정적 분석기:

```bash
node scripts/design-guard.mjs --check          # 8조 위반 리포트 (순백·rgba·단청 예산·합성볼드·쿨그레이·이중강조)
node scripts/design-guard.mjs --check-density   # 14종 fixture 페이지 밀도 스캔 (희소 페이지 < 50% 감지)
```

`design-guard`는 warn 모드(위반을 리포트하되 CI를 깨뜨리지 않음)로 동작하며, `verify:templates`와 함께 CI에서 게이트로 실행됩니다(`.github/workflows/ci.yml`). PDF 내려받기를 로컬에서 시험하려면 `CHROMIUM_PATH`에 크롬 실행 파일 경로를 지정하세요(예: macOS `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`). 미지정 시 서버리스용 `@sparticuz/chromium`을 사용합니다.

또는 CLI 직접:

```bash
npx satgat help           # 도움말
npx satgat dev            # next dev wrap
npx satgat init <dir>     # 새 워크스페이스
npx satgat skill <dir>    # AI agent용 skill 폴더 내보내기
```

---

## 프로젝트 구조

```text
app/                          Next.js App Router · API · 페이지
bin/satgat.mjs                npx CLI 엔트리
src/components/               14종 문서 React 렌더러
src/lib/design-system/        한지·먹·단청·취색·금박 토큰 (constraint.ts)
src/lib/templates/            슬롯·section·registry
src/lib/engine/               렌더 + 검증 + 슬롯 정규화
src/lib/generation/           AI 프롬프트 → 슬롯 데이터
src/lib/bridge/prompt-builder.ts  type-aware 생성 프롬프트
scripts/verify-template-catalog.mjs   14종 카탈로그 계약 검증 (CI 게이트)
scripts/design-guard.mjs              디자인 8조 + 밀도 정적 강제기 (CI 게이트, warn)
scripts/template-preview-fixtures.mjs 14종 미리보기 fixture
scripts/render-template-specimens.mjs 14종 런타임 PNG/PDF/manifest 생성
public/satgat/assets/examples/ko/      생성된 specimen 아티팩트
skills/satgat/SKILL.md        AI agent용 brief
references/                   디자인·글쓰기·이력서·안티패턴 가이드
```

---

## 동작 흐름

1. **brief** — 자연어로 목적·독자·핵심 사실 적기.
2. **slot fill** — AI가 type-aware JSON 스켈레톤을 채움. 모든 list/table/image/visual 슬롯은 구조화 데이터로.
3. **render** — satgat 렌더러가 백자지 캔버스 위에 명조 위계로 옮겨 적음. 14종 전부 데스크톱(가로 스크롤 없음)과 모바일 375px(가로 오버플로우 없음) 반응형을 지원.
4. **export** — `PDF 내려받기` 버튼으로 서버 렌더 PDF(셀프호스팅 OFL 폰트 임베드, 한자 두부 없음, 백자지 `#F7F7F2` 캔버스 보존). 브라우저 인쇄·PNG 미리보기·HTML 저장도 그대로. 인쇄(`@media print`) 규칙은 `SatgatPrintStyles` 한 곳이 단독 소유하여 브라우저 인쇄와 서버 PDF가 동일한 단일 전략을 따릅니다.

---

## 디자인 8조

1. 백자지 `#F7F7F2`. 순백·양피지 누런 크림 금지.
2. 단청 `#9B1B1B`. 한 페이지의 5% 이내.
3. 보조 액센트는 취색·금박 중 하나만. 동시 사용 금지.
4. 모든 회색은 회녹빛. 푸른 회색 금지.
5. 제목은 명조(600-700), 본문은 바탕(400). 위계는 크기로.
6. solid hex만. rgba 금지(그림자·질감 알파는 예외).
7. 여백은 디자인. xl/2xl 간격 두려워하지 말 것.
8. 합성 볼드 금지. 폰트 정의 weight만. 한자는 본문 옆 괄호 보조만.

8조는 주석이 아니라 **`design-guard`가 기계적으로 검증**합니다. 전문: `skills/satgat/SKILL.md`, `references/design.ko.md`, `references/anti-patterns.ko.md`.

### 밀도 계약

AI가 채워도 정돈된 결과를 보장하기 위한 페이지 밀도 규칙. 페이지 채움률이 50% 미만이면 *희소(sparse)* 로 보고:

- **정적 스캔** — `design-guard --check-density`가 14종 fixture를 offline 추정(현재 0 희소).
- **렌더 시 힌트** — 프리뷰에서 각 문서 페이지가 자기 채움률을 측정해 `data-density="sparse"` 페이지에 인쇄되지 않는 `희소 NN%` 배지를 붙입니다(`SatgatDocument`).

템플릿별 항목 수 권장치는 `skills/satgat/SKILL.md`의 밀도 계약 표 참조.

---

## 영감

삿갓의 랜딱 페이지 구조와 제약 기반 디자인 시스템 접근은 [tw93](https://github.com/tw93)의 [Kami](https://github.com/tw93/Kami)에서 깊은 영감을 받았습니다. Kami가 "좋은 콘텐츠는 좋은 종이를 만날 자격이 있다"고 말했을 때, 그 문장은 삿갓의 출발점이기도 합니다. 감사합니다.

---

## 라이선스

MIT © 2026 [unclejobs-ai](https://github.com/unclejobs-ai).

번들된 폰트는 각 폰트의 OFL · MIT 라이선스를 따릅니다. 상업 사용 가능.
