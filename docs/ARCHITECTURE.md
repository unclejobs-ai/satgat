# 삿갓 웹 제품 아키텍처

> 현재 구현 기준. 최종 갱신: 2026-07-12.

삿갓은 자연어 입력을 14개 한국형 문서의 구조화 슬롯으로 바꾸고, 하나의 React 렌더링 경로에서 화면·PNG·PDF를 만드는 Next.js 웹 제품이다. 이 문서는 미래 로드맵이 아니라 저장소의 현재 실행 계약을 설명한다.

## 1. 제품 경계

| 경계 | 현재 계약 |
|---|---|
| 사용자 | 한국어 문서를 만드는 개인·소규모 조직 |
| 입력 | 템플릿 ID, 최대 1,200자의 자연어, 사용자가 켠 경우의 브랜드 정보 |
| 출력 | React 미리보기, 브라우저 인쇄, 서버 PDF, 명시적 내용 포함 공유 링크 |
| 카탈로그 | 14개 canonical template |
| 저장 | 현재 탭의 `sessionStorage`; 서버 DB 없음 |
| 인증 | 없음 |
| AI | `@ai-sdk/google`을 통한 구조화 슬롯 생성 |
| 검증 | Zod, 템플릿 계약 검사, 정적 디자인 검사, 브라우저/PDF smoke |

Kami는 제약 기반 문서 디자인의 영감이다. 삿갓은 별도 소스·런타임·배포 origin을 가진 독립 프로젝트이며 upstream 동기화를 전제로 하지 않는다.

## 2. 실행 표면

```text
/[lang]                       랜딩·14개 카탈로그·대표 specimen
/[lang]/examples              생성된 14개 PNG/PDF 카탈로그
/[lang]/new                   템플릿 선택·프롬프트·선택적 브랜드 입력
/[lang]/preview               임시 초안 또는 명시적 공유 payload 렌더
/api/generate                 AI 슬롯 생성
/api/export                   Chromium PDF 렌더
```

지원 언어 경로는 현재 `ko`뿐이다. 미지원 언어는 locale 유틸리티의 canonical 경로로 정규화한다.

## 3. 모듈과 의존 방향

```text
app/ UI routes
  -> src/lib/generation, src/lib/preview application services
    -> src/lib/templates, src/lib/engine domain contracts
      -> src/lib/design-system tokens

app/api adapters
  -> generation provider or export renderer
    -> domain contracts

src/components/templates
  -> document primitives and design-system tokens
  -> never owns catalog metadata
```

핵심 디렉터리:

```text
app/[lang]/                         사용자 화면
app/api/generate/route.ts           AI 경계
app/api/export/route.ts             PDF 경계
app/satgat-tokens.css               생성된 CSS 토큰
src/components/document/            공통 페이지·인쇄 primitive
src/components/templates/           14개 React renderer
src/lib/design-system/constraint.ts canonical token source
src/lib/design-system/generated-tokens.ts generated code tokens
src/lib/templates/definitions/      슬롯·section·specimen 정의
src/lib/templates/registry.ts       PageSpec·category·renderer registry
src/lib/engine/                      정규화·검증·render dispatch
src/lib/generation/                  AI 요청·응답 application logic
src/lib/preview/                     draft·share·PDF attempt state
scripts/                             생성기와 executable contract
public/fonts/                        화면·PDF 공용 self-hosted font
public/satgat/assets/examples/ko/    canonical PNG/PDF/manifest
skills/satgat/SKILL.md               에이전트용 visual/content brief
references/                          상세 디자인·글쓰기 가이드
```

UI는 provider SDK나 파일 시스템을 직접 호출하지 않는다. domain 모듈은 React·브라우저 저장소·네트워크에 의존하지 않는다.

## 4. 생성 데이터 흐름

```mermaid
flowchart LR
  U[사용자 입력] --> C[NewDocumentClient]
  C --> A[/api/generate]
  A --> G[document-generator]
  G --> P[Google AI provider]
  P --> N[slot normalize]
  N --> V[Zod + template validation]
  V --> S[sessionStorage draft]
  S --> R[preview route]
  R --> T[SatgatTemplateRenderer]
```

