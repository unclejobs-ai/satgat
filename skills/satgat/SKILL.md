---
name: satgat
description: This skill should be used when the user asks to “한국 문서 만들어줘”, requests a Korean resume, self-introduction, business card, proposal, IR deck, company profile, brochure, invitation, New Year card, newsletter, portfolio, report, or asks to apply the Satgat Korean print-document design system.
license: MIT
---

# satgat — 한국형 인쇄 문서

자연어를 백자지 위의 단정한 한국 문서로 옮겨라. 장식보다 내용, 유행보다 인쇄 안정성, 임의의 한국풍보다 일관된 제약을 우선한다.

## 작업 순서

1. 요청과 가장 가까운 14개 템플릿 중 하나를 고른다.
2. 목적, 독자, 반드시 보존할 사실, 빠진 사실을 구분한다.
3. 아래 콘텐츠 계약에 맞춰 구조화한다. 사실을 지어내지 않는다.
4. 디자인 8조와 해당 PageSpec을 적용한다.
5. 화면뿐 아니라 인쇄/PDF에서 잘림, 희소 페이지, 폰트 대체를 확인한다.

저장소 안에서 작업할 때는 기존 definition, registry, renderer, `constraint.ts`를 사용한다. 별도 정적 HTML 문서 엔진이나 두 번째 token 사전을 만들지 않는다.

## 호출 예시

```text
7년차 프론트엔드 개발자 이력서. 커머스 성능 개선과 디자인 시스템 구축을 강조해 주세요.

로컬 문화 공간 SaaS 회사 소개서. 비전, 미션, 핵심 가치, 연혁, 팀, 연락처를 포함해 주세요.

시드 투자 IR 덱. 문제, 해결, 시장, 트랙션, 비즈니스 모델, 팀, 요청 금액을 한 주장씩 보여 주세요.
```

정보가 부족하면 필요한 사실을 짧게 요청하거나 빈 슬롯을 명확히 표시하라. 경력, 수치, 고객, 인증, 연락처를 추정하지 않는다.

## 디자인 8조

1. **캔버스는 `#F7F7F2`.** 순백과 누런 양피지를 쓰지 않는다.
2. **단청은 `#9B1B1B`, 페이지의 5% 이내.** 밑줄, 작은 규칙선, 핵심 숫자처럼 한 기능에만 쓴다.
3. **보조 강조는 취색 또는 금박 중 하나.** 같은 페이지에 둘을 함께 쓰지 않는다.
4. **회색은 회녹 계열.** 푸른 회색을 쓰지 않는다.
5. **표지·display는 명조 800, 제목은 명조 700, 본문은 바탕 400.** 위계는 굵기 남용이 아니라 크기·간격으로 만든다.
6. **문서 색은 solid hex.** 반투명 색으로 분위기를 만들지 않는다.
7. **여백은 구조다.** xl/2xl 간격을 허용하되 콘텐츠가 페이지 아래쪽에 몰리지 않게 한다.
8. **합성 볼드와 장식 한자를 금지한다.** 한자가 실제 고유명 표기에 필요하면 한글 옆 괄호 안의 보조 정보로만 둔다.

## 팔레트와 글꼴

| 역할 | 값 |
|---|---|
| Canvas | `#F7F7F2` |
| Ink | `#1C1916` |
| Muted ink | `#4D4B46` |
| Hairline | `#D2D6CB` |
| Dancheong | `#9B1B1B` |
| Jade | `#2E6B5E` |
| Gold | `#B8954F` |

- **나눔명조:** 표지와 H1. 제공된 400·700·800 weight만 쓴다.
- **고운바탕:** 본문과 인용. 제공된 400·700 weight만 쓴다.
- **고운돋움:** 라벨과 메타. 제공된 400 weight만 쓴다.
- **Pretendard:** 제품 UI나 sans 본문이 필요할 때만 쓴다.
- **Noto Serif KR:** 필요한 글리프의 fallback이다.

문서 제목을 영문 sans로 대체하지 않는다. 지원되지 않는 weight를 지정해 브라우저가 합성하게 두지 않는다.

## 실제 PageSpec

| ID | 라벨 | 캔버스 | 문서 |
|---|---|---|---|
| `a4Portrait` | A4 세로 | 210×297mm | 이력서, 자기소개서, 제품 소개서, 회사 소개서, 브랜드 스토리북, 제안서, 뉴스레터, 보고서 |
| `a4Landscape` | A4 가로 | 297×210mm | 브랜드 원페이지, 포트폴리오 |
| `slide16x9` | 16:9 슬라이드 | 297×167mm | 투자 IR 덱 |
| `businessCard8Up` | 명함 8-up | A4 위 90×55mm 8면 | 명함 |
| `postcardPortrait` | 엽서 세로 | 105×148mm | 청첩장, 연하장 |

