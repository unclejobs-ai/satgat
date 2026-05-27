# 삿갓 — Architecture (v2)

> 한국형 AI 문서 생성 플랫폼. 독립 프로덕트. Kami는 영감, 우리가 메인 origin.

---

## 0. Positioning

| 항목 | 정의 |
|------|------|
| **이름** | 삿갓 (Korean: bamboo hat. 漢字: 笠) |
| **한 줄 정의** | "AI가 한지에 옮겨 적는 한국 문서 생성기" |
| **카테고리** | 한국형 AI 문서 디자인 + 자동 생성 SaaS (또는 OSS skill) |
| **타깃** | 한국어로 문서 만드는 모든 사람 — 개인 (이력서·자기소개서·청첩장·연하장·사주), SMB (회사소개·제안서·뉴스레터·명함·청구서) |
| **차별점** | (1) 한지·먹·단청 미감 한국 정체성, (2) AI가 슬롯 자동 채움 (수기 HTML 작성 불요), (3) 무료 한국 폰트만, (4) 인쇄 우선 (A4·PDF) |
| **수익** | Freemium. Free = 5종 기본 템플릿 무제한 / Pro = 20+ 템플릿 + 브랜드 프로필 + 무한 사용 |

---

## 1. Identity vs Kami

| | Kami (tw93/Kami) | 삿갓 (우리) |
|---|------------------|--------------|
| 모기지 | AI agent skill (HTML + Python) | Next.js 웹앱 + 옵션 skill |
| 사용자 | LLM agent에게 브리프 → HTML 생성 | 일반 사용자가 자연어 입력 → 완성 문서 |
| 미감 | 양피지(parchment) + ink blue | 한지(韓紙) + 먹(墨) + 단청(丹靑) |
| 폰트 | Charter / TsangerJinKai02 (상업 라이선스 주의) | Nanum Myeongjo / Gowun Batang/Dodum / Cormorant (전부 OFL 무료) |
| 문서 | 10종 (영문/중문 중심) | 8+종 (한국 문서 중심 — 아래 §3) |
| 출력 | WeasyPrint Python PDF | 브라우저 네이티브 PDF + 향후 서버 export |
| 라이선스 | MIT (Kami 소스) | MIT (삿갓 소스. Kami CSS는 영감이지만 본 코드는 우리가 작성/확장) |

**중요**: 삿갓은 Kami를 **포크하지 않는다**. Kami의 디자인 원칙(따뜻한 캔버스 + 단일 강조색 + 명조 위계 + 절제된 그림자)을 *벤치마크*로 흡수했지만, 코드/자산은 우리 것. 업스트림 머지 안 함.

---

## 2. Stack

- **Next.js 16** App Router + React 19 + TypeScript
- **AI**: `@ai-sdk/google` (Gemini Flash 2.0) — slot 자동 채움
- **Validation**: `zod` runtime schema
- **No DB / No Auth (Phase 1)** — Stateless. base64 URL로 결과 공유.
- **Phase 2**: Supabase auth + 저장된 문서 + 결제 (Polar.sh)
- **CSS**: 우리 `styles/satgat-theme.css` + Kami에서 영감받아 정제한 `public/satgat/satgat.css`
- **Fonts**: Google Fonts OFL — Nanum Myeongjo / Gowun Batang / Gowun Dodum / Cormorant Garamond / Pretendard Variable

---

## 3. 한국 문서 라인업 (8종 v1)

Kami의 영문 중심(equity report, changelog, letter) 대신 **한국에서 자주 만드는 문서**:

| 문서 | 인장(印章) | 사용자 | 차별 포인트 |
|------|----------|--------|------------|
| **이력서(履歷書)** | 履 | 취준생, 경력자 | 한국 채용 관습(증명사진 자리, 학력→경력 순서, 한자 이름) |
| **자기소개서(自己紹介書)** | 介 | 취준생, 학생 | 4문항 한국 자소서 표준 (지원동기/직무역량/성장과정/입사후포부) |
| **명함(名銜)** | 名 | 프리랜서, 1인기업 | 한·영 양면, A4 8-up 인쇄용 |
| **청첩장(請牒狀)** | 牒 | 결혼 준비 | 신랑·신부 부모, 한자 이름, 약도, RSVP |
| **연하장(年賀狀)** | 賀 | 모든 사람 | 신년·추석 인사, 가족 명단 |
| **회사 제안서(提案書)** | 案 | SMB, 컨설턴트 | 한국 RFP 양식 친화 |
| **뉴스레터(消息誌)** | 報 | 마케터, 작가 | 한국형 메일링 발송 가능 (Stibee/Mailerlite export) |
| **포트폴리오(作品集)** | 作 | 디자이너, 사진가 | A4 가로 + 인쇄용 PDF |

