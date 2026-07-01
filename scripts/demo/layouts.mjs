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

const palette = ["var(--dan)", "var(--jade)", "var(--gold)", "#D6D9CD", "#73786F"];

const toRows = (rows = []) =>
  rows.map((row) => {
    if (Array.isArray(row)) return { label: String(row[0]), value: Number(row[1]) || 0, note: row[2] ? String(row[2]) : "" };
    return { label: String(row.label ?? ""), value: Number(row.value) || 0, note: row.note ? String(row.note) : "" };
  });

const svgText = (x, y, text, attrs = "") => `<text x="${x}" y="${y}" ${attrs}>${e(text)}</text>`;

function visualFrame(visual, svg, klass = "") {
  const caption = visual.caption ? `<p class="viz-caption">${e(visual.caption)}</p>` : "";
  return `<figure class="viz ${klass ? `viz-${klass}` : ""}">
    <figcaption class="viz-title">${e(visual.title)}</figcaption>
    ${svg}
    ${caption}
  </figure>`;
}

function barVisual(visual, klass = "") {
  const rows = toRows(visual.rows);
  const max = Math.max(...rows.map((row) => row.value), 1);
  const chartX = 32;
  const chartY = 22;
  const chartW = 300;
  const chartH = 110;
  const gap = rows.length > 1 ? 14 : 0;
  const barW = (chartW - gap * Math.max(rows.length - 1, 0)) / Math.max(rows.length, 1);
  const bars = rows
    .map((row, i) => {
      const h = Math.max(4, (row.value / max) * chartH);
      const x = chartX + i * (barW + gap);
      const y = chartY + chartH - h;
      return `<g>
        <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="5" fill="${palette[i % palette.length]}"></rect>
        ${svgText((x + barW / 2).toFixed(1), (y - 8).toFixed(1), `${row.value}${visual.unit ?? ""}`, `class="value" text-anchor="middle"`)}
        ${svgText((x + barW / 2).toFixed(1), 154, row.label, `text-anchor="middle"`)}
      </g>`;
    })
    .join("");
  return visualFrame(
    visual,
    `<svg viewBox="0 0 364 172" role="img" aria-label="${e(visual.title)}">
      <line x1="${chartX}" y1="${chartY + chartH}" x2="${chartX + chartW}" y2="${chartY + chartH}" stroke="var(--line)" stroke-width="1.5"></line>
      ${bars}
    </svg>`,
    klass
  );
}

function horizontalBarVisual(visual, klass = "") {
  const rows = toRows(visual.rows);
  const max = Math.max(...rows.map((row) => row.value), 1);
  const rowsSvg = rows
    .map((row, i) => {
      const y = 20 + i * 31;
      const w = Math.max(12, (row.value / max) * 190);
      return `<g>
        ${svgText(18, y + 13, row.label)}
        <rect x="112" y="${y}" width="196" height="15" rx="7.5" fill="#F2F2EC"></rect>
        <rect x="112" y="${y}" width="${w.toFixed(1)}" height="15" rx="7.5" fill="${palette[i % palette.length]}"></rect>
        ${svgText(322, y + 12, `${row.value}${visual.unit ?? ""}`, `class="value"`)}
      </g>`;
    })
    .join("");
  const h = Math.max(76, 28 + rows.length * 31);
  return visualFrame(
    visual,
    `<svg viewBox="0 0 364 ${h}" role="img" aria-label="${e(visual.title)}">${rowsSvg}</svg>`,
    klass
  );
}

