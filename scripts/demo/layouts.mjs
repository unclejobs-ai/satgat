// 13종 레이아웃 렌더러 + 갤러리 인덱스.
import { escapeHtml as e, nl2br, page } from "./base.mjs";

const colophon = (type) =>
  `<div class="colophon"><span class="mark">satgat · 笠</span><span>백자지에 단청 한 점 · ${e(type)}</span></div>`;

const promptPanel = (ex, klass = "") =>
  `<aside class="prompt-panel ${klass}"><b>입력 예시</b> ${e(ex.prompt)}</aside>`;

const seal = (ex) => `<span class="seal ${ex.sealClass}">${e(ex.seal)}</span>`;
const eyebrow = (ex) => `<p class="eyebrow">satgat specimen · ${e(ex.type)}</p>`;

const metrics = (rows, klass = "") =>
  `<div class="metrics ${klass}">${rows
    .map(([label, value]) => `<div class="metric"><b>${e(value)}</b><span>${e(label)}</span></div>`)
    .join("")}</div>`;

const chips = (items, klass = "") =>
  `<div class="chips">${items.map((s) => `<span class="chip ${klass}">${e(s)}</span>`).join("")}</div>`;

// ---------- A4 세로 ----------
function resume(ex) {
  const p = ex.payload;
  return `<main class="sheet">${seal(ex)}${eyebrow(ex)}
    <h1>${e(p.name)} <span class="hanja">${e(p.hanja)}</span></h1>
    <p class="subtitle">${e(p.role)}</p>
    <p class="meta">${e(p.contact)}</p>
    <div class="rule"></div>
    <div class="two"><div><p class="lead">${e(p.summary)}</p></div>${metrics(p.metrics)}</div>
    <section class="section"><h2 class="bar">경력</h2><div class="timeline">${p.timeline
      .map(([period, head, bullets]) => `<div class="item item-grid"><time>${e(period)}</time><div><h3>${e(head)}</h3><ul>${bullets
        .map((b) => `<li>${e(b)}</li>`)
        .join("")}</ul></div></div>`)
      .join("")}</div></section>
    <div class="two even" style="margin-top:26px">
      <section><h2 class="bar">핵심 역량</h2>${chips(p.skills)}</section>
      <section><h2 class="bar jade">학력 · 활동</h2><div class="history">${p.education
        .map(([what, when]) => `<div class="history-row"><b>${e(when)}</b><span>${e(what)}</span></div>`)
        .join("")}</div></section>
    </div>
    ${colophon(ex.type)}</main>${promptPanel(ex)}`;
}

function essay(ex) {
  const p = ex.payload;
  return `<main class="sheet">${seal(ex)}${eyebrow(ex)}
    <h1>${e(p.name)}</h1>
    <p class="subtitle">${e(p.role)} · ${e(p.target)}</p>
    <div class="quote"><p>${e(p.quote)}</p></div>
    ${p.sections
      .map(([title, summary, body], i) => `<section class="section"><h2 class="bar">${i + 1}. ${e(title)}</h2><p class="kicker">${e(summary)}</p><p>${e(body)}</p></section>`)
      .join("")}
    ${colophon(ex.type)}</main>${promptPanel(ex)}`;
}

function product(ex) {
  const p = ex.payload;
  return `<main class="sheet">${seal(ex)}${eyebrow(ex)}
    <h1>${e(p.product)}</h1>
    <p class="subtitle">${e(p.tagline)}</p>
    <div class="rule"></div>
    <p class="lead">${e(p.lead)}</p>
    <div class="block-grid">${p.features
      .map(([h, t], i) => `<div class="block"><div class="n">0${i + 1}</div><h3>${e(h)}</h3><p>${e(t)}</p></div>`)
      .join("")}</div>
    <div class="two" style="margin-top:28px">
      <section><h2 class="bar">제품 사양</h2><table class="data"><tbody>${p.spec
        .map(([k, v]) => `<tr><td>${e(k)}</td><td class="num">${e(v)}</td></tr>`)
        .join("")}</tbody></table></section>
      <section><h2 class="bar jade">이런 분께</h2>${chips(p.uses, "dan")}
        <div class="gold-div"><i></i></div>
        <p class="meta">상담·구매 — 온정 공식 스토어 / 전국 백화점 입점 문의 가능</p></section>
    </div>
    ${colophon(ex.type)}</main>${promptPanel(ex)}`;
}