1. 생성 화면은 registry에서 템플릿과 `promptSeeds`, `factChecklist`, 길이 제한을 읽는다.
2. 브랜드 정보는 사용자가 체크한 경우에만 browser-local profile에서 요청 payload로 복사한다.
3. API는 템플릿 ID, prompt, 브랜드 payload를 검증한다.
4. `document-generator`는 템플릿 정의의 슬롯 타입을 반영한 prompt를 구성한다.
5. AI 응답은 슬롯별로 정규화하고 `SatgatDocumentData`로 검증한다.
6. 브라우저는 무작위 UUID 키로 결과를 현재 탭의 `sessionStorage`에 기록하고 미리보기로 이동한다.

호스팅된 웹 화면은 사용자의 홈 디렉터리나 workspace 파일을 읽지 않는다.

## 5. 초안과 공유 경계

### 일반 미리보기

```text
URL: /ko/preview?draft=<UUID v4>
storage key: satgat:draft:<UUID v4>
value: SatgatDocumentData JSON in sessionStorage
```

URL은 opaque identifier만 운반한다. 해당 탭의 저장소가 없으면 같은 주소를 다른 기기에서 열어도 문서가 복원되지 않는다.

### 공유 링크

```text
/ko/preview#share=<encoded SatgatDocumentData>
```

공유는 별도 사용자 동작이다. 복사 전 대화상자가 문서 내용과 개인정보가 링크에 포함됨을 고지한다. URL fragment는 HTTP 요청에 포함되지 않지만 링크 수신자는 payload를 해독할 수 있다. payload 크기 상한을 넘으면 공유를 거부한다.

### 오류 모델

- 예상 가능한 draft/storage 오류는 사용자용 한국어 메시지로 변환한다.
- 잘못된 공유 payload와 존재하지 않는 draft를 구분한다.
- PDF와 clipboard 작업은 attempt ID로 stale completion을 무시한다.
- API의 내부 오류·provider 세부 정보는 사용자 화면에 그대로 노출하지 않는다.

## 6. 템플릿 계약

각 문서는 `src/lib/templates/definitions/*.ts`에서 다음을 정의한다.

- stable `id`, 한국어 `name`, `category`
- 하나의 `PageSpec`
- typed slots와 section grouping
- prompt seeds와 fact checklist
- landing/preview용 specimen metadata

`src/lib/templates/registry.ts`는 definition과 React renderer를 연결한다. 추가 템플릿은 definition, renderer, registry, landing/create 노출, preview fixture, runtime specimen을 한 변경으로 추가해야 한다.

현재 PageSpec:

| ID | 라벨 | 캔버스 |
|---|---|---|
| `a4Portrait` | A4 세로 | 210×297mm |
| `a4Landscape` | A4 가로 | 297×210mm |
| `slide16x9` | 16:9 슬라이드 | 297×167mm |
| `businessCard8Up` | 명함 8-up | A4 위 90×55mm 8면 |
| `postcardPortrait` | 엽서 세로 | 105×148mm |

14개 ID:

```text
resume, self-intro, business-card, brand-onepager,
product-brochure, company-profile, investor-deck, brand-storybook,
invitation, new-year-card, proposal, newsletter, portfolio, report
```

## 7. 렌더링과 출력

`SatgatTemplateRenderer`가 template ID로 renderer를 선택한다. `SatgatDocument`가 화면의 page canvas와 `data-page-spec`을 소유하고, `SatgatPrintStyles`가 인쇄 규칙을 단독 소유한다.

동일 renderer 소비자:

1. `/[lang]/preview` 화면
2. browser print
3. `/api/export`의 Chromium PDF
4. `scripts/render-template-specimens.mjs`의 PNG/PDF 생성
5. `scripts/verify-web-product.mjs`의 runtime 검증

PDF는 `printBackground: true`, `preferCSSPageSize: true`를 사용한다. 검증기는 PDF MediaBox를 읽어 PageSpec과 대조한다. specimen 생성기는 로컬 production server를 열고 폰트 준비와 `.satgat-document[data-page-spec]` 렌더 완료를 기다린 뒤 원자적으로 PNG/PDF/manifest를 교체한다.

정적 HTML 문서 엔진이나 별도 데모 레이아웃은 유지하지 않는다.

## 8. 디자인 시스템 권위

`src/lib/design-system/constraint.ts`가 사람이 수정하는 단일 token source다.

