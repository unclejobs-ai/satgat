# Changelog

## [0.7.0] — 2026-06-16 — "서버 PDF·보고서"

### 문서 14종 완성
- **보고서(報告書)** 템플릿 추가 — 개요·배경·추진·성과·이슈·계획 + 성과 지표 표. 13 → **14종** 라인업 확정
- 인장 `報` (ink) · 폼팩터 A4 세로

### 서버 PDF export
- `/api/export` 신설 — puppeteer-core + @sparticuz/chromium 서버 렌더링
- 폰트 임베드(tofu 없음), 백자지 캔버스 색 보존, 인쇄 폰트 강제 오버라이드
- `CHROMIUM_PATH` 환경변수로 로컬 크롬 지정 가능, 없으면 @sparticuz 번들 사용

### 생성 견고화
- `document-generator` retry/fallback 정책 정교화 — 모델 미응답 시 placeholder 조작 안 함
- 14종 fixture(`scripts/template-preview-fixtures.mjs`) 기반 검증 강화

### 비주얼·랜딩 폴리싱
- 비주얼 예시·IR 덱 슬라이드 폴리싱
- Kami 영감 랜딩 정제 — `!important` 전쟁 정리, 간격·weight 정규화

---

## [0.6.0] — 2026-05-27 — "공개 배포"

### 공개 릴리스
- `unclejobs-ai/satgat` 공개 저장소 + `satgat.vercel.app` 라이브
- npx CLI 배포 (`bin/satgat.mjs`) — `init` / `skill` / `dev` / `build` / `start`
- npm 패키지 게시 준비 — bin 경로 정규화, 앱 의존성 devDependencies 이동

### 카탈로그 확장 (8 → 13종)
- 비즈니스 문서 5종 추가: 브랜드 원페이지(品) · 제품 소개서(製) · 회사 소개서(社) · 투자 IR 덱(投) · 브랜드 스토리북(話)
- 14종 무의존 SVG 차트(막대·선·도넛·폭포·타임라인·흐름도·구성도·사분면·벤·레이어 스택 등) — 인쇄 안전
- `visual` 슬롯 — 자연어에서 차트 타입 추론, 60+ 한·영 별칭

### 계약·brief
- `scripts/verify-template-catalog.mjs` — 정의×렌더러×랜딩×fixture 10-surface 카탈로그 계약 (TS AST 기반)
- `skills/satgat/SKILL.md` — AI agent용 single-file brief + `brand.example.md`
- `src/lib/bridge/prompt-builder.ts` — type-aware 생성 계약 (list/table/image 구조 보존)
- 형상 허용 slot 정규화 — `slot-list.ts` · `slot-image.ts`

---

## [0.5.0] — 2026-05-22 — "백자지 전환"

### 캔버스 정체성
- Kami parchment `#F3EDDD`(누런 양피지) 폐기 → **백자지(白瓷紙) `#F7F7F2`** — 회녹 undertone의 맑은 닥종이
- 이보리 `#FFFFFB`, 황지 `#E7E8DD`, 회녹빛 보더(`#BEC5BA`/`#D2D6CB`) 재정의
- 무궁화 핫핑크(`#B91C5C`) 폐기 → 단청 `#9B1B1B` 단일 강조로 통일, 단청 밝게 `#B92D2D`
- 닥섬유 텍스처를 누런 톤 대신 회녹 shadow + fiber 선으로 재구성

---

## [0.4.0] — 2026-05-20 — "인쇄와 데모"

### 인쇄 우선
- `@page` 규칙 정교화 — A4·A5·명함·엽서·16:9 폼팩터, `print-color-adjust: exact`
- 브라우저 네이티브 PDF 출력 폴리싱
- 한국어 데모팩(`scripts/generate-korean-demo-pack.mjs`) — HTML·PDF·PNG·manifest
- specimen 페이지(`/ko`) 인쇄급 폴리싱

---

## [0.3.0] — 2026-05-18 — "여덟 문서"