function profile(ex) {
  const p = ex.payload;
  return `<main class="sheet">${seal(ex)}${eyebrow(ex)}
    <h1>${e(p.company)}</h1>
    <p class="subtitle">${e(p.tagline)}</p>
    <div class="rule"></div>
    <div class="two"><div><p class="lead">${e(p.vision)}</p>
      <div class="quote"><p>${e(p.quote)}</p></div></div>${metrics(p.stats.map(([l, v]) => [l, v]))}</div>
    <div class="two even" style="margin-top:26px">
      <section><h2 class="bar">연혁</h2><div class="history">${p.history
        .map(([y, ev]) => `<div class="history-row"><b>${e(y)}</b><span>${e(ev)}</span></div>`)
        .join("")}</div></section>
      <section><h2 class="bar jade">팀</h2><div class="history">${p.team
        .map(([who, bio]) => `<div class="history-row"><b>·</b><span><b style="color:var(--ink)">${e(who)}</b><br><span class="muted" style="font-size:13px">${e(bio)}</span></span></div>`)
        .join("")}</div></section>
    </div>
    <section class="section"><h2 class="bar gold">브랜드 기준</h2>${chips(p.values)}</section>
    ${colophon(ex.type)}</main>${promptPanel(ex)}`;
}

function proposal(ex) {
  const p = ex.payload;
  return `<main class="sheet">${seal(ex)}${eyebrow(ex)}
    <h1>${e(p.headline)}</h1>
    <p class="subtitle">${e(p.subtitle)}</p>
    <p class="meta">${e(p.client)}</p>
    ${metrics(p.metrics, "four")}
    <div class="block-grid">${p.blocks
      .map(([h, t], i) => `<div class="block"><div class="n">0${i + 1}</div><h3>${e(h)}</h3><p>${e(t)}</p></div>`)
      .join("")}</div>
    <section class="section"><h2 class="bar">실행 일정</h2><table class="data"><thead><tr><th style="width:110px">기간</th><th style="width:90px">단계</th><th>주요 활동</th></tr></thead><tbody>${p.schedule
      .map(([when, phase, what]) => `<tr><td class="num" style="text-align:left">${e(when)}</td><td>${e(phase)}</td><td>${e(what)}</td></tr>`)
      .join("")}</tbody></table></section>
    ${colophon(ex.type)}</main>${promptPanel(ex)}`;
}

function storybook(ex) {
  const p = ex.payload;
  return `<main class="sheet">${seal(ex)}${eyebrow(ex)}
    <h1>${e(p.brand)}</h1>
    <p class="subtitle latin">${e(p.tagline)}</p>
    <div class="sb-figure"><span>${e(p.figureLabel)}</span></div>
    <p class="lead">${e(p.intro)}</p>
    ${p.chapters
      .map(([no, title, body]) => `<section class="sb-chapter"><span class="cno">${e(no)}</span><h2 class="bar gold" style="margin-top:4px">${e(title)}</h2><p>${e(body)}</p></section>`)
      .join("")}
    <div class="quote" style="border-color:var(--gold)"><p>${e(p.quote)}</p><cite>${e(p.credit)}</cite></div>
    ${colophon(ex.type)}</main>${promptPanel(ex)}`;
}

function newsletter(ex) {
  const p = ex.payload;
  return `<main class="sheet">${seal(ex)}
    <div class="masthead"><div><div class="mh-title">${e(p.title)}</div><p class="meta" style="margin-top:4px">${e(p.tagline)}</p></div><div class="mh-meta">${e(p.issue)}</div></div>
    <div class="nl-lead"><p class="kicker">${e(p.leadKicker)}</p><h2>${e(p.leadTitle)}</h2><p>${e(p.leadBody)}</p></div>
    <div class="gold-div"><i></i></div>
    <div class="nl-cols">${p.items
      .map(([h, t]) => `<div class="nl-item"><h3>${e(h)}</h3><p>${e(t)}</p></div>`)
      .join("")}</div>
    <div class="nl-aside" style="margin-top:24px"><p class="kicker">${e(p.aside[0])}</p><p style="font-family:var(--serif);font-size:18px;margin:0">${e(p.aside[1])}</p></div>
    <div class="colophon"><span class="mark">satgat · 笠</span><span>${e(p.foot)}</span></div></main>${promptPanel(ex)}`;
}