Phase 2: 사주명리(四柱) · 가계부 · 연차계획서 · 보고서(報告書) · 백서(白書)

---

## 4. Directory Layout

```
삿갓/                              # 🏠 Hangul dir, package.json name "satgat"
├ app/                            # Next.js App Router
│  ├ layout.tsx                   # lang="ko", satgat-theme.css 글로벌 로드
│  ├ page.tsx                     # / → redirect /ko
│  ├ [lang]/
│  │  ├ page.tsx                  # → rewrite /satgat/satgat-ko.html (specimen)
│  │  ├ new/page.tsx              # AI 문서 생성 (slot prompt)
│  │  └ preview/page.tsx          # 생성 결과 미리보기 + 인쇄
│  └ api/
│     └ generate/route.ts         # Gemini API endpoint
│
├ public/satgat/                  # 정적 자산 (own 자원, sync 안 함)
│  ├ satgat.css                   # 디자인 시스템 CSS (Kami 영감, 우리가 유지보수)
│  ├ overrides.css                # 한국화 토큰 + 한국 폰트 import
│  ├ satgat-ko.html               # specimen 페이지 (한국 narrative)
│  └ assets/                      # 이미지 / 폰트 / 데모
│
├ styles/
│  └ satgat-theme.css             # CSS source (public/ 와 사본 동기)
│
├ src/
│  ├ lib/
│  │  ├ design-system/            # TS 토큰 (한지/먹/단청/취색/금박/명조/바탕/돋움)
│  │  ├ templates/                # 8종 한국 문서 정의 (definitions/)
│  │  ├ engine/                   # 렌더러 + validator
│  │  └ generation/               # Gemini prompt builder
│  └ components/
│     ├ document/                 # 문서 atomic 컴포넌트 (SatgatDocument, SatgatSeal …)
│     └ templates/                # 8종 문서 React 컴포넌트
│
├ docs/
│  ├ ARCHITECTURE.md              # 본 문서 (v2)
│  ├ ROADMAP.md                   # 12주 마일스톤
│  └ FONTS.md                     # 무료 한국 폰트 카탈로그
│
└ scripts/                        # (sync-kami.sh 제거됨)
```

---

## 5. 디자인 시스템 토큰

```
한지(韓紙) #F3EDDD   ─ 페이지 캔버스 (절대 #FFF 금지)
이보리(象牙) #FAF6EA ─ 카드/카드 표면
황지(黃紙) #E8E3D4   ─ 인터랙티브 표면 / 버튼 기본

먹(墨) #1C1916       ─ 본문 텍스트, 표지 디스플레이
부엽(腐葉) #3A3833    ─ 회색 본문
숯(炭) #4D4B46        ─ 캡션
이끼(苔) #6B6862     ─ 미세한 메타 텍스트

무궁화(無窮花) 단심 #B91C5C   ─ 단일 강조색 (5% 이내!)
취색(翠色) #2E6B5E   ─ 보조 강조 (잠금 / 인장)
금박(金箔) #B8954F   ─ 절제된 고급 (메달 / 디바이더)

엷음(淡) #D9D4C8     ─ 1pt hairline
연황(軟黃) #E3DDD1   ─ 더 옅은 보더
```

Font scale (인쇄 pt 기준, 화면 px = pt × 1.33):
- Display 36-48pt / weight 800 / leading 1.1
- H1 22pt / weight 700 / leading 1.2
- H2 16pt / weight 700 / leading 1.25
- Body 10pt / weight 400 / leading 1.55
- Caption 9pt / weight 400 / leading 1.45

---

## 6. 일곱 가지 규(規) — 삿갓의 디자인 원칙

1. **한지가 캔버스, 먹이 글씨** — 순백(`#FFF`) 절대 사용 금지.
2. **단청은 5% 이내** — 페이지 면적의 5%를 넘으면 절제가 아니라 혼잡.
3. **명조가 위계(位階)** — 크기와 굵기로 구조를 말하라. 장식 금지.
4. **여백이 디자인** — 한국 문서의 호흡. xl/2xl 간격을 두려워 말라.
5. **인쇄에 견디는 색만** — rgba 태그 배경 금지, solid hex만.
6. **그림자는 가는 테(ring)** — hard drop 금지, 0 0 0 1pt hairline만.
7. **합성 볼드 금지** — 실제 weight 700/800만. fake bold는 획을 흐린다.

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
| **P2: 8 Templates** | W3-6 | 8종 한국 문서 전부 구현 + brand profile + 인쇄 폴리싱 |
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