function lineVisual(visual, klass = "") {
  const rows = toRows(visual.rows);
  const max = Math.max(...rows.map((row) => row.value), 1);
  const min = Math.min(0, ...rows.map((row) => row.value));
  const range = Math.max(max - min, 1);
  const chartX = 34;
  const chartY = 24;
  const chartW = 294;
  const chartH = 112;
  const xFor = (i) => chartX + (rows.length === 1 ? chartW / 2 : (i / (rows.length - 1)) * chartW);
  const yFor = (value) => chartY + chartH - ((value - min) / range) * chartH;
  const points = rows.map((row, i) => `${xFor(i).toFixed(1)},${yFor(row.value).toFixed(1)}`).join(" ");
  const nodes = rows
    .map((row, i) => {
      const x = xFor(i);
      const y = yFor(row.value);
      return `<g>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="var(--dan)"></circle>
        ${svgText(x.toFixed(1), 158, row.label, `text-anchor="middle"`)}
      </g>`;
    })
    .join("");
  return visualFrame(
    visual,
    `<svg viewBox="0 0 364 176" role="img" aria-label="${e(visual.title)}">
      <line x1="${chartX}" y1="${chartY}" x2="${chartX}" y2="${chartY + chartH}" stroke="var(--line)" stroke-width="1.2"></line>
      <line x1="${chartX}" y1="${chartY + chartH}" x2="${chartX + chartW}" y2="${chartY + chartH}" stroke="var(--line)" stroke-width="1.2"></line>
      <polyline points="${points}" fill="none" stroke="var(--dan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${nodes}
    </svg>`,
    klass
  );
}

function donutVisual(visual, klass = "") {
  const rows = toRows(visual.rows);
  const total = Math.max(rows.reduce((sum, row) => sum + row.value, 0), 1);
  const r = 42;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const rings = rows
    .map((row, i) => {
      const length = (row.value / total) * circumference;
      const dashOffset = -offset;
      offset += length;
      return `<circle cx="78" cy="78" r="${r}" fill="none" stroke="${palette[i % palette.length]}" stroke-width="18"
        stroke-dasharray="${length.toFixed(2)} ${circumference.toFixed(2)}" stroke-dashoffset="${dashOffset.toFixed(2)}"
        transform="rotate(-90 78 78)"></circle>`;
    })
    .join("");
  const legend = rows
    .map((row, i) => {
      const y = 39 + i * 27;
      return `<g>
        <rect x="170" y="${y}" width="12" height="12" rx="3" fill="${palette[i % palette.length]}"></rect>
        ${svgText(192, y + 10, `${row.label} ${row.value}${visual.unit ?? ""}`)}
      </g>`;
    })
    .join("");
  return visualFrame(
    visual,
    `<svg viewBox="0 0 364 158" role="img" aria-label="${e(visual.title)}">
      <circle cx="78" cy="78" r="${r}" fill="none" stroke="#F2F2EC" stroke-width="18"></circle>
      ${rings}
      ${svgText(78, 75, `${total}${visual.unit ?? ""}`, `class="value" text-anchor="middle"`)}
      ${svgText(78, 94, "합계", `text-anchor="middle"`)}
      ${legend}
    </svg>`,
    klass
  );
}

function waterfallVisual(visual, klass = "") {
  const rows = toRows(visual.rows);
  const totals = [];
  let running = 0;
  for (const row of rows) {
    const start = running;
    running += row.value;
    totals.push({ ...row, start, end: running });
  }
  if (visual.totalLabel) totals.push({ label: visual.totalLabel, value: running, start: 0, end: running, total: true });
  const max = Math.max(...totals.map((row) => Math.max(row.start, row.end)), 1);
  const chartX = 28;
  const chartY = 24;
  const chartW = 306;
  const chartH = 112;
  const gap = 13;
  const barW = (chartW - gap * Math.max(rows.length - 1, 0)) / Math.max(rows.length, 1);
  const yFor = (value) => chartY + chartH - (value / max) * chartH;
  const bars = totals
    .map((row, i) => {
      const x = chartX + i * (barW + gap);
      const top = yFor(Math.max(row.start, row.end));
      const bottom = yFor(Math.min(row.start, row.end));
      const h = Math.max(4, bottom - top);
      const fill = row.total ? "var(--gold)" : palette[i % 2];
      const connector =
        i > 0 && !row.total
          ? `<line x1="${(x - gap).toFixed(1)}" y1="${yFor(totals[i - 1].end).toFixed(1)}" x2="${x.toFixed(1)}" y2="${yFor(row.start).toFixed(1)}" stroke="var(--line)" stroke-width="1.4"></line>`
          : "";
      return `<g>${connector}
        <rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="5" fill="${fill}"></rect>
        ${svgText((x + barW / 2).toFixed(1), (top - 8).toFixed(1), `${row.total ? "" : "+"}${row.value}${visual.unit ?? ""}`, `class="value" text-anchor="middle"`)}
        ${svgText((x + barW / 2).toFixed(1), 158, row.label, `text-anchor="middle"`)}
      </g>`;
    })
    .join("");
  return visualFrame(
    visual,
    `<svg viewBox="0 0 364 176" role="img" aria-label="${e(visual.title)}">
      <line x1="${chartX}" y1="${chartY + chartH}" x2="${chartX + chartW}" y2="${chartY + chartH}" stroke="var(--line)" stroke-width="1.2"></line>
      ${bars}
    </svg>`,
    klass
  );
}