// ---------- A4 가로 ----------
function onepager(ex) {
  const p = ex.payload;
  return `<main class="sheet land">${seal(ex)}${eyebrow(ex)}
    <div class="two" style="grid-template-columns:1.3fr .7fr;align-items:end">
      <div><h1 style="font-size:34px">${e(p.brand)}</h1><p class="subtitle latin" style="margin-top:6px">${e(p.tagline)}</p></div>
    </div>
    <div class="gold-div"><i></i></div>
    <p class="op-hero">${nl2br(p.hero)}</p>
    <div class="op-grid" style="margin-top:26px">${p.pillars
      .map(([h, t]) => `<div class="op-pillar"><h3>${e(h)}</h3><p>${e(t)}</p></div>`)
      .join("")}</div>
    ${metrics(p.metrics, "four")}
    <div class="colophon"><span class="mark">satgat · 笠</span><span>${e(p.cta)}</span></div></main>${promptPanel(ex, "land")}`;
}

function portfolio(ex) {
  const p = ex.payload;
  return `<main class="sheet land">${seal(ex)}${eyebrow(ex)}
    <div class="pf-head"><div><h1 style="font-size:36px">${e(p.studio)}</h1><p class="subtitle latin" style="margin-top:6px">${e(p.tagline)}</p><p class="lead" style="margin-top:14px;max-width:52ch">${e(p.about)}</p></div>${metrics(p.stats)}</div>
    <div class="works">${p.works
      .map(([mark, title, desc]) => `<article class="work"><div class="thumb"><b>${e(mark)}</b></div><div class="wb"><h3>${e(title)}</h3><p>${e(desc)}</p></div></article>`)
      .join("")}</div>
    <div class="colophon"><span class="mark">satgat · 笠</span><span>${e(p.contact)}</span></div></main>${promptPanel(ex, "land")}`;
}

// ---------- 16:9 덱 ----------
function deck(ex) {
  const p = ex.payload;
  const total = p.slides.length + 1;
  const no = (n) => String(n).padStart(2, "0");
  const cover = `<section class="deck-page deck-cover" data-no="${no(1)}" data-of="${no(total)}">${seal(ex)}
    <p class="eyebrow">${e(p.company)} · ${e(p.round)}</p>
    <h1 class="deck-title">${e(p.company)}</h1>
    <p class="deck-lead">${e(p.tagline)}</p></section>`;
  const slides = p.slides
    .map(([title, lead, cards, mets], i) => {
      const grid = cards
        ? `<div class="deck-grid">${cards.map(([h, t]) => `<div class="deck-card"><h4>${e(h)}</h4><p>${e(t)}</p></div>`).join("")}</div>`
        : "";
      const mrow = mets
        ? `<div class="deck-metrics">${mets.map(([b, s]) => `<div><b>${e(b)}</b><span>${e(s)}</span></div>`).join("")}</div>`
        : "";
      return `<section class="deck-page" data-no="${no(i + 2)}" data-of="${no(total)}">
        <p class="eyebrow">${e(p.company)} · ${e(title)}</p>
        <h1 class="deck-title">${e(lead)}</h1>${grid}${mrow}</section>`;
    })
    .join("");
  return `${cover}${slides}${promptPanel(ex, "deck")}`;
}

