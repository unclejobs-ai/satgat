# Changelog

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

### [0.3.0] · 8 한국 템플릿 React 컴포넌트
- 이력서(履) 풀 구현 — 한자 이름·증명사진·경력 타임라인
- 자기소개서(介) — 4문항 자소서 표준
- 명함(名) — A4 8-up 인쇄 레이아웃
- 청첩장(牒) — A5 + 약도 + RSVP
- 연하장(賀) · 제안서(案) · 뉴스레터(報) · 포트폴리오(作)

### [0.4.0] · 인쇄 폴리싱
- `@page` 규칙 정교화
- A4 / A5 / 명함 사이즈 인쇄 검증
- PDF 직접 export (Puppeteer)

### [0.5.0] · 사용자 시스템
- Supabase auth
- 저장된 문서 (cloud)
- 공유 링크

### [1.0.0] · 결제 + 런칭
- Polar.sh Freemium
- Product Hunt 런칭
- 한국 IT 커뮤니티 (생활코딩 / OKKY / 디스콰이엇)
