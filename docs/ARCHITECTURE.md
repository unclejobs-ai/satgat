# 삿갓 — Architecture (v2)

> 한국형 AI 문서 생성 플랫폼. 독립 프로덕트. Kami는 영감, 우리가 메인 origin.

---

## 0. Positioning

| 항목 | 정의 |
|------|------|
| **이름** | 삿갓 (Korean: bamboo hat. 漢字: 笠) |
| **한 줄 정의** | "AI가 한지에 옮겨 적는 한국 문서 생성기" |
| **카테고리** | 한국형 AI 문서 디자인 + 자동 생성 SaaS (또는 OSS skill) |
| **타깃** | 한국어로 문서 만드는 모든 사람 — 개인 (이력서·자기소개서·청첩장·연하장·포트폴리오), SMB (회사소개·제안서·뉴스레터·명함·IR 덱·보고서) |
| **차별점** | (1) 백자지·먹·단청 미감 한국 정체성, (2) AI가 슬롯 자동 채움 (수기 HTML 작성 불요), (3) 무료 한국 폰트만, (4) 인쇄 우선 (A4·PDF) |
| **수익** | Freemium. Free = 5종 기본 템플릿 무제한 / Pro = 14종 + 브랜드 프로필 + 무한 사용 |

---

## 1. Identity vs Kami

| | Kami (tw93/Kami) | 삿갓 (우리) |
|---|------------------|--------------|
| 모기지 | AI agent skill (HTML + Python) | Next.js 웹앱 + 옵션 skill |
| 사용자 | LLM agent에게 브리프 → HTML 생성 | 일반 사용자가 자연어 입력 → 완성 문서 |
| 미감 | 양피지(parchment) + ink blue | 백자지(白瓷紙) + 먹(墨) + 단청(丹靑) |
| 폰트 | Charter / TsangerJinKai02 (상업 라이선스 주의) | Nanum Myeongjo / Gowun Batang/Dodum / Cormorant (전부 OFL 무료) |
| 문서 | 10종 (영문/중문 중심) | 14종 (한국 문서 중심 — 아래 §3) |
| 출력 | WeasyPrint Python PDF | 브라우저 네이티브 PDF + 서버 export (puppeteer) |
| 라이선스 | MIT (Kami 소스) | MIT (삿갓 소스. Kami CSS는 영감이지만 본 코드는 우리가 작성/확장) |

**중요**: 삿갓은 Kami를 **포크하지 않는다**. Kami의 디자인 원칙(맑은 캔버스 + 단일 강조색 + 명조 위계 + 절제된 그림자)을 *벤치마크*로 흡수했지만, 코드/자산은 우리 것. 업스트림 머지 안 함.

---

## 2. Stack

- **Next.js 16** App Router + React 19 + TypeScript
- **AI**: `@ai-sdk/google` (Gemini Flash 2.0) — slot 자동 채움
- **Validation**: `zod` runtime schema
- **No DB / No Auth (Phase 1)** — Stateless. base64 URL로 결과 공유.
- **Phase 2**: Supabase auth + 저장된 문서 + 결제 (Polar.sh)
- **CSS**: React routes (`/ko`, `/ko/examples`, `/ko/new`, `/ko/preview`) load `app/globals.css`, with shared product and document styles.
- **Fonts**: Google Fonts OFL on screen; deterministic PDF/specimen capture injects same-origin self-hosted faces from `/fonts/satgat-fonts.css`.

---

## 3. 한국 문서 라인업 (14종 v1)

Kami의 영문 중심(equity report, changelog, letter) 대신 **한국에서 자주 만드는 문서**:

| 문서 | 인장(印章) | 포맷 | 사용자 | 차별 포인트 |
|------|----------|------|--------|------------|
| **이력서(履歷書)** | 履 | A4 | 취준생, 경력자 | 한국 채용 관습(증명사진 자리, 학력→경력 순서, 한자 이름) |
| **자기소개서(自己紹介書)** | 介 | A4 | 취준생, 학생 | 4문항 한국 자소서 표준 (지원동기/직무역량/성장과정/입사후포부) |
| **명함(名銜)** | 名 | 90×55 | 프리랜서, 1인기업 | 한·영 양면, A4 8-up 인쇄용 |
| **브랜드 원페이지** | 品 | A4 | 브랜드, 마케터 | 핵심 가치 + 제품 + 포지셔닝 도표 한 장 |
| **제품 소개서(製品)** | 製 | A4 | SMB, 제조사 | 스펙·효능·인증, 특징 비교 차트 |
| **회사 소개서(會社)** | 社 | A4 | SMB, 컨설턴트 | 비전·미션·가치·연혁·팀, 성장 도표 |
| **투자 IR 덱(投資)** | 投 | 16:9 | 스타트업 | Problem·Solution·TAM·Traction·Team 슬라이드 |
| **브랜드 스토리북(話)** | 話 | A4 | 브랜드, 에이전시 | 탄생 이야기·비주얼 컨셉·톤앤매너 |
| **청첩장(請牒狀)** | 牒 | A5 | 결혼 준비 | 신랑·신부 부모, 한자 이름, 약도, RSVP |
| **연하장(年賀狀)** | 賀 | 엽서 | 모든 사람 | 신년·추석 인사, 가족 명단 |
| **회사 제안서(提案書)** | 案 | A4 | SMB, 컨설턴트 | 한국 RFP 양식 친화, 효과 차트 |
| **뉴스레터(消息誌)** | 報 | A4 | 마케터, 작가 | 한국형 메일링 발송 가능 (Stibee/Mailerlite export) |
| **포트폴리오(作品集)** | 作 | A4 가로 | 디자이너, 사진가 | A4 가로 + 인쇄용 PDF |
| **보고서(報告書)** | 報 | A4 | 직장인, 기관 | 개요·배경·추진·성과·이슈·계획, 성과 지표 표 |

