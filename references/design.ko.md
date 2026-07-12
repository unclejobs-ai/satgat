# 삿갓 디자인 레퍼런스

삿갓은 전통 장식을 붙이는 스타일이 아니다. 백자지의 맑은 표면, 먹의 위계, 제한된 단청, 정확한 물리 치수로 한국 문서를 조판하는 제약 시스템이다. 구현 token의 단일 진실원천은 `src/lib/design-system/constraint.ts`다.

## 1. 색

| 역할 | 값 | 사용 |
|---|---|---|
| 백자지 Canvas | `#F7F7F2` | 모든 문서 페이지 |
| 밝은 Surface | `#FFFFFB` | 제품 UI의 제한된 표면 |
| 먹 Ink | `#1C1916` | H1·핵심 본문 |
| 본문 Ink | `#3A3833` | 긴 본문 |
| 보조 Ink | `#4D4B46` | 캡션·설명 |
| Hairline | `#D2D6CB` | 얇은 구분선 |
| Strong line | `#BEC5BA` | 표 외곽과 인쇄 경계 |
| 단청 | `#9B1B1B` | 페이지당 하나의 핵심 강조 |
| 취색 | `#2E6B5E` | 선택적 보조 강조 |
| 금박 | `#B8954F` | 선택적 보조 강조 |

규칙:

- 순백 캔버스와 누런 크림 배경을 쓰지 않는다.
- 단청은 페이지 시각 면적의 5%를 넘지 않는다.
- 단청 외 보조 강조가 필요하면 취색 또는 금박 중 하나만 고른다.
- 회색은 붉거나 회녹 기운을 유지한다. blue channel이 지배하는 cool gray를 쓰지 않는다.
- active document/UI 색은 solid hex다. 분위기를 만들기 위한 `rgba()`, gradient, glass 효과를 쓰지 않는다.

## 2. 글꼴과 위계

모든 weight는 실제 self-hosted face가 있는 값만 쓴다.

| 역할 | 글꼴 | 크기 기준 | weight | line-height |
|---|---|---:|---:|---:|
| Cover display | Nanum Myeongjo | 36–48pt | 800 | 1.10 |
| H1 | Nanum Myeongjo | 18–24pt | 700 | 1.20 |
| H2 | Nanum Myeongjo | 14–16pt | 700 | 1.25 |
| H3 | Nanum Myeongjo | 11–13pt | 700 | 1.30 |
| 본문 | Gowun Batang | 10–11pt | 400 | 1.70–1.80 |
| 캡션 | Gowun Batang | 8.5–9pt | 400 | 1.50–1.60 |
| 라벨·메타 | Gowun Dodum | 7.5–9pt | 400 | 1.35–1.50 |
| 제품 UI | Pretendard 또는 Gowun Dodum | 13–16px | 제공 face | 1.4–1.6 |

- display와 heading을 같은 800으로 평평하게 만들지 않는다.
- `font-weight: 600`처럼 제공되지 않은 face를 요청하지 않는다.
- 본문 위계는 weight보다 크기, 간격, 위치로 만든다.
- 제목 자간은 약 `-0.018em`, 본문은 약 `-0.005em`을 시작점으로 삼는다.
- 영문 italic은 필요한 한 점에만 사용한다.

## 3. 간격과 그리드

4pt 배수를 기본 단위로 삼는다.

```text
xs      2–4pt      인라인 간격
sm      6–8pt      라벨과 값
md      12–16pt    같은 section 내부
lg      24–32pt    section 사이
xl      48–64pt    큰 위계 전환
2xl     80–120pt   표지와 본문, 장 전환
```

- A4 page padding은 template과 PageSpec primitive가 소유한다.
- 긴 문서는 section 제목과 첫 문단을 같은 페이지에 둔다.
- 같은 중요도의 card를 반복해 dashboard처럼 만들지 않는다.
- 표는 얇은 hairline과 충분한 cell padding을 사용한다.
- page surface에는 두꺼운 drop shadow를 쓰지 않는다. 화면 구분이 필요하면 1px ring 또는 아주 옅은 solid shadow만 쓴다.

## 4. PageSpec