```text
constraint.ts
  -> scripts/generate-design-tokens.mjs
    -> app/satgat-tokens.css
    -> src/lib/design-system/generated-tokens.ts
```

`npm run tokens:check`는 생성 결과를 임시로 계산해 저장된 두 파일과 byte-level로 비교한다. generated 파일을 직접 수정하지 않는다.

핵심 불변식:

- canvas `#F7F7F2`; pure white 금지
- dancheong `#9B1B1B`; 페이지 5% 이하
- secondary accent는 jade 또는 gold 중 하나
- gray는 warm/green cast
- display 600–700, body 400; 실제 제공 font face만 사용
- active UI/document color는 solid hex
- 장식 한자 금지; 필요한 고유명 옆 괄호만 허용
- page surface에 두꺼운 drop shadow 금지

폰트는 `public/fonts/satgat-fonts.css`에서 self-host한다. 화면과 PDF가 같은 family/weight를 사용하며 외부 font CDN을 런타임 전제조건으로 두지 않는다.

## 9. 검증 계층

| 계층 | 명령 | blocking 계약 |
|---|---|---|
| token generation | `npm run tokens:check` | generated CSS/TS drift 0 |
| catalog | `npm run verify:templates` | 14 definitions, registry, renderers, fixtures, PNG/PDF/manifest 일치 |
| static design | `node scripts/design-guard.mjs --check` | 오류 0; advisory warning은 보고 |
| density | `node scripts/design-guard.mjs --check-density` | 14 fixture 페이지의 물리 밀도 보고; 현재 advisory |
| unit/integration | `npm test` | domain·UI 계약 |
| lint/type | `npm run lint`, `npx tsc --noEmit` | 오류 0 |
| production | `npm run build` | Next.js production compile |
| runtime | `npm run verify:web` | 랜딩·생성·14 preview·PDF geometry |

`verify:web`은 실행 중인 production server를 대상으로 한다. 랜딩의 최대 높이, 모바일 카드 최소 폭, opaque draft URL, 14개 renderer, 화면 canvas 치수, PDF PageSpec을 검사한다.

## 10. CI 순서

`.github/workflows/ci.yml`의 `verify` job은 다음 순서를 사용한다.

1. checkout, Node 20, `npm ci`
2. `tokens:check`
3. `lint`
4. `test`
5. `build`
6. production server 시작
7. `verify:web`
8. server 종료
9. `verify:templates`
10. strict design guard
11. advisory density guard

CI와 로컬 명령은 같은 package scripts를 사용한다. 별도 CI 전용 renderer나 artifact source는 없다.

## 11. 운영 결정

- **Web-first:** README와 랜딩의 기본 동선은 설치보다 웹 생성 흐름을 먼저 설명한다.
- **One renderer:** preview, specimen, print, PDF가 동일 React renderer를 사용한다.
- **No hidden persistence:** 현재 서버 DB·인증이 없음을 사용자에게 명시한다.
- **Explicit sharing:** 내용 포함 링크는 경고와 확인 뒤에만 만든다.
- **Explicit brand application:** browser-local 브랜드 값은 사용자가 적용을 켠 요청에만 포함한다.
- **Generated tokens:** token output은 수작업 복제 대신 generator로 파생한다.
- **Runtime artifacts:** 공개 예시는 production runtime에서 생성한 14개 PNG/PDF만 canonical로 취급한다.
- **No speculative roadmap:** 구현되지 않은 요금제, 계정, 편집기, 결제를 현재 기능처럼 문서화하지 않는다.

## 12. 변경 체크리스트

### 템플릿 추가·변경

- definition과 slot validation
- registry와 renderer 연결
- landing/create 노출
- preview fixture
- runtime PNG/PDF/manifest
- `verify:templates`, `verify:web`

### 디자인 token 변경

- `constraint.ts`만 수정
- `npm run tokens:generate`
- `npm run tokens:check`
- 관련 화면 screenshot과 PDF smoke

### 생성·공유 경계 변경

- request schema와 크기 제한
- browser storage lifecycle
- 개인정보 고지
- stale attempt/abort behavior
- malformed payload와 실제 provider 오류 테스트

### 배포 전

- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
- `npm run build`
- production server + `npm run verify:web`
- `npm run verify:templates`