function timelineVisual(visual, klass = "") {
  const rows = (visual.rows ?? []).map((row) => (Array.isArray(row) ? { label: row[0], title: row[1], note: row[2] ?? "" } : row));
  const count = Math.max(rows.length, 1);
  const points = rows
    .map((row, i) => {
      const x = 34 + (count === 1 ? 148 : (i / (count - 1)) * 296);
      const top = i % 2 === 0;
      return `<g>
        <circle cx="${x.toFixed(1)}" cy="88" r="6" fill="${palette[i % palette.length]}"></circle>
        ${svgText(x.toFixed(1), top ? 54 : 124, String(row.label), `class="value" text-anchor="middle"`)}
        ${svgText(x.toFixed(1), top ? 70 : 140, String(row.title), `text-anchor="middle"`)}
      </g>`;
    })
    .join("");
  return visualFrame(
    visual,
    `<svg viewBox="0 0 364 168" role="img" aria-label="${e(visual.title)}">
      <line x1="34" y1="88" x2="330" y2="88" stroke="var(--line)" stroke-width="2"></line>
      ${points}
    </svg>`,
    klass
  );
}

function quadrantVisual(visual, klass = "") {
  const points = (visual.points ?? []).map((point) =>
    Array.isArray(point)
      ? { label: point[0], x: Number(point[1]), y: Number(point[2]), tone: point[3] ?? "dan" }
      : { label: point.label, x: Number(point.x), y: Number(point.y), tone: point.tone ?? "dan" }
  );
  const tone = (name) => (name === "jade" ? "var(--jade)" : name === "gold" ? "var(--gold)" : name === "stone" ? "#73786F" : "var(--dan)");
  const marks = points
    .map((point) => {
      const x = 48 + point.x * 260;
      const y = 134 - point.y * 98;
      return `<g>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${tone(point.tone)}"></circle>
        ${svgText((x + 10).toFixed(1), (y - 7).toFixed(1), point.label, `class="value"`)}
      </g>`;
    })
    .join("");
  return visualFrame(
    visual,
    `<svg viewBox="0 0 364 176" role="img" aria-label="${e(visual.title)}">
      <rect x="48" y="36" width="260" height="98" rx="8" fill="#FFFFFB" stroke="var(--line)"></rect>
      <line x1="178" y1="36" x2="178" y2="134" stroke="var(--line)" stroke-width="1.2"></line>
      <line x1="48" y1="85" x2="308" y2="85" stroke="var(--line)" stroke-width="1.2"></line>
      ${svgText(178, 158, visual.xLabel ?? "대중성", `text-anchor="middle"`)}
      ${svgText(18, 88, visual.yLabel ?? "격식", `transform="rotate(-90 18 88)" text-anchor="middle"`)}
      ${marks}
    </svg>`,
    klass
  );
}

