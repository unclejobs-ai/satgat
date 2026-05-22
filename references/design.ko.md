# 삿갓 디자인 원칙 (한국형)

> AI agent에게 넘기는 brief. 이 문서를 따르면 어떤 LLM이든 일관된 한국 문서를 그립니다.

---

## 0. 단 하나의 미감

한지(韓紙) 위에 먹(墨)으로 옮겨 적습니다. 화려한 그림자도 두 번째 색도 두지 않습니다. **인쇄에 견디는 색만, 합성 볼드 없이, 옛 종이 위 글씨의 단정함으로.**

---

## 1. 색 (Colors)

### 한지 캔버스 (절대 #FFF 금지)
```
한지(韓紙)   #F1ECDF   페이지 본바탕
이보리(象牙) #F8F4E8   카드 · 부상 표면
황지(黃紙)   #E8E1CC   버튼 · 인터랙티브
한지그늘     #E0D8C0   카드 음영
```

### 먹(墨) 계열 — 위계
```
먹(墨)     #1C1916   본문 H1·H2
부엽(腐葉) #3A3833   본문 9.5pt
숯(炭)     #4D4B46   캡션·인용
이끼(苔)   #6B6862   메타·label
```

### 강조 — 단청만 (5% 룰)
```
단청(丹靑)   #9B1B1B   단 하나의 강조색
단청 밝게    #B53030   hover · 다크 위 링크
취색(翠色)   #2E6B5E   보조 강조 (인장 등)
금박(金箔)   #B8954F   메달·디바이더 (최소)
```

### 한지 위 단청 tint 5단계 (solid hex)
```
tint 1  #F4ECE9
tint 2  #EEDED9
tint 3  #E8D0C9   ← 기본
tint 4  #DDC3BB
tint 5  #D0B4AB
```

### 엷음(淡) — 보더
```
보더       #DDD6C4
보더 옅음  #E8E2D0
헤어라인   #D2CAB5
```

**규칙:**
- 한 페이지에서 단청 ≤ 5% 면적
- 단청과 취색 동시 사용 금지 (둘 중 하나만)
- cool blue-gray 모두 금지

---

## 2. 자 (Typography)

### 폰트 페어링 (전부 OFL 무료)
- **명조** (Display·H1): Nanum Myeongjo 800 — 장중함·표지·인장
- **바탕** (본문): Gowun Batang 400 / 700 — 따뜻한 곡선
- **돋움** (라벨·UI): Gowun Dodum 400 — 정갈한 직선
- **Latin** italic: Cormorant Garamond — 영문 보조 일점

### 스케일 (인쇄 pt 기준)
```
Display    36-48pt  weight 800  line 1.10
H1 섹션    18-22pt  weight 800  line 1.20
H2 소제목  14-16pt  weight 700  line 1.25
H3 항목    12-13pt  weight 700  line 1.30
본문       10-11pt  weight 400  line 1.72  ← 한글은 1.7+
캡션       8.5-9pt  weight 400  line 1.55
라벨       7.5-8pt  weight 600  line 1.35  uppercase
```

### 한글 자간 (letter-spacing)
- 본문: `-0.005em` (약간 조이기)
- 제목: `-0.018em` (더 조이기)
- 라벨 uppercase: `+0.18em` (넓히기)

### 합성 볼드 금지
실제 weight (400 / 700 / 800)만. `font-weight: 600` 가짜 굵기 절대 금지.

---

## 3. 결·꼴 (Spacing & Shape)

### 4pt 베이스 단위
```
xs   2-3pt    인라인 요소
sm   4-5pt    태그 패딩
md   8-10pt   컴포넌트 내부
lg   16-20pt  컴포넌트 간격 · 카드 패딩
xl   24-32pt  섹션 제목 마진
2xl  40-60pt  주요 섹션 간격
3xl  80-120pt 챕터 간격
```

### Radii (작은 모서리)
```
4pt   타이트
6pt   코드 블록
8pt   기본 카드
12pt  컨테이너
16pt  피처 카드
24pt  대형 컨테이너
32pt  히어로
```

### 그림자 — 가는 테 또는 옅은 whisper만
```css
/* ring */
box-shadow: 0 0 0 1pt var(--border);

/* whisper */
box-shadow: 0 4pt 24pt rgba(28, 25, 22, 0.05);

/* hard drop 금지 */
```

---

## 4. 위계 (Hierarchy)

크기와 굵기가 위계를 짓는다. 장식 금지.

```
표지 Display 800   →   섹션 H1 800   →   H2 700   →   본문 400
```

좌측 단청 2pt 바 또는 hairline 0.5pt 점선으로 섹션 구분.

---

## 5. 인장(印章)

8 문서마다 한 한자 인장:
```
履 이력서       ink (#1C1916)
介 자기소개서   dancheong
名 명함        jade
牒 청첩장      dancheong
賀 연하장      gold
案 제안서      dancheong
報 뉴스레터    gold
作 포트폴리오  jade
```

22×22pt 사각 · 명조 800 · 카테고리 색 · `inset` 흰 광택 1.2px.

---

## 6. 한지 캔버스 (반드시)

```css
background-color: #F1ECDF;
background-image:
  radial-gradient(ellipse 95% 70% at 50% 30%, rgba(255,252,240,0.32), transparent 62%),
  /* 닥섬유 텍스처 (긴 fiber + 짧은 cluster + grain) */
  url("data:image/svg+xml,...");
```

순백(`#FFFFFF`) 절대 금지. `@page background` 도 한지로 묶을 것.

---

## 7. 인쇄

- 모든 색은 solid hex (rgba 금지 — 인쇄 시 패딩·글리프 농도 어긋남)
- `@page { margin: 0; background: #F1ECDF; }`
- `-webkit-print-color-adjust: exact`
- A4 = 210×297mm · A5 = 148×210mm · 명함 = 90×55mm

---

## 8. 한국 문서 8종 표준

| 인장 | 문서 | 포맷 | 핵심 슬롯 |
|----|------|------|----------|
| 履 | 이력서 | A4 | name, hanja_name, title, photo, summary, experience[], education[], skills |
| 介 | 자기소개서 | A4 | name, q1_motivation, q2_competence, q3_growth, q4_aspiration |
| 名 | 명함 | 90×55 | name, title, company, email, phone, website |
| 牒 | 청첩장 | A5 | groom_name, bride_name, date, time, venue, parents, rsvp_url |
| 賀 | 연하장 | 엽서 | sender_family, recipient, occasion (신년/추석), message |
| 案 | 제안서 | A4 | title, problem, solution, metrics[], timeline, cost |
| 報 | 뉴스레터 | A4 | issue_no, date, lead, articles[], cta |
| 作 | 포트폴리오 | A4 가로 | name, intro, projects[], skills, contact |

---

## 9. AI 출력 톤

- **단정문** + 격조있는 한국어 (한자 보조)
- 영문 직역체 금지 (예: "~하는 것입니다" → "~합니다")
- 한 줄에 한 사실
- 숫자 강조는 단청 색만 (`color: var(--brand)`)
- "그리고" "하지만" "그러므로" 같은 접속사 절제

---

## 10. 절대 금지

1. ❌ 순백(#FFF) 캔버스
2. ❌ 단청 5% 초과
3. ❌ 합성 볼드 (font-weight 600 등)
4. ❌ Hard drop shadow
5. ❌ rgba 태그·배지 배경
6. ❌ cool blue-gray 색조
7. ❌ TsangerJinKai · Charter 같은 유료 폰트
8. ❌ 영문 직역체 문장