PageSpec을 비슷한 임의 치수로 바꾸지 않는다. 명함과 엽서를 일반 A4 문서처럼 늘리지 않는다.

## 14개 콘텐츠 계약

| ID | 최소 구조 |
|---|---|
| `resume` | 이름·직무·요약, 경력 2–4개, 기술, 학력, 검증 가능한 연락처 |
| `self-intro` | 지원처·직무, 동기·역량·성장·포부 4문항, 문항당 구체 사례 |
| `business-card` | 이름·직함·회사, 전화·이메일·웹사이트·주소 중 실제 제공값 |
| `brand-onepager` | 브랜드명·태그라인·설명, 제품/가치 2–3개, 포지셔닝, 연락처 |
| `product-brochure` | 제품명·한 줄 가치, 특징 2–3개, 사양, 용도, 검증된 인증/연락처 |
| `company-profile` | 회사명·태그라인, 비전·미션·가치, 연혁, 팀, 연락처 |
| `investor-deck` | 표지 뒤 문제·해결·시장·트랙션·모델·팀·ASK를 슬라이드당 한 주장으로 |
| `brand-storybook` | 연원, 가치 2–3개, 비주얼 원칙, 톤, 마일스톤, 연락처 |
| `invitation` | 두 사람의 이름, 날짜·시간·장소, 초대 문구, 필요한 가족 정보 |
| `new-year-card` | 연도, 인사말, 보내는 이, 받는 이; 큰 상징 문자 없이 구성 |
| `proposal` | 고객·목표, 문제·해결, 기대 지표, 일정, 비용, 담당 팀 |
| `newsletter` | 호 제목·날짜·인사, 기사 2–4개, 프로모션/CTA가 있으면 명확히 |
| `portfolio` | 이름·역할·소개, 프로젝트 2–3개와 기여·결과, 기술, 연락처 |
| `report` | 제목·메타, 개요·배경·추진·성과·이슈·계획, 표나 차트의 근거 |

시각화가 있는 템플릿은 막대, 선, 도넛, 폭포, 타임라인, 흐름도, 구성도, 사분면, 벤 도표, 레이어 스택 중 의미에 맞는 하나를 고른다. 장식용 차트를 넣지 말고 단위·기간·출처를 보존한다.

## 밀도와 페이지 분할

페이지의 시각적 채움률 50%를 하한으로 삼되 글자를 키워 빈 공간을 감추지 않는다.

- A4 단일 페이지: 핵심 section 3개 이상 또는 동등한 표/차트 블록을 둔다.
- IR 슬라이드: 키커·제목 뒤 본문, 지표, 차트 중 하나를 반드시 둔다.
- 다중 페이지: 각 페이지가 독립된 제목과 하나의 완결된 논점을 갖게 한다.
- 명함/엽서: 카드 면 자체가 시각 블록이다. 짧은 문구를 억지로 늘리지 않는다.
- 50% 미만이면 내용을 합치거나 실제로 필요한 사실을 요청한다. 허구로 채우지 않는다.

저장소에서는 `node scripts/design-guard.mjs --check-density`로 fixture 밀도를 확인한다.

## 피할 것

- 순백·누런 크림·푸른 회색
- 단청과 취색/금박을 여러 군데 경쟁적으로 사용
- 테두리와 card를 중첩한 dashboard식 문서
- 두꺼운 drop shadow, glassmorphism, gradient
- 영문 UI 폰트로 한국 문서 전체를 조판
- 큰 장식 문자, 도장·낙관 모티프, 의미 없는 전통 문양
- 데이터 없는 chart, 출처 없는 성과 수치
- 작은 글씨로 과밀하게 맞춘 페이지

## 브랜드 정보

브랜드 정보는 사용자가 제공하고 적용을 요청한 경우에만 사용한다. 이름, 역할, 웹사이트, 톤처럼 요청에 포함된 값만 generation context에 넣는다. 사용자 기기의 파일이나 숨은 profile이 제공되었다고 가정하지 않는다.

## 검증

저장소 변경 시 다음을 확인한다.

```bash
npm run tokens:check
npm run verify:templates
node scripts/design-guard.mjs --check
node scripts/design-guard.mjs --check-density
```

화면 또는 출력 동작을 바꾸면 production server에서 `npm run verify:web`도 실행한다. 시각 결과는 화면 screenshot과 PDF 페이지 치수로 함께 확인한다.

상세 참고: `references/design.ko.md`, `references/writing.ko.md`, `references/resume-writing.ko.md`, `references/anti-patterns.ko.md`.
