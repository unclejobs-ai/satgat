import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = join(process.cwd(), "public", "satgat", "assets", "examples", "ko");

const examples = [
  {
    id: "resume-kim-sumin",
    type: "이력서",
    title: "김수민 이력서",
    meta: "한국어 · A4 · 2p",
    seal: "履",
    prompt:
      "7년차 프론트엔드 개발자 김수민의 이력서를 한국 스타트업 채용 담당자가 빠르게 읽을 수 있게 만들어줘. React, 디자인 시스템, 결제 전환율 개선 경험을 중심으로.",
    layout: "resume",
    payload: {
      name: "김수민",
      hanja: "金秀珉",
      role: "프론트엔드 엔지니어 · 디자인 시스템",
      contact: "sumin.kim@example.com · github.com/sumin-kim · 서울",
      summary:
        "디자인 시스템과 제품 지표 사이를 연결하는 프론트엔드 엔지니어입니다. 컴포넌트 품질, 접근성, 결제 퍼널 개선을 함께 다루며 복잡한 사용자 흐름을 읽기 쉬운 인터페이스로 정리합니다.",
      metrics: [
        ["결제 전환율", "+18.4%"],
        ["공통 컴포넌트", "62개"],
        ["접근성 이슈", "-73%"],
      ],
      timeline: [
        ["2023 - 현재", "라운드테이블", "시니어 프론트엔드 엔지니어", "결제/구독 플로우 재설계, 디자인 토큰 마이그레이션, 사내 문서화 체계 구축."],
        ["2020 - 2023", "모노랩스", "프론트엔드 리드", "상품 상세와 검색 결과 페이지를 통합하고 A/B 테스트 기반으로 전환율 개선."],
        ["2018 - 2020", "스튜디오결", "프로덕트 엔지니어", "초기 SaaS 관리자 도구와 고객 온보딩 화면 구현."],
      ],
      skills: ["React", "TypeScript", "Next.js", "Design System", "Accessibility", "Experimentation"],
    },
  },
  {
    id: "self-intro-yoon-hajin",
    type: "자기소개서",
    title: "윤하진 자기소개서",
    meta: "한국어 · A4 · 4문항",
    seal: "介",
    prompt:
      "AI 서비스 기획자 윤하진이 B2B SaaS 회사에 지원하는 자기소개서를 써줘. 과장하지 말고, 고객 인터뷰와 제품 실험을 통해 배운 점이 보이게.",
    layout: "essay",
    payload: {
      name: "윤하진",
      role: "AI 서비스 기획자",
      target: "B2B SaaS Product Manager 지원",
      sections: [
        ["지원 동기", "좋은 AI 제품은 모델의 성능만으로 완성되지 않는다고 믿습니다. 사용자가 어떤 순간에 불안해하고, 어떤 근거를 확인해야 다음 행동으로 넘어가는지 이해해야 합니다. 저는 고객 인터뷰와 로그 분석을 함께 보며 기능의 형태를 좁혀 온 경험을 바탕으로, 귀사의 업무 자동화 제품이 더 신뢰받는 도구가 되도록 기여하고 싶습니다."],
        ["직무 역량", "이전 팀에서 42명의 고객 담당자와 인터뷰를 진행했고, 반복 문의를 유형화해 온보딩 체크리스트와 추천 액션을 설계했습니다. 출시 후 첫 달 활성 사용률은 31%에서 47%로 올랐고, 고객 지원 티켓은 24% 줄었습니다. 숫자보다 중요했던 것은 팀이 같은 기준으로 문제를 바라보게 된 점이었습니다."],
        ["성장 과정", "처음에는 좋은 기획서를 쓰는 일이 제품 기획의 핵심이라고 생각했습니다. 그러나 실제 운영에서는 문서보다 빠르게 변하는 고객의 언어가 더 중요했습니다. 그래서 기능 설명보다 관찰 기록, 실험 로그, 실패 원인을 더 꼼꼼히 남기기 시작했습니다."],
        ["입사 후 포부", "입사 후에는 AI 기능의 성공 기준을 '생성 여부'가 아니라 '사용자가 검토하고 채택할 수 있는가'로 세우겠습니다. 고객 업무의 맥락을 반영한 프롬프트, 결과 검증 흐름, 팀 내부 운영 지표를 함께 설계해 제품 신뢰도를 높이겠습니다."],
      ],
    },
  },
  {
    id: "proposal-hanji-retail",
    type: "제안서",
    title: "한지 리테일 전환 제안서",
    meta: "한국어 · A4 · 3p",
    seal: "案",
    prompt:
      "지역 공예 브랜드의 온라인 매출을 높이기 위한 3개월 제안서를 만들어줘. 상세페이지, 뉴스레터, 명절 선물 기획을 하나의 실행안으로 묶어줘.",
    layout: "proposal",
    payload: {
      headline: "지역 공예 브랜드 온라인 전환 제안",
      subtitle: "상세페이지, 뉴스레터, 명절 선물 기획을 하나의 판매 흐름으로 연결합니다.",
      client: "제출처 · 느린손 공방",
      metrics: [
        ["3개월", "실행 기간"],
        ["12종", "상품 스토리 정리"],
        ["2회", "명절 캠페인"],
        ["15%", "목표 재구매율"],
      ],
      blocks: [
        ["문제", "현재 상품의 품질은 충분하지만 온라인 화면에서는 재료, 제작자, 사용 장면이 분리되어 전달됩니다. 고객은 왜 이 가격이어야 하는지 이해하기 전에 페이지를 이탈합니다."],
        ["해결 방향", "상품별 제작 서사를 한지 톤 상세페이지로 정리하고, 구매 전 고민을 뉴스레터와 선물 큐레이션으로 이어 붙입니다. 한 번의 구매가 브랜드 기억으로 남도록 포장 문구와 사후 메시지도 함께 설계합니다."],
        ["실행 일정", "1주차 진단, 2-4주차 대표 상품 6종 리뉴얼, 5-8주차 뉴스레터와 선물 기획 운영, 9-12주차 성과 분석과 재구매 캠페인."],
      ],
    },
  },
  {
    id: "company-profile-dalbit",
    type: "회사 소개서",
    title: "달빛식품 회사 소개서",
    meta: "한국어 · A4 · 4p",
    seal: "社",
    prompt:
      "프리미엄 전통 간편식 브랜드 달빛식품의 회사 소개서를 만들어줘. 투자자와 유통 MD가 함께 볼 문서라서 브랜드 철학과 숫자가 균형 있게 보여야 해.",
    layout: "profile",
    payload: {
      company: "달빛식품",
      tagline: "오늘의 식탁에 오래된 조리법을 다시 올립니다.",
      vision:
        "달빛식품은 지역 장인과 협업해 전통 장류와 제철 재료를 현대 가정식 형태로 다시 설계하는 푸드 브랜드입니다. 느린 조리법의 깊이는 유지하되, 보관과 조리 경험은 오늘의 생활 리듬에 맞춥니다.",
      stats: [
        ["38곳", "지역 생산자 네트워크"],
        ["91%", "정기구독 재구매율"],
        ["14종", "대표 간편식 라인업"],
      ],
      history: [
        ["2024", "전통 장류 기반 밀키트 4종 출시"],
        ["2025", "새벽배송 채널 입점, 월 반복 구매 1만 건 돌파"],
        ["2026", "지역 생산자 공동 브랜드 프로그램 시작"],
      ],
      values: ["지역성", "느린 발효", "짧은 조리", "정직한 원재료"],
    },
  },
  {
    id: "investor-deck-maruai",
    type: "투자 IR 덱",
    title: "마루AI 투자 IR 덱",
    meta: "한국어 · 16:9 · 5 slides",
    seal: "投",
    prompt:
      "한국 중소기업을 위한 문서 자동화 SaaS 마루AI의 Seed 투자 IR 덱을 만들어줘. 문제, 해결책, 시장, traction, 요청 금액이 한눈에 보이게.",
    layout: "deck",
    payload: {
      company: "마루AI",
      tagline: "중소기업 문서를 10분 안에 실무 양식으로 바꿉니다.",
      slides: [
        ["문제", "보고서, 제안서, 공문이 여전히 담당자의 야근과 복붙으로 만들어집니다.", ["양식마다 다른 문체", "검토 기준 부재", "PDF 전환 품질 불안정"]],
        ["해결책", "업종별 템플릿, 검증 가능한 JSON, 브라우저 렌더링을 하나의 생성 흐름으로 묶습니다.", ["자연어 brief", "구조화 데이터", "인쇄 가능한 결과물"]],
        ["시장", "국내 중소기업 771만 개 중 반복 문서 업무가 많은 1차 타깃을 공략합니다.", ["세무/노무/제안 문서", "월 구독형 SaaS", "파트너 채널 판매"]],
        ["Traction", "비공개 베타 6주 동안 83개 팀이 1,420건의 문서를 생성했습니다.", ["주간 재방문 52%", "평균 생성 시간 7분", "유료 전환 의향 38%"]],
        ["요청", "Seed 7억 원으로 업종 템플릿 40종, 파트너 세일즈, 보안 검토 체계를 구축합니다.", ["18개월 runway", "B2B 세일즈 2명", "문서 QA 자동화"]],
      ],
    },
  },
  {
    id: "invitation-jisoo-minho",
    type: "청첩장",
    title: "지수와 민호 청첩장",
    meta: "한국어 · A5 · 모바일 공유",
    seal: "牒",
    prompt:
      "지수와 민호의 청첩장을 만들어줘. 과하게 화려하지 않고, 가족 어른들이 읽기 편한 한글 중심의 따뜻한 문장으로.",
    layout: "invitation",
    payload: {
      groom: "민호",
      bride: "지수",
      groomHanja: "珉鎬",
      brideHanja: "智秀",
      date: "2026년 10월 17일 토요일 오후 2시",
      dateHanja: "丙午年 十月 十七日",
      venue: "서울 정동 예식당 · 은행나무홀",
      message:
        "서로의 계절을 천천히 배워 온 두 사람이 이제 한 집의 이름으로 걸어가려 합니다. 귀한 걸음으로 축복해 주시면 그 마음 오래 간직하겠습니다.",
      families: "김영호 · 박미정의 장남 민호  /  이성재 · 최은주의 장녀 지수",
    },
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function page(title, body, extraClass = "") {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} · satgat demo</title>
  <style>${baseCss()}</style>
</head>
<body class="${extraClass}">
${body}
</body>
</html>`;
}

function baseCss() {
  return `
    @page { size: A4; margin: 0; background: #f7f7f2; }
    @page deck { size: 16in 9in; margin: 0; }
    * { box-sizing: border-box; }
    :root {
      --paper: #f7f7f2;
      --ivory: #fffffb;
      --ink: #1c1916;
      --muted: #565b53;
      --stone: #73786f;
      --line: #d2d6cb;
      --soft: #e6e8de;
      --dan: #9b1b1b;
      --jade: #2e6b5e;
      --gold: #b8954f;
      --serif: "AppleMyungjo", "Nanum Myeongjo", "Noto Serif CJK KR", "Gowun Batang", "Batang", serif;
      --sans: "Apple SD Gothic Neo", "Gowun Dodum", "Noto Sans KR", system-ui, sans-serif;
    }
    html, body { margin: 0; min-height: 100%; background: var(--paper); color: var(--ink); }
    body { font-family: var(--serif); word-break: keep-all; line-height: 1.56; }
    a { color: inherit; }
    .sheet {
      width: 210mm;
      min-height: 297mm;
      margin: 28px auto;
      padding: 22mm 20mm;
      background:
        radial-gradient(circle at 20% 12%, rgba(46,107,94,.055), transparent 28%),
        linear-gradient(135deg, rgba(155,27,27,.032), transparent 34%),
        var(--paper);
      border: 1px solid var(--line);
      box-shadow: 0 18px 60px rgba(28,25,22,.1);
      position: relative;
      overflow: hidden;
    }
    .sheet:before {
      content: "";
      position: absolute;
      inset: 11mm;
      border: 1px solid rgba(155,27,27,.18);
      pointer-events: none;
    }
    .sheet > * { position: relative; z-index: 1; }
    .seal {
      position: absolute;
      right: 20mm;
      top: 20mm;
      width: 19mm;
      height: 19mm;
      border: 1.2mm solid var(--dan);
      color: var(--dan);
      display: grid;
      place-items: center;
      font-size: 20px;
      font-weight: 700;
      line-height: 1;
      transform: rotate(-4deg);
      opacity: .92;
    }
    .eyebrow {
      font-family: var(--sans);
      font-size: 10px;
      letter-spacing: .24em;
      color: var(--stone);
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    h1 {
      margin: 0;
      font-size: 46px;
      line-height: 1.08;
      letter-spacing: 0;
      font-weight: 700;
    }
    .hanja { color: var(--stone); font-size: .48em; margin-left: .25em; font-weight: 400; }
    .subtitle { margin: 12px 0 0; font-size: 17px; color: var(--muted); max-width: 560px; }
    .rule { width: 72px; height: 3px; background: var(--dan); margin: 28px 0; }
    .two { display: grid; grid-template-columns: 1.1fr .9fr; gap: 24px; }
    .section { margin-top: 26px; }
    .section h2 {
      margin: 0 0 10px;
      padding-left: 10px;
      border-left: 4px solid var(--dan);
      font-size: 19px;
      line-height: 1.25;
    }
    p { margin: 0 0 10px; color: #36322d; }
    .lead { font-size: 15px; color: #342f2a; }
    .muted { color: var(--muted); }
    .meta { font-family: var(--sans); color: var(--stone); font-size: 12px; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 24px 0; }
    .metrics.four { grid-template-columns: repeat(4, 1fr); }
    .metric { background: var(--ivory); border: 1px solid var(--line); border-radius: 6px; padding: 12px; }
    .metric b { display: block; color: var(--dan); font-size: 22px; line-height: 1.1; }
    .metric span { font-family: var(--sans); color: var(--muted); font-size: 12px; }
    .timeline { display: grid; gap: 12px; }
    .item { border-top: 1px solid var(--line); padding-top: 12px; }
    .item-grid { display: grid; grid-template-columns: 86px 1fr; gap: 16px; }
    .item time { font-family: var(--sans); color: var(--dan); font-size: 12px; font-weight: 700; }
    .item h3 { margin: 0 0 4px; font-size: 16px; }
    .chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 12px; }
    .chip { border: 1px solid var(--line); background: var(--ivory); border-radius: 999px; padding: 5px 9px; font-family: var(--sans); font-size: 11px; color: var(--muted); }
    .essay-q { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--line); }
    .essay-q h2 { border-color: var(--jade); }
    .block-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 18px; }
    .block { background: var(--ivory); border: 1px solid var(--line); border-radius: 8px; padding: 16px; min-height: 146px; }
    .block h3 { margin: 0 0 8px; color: var(--dan); font-size: 17px; }
    .history { margin-top: 18px; border-top: 1px solid var(--line); }
    .history-row { display: grid; grid-template-columns: 80px 1fr; gap: 18px; padding: 12px 0; border-bottom: 1px solid var(--line); }
    .history-row b { color: var(--dan); }
    .deck-page { page: deck; width: 16in; height: 9in; margin: 0 auto 24px; padding: 72px 84px; background: var(--paper); border-bottom: 1px solid var(--line); position: relative; overflow: hidden; }
    .deck-page:after { content: attr(data-no); position: absolute; right: 44px; bottom: 30px; font-family: var(--sans); color: var(--stone); font-size: 16px; }
    .deck-title { font-size: 70px; line-height: 1.05; max-width: 940px; }
    .deck-lead { font-size: 28px; color: var(--muted); max-width: 980px; margin-top: 22px; }
    .deck-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-top: 58px; }
    .deck-card { background: var(--ivory); border: 1px solid var(--line); border-radius: 12px; padding: 24px; font-size: 23px; min-height: 150px; }
    .invite { text-align: center; padding: 28mm 24mm; }
    .invite h1 { font-size: 54px; }
    .invite .names { margin: 48px 0 18px; font-size: 48px; letter-spacing: .18em; }
    .invite .message { max-width: 500px; margin: 34px auto; font-size: 17px; }
    .prompt-panel {
      width: 210mm;
      margin: -12px auto 32px;
      padding: 14px 18px;
      border: 1px solid var(--line);
      background: var(--ivory);
      font-family: var(--sans);
      color: var(--muted);
      font-size: 13px;
    }
    .prompt-panel b { color: var(--dan); }
    .gallery {
      max-width: 1180px;
      margin: 0 auto;
      padding: 56px 28px 80px;
    }
    .gallery h1 { font-size: clamp(38px, 6vw, 72px); max-width: 820px; }
    .gallery-lead { max-width: 760px; font-size: 18px; color: var(--muted); margin-top: 18px; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 38px; }
    .card { background: var(--ivory); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; text-decoration: none; }
    .card img { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; object-position: top center; display: block; background: var(--paper); }
    .card-body { padding: 16px; }
    .card h2 { margin: 0 0 4px; font-size: 19px; }
    .card p { font-family: var(--sans); font-size: 13px; color: var(--muted); margin: 0 0 12px; }
    .links { display: flex; gap: 10px; font-family: var(--sans); font-size: 12px; color: var(--dan); }
    @media (max-width: 900px) {
      .sheet, .prompt-panel { width: calc(100vw - 24px); }
      .sheet { padding: 28px; min-height: auto; }
      .cards { grid-template-columns: 1fr; }
      .two, .block-grid { grid-template-columns: 1fr; }
    }
    @media print {
      html, body { background: var(--paper); }
      .sheet { margin: 0; border: 0; box-shadow: none; width: auto; min-height: 297mm; break-after: page; }
      .prompt-panel, .gallery { display: none; }
      .deck-page { margin: 0; border: 0; break-after: page; }
    }
  `;
}

function renderExample(example) {
  const p = example.payload;
  const prompt = `<aside class="prompt-panel"><b>입력 예시</b> ${escapeHtml(example.prompt)}</aside>`;
  if (example.layout === "resume") {
    return page(
      example.title,
      `<main class="sheet">
        <span class="seal">${example.seal}</span>
        <div class="eyebrow">satgat specimen · ${escapeHtml(example.type)}</div>
        <h1>${escapeHtml(p.name)} <span class="hanja">${escapeHtml(p.hanja)}</span></h1>
        <p class="subtitle">${escapeHtml(p.role)}</p>
        <p class="meta">${escapeHtml(p.contact)}</p>
        <div class="rule"></div>
        <div class="two">
          <section><p class="lead">${escapeHtml(p.summary)}</p></section>
          <section class="metrics">${p.metrics.map(([label, value]) => `<div class="metric"><b>${escapeHtml(value)}</b><span>${escapeHtml(label)}</span></div>`).join("")}</section>
        </div>
        <section class="section"><h2>경력</h2><div class="timeline">${p.timeline.map(([period, company, role, desc]) => `<div class="item item-grid"><time>${escapeHtml(period)}</time><div><h3>${escapeHtml(company)} · ${escapeHtml(role)}</h3><p>${escapeHtml(desc)}</p></div></div>`).join("")}</div></section>
        <section class="section"><h2>핵심 역량</h2><div class="chips">${p.skills.map((s) => `<span class="chip">${escapeHtml(s)}</span>`).join("")}</div></section>
      </main>${prompt}`
    );
  }
  if (example.layout === "essay") {
    return page(
      example.title,
      `<main class="sheet">
        <span class="seal">${example.seal}</span>
        <div class="eyebrow">satgat specimen · ${escapeHtml(example.type)}</div>
        <h1>${escapeHtml(p.name)}</h1>
        <p class="subtitle">${escapeHtml(p.role)} · ${escapeHtml(p.target)}</p>
        <div class="rule"></div>
        ${p.sections.map(([title, text], i) => `<section class="essay-q"><h2>${i + 1}. ${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></section>`).join("")}
      </main>${prompt}`
    );
  }
  if (example.layout === "proposal") {
    return page(
      example.title,
      `<main class="sheet">
        <span class="seal">${example.seal}</span>
        <div class="eyebrow">satgat specimen · ${escapeHtml(example.type)}</div>
        <h1>${escapeHtml(p.headline)}</h1>
        <p class="subtitle">${escapeHtml(p.subtitle)}</p>
        <p class="meta">${escapeHtml(p.client)}</p>
        <div class="metrics four">${p.metrics.map(([value, label]) => `<div class="metric"><b>${escapeHtml(value)}</b><span>${escapeHtml(label)}</span></div>`).join("")}</div>
        <div class="block-grid">${p.blocks.map(([title, text]) => `<section class="block"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></section>`).join("")}</div>
      </main>${prompt}`
    );
  }
  if (example.layout === "profile") {
    return page(
      example.title,
      `<main class="sheet">
        <span class="seal">${example.seal}</span>
        <div class="eyebrow">satgat specimen · ${escapeHtml(example.type)}</div>
        <h1>${escapeHtml(p.company)}</h1>
        <p class="subtitle">${escapeHtml(p.tagline)}</p>
        <div class="rule"></div>
        <p class="lead">${escapeHtml(p.vision)}</p>
        <div class="metrics">${p.stats.map(([value, label]) => `<div class="metric"><b>${escapeHtml(value)}</b><span>${escapeHtml(label)}</span></div>`).join("")}</div>
        <section class="section"><h2>연혁</h2><div class="history">${p.history.map(([year, event]) => `<div class="history-row"><b>${escapeHtml(year)}</b><span>${escapeHtml(event)}</span></div>`).join("")}</div></section>
        <section class="section"><h2>브랜드 기준</h2><div class="chips">${p.values.map((s) => `<span class="chip">${escapeHtml(s)}</span>`).join("")}</div></section>
      </main>${prompt}`
    );
  }
  if (example.layout === "deck") {
    return page(
      example.title,
      `${p.slides.map(([title, lead, points], i) => `<section class="deck-page" data-no="${String(i + 1).padStart(2, "0")}">
        <div class="eyebrow">${i === 0 ? escapeHtml(p.company) : "satgat investor deck"}</div>
        <h1 class="deck-title">${i === 0 ? `${escapeHtml(p.company)}<br><span class="hanja">Seed Round</span>` : escapeHtml(title)}</h1>
        <p class="deck-lead">${i === 0 ? escapeHtml(p.tagline) : escapeHtml(lead)}</p>
        <div class="deck-list">${points.map((point) => `<div class="deck-card">${escapeHtml(point)}</div>`).join("")}</div>
      </section>`).join("")}${prompt}`,
      "deck-doc"
    );
  }
  if (example.layout === "invitation") {
    return page(
      example.title,
      `<main class="sheet invite">
        <span class="seal">${example.seal}</span>
        <div class="eyebrow">satgat specimen · ${escapeHtml(example.type)}</div>
        <h1>청 첩 장</h1>
        <div class="names">${escapeHtml(p.bride)} · ${escapeHtml(p.groom)}</div>
        <p class="meta">${escapeHtml(p.brideHanja)} · ${escapeHtml(p.groomHanja)}</p>
        <p class="message">${escapeHtml(p.message)}</p>
        <div class="rule" style="margin-left:auto;margin-right:auto"></div>
        <p><strong>${escapeHtml(p.date)}</strong><br><span class="muted">${escapeHtml(p.dateHanja)}</span></p>
        <p>${escapeHtml(p.venue)}</p>
        <p class="meta">${escapeHtml(p.families)}</p>
      </main>${prompt}`
    );
  }
  throw new Error(`Unknown layout: ${example.layout}`);
}

function renderIndex() {
  return page(
    "satgat 한국어 데모팩",
    `<main class="gallery">
      <div class="eyebrow">satgat korean demo pack · generated artifacts</div>
      <h1>한국어 입력이 한국형 문서로 바뀌는 장면</h1>
      <p class="gallery-lead">각 예시는 자연어 brief, 구조화된 문서 내용, HTML 원본, PDF, PNG 미리보기를 한 묶음으로 제공합니다. README와 배포 페이지에서 바로 확인할 수 있는 satgat 전용 데모팩입니다.</p>
      <section class="cards">
        ${examples.map((ex) => `<article class="card">
          <a href="./${ex.id}.html"><img src="./${ex.id}.png" alt="${escapeHtml(ex.title)} 미리보기"></a>
          <div class="card-body">
            <h2>${escapeHtml(ex.title)}</h2>
            <p>${escapeHtml(ex.meta)}</p>
            <p>${escapeHtml(ex.prompt)}</p>
            <div class="links"><a href="./${ex.id}.html">HTML</a><a href="./${ex.id}.pdf">PDF</a><a href="./${ex.id}.png">PNG</a></div>
          </div>
        </article>`).join("")}
      </section>
    </main>`
  );
}

await mkdir(outDir, { recursive: true });

for (const example of examples) {
  await writeFile(join(outDir, `${example.id}.html`), renderExample(example), "utf8");
}

await writeFile(join(outDir, "index.html"), renderIndex(), "utf8");
await writeFile(
  join(outDir, "manifest.json"),
  JSON.stringify(
    examples.map(({ id, type, title, meta, prompt, layout }) => ({
      id,
      type,
      title,
      meta,
      prompt,
      layout,
      html: `${id}.html`,
      pdf: `${id}.pdf`,
      png: `${id}.png`,
    })),
    null,
    2
  ) + "\n",
  "utf8"
);

console.log(`Generated ${examples.length} Korean satgat examples in ${outDir}`);