| ID | 라벨 | 실제 캔버스 |
|---|---|---|
| `a4Portrait` | A4 세로 | 210×297mm |
| `a4Landscape` | A4 가로 | 297×210mm |
| `slide16x9` | 16:9 슬라이드 | 297×167mm |
| `businessCard8Up` | 명함 8-up | A4 한 장에 90×55mm 명함 2×4 |
| `postcardPortrait` | 엽서 세로 | 105×148mm |

`SatgatDocument`가 화면 캔버스를, `SatgatPrintStyles`가 print `@page`를 소유한다. 별도 CSS에서 비슷한 치수를 다시 선언하지 않는다.

## 5. 한국적 인상

한국적 인상은 문양이나 큰 상징 문자보다 다음에서 만든다.

- 넓은 여백과 비대칭 정렬
- 세로로 긴 명조 획과 안정된 본문 행간
- 백자지와 먹의 낮은 대비 변화
- 작은 단청 rule, underline, 핵심 숫자 한 점
- 제목과 메타의 절제된 크기 차이

도장, 낙관, 큰 장식 문자, 반복 전통 문양을 사용하지 않는다. 한자가 실제 인명·기관명 구분에 필요하면 한글 표기 바로 옆 괄호 안의 작은 보조 정보로 한 번만 쓴다.

## 6. 시각화

차트는 장식이 아니라 주장과 근거를 압축한다.

- 막대: 범주 비교
- 선: 시간 변화
- 도넛: 제한된 구성비
- 폭포: 증감 원인
- 타임라인: 단계와 일정
- 흐름도: 순서와 분기
- 구성도: 조직·시스템 관계
- 사분면: 두 축의 포지셔닝
- 벤: 집합의 교집합
- 레이어 스택: 계층 구조

단위, 기간, 표본, 출처를 보존한다. 데이터가 없으면 빈 차트를 만들지 않는다. 단청은 강조 series 하나에만 쓰고 나머지는 먹·회녹 단계로 구분한다.

## 7. 이미지

- 사용자 제공 이미지의 의미를 바꾸는 crop을 피한다.
- 제품 소개서와 포트폴리오 이미지는 캡션과 연결한다.
- 외부 추적 URL이나 실행 가능한 SVG를 문서 데이터로 허용하지 않는다.
- 인쇄에서 이미지가 흐려지지 않도록 실제 출력 크기에 충분한 해상도를 쓴다.
- 이미지가 없을 때 임의 stock 사진으로 사실을 꾸미지 않는다.

## 8. 인쇄와 PDF

- `@page` margin과 background는 `SatgatPrintStyles` 한 곳에서 관리한다.
- `printBackground: true`, `preferCSSPageSize: true`를 사용한다.
- 화면과 PDF가 같은 self-hosted font family와 weight를 사용한다.
- 모든 PDF 페이지의 MediaBox가 template PageSpec과 일치해야 한다.
- 다중 페이지 PDF의 page count는 runtime document root 수와 같아야 한다.
- 브라우저 print와 서버 PDF 모두 백자지 배경과 hairline을 보존한다.

## 9. 밀도

페이지 채움률 50%를 하한으로 삼는다. 빈 공간을 없애기 위해 글자를 키우거나 허구의 내용을 추가하지 않는다.

- A4 문서는 핵심 section 3개 또는 동등한 표/차트 블록을 둔다.
- IR 슬라이드는 한 장에 주장 하나와 본문·지표·차트 중 하나를 둔다.
- 명함과 엽서는 카드 면 자체가 시각 블록이므로 짧은 문구를 억지로 늘리지 않는다.
- 희소 페이지는 인접 내용을 합치거나 사용자에게 빠진 사실을 요청한다.

```bash
node scripts/design-guard.mjs --check-density
```

## 10. 검토 질문

1. 3초 안에 문서 종류와 핵심 주장이 보이는가?
2. 단청이 한 기능만 수행하는가?
3. 제공되지 않은 font weight가 없는가?
4. 장식 없이도 한국어 문서의 위계가 서는가?
5. 다섯 PageSpec 중 정확한 하나를 쓰는가?
6. 390px 화면에서 page preview와 controls가 가로로 넘치지 않는가?
7. 모든 PDF 페이지의 치수와 page count가 맞는가?
8. 데이터와 개인정보가 공유·export 경계를 넘을 때 사용자가 알고 있는가?
