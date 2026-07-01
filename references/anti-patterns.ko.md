# 피해야 할 것 (Anti-Patterns)

> 예외는 허용되지만, 이유는 명시적이어야 합니다.

---

## 1. 색 (Colors)

### ❌ 순백·푸른빛 회색
```css
background: #ffffff;    /* 백자지의 맑음이 사라짐 */
background: #f3f4f6;    /* 푸른빛 — 한국말이 차갑게 떠 보임 */
color: #6b7280;         /* slate-500 — cool gray, 백자지 위 어긋남 */
```

### ✅ 백자지·따뜻한 회색
```css
background: #F7F7F2;    /* 백자지(白瓷紙) — 회녹 undertone */
color: #4D4B46;         /* 숯(炭) — 따뜻한 황갈 */
```

---

### ❌ rgba 태그·배지
```css
.tag { background: rgba(155, 27, 27, 0.18); }
/* WeasyPrint·브라우저 인쇄에서 패딩과 글리프 농도 어긋남 */
```

### ✅ solid hex tint
```css
.tag { background: #E8C9C9; }  /* 백자지 위 단청 tint 3 (미리 계산) */
```

---

### ❌ 두 가지 강조색
```css
--brand: #9B1B1B;       /* 단청 */
--accent: #2E6B5E;      /* 취색을 동시 사용 */
/* 절제 → 혼잡 */
```

### ✅ 단청 한 점만
```css
--brand: #9B1B1B;
/* 취색·금박은 보조 (인장 등 점적용만) */
```

---

## 2. 자 (Typography)

### ❌ 합성 볼드
```css
.h1 { font-weight: 600; }
/* Gowun Batang에 600 weight 없음 → 브라우저가 가짜로 굵게 그림
   → 획이 흐려지고 명조 골격이 무너짐 */
```

### ✅ 실제 weight만
```css
.h1 { font-family: 'Nanum Myeongjo'; font-weight: 800; }  /* 실제 800 */
.body { font-family: 'Gowun Batang'; font-weight: 400; }  /* 실제 400 */
.strong { font-family: 'Gowun Batang'; font-weight: 700; }
```

---

### ❌ 한글에 영문 행간
```css
body { line-height: 1.5; }
/* 한글은 받침 때문에 1.5는 좁음 */
```

### ✅ 한글 본문 1.7+
```css
body { line-height: 1.72; letter-spacing: -0.005em; }
```

---

### ❌ word-break 미설정
```html
<p>한국에서문서를만든다는일은</p>
/* 어절 단위 break 안 됨 — 어색하게 잘림 */
```

### ✅ keep-all 전역
```css
body { word-break: keep-all; word-wrap: break-word; }
```

---

## 3. 결·꼴 (Spacing & Shape)

### ❌ 하드 드롭 그림자
```css
.card { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); }
/* 백자지 위 얼룩처럼 보이고 시선을 빼앗음 */
```

### ✅ 가는 테 또는 옅은 whisper
```css
.card { box-shadow: 0 0 0 1pt var(--border); }
.featured { box-shadow: 0 4pt 24pt rgba(28, 25, 22, 0.05); }
```

---

### ❌ 큰 둥근 모서리
```css
.card { border-radius: 24px; }
/* 한국 전통 종이는 직선미 — 너무 둥글면 미감 깨짐 */
```

### ✅ 4-8pt 작은 모서리
```css
.card { border-radius: 8px; }
.code { border-radius: 6px; }
```

---

## 4. 레이아웃

### ❌ 꽉 찬 그리드
```css
.section { padding: 12px; }
.grid { gap: 8px; }
/* 여백 부족 — 한국 문서의 호흡 결여 */
```

### ✅ 여백이 디자인
```css
.section { padding: 48px 32px; }   /* xl */
.grid { gap: 24px; }               /* xl */
.chapter { margin-bottom: 96px; }  /* 2xl */
```

---

## 5. 인쇄

### ❌ 흰 테두리
```css
@page { margin: 1in; background: white; }
/* 본바탕은 백자지인데 인쇄 시 흰 테두리 → 미감 깨짐 */
```

### ✅ 백자지 배경 끝까지
```css
@page { margin: 0; background: #F7F7F2; }
body { -webkit-print-color-adjust: exact; }
```

---

## 6. AI 카피

### ❌ 영문 직역체
```
"본 시스템은 사용자에게 편리함을 제공하는 것입니다."
"~로 인하여 ~한 결과를 도출하였습니다."
```

### ✅ 한국 단정문
```
"삿갓은 백자지 위에 옮겨 적습니다."
"평균 10초 안에 완성된 문서가 백자지 위에 옮겨 적힙니다."
```

---

### ❌ 외국 사례 (Tesla, Musk, Kaku)
```
"Tesla Q1 실적 분석"
"창업자 이력서, 2페이지"
```

### ✅ 한국 사례
```
"카카오 시각디자인팀 이력서"
"무신사 UX 리드 — 7년차"
"서울 그랜드인터컨티넨탈 청첩장"
```

---

## 7. 폰트

### ❌ 유료 폰트 의존
```
font-family: 'TsangerJinKai02';  /* 상업 라이선스 필요 */
font-family: 'Charter';          /* macOS/iOS 외 fallback 깨짐 */
font-family: 'SF Pro';           /* Apple 한정 */
```

### ✅ OFL 무료 한글
```
font-family: 'Nanum Myeongjo', 'Gowun Batang', 'Gowun Dodum', serif;
font-family: 'Pretendard Variable', sans-serif;  /* Apple SD Gothic 호환 */
```

---

## 8. 정체성

### ❌ Kami 클론으로 마케팅
```
"Kami의 한국 버전"
"Kami fork"
```

### ✅ 독립 프로덕트
```
"삿갓 · 한국 AI 문서 생성기"
"백자지 위에 먹글씨로 옮겨 적는 시스템"
```

(영감은 받았지만 메인 origin은 우리)