Phase 2: 사주명리(四柱) · 가계부 · 연차계획서 · 백서(白書)

---

## 4. Directory Layout

```
삿갓/                              # 🏠 Hangul dir, package.json name "satgat"
├ app/                            # Next.js App Router
│  ├ layout.tsx                   # lang="ko", globals.css 글로벌 로드
│  ├ globals.css                  # React 앱 CSS 진입점 (Tailwind + overrides.css import)
│  ├ page.tsx                     # / → redirect /ko
│  ├ [lang]/
│  │  ├ page.tsx                  # React 제품 랜딩 `/ko`
│  │  ├ examples/page.tsx         # canonical runtime specimen catalog `/ko/examples`
│  │  ├ new/page.tsx              # AI 문서 생성 (slot prompt)
│  │  └ preview/page.tsx          # 비공개 draft 미리보기 + 인쇄
│  └ api/
│     ├ generate/route.ts         # Gemini API endpoint
│     └ export/route.ts           # 서버 PDF export (puppeteer-core + @sparticuz/chromium)
│
├ public/satgat/                  # 정적 자산 (own 자원, sync 안 함)
│  ├ satgat.css                   # 문서 디자인 시스템 CSS (Kami 영감, 우리가 유지보수)
│  ├ overrides.css                # 한국화 토큰
│  └ assets/examples/ko/          # canonical manifest + 14 PNG/PDF specimen pairs
│
├ src/
│  ├ lib/
│  │  ├ design-system/            # TS 토큰 (백자지/먹/단청/취색/금박/명조/바탕/돋움)
│  │  ├ templates/                # 14종 한국 문서 정의 (definitions/) + registry
│  │  ├ engine/                   # 렌더러 + validator + slot 정규화
│  │  └ generation/               # Gemini prompt builder
│  └ components/
│     ├ document/                 # 문서 atomic 컴포넌트 (SatgatDocument, SatgatDivider, SectionHeading)
│     └ templates/                # 14종 문서 React 컴포넌트
│
├ docs/
│  └ ARCHITECTURE.md              # 본 문서 (v2)
│
├ references/                     # 디자인·글쓰기·이력서·안티패턴 가이드
├ skills/satgat/SKILL.md          # AI agent용 single-file brief
└ scripts/                        # catalog reader/verifier · runtime specimen generator · design guard
```

---

## 5. 디자인 시스템 토큰

```
백자지(白瓷紙) #F7F7F2 ─ 페이지 캔버스 (절대 #FFF 금지)
이보리(象牙) #FFFFFB  ─ 카드/카드 표면
황지(黃紙) #E7E8DD    ─ 인터랙티브 표면 / 버튼 기본

먹(墨) #1C1916       ─ 본문 텍스트, 표지 디스플레이
부엽(腐葉) #3A3833    ─ 회색 본문
숯(炭) #4D4B46        ─ 캡션
이끼(苔) #6B6862     ─ 미세한 메타 텍스트

단청(丹靑) #9B1B1B   ─ 단일 강조색 (5% 이내!)
단청 밝게 #B92D2D    ─ hover · 다크 위 링크
취색(翠色) #2E6B5E   ─ 보조 강조 (잠금 / 인장)
금박(金箔) #B8954F   ─ 절제된 고급 (메달 / 디바이더)

엷음(淡) #BEC5BA     ─ 1pt border
헤어라인 #D2D6CB     ─ 더 옅은 hairline
```

Font scale (인쇄 pt 기준, 화면 px = pt × 1.33):
- Display 36-48pt / weight 800 / leading 1.1
- H1 22pt / weight 700 / leading 1.2
- H2 16pt / weight 700 / leading 1.25
- Body 10pt / weight 400 / leading 1.55
- Caption 9pt / weight 400 / leading 1.45