// ---------- 명함 (8-up 대지 위 앞뒷면) ----------
function namecard(ex) {
  const p = ex.payload;
  return `<main class="sheet">${seal(ex)}${eyebrow(ex)}
    <h1 style="font-size:32px">명함</h1>
    <p class="subtitle">${e(p.role)}</p>
    <div class="card-stage">
      <div class="namecard"><div class="cseal">${e(p.mark)}</div>
        <div class="nm">${e(p.name)} <span class="hanja">${e(p.hanja)}</span></div>
        <div class="role">${e(p.role)}</div>
        <div class="info">${p.info.map((l) => e(l)).join("<br>")}</div></div>
      <div class="namecard back"><div><div class="bigmark">${e(p.mark)}</div><div class="url">${e(p.url)}</div></div></div>
    </div>
    <div class="two even" style="margin-top:30px">
      <section><h2 class="bar jade">인쇄 사양</h2><table class="data"><tbody>
        <tr><td>규격</td><td class="num">90 × 55mm</td></tr>
        <tr><td>대지</td><td class="num">A4 8-up</td></tr>
        <tr><td>용지</td><td class="num">백색 면지 300g</td></tr>
        <tr><td>후가공</td><td class="num">단청 박 1도</td></tr></tbody></table></section>
      <section><h2 class="bar">디자인 노트</h2><p>앞면은 이름과 직함만 남겨 여백을 충분히 둡니다. 뒷면은 브랜드 인장 한 글자(${e(p.mark)})로 정체성을 압축합니다. 단청은 인장에만 쓰여 한 면의 5%를 넘지 않습니다.</p></section>
    </div>
    ${colophon(ex.type)}</main>${promptPanel(ex)}`;
}

// ---------- 엽서 (청첩장·연하장) ----------
function invitation(ex) {
  const p = ex.payload;
  return `<main class="card-sheet dan">${seal(ex)}
    <p class="card-title">${e(p.title)}</p>
    <div class="card-names">${e(p.names)}</div>
    <p class="meta" style="letter-spacing:.1em">${e(p.hanja)}</p>
    <p class="card-msg">${nl2br(p.message)}</p>
    <div class="gold-div" style="width:60%;margin-left:auto;margin-right:auto"><i></i></div>
    <p class="card-when"><b>${e(p.date)}</b><br><span class="muted" style="font-size:11px">${e(p.dateHanja)}</span></p>
    <p class="card-line">${e(p.venue)}</p>
    <p class="card-line">${e(p.transport)}</p>
    <p class="card-foot">${nl2br(p.families)}</p></main>${promptPanel(ex, "card")}`;
}

function newyear(ex) {
  const p = ex.payload;
  return `<main class="card-sheet">${seal(ex)}
    <p class="ygreet">${e(p.greet)}</p>
    <p class="yyear">${e(p.year)}</p>
    <div class="gold-div" style="width:55%;margin-left:auto;margin-right:auto"><i></i></div>
    <p class="card-msg">${nl2br(p.message)}</p>
    <p class="card-when"><b style="color:var(--dan)">${e(p.blessing)}</b></p>
    <p class="card-foot">${e(p.from)}</p></main>${promptPanel(ex, "card")}`;
}

const LAYOUTS = { resume, essay, product, profile, proposal, storybook, newsletter, onepager, portfolio, deck, namecard, invitation, newyear };

export function renderExample(ex) {
  const fn = LAYOUTS[ex.layout];
  if (!fn) throw new Error(`Unknown layout: ${ex.layout}`);
  const bodyClass = ex.form === "deck" ? "deck-doc" : "";
  return page(ex.title, fn(ex), bodyClass);
}

export function renderIndex(examples) {
  return page(
    "satgat 한국어 데모팩",
    `<main class="gallery">
      <p class="eyebrow">satgat korean demo pack · 13 specimens</p>
      <h1>한국어 한 문장이 한국형 문서로 바뀌는 장면</h1>
      <p class="gallery-lead">각 예시는 자연어 brief, 구조화된 문서 내용, HTML 원본, 인쇄용 PDF, 미리보기 PNG를 한 묶음으로 제공합니다. 백자지 캔버스 위 단청 한 점, 명조 위계 — satgat 디자인 8조를 그대로 따른 13종 전수 데모팩입니다.</p>
      <section class="cards">
        ${examples
          .map(
            (ex) => `<article class="card">
          <a href="./${ex.id}.html"><img class="shot" src="./${ex.id}.png" alt="${e(ex.title)} 미리보기" loading="lazy"></a>
          <div class="card-body">
            <p class="ct">${e(ex.type)}</p>
            <h2>${e(ex.title)}</h2>
            <p class="cm">${e(ex.meta)}</p>
            <p class="cp">${e(ex.prompt)}</p>
            <div class="links"><a href="./${ex.id}.html">문서 열기</a><a href="./${ex.id}.png">PNG</a><a href="./${ex.id}.html" title="브라우저 인쇄 → PDF">인쇄</a></div>
          </div>
        </article>`
          )
          .join("")}
      </section>
    </main>`
  );
}