function flowVisual(visual, klass = "") {
  const steps = (visual.steps ?? []).map((step) =>
    Array.isArray(step) ? { label: step[0], note: step[1] ?? "" } : { label: step.label, note: step.note ?? "" }
  );
  const nodes = steps
    .map((step, i) => {
      const y = 24 + i * 42;
      const fill = i === steps.length - 1 ? "var(--gold)" : palette[i % 2];
      const arrow =
        i < steps.length - 1
          ? `<path d="M182 ${y + 26} L182 ${y + 36}" stroke="var(--line)" stroke-width="2" stroke-linecap="round"></path>
             <path d="M176 ${y + 32} L182 ${y + 38} L188 ${y + 32}" fill="none" stroke="var(--line)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>`
          : "";
      return `<g>
        <rect x="36" y="${y}" width="292" height="28" rx="8" fill="#FFFFFB" stroke="var(--line)"></rect>
        <rect x="36" y="${y}" width="34" height="28" rx="8" fill="${fill}"></rect>
        ${svgText(53, y + 19, String(i + 1).padStart(2, "0"), `class="flow-no" text-anchor="middle"`)}
        ${svgText(82, y + 18, step.label, `class="value"`)}
        ${step.note ? svgText(246, y + 18, step.note, `text-anchor="middle"`) : ""}
        ${arrow}
      </g>`;
    })
    .join("");
  return visualFrame(
    visual,
    `<svg viewBox="0 0 364 198" role="img" aria-label="${e(visual.title)}">${nodes}</svg>`,
    klass
  );
}

function architectureVisual(visual, klass = "") {
  const layers = (visual.layers ?? []).map((layer) =>
    Array.isArray(layer) ? { label: layer[0], note: layer[1] ?? "" } : { label: layer.label, note: layer.note ?? "" }
  );
  const cards = layers
    .map((layer, i) => {
      const y = 25 + i * 36;
      return `<g>
        <rect x="${(44 + i * 11).toFixed(1)}" y="${y}" width="${(276 - i * 22).toFixed(1)}" height="27" rx="7" fill="#FFFFFB" stroke="var(--line)"></rect>
        <rect x="${(44 + i * 11).toFixed(1)}" y="${y}" width="6" height="27" rx="3" fill="${palette[i % palette.length]}"></rect>
        ${svgText(66 + i * 11, y + 18, layer.label, `class="value"`)}
        ${layer.note ? svgText(292 - i * 4, y + 18, layer.note, `text-anchor="end"`) : ""}
      </g>`;
    })
    .join("");
  return visualFrame(
    visual,
    `<svg viewBox="0 0 364 184" role="img" aria-label="${e(visual.title)}">
      <path d="M182 25 L182 166" stroke="var(--line)" stroke-width="1.4" stroke-dasharray="4 5"></path>
      ${cards}
    </svg>`,
    klass
  );
}

function visualBlock(visual, klass = "") {
  if (!visual) return "";
  if (visual.kind === "flow") return flowVisual(visual, klass);
  if (visual.kind === "architecture") return architectureVisual(visual, klass);
  if (visual.kind === "bar-horizontal") return horizontalBarVisual(visual, klass);
  if (visual.kind === "line") return lineVisual(visual, klass);
  if (visual.kind === "donut") return donutVisual(visual, klass);
  if (visual.kind === "waterfall") return waterfallVisual(visual, klass);
  if (visual.kind === "timeline") return timelineVisual(visual, klass);
  if (visual.kind === "quadrant") return quadrantVisual(visual, klass);
  return barVisual(visual, klass);
}

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
      <section><h2 class="bar">학력 · 활동</h2><div class="history">${p.education
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
  return `<main class="sheet product-sheet">${seal(ex)}${eyebrow(ex)}
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
        ${visualBlock(p.featureChart, "compact")}
        ${p.kit ? `<h2 class="bar" style="margin-top:22px">구성품</h2><table class="data"><tbody>${p.kit
          .map((k) => `<tr><td>${e(k)}</td></tr>`)
          .join("")}</tbody></table>` : ""}</section>
    </div>
    <div class="gold-div"><i></i></div>
    <p class="meta" style="text-align:center">상담·구매 — 온정 공식 스토어 · 전국 백화점 입점 문의 · A/S 1588-0000</p>
    ${colophon(ex.type)}</main>${promptPanel(ex)}`;
}