---

## 6. 디자인 8조(條) — 삿갓의 디자인 원칙

1. **백자지가 캔버스 `#F7F7F2`** — 순백(`#FFF`) 절대 사용 금지. 누런 양피지도 금지.
2. **단청 `#9B1B1B` 단일 강조** — 페이지 면적의 5%를 넘으면 절제가 아니라 혼잡.
3. **보조 액센트는 취색 `#2E6B5E` 또는 금박 `#B8954F` 하나만** — 단청과 동시 사용 금지.
4. **모든 회색은 회녹빛 백자지 계열** — cool blue-gray 금지.
5. **제목 명조 600-700, 본문 바탕 400** — 위계는 크기와 굵기로. 장식 금지.
6. **인쇄에 견디는 색만** — rgba 태그 배경 금지, solid hex만. 그림자는 가는 테(ring) 또는 옅은 whisper.
7. **여백이 디자인** — 한국 문서의 호흡. xl/2xl 간격을 두려워 말라.
8. **합성 볼드 금지** — 실제 weight 700/800만. 한자는 본문 옆 괄호 보조만.

---

## 7. AI 생성 플로우 (삿갓 핵심)

```
사용자 자연어 입력          예) "신입 프론트엔드 개발자 이력서, 학력은 홍익대 시각디자인..."
        ↓
templateId + prompt → /api/generate
        ↓
Gemini structured output (zod schema)
        ↓
DocumentData { templateId, slots, brand? }
        ↓
React 렌더링 (한지 + 먹 + 단청)
        ↓
인쇄 → PDF (브라우저 native, 향후 서버 export 옵션)
```

`brand` 슬롯은 `~/.config/satgat/brand.md` 에서 자동 로드 (개인 페르소나 일관성).

---

## 8. 사용자 여정 (한국 사용자 기준)

```
Discover           "한국형 AI 이력서 생성기" 검색 → 삿갓.fun 진입
        ↓
Specimen (/ko)    한지 위 견본 보기 → 미감 신뢰 → CTA 클릭
        ↓
Generate (/ko/new) 템플릿 선택 → 자연어 입력 → AI 생성 (10초)
        ↓
Preview (/ko/preview) 결과 보고 수정 (TipTap 인라인 편집, Phase 2)
        ↓
Print              브라우저 인쇄 → PDF 저장 (또는 메일 발송, Phase 2)
        ↓
Share             URL base64 인코딩 → 공유 → 다른 사람도 본인 정보 채워 재생성
```

---

## 9. 12주 로드맵

| Phase | 기간 | 산출물 |
|-------|------|--------|
| **P1: Foundation** | W1-2 | 디자인 시스템 + specimen 페이지 + 2개 템플릿 (이력서 + 명함) + Gemini 연동 |
| **P2: 14 Templates** | W3-6 | 14종 한국 문서 전부 구현 + brand profile + 서버 PDF + 인쇄 폴리싱 |
| **P3: Polish** | W7-8 | 모바일 반응형 + Open Graph + SEO + Plausible analytics |
| **P4: Monetize** | W9-10 | Supabase auth + Polar 결제 + Free/Pro tier + 사용량 카운터 |
| **P5: Launch** | W11-12 | Product Hunt + 한국 IT 커뮤니티 (생활코딩, OKKY, 디스콰이엇) |

---

## 10. Anti-Patterns

1. ❌ 삿갓을 "Kami 한국판"으로 마케팅 — 우리는 독립 프로덕트. Kami는 영감.
2. ❌ Kami repo 업스트림 sync — 우리가 origin.
3. ❌ Tesla/Musk 같은 외국 데모 — 한국 사례 (李舜臣 이력서, 카카오톡 청첩장 등)
4. ❌ pure white 캔버스 — 한지 정체성 위반
5. ❌ 단청을 5% 이상 — 절제 원칙 위반
6. ❌ 영문/중문/일문 멀티 lang — 한국 only (Phase 1)
7. ❌ 사용자에게 HTML/Markdown 직접 작성하라 요구 — AI가 채운다
8. ❌ TsangerJinKai/Charter 같은 유료 폰트 — 100% OFL 무료 폰트만

---

## 11. 메인 origin 선언

이 저장소가 삿갓의 단일 진실원천. Kami로 PR 안 보냄, Kami에서 pull 안 함. 영감받은 디자인 원칙은 우리 코드/카피로 재해석. 라이선스 MIT 동일하지만 코드는 별도 lineage.

GitHub: `unclejobs-ai/satgat` (or `unclejobs-ai/삿갓` — IDN 가능 시)
도메인: `satgat.vercel.app` (또는 `삿갓.kr` IDN)