### 한국 문서 8종 React 구현
- placeholder 정의 → 풀 React 렌더러 전환
- 履 이력서 — 한자 이름·증명사진 자리·경력 타임라인
- 介 자기소개서 — 4문항 자소서 표준
- 名 명함 — A4 8-up 인쇄 레이아웃
- 牒 청첩장 — A5 + 약도 + RSVP · 賀 연하장 · 案 제안서 · 報 뉴스레터 · 作 포트폴리오
- `src/lib/engine` 렌더러 + validator 분리, `getTemplate`/`listTemplates` registry

---

## [0.2.0] — 2026-05-16 — "한지 정착"

### 정체성
- 독립 프로덕트 선언: Kami는 영감, 삿갓이 메인 origin
- Kami 업스트림 sync 단절. 우리 코드/자산 독립 lineage
- 디렉토리 한글화: `satgat` → `삿갓` (Hangul path)
- package name: `satgat` → `satgat`

### 디자인 시스템
- **한지 v3**: 캔버스 `#F3EDDD` (Kami parchment `#F5F4ED` 누리끼리 폐기, 한국 백한지 톤)
- **닥섬유(楮纖維) 텍스처**: 긴 fiber + 짧은 cluster + 미세 grain 3중 합성 SVG
- 한국 색 매핑 9 토큰: 한지·이보리·황지·먹·부엽·숯·이끼·무궁화·취색·금박·단청
- 단청 tint 5 단계 (`#F4ECE9` ~ `#D0B4AB`)
- 한글 본문 행간 `1.55 → 1.72`, letter-spacing 미세 조정
- body font sans → serif (Gowun Batang) 한글 가독성 우선

### 폰트 (전부 OFL 무료)
- Display: Nanum Myeongjo 800
- 본문: Gowun Batang 400/700
- UI: Gowun Dodum
- Latin: Cormorant Garamond italic

### 문서 8종 (한국 라인업)
- 履 이력서 · 介 자기소개서 · 名 명함 · 牒 청첩장
- 賀 연하장 · 案 회사제안서 · 報 뉴스레터 · 作 포트폴리오

### Specimen 페이지 (`/ko`)
- 12 섹션 전부 한국 톤으로 재작성
- 출력 샘플 4장 폴리싱 — 이력서/명함/청첩장/제안서 미니 미리보기 (한자 이름·인장·증명사진·약도 placeholder)
- 7 規 매니페스토
- 4 도해(圖解): 구성도·흐름도·막대·환 (한국 한자 라벨 + 단청 SVG)
- FAQ 5 → 7 (한지 톤 / 인쇄 / 외국어 추가)
- 섹션 번호 한자 한국화 (00 보기·02 규·03 색·04 자·…·11 묻고 답하기)

### 기술
- Next.js 16 + React 19 + TypeScript
- App Router · `/ko` rewrite to static specimen
- `/api/generate` Gemini Flash 2.0 + zod structured output
- 한지 노이즈 텍스처: 6-layer cascade backgrounds
- 토큰 TS 미러 + legacy alias (`fontMyeongjo`, `dancheong`, `canvas` 등)

### GitHub
- README.md (한국어 풀)
- LICENSE MIT + Kami attribution
- CHANGELOG.md
- ARCHITECTURE.md 전략 v2

---

## [0.1.0] — 2026-05-16 — "포크 시작"

### 초기 (Kami port phase)
- tw93/Kami CSS verbatim 흡수
- Next.js 16 scaffold
- 한국어 lang override layer
- 8 템플릿 placeholder definitions
- Specimen 페이지 Kami HTML 그대로 + Korean text

---

## 로드맵 (예정)

### · 강제기 error 전환
- design-guard warn → error 단계적 전환 (룰별)
- 밀도 계약 CI 게이트화

### · 사용자 시스템
- Supabase auth
- 저장된 문서 (cloud)
- 공유 링크

### [1.0.0] · 결제 + 런칭
- Polar.sh Freemium
- Product Hunt 런칭
- 한국 IT 커뮤니티 (생활코딩 / OKKY / 디스콰이엇)