function profile(ex) {
  const p = ex.payload;
  return `<main class="sheet profile-sheet">${seal(ex)}${eyebrow(ex)}
    <h1>${e(p.company)}</h1>
    <p class="subtitle">${e(p.tagline)}</p>
    <div class="rule"></div>
    <div class="two"><div><p class="lead">${e(p.vision)}</p>
      <div class="quote"><p>${e(p.quote)}</p></div></div>${metrics(p.stats.map(([l, v]) => [l, v]))}</div>
    <div class="two even" style="margin-top:26px">
      <section><h2 class="bar">연혁</h2>${visualBlock(p.historyChart, "compact")}<div class="history">${p.history
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
  return `<main class="sheet proposal-sheet">${seal(ex)}${eyebrow(ex)}
    <h1>${e(p.headline)}</h1>
    <p class="subtitle">${e(p.subtitle)}</p>
    <p class="meta">${e(p.client)}</p>
    ${metrics(p.metrics, "four")}
    ${visualBlock(p.impactChart, "wide")}
    <div class="proposal-body">
      <div class="proposal-blocks">${p.blocks
        .map(([h, t], i) => `<div class="block"><div class="n">0${i + 1}</div><h3>${e(h)}</h3><p>${e(t)}</p></div>`)
        .join("")}</div>
      <section class="proposal-schedule"><h2 class="bar">실행 일정</h2><table class="data"><thead><tr><th>기간</th><th>단계</th><th>주요 활동</th></tr></thead><tbody>${p.schedule
        .map(([when, phase, what]) => `<tr><td class="num" style="text-align:left">${e(when)}</td><td>${e(phase)}</td><td>${e(what)}</td></tr>`)
        .join("")}</tbody></table></section>
    </div>
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
  return `<main class="sheet newsletter-sheet">${seal(ex)}
    <div class="masthead"><div><div class="mh-title">${e(p.title)}</div><p class="meta" style="margin-top:4px">${e(p.tagline)}</p></div><div class="mh-meta">${e(p.issue)}</div></div>
    <div class="nl-feature-grid">
      <div class="nl-lead"><p class="kicker">${e(p.leadKicker)}</p><h2>${e(p.leadTitle)}</h2><p>${e(p.leadBody)}</p></div>
      ${visualBlock(p.mixChart, "newsletter")}
    </div>
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
  return `<main class="sheet land onepager-sheet">${seal(ex)}${eyebrow(ex)}
    <div class="two" style="grid-template-columns:1.3fr .7fr;align-items:end">
      <div><h1 style="font-size:34px">${e(p.brand)}</h1><p class="subtitle latin" style="margin-top:6px">${e(p.tagline)}</p></div>
    </div>
    <div class="gold-div"><i></i></div>
    <div class="op-showcase">
      <p class="op-hero">${nl2br(p.hero)}</p>
      ${visualBlock(p.positioning, "op")}
    </div>
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
// 밀도 모델: 한 슬라이드에 한 메시지. visual·cards·metrics 중
// 주된 것 하나만 풀사이즈로 — 정보 과적(뭉침) 방지.
function deck(ex) {
  const p = ex.payload;
  const total = p.slides.length + 1;
  const no = (n) => String(n).padStart(2, "0");
  const cover = `<section class="deck-page deck-cover" data-no="${no(1)}" data-of="${no(total)}">${seal(ex)}
    <p class="deck-chrome-eyebrow">${e(p.company)} · IR OUTLINE</p>
    <div class="deck-cover-copy">
      <p class="deck-kicker">${e(p.round)}</p>
      <h1 class="deck-title">${e(p.company)}</h1>
      <p class="deck-lead">${e(p.tagline)}</p>
    </div>
    <aside class="deck-cover-panel">
      <b>IR OUTLINE</b>
      <span>Problem</span>
      <span>Solution</span>
      <span>Market</span>
      <span>Traction</span>
      <span>Ask</span>
    </aside>
    <p class="deck-chrome-footer">${e(p.round)}</p>
  </section>`;
  const slides = p.slides
    .map(([title, lead, cards, mets, visual], i) => {
      // 밀도 분기: visual이 있으면 카드는 시각화 컬럼 아래 축소 배치(정보 과적 방지).
      const hasVisual = Boolean(visual);
      const hasCards = Boolean(cards);
      const hasMets = Boolean(mets);
      const gridHtml = (mini) =>
        hasCards
          ? `<div class="deck-grid${mini ? " deck-grid-mini" : ""}">${cards.map(([h, t]) => `<div class="deck-card"><h4>${e(h)}</h4><p>${e(t)}</p></div>`).join("")}</div>`
          : "";
      const mrow = hasMets
        ? `<div class="deck-metrics">${mets.map(([b, s]) => `<div><b>${e(b)}</b><span>${e(s)}</span></div>`).join("")}</div>`
        : "";
      // visual 슬라이드: copy엔 title+mets만(카드는 시각화 아래로).
      const copy = `<div class="deck-copy"><p class="deck-slide-label"><b>${no(i + 2)}</b><span>${e(p.company)} · ${e(title)}</span></p>
        <h1 class="deck-title">${e(lead)}</h1>${hasVisual ? "" : gridHtml(false)}${mrow}</div>`;
      const visualCol = hasVisual
        ? `${visualBlock(visual, "deck")}${gridHtml(true)}`
        : "";
      return `<section class="deck-page ${hasVisual ? "has-visual" : "text-only"}" data-no="${no(i + 2)}" data-of="${no(total)}">
        <p class="deck-chrome-eyebrow">${e(p.company)} · ${e(title)}</p>
        ${copy}${visualCol}</section>`;
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
  return page(ex.title, fn(ex));
}

export function renderIndex(examples) {
  // 갤러리는 /satgat/assets/examples/ko/ 로 서빙되지만 Vercel이 trailing slash를 벗겨
  // 무슬래시 URL로 리다이렉트한다. 상대경로(./)는 한 단계 위로 풀려 404가 나므로 절대경로 고정.
  const base = "/satgat/assets/examples/ko";
  return page(
    "satgat 한국어 데모팩",
    `<main class="gallery">
      <p class="eyebrow">satgat korean demo pack · 13 specimens</p>
      <h1>한국어 한 문장이 한국형 문서로 바뀌는 장면</h1>
      <p class="gallery-lead">각 예시는 자연어 brief, 구조화된 문서 내용, 인쇄 가능한 HTML 원본, 미리보기 PNG를 한 묶음으로 제공합니다. 백자지 캔버스 위 단청 한 점, 명조 위계 — satgat 디자인 8조를 그대로 따른 13종 전수 데모팩입니다.</p>
      <section class="cards">
        ${examples
          .map(
            (ex) => `<article class="card">
          <a href="${base}/${ex.id}.html"><img class="shot" src="${base}/${ex.id}.png" alt="${e(ex.title)} 미리보기" loading="lazy"></a>
          <div class="card-body">
            <p class="ct">${e(ex.type)}</p>
            <h2>${e(ex.title)}</h2>
            <p class="cm">${e(ex.meta)}</p>
            <p class="cp">${e(ex.prompt)}</p>
            <div class="links"><a href="${base}/${ex.id}.html">문서 열기</a><a href="${base}/${ex.id}.png">PNG</a><a href="${base}/${ex.id}.html" title="브라우저 인쇄 → PDF">인쇄</a></div>
          </div>
        </article>`
          )
          .join("")}
      </section>
    </main>`
  );
}
