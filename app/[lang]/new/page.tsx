"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { listTemplates, getTemplate, TEMPLATE_SEAL, TEMPLATE_VOICE } from "@/lib/templates/registry";

/* 8 템플릿별 미니프리뷰 — 실제 문서 결.
 * 각각 A4 비율 thumbnail 안에 들어가는 typography-driven 미니 mock. */
function TemplatePreview({ id }: { id: string }) {
  switch (id) {
    case 'resume':
      return (
        <span className="tp tp-resume">
          <span className="tp-eyebrow">履歷書 · 2026</span>
          <span className="tp-name">김상세 <em>金詳細</em></span>
          <span className="tp-role">프로덕트 디자이너 · 7년차</span>
          <span className="tp-divider" />
          <span className="tp-section">경력(經歷)</span>
          <span className="tp-row"><i>2024 — 現</i><b>카카오 · 시각디자인팀</b></span>
          <span className="tp-row"><i>2020 — 2024</i><b>무신사 · UX 리드</b></span>
          <span className="tp-row"><i>2018 — 2020</i><b>29CM</b></span>
        </span>
      );
    case 'self-intro':
      return (
        <span className="tp tp-self-intro">
          <span className="tp-eyebrow">自己紹介書 · 一</span>
          <span className="tp-name">김상세</span>
          <span className="tp-role">프론트엔드 · 7년차</span>
          <span className="tp-q">一. 지원 동기</span>
          <span className="tp-line" />
          <span className="tp-line short" />
          <span className="tp-line" />
          <span className="tp-q">二. 직무 역량</span>
          <span className="tp-line" />
          <span className="tp-line short" />
        </span>
      );
    case 'business-card':
      return (
        <span className="tp tp-card">
          <span className="tp-card-front">
            <span className="tp-name-cn">朴詳細</span>
            <span className="tp-name">박상세</span>
            <span className="tp-role">대표 · Founder</span>
            <span className="tp-divider" />
            <span className="tp-tiny">satgat.fun</span>
            <span className="tp-tiny">@sangse_pjs · 010-0000-0000</span>
          </span>
        </span>
      );
    case 'invitation':
      return (
        <span className="tp tp-invitation">
          <span className="tp-inv-head">청 첩 장</span>
          <span className="tp-inv-names">
            <em>상세</em><span className="tp-dot">·</span><em>한지</em>
          </span>
          <span className="tp-inv-date">2026년 6월 14일</span>
          <span className="tp-inv-date-cn">丙午年 六月 十四日</span>
          <span className="tp-inv-time">토요일 오후 2시</span>
          <span className="tp-divider thin" />
          <span className="tp-inv-loc">서울 그랜드인터컨티넨탈</span>
        </span>
      );
    case 'new-year-card':
      return (
        <span className="tp tp-newyear">
          <span className="tp-ny-year">丙午年</span>
          <span className="tp-ny-main">謹賀新年</span>
          <span className="tp-ny-msg">
            새해에도 건강과 평안이<br />가득하시기를 빕니다
          </span>
        </span>
      );
    case 'proposal':
      return (
        <span className="tp tp-proposal">
          <span className="tp-eyebrow">PROPOSAL · 2026</span>
          <span className="tp-prop-title">한국형 PDP<br />AI 생성 도입안</span>
          <span className="tp-metrics">
            <span><b>+18%</b><i>전환율</i></span>
            <span><b>10분</b><i>생성</i></span>
            <span><b>8종</b><i>양식</i></span>
          </span>
          <span className="tp-divider thin" />
          <span className="tp-tiny">― 평균 작성 2주 → 10분</span>
          <span className="tp-tiny">― 한국 인쇄 8종 모두 지원</span>
        </span>
      );
    case 'newsletter':
      return (
        <span className="tp tp-newsletter">
          <span className="tp-ns-head">
            <span className="tp-ns-no">第 拾貳 號</span>
            <span className="tp-ns-date">2026.05</span>
          </span>
          <span className="tp-ns-title">한지 위에<br />먹으로 옮긴다</span>
          <span className="tp-line" />
          <span className="tp-line short" />
          <span className="tp-tiny">― 무궁화로 시선 모으기</span>
          <span className="tp-tiny">― 8종 문서 확장</span>
        </span>
      );
    case 'portfolio':
      return (
        <span className="tp tp-portfolio">
          <span className="tp-eyebrow">PORTFOLIO · 作品集</span>
          <span className="tp-name">이상세</span>
          <span className="tp-role">디자이너 · 솜씨를 펼치다</span>
          <span className="tp-grid">
            <span className="tp-work" />
            <span className="tp-work" />
            <span className="tp-work" />
            <span className="tp-work" />
          </span>
        </span>
      );
    default:
      return (
        <span className="tp tp-default">
          <span className="tp-line title" />
          <span className="tp-line" />
          <span className="tp-line short" />
        </span>
      );
  }
}

export default function NewPage({ params }: { params: Promise<{ lang: string }> }) {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("template");
  const [, setLang] = React.useState("ko");
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(preselected);
  const [prompt, setPrompt] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then((p) => setLang(p.lang));
  }, [params]);

  const templates = listTemplates();
  const selected = selectedTemplate ? getTemplate(selectedTemplate) : null;
  const voice = selectedTemplate ? TEMPLATE_VOICE[selectedTemplate] : undefined;

  const handleGenerate = async () => {
    if (!selectedTemplate || !prompt.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplate, prompt }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const json = JSON.stringify(data);
      const base64 = btoa(unescape(encodeURIComponent(json)));
      setResult(`/ko/preview?data=${encodeURIComponent(base64)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "한지 위에 옮기지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="satgat-new">
      {/* Hero */}
      <header className="hero">
        <div className="hero-eyebrow">
          <span className="hero-line" />
          <span>제 1 장 · 종이를 고르다</span>
        </div>
        <h1 className="hero-title">
          어떤 <em className="latin">종이</em>에<br />
          옮겨 적을까요
        </h1>
        <p className="hero-sub">
          종이를 고르고, 담을 이야기를 풀어 적으면<br />
          삿갓이 한지 위에 옮겨 적습니다.
        </p>
      </header>

      {/* Section 1: Template grid */}
      <section className="step">
        <div className="step-head">
          <span className="step-num">壹 · ONE</span>
          <h2 className="step-title">종이 고르기</h2>
          {selected && (
            <p className="step-note">
              현재 선택 — <strong>{selected.name}</strong>
              {voice && <span className="voice"> · {voice}</span>}
            </p>
          )}
        </div>

        <div className="paper-grid">
          {templates.map((tmpl) => {
            const seal = TEMPLATE_SEAL[tmpl.id] ?? { glyph: '紙', variant: 'ink' as const };
            const v = TEMPLATE_VOICE[tmpl.id] ?? '';
            const active = selectedTemplate === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`paper-card ${active ? 'is-active' : ''}`}
                aria-pressed={active}
              >
                <span className="paper-thumb" aria-hidden>
                  <TemplatePreview id={tmpl.id} />
                  <span className={`paper-seal v-${seal.variant}`}>{seal.glyph}</span>
                </span>
                <span className="paper-meta">
                  <span className="paper-name">{tmpl.name}</span>
                  <span className="paper-voice">{v}</span>
                  <span className="paper-format">{tmpl.format}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 2: Prompt */}
      {selected && (
        <section className="step">
          <div className="step-head">
            <span className="step-num">貳 · TWO</span>
            <h2 className="step-title">담을 이야기</h2>
            <p className="step-note">
              인물·사실·맥락을 자연어로 풀어 적으면 AI가 슬롯을 채웁니다. 길수록 결이 풍부합니다.
            </p>
          </div>

          <label className="prompt-wrap">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`예: ${selected.name}에 담을 이야기를 자유롭게 적어 주세요.\n인물·시기·기관·강점·맥락 무엇이든.`}
              rows={9}
              className="prompt-textarea"
            />
            <span className="prompt-counter">{prompt.length.toLocaleString()} 자</span>
          </label>

          {error && (
            <div className="error-banner" role="alert">
              <span className="error-mark">!</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className={`generate-btn ${generating ? 'is-loading' : ''}`}
          >
            <span className="btn-glyph">墨</span>
            <span className="btn-label">
              {generating ? '한지 위에 옮겨 적는 중…' : '한지에 옮겨 적기'}
            </span>
            <span className="btn-arrow" aria-hidden>→</span>
          </button>
        </section>
      )}

      {/* Result CTA */}
      {result && (
        <section className="step">
          <div className="result-banner">
            <div>
              <p className="result-label">완성</p>
              <p className="result-text">한지 위에 옮겨 적었습니다.</p>
            </div>
            <Link href={result} className="result-link">
              <span>미리보기</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      )}

      {/* Footer manifesto reminder */}
      <footer className="bottom">
        <p>
          한지(韓紙) 위에 먹(墨)으로 옮겨 적습니다.<br />
          단청(丹靑) 한 점이면 충분합니다.
        </p>
      </footer>

      <style jsx>{`
        .satgat-new {
          max-width: 980px;
          margin: 0 auto;
          padding: 48px 32px 96px;
          color: var(--near-black, #1C1916);
          font-family: var(--serif, 'Gowun Batang', serif);
          font-feature-settings: 'palt' 1, 'kern' 1;
          word-break: keep-all;
        }

        /* HERO */
        .hero { margin-bottom: 80px; }
        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--sans);
          font-size: 11.5px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--stone, #6B6862);
          margin-bottom: 28px;
        }
        .hero-line {
          width: 36px;
          height: 1px;
          background: var(--near-black);
          opacity: 0.42;
        }
        .hero-title {
          font-family: var(--serif-display, 'Nanum Myeongjo');
          font-size: clamp(40px, 6.5vw, 72px);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: var(--near-black);
          text-shadow: 0 0 0.3px rgba(28,25,22,0.12), 0 0 0.7px rgba(28,25,22,0.06);
          margin: 0 0 18px;
          max-width: 14ch;
        }
        .hero-title em {
          font-family: var(--serif-latin, 'Cormorant Garamond');
          font-style: italic;
          font-weight: 600;
          color: var(--brand, #9B1B1B);
        }
        .hero-sub {
          font-family: var(--serif);
          font-size: 16px;
          line-height: 1.85;
          color: var(--dark-warm, #3A3833);
          margin: 0;
          max-width: 460px;
        }

        /* STEP */
        .step { margin-bottom: 80px; }
        .step-head {
          margin-bottom: 28px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border, #DDD6C4);
        }
        .step-num {
          display: inline-block;
          font-family: var(--serif-display);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.3em;
          color: var(--brand);
          margin-bottom: 8px;
        }
        .step-title {
          font-family: var(--serif-display);
          font-size: 30px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--near-black);
          margin: 0 0 8px;
        }
        .step-note {
          font-family: var(--serif);
          font-size: 14px;
          line-height: 1.72;
          color: var(--olive, #4D4B46);
          margin: 0;
        }
        .step-note strong { color: var(--near-black); font-weight: 700; }
        .step-note .voice { color: var(--brand); font-style: italic; }

        /* PAPER GRID */
        .paper-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 18px;
        }
        .paper-card {
          all: unset;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          padding: 16px 16px 14px;
          background: var(--ivory, #F8F4E8);
          border-radius: 8px;
          box-shadow: 0 0 0 1pt var(--border-soft, #E8E2D0), 0 1pt 2pt rgba(28,25,22,0.04);
          transition: box-shadow 0.18s ease, transform 0.18s ease, background-color 0.18s ease;
        }
        .paper-card:hover {
          box-shadow: 0 0 0 1pt var(--brand), 0 8pt 24pt rgba(28,25,22,0.08);
          transform: translateY(-3px);
        }
        .paper-card.is-active {
          background: var(--near-black);
          color: var(--parchment);
          box-shadow: 0 0 0 1pt var(--near-black), 0 12pt 28pt rgba(28,25,22,0.18);
          transform: translateY(-3px);
        }
        .paper-thumb {
          position: relative;
          display: block;
          aspect-ratio: 210 / 297;
          background: var(--hanji, #F5F2EA);
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02 0.25' numOctaves='2' seed='5'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.25 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23f)' opacity='0.05'/%3E%3C/svg%3E");
          background-size: auto, 160px 160px;
          border-radius: 3px;
          padding: 22px 16px 18px;
          margin-bottom: 14px;
          overflow: hidden;
          box-shadow: inset 0 0 0 1px rgba(28,25,22,0.06), 0 1px 0 rgba(255,255,255,0.4) inset;
        }
        .paper-card.is-active .paper-thumb {
          background-color: var(--ivory);
        }
        .t-rule {
          display: block;
          background: var(--near-black);
          opacity: 0.22;
          border-radius: 1px;
        }
        .t-title { height: 9px; width: 64%; margin: 8px 0 14px; opacity: 0.62; }
        .t-sub   { height: 2.5px; width: 38%; margin-bottom: 22px; opacity: 0.32; }
        .t-body  { height: 2px; width: 100%; margin-bottom: 6px; opacity: 0.22; }
        .t-body.short { width: 68%; }
        .paper-seal {
          position: absolute;
          right: 12px;
          bottom: 12px;
          width: 26px;
          height: 26px;
          border-radius: 3px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--serif-display);
          font-size: 13px;
          font-weight: 800;
          color: var(--parchment);
          box-shadow: inset 0 0 0 1.2px rgba(255,255,255,0.18);
        }
        .v-ink       { background: var(--near-black); }
        .v-dancheong { background: var(--brand); }
        .v-jade      { background: var(--jade, #2E6B5E); }
        .v-gold      { background: var(--gold, #B8954F); color: var(--near-black); }

        /* 미니프리뷰 — 8 템플릿별 결 */
        .tp {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          color: var(--near-black);
          font-family: var(--serif);
          font-size: 6px;
          line-height: 1.45;
          text-align: left;
          word-break: keep-all;
          overflow: hidden;
        }
        .paper-card.is-active .tp { color: var(--parchment); }
        .tp-eyebrow {
          font-family: var(--sans);
          font-size: 5.5px;
          letter-spacing: 0.18em;
          color: var(--olive);
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 5px;
        }
        .paper-card.is-active .tp-eyebrow { color: rgba(241,236,223,0.55); }
        .tp-name {
          font-family: var(--serif-display);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: -0.018em;
          line-height: 1;
          margin-bottom: 3px;
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .tp-name em {
          font-family: var(--serif-display);
          font-size: 7px;
          font-weight: 400;
          font-style: normal;
          color: var(--olive);
          letter-spacing: 0.04em;
        }
        .paper-card.is-active .tp-name em { color: rgba(241,236,223,0.5); }
        .tp-name-cn {
          font-family: var(--serif-display);
          font-size: 8px;
          font-weight: 400;
          color: var(--olive);
          letter-spacing: 0.06em;
          margin-bottom: 2px;
        }
        .tp-role {
          font-family: var(--serif);
          font-size: 6px;
          font-weight: 700;
          color: var(--dark-warm);
          margin-bottom: 6px;
        }
        .paper-card.is-active .tp-role { color: rgba(241,236,223,0.7); }
        .tp-divider {
          display: block;
          height: 0.5px;
          background: var(--border);
          margin: 4px 0 5px;
        }
        .tp-divider.thin {
          background: var(--brand);
          opacity: 0.6;
          width: 24px;
          margin: 4px auto 5px;
        }
        .tp-section {
          font-family: var(--serif-display);
          font-size: 6.5px;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin: 0 0 3px;
        }
        .tp-row {
          display: flex;
          align-items: baseline;
          gap: 5px;
          font-size: 5.5px;
          margin-bottom: 2px;
        }
        .tp-row i {
          font-family: var(--sans);
          font-style: normal;
          font-weight: 600;
          color: var(--olive);
          letter-spacing: 0.04em;
          font-size: 5px;
          min-width: 36px;
        }
        .tp-row b {
          font-family: var(--serif);
          font-weight: 700;
          color: var(--near-black);
        }
        .paper-card.is-active .tp-row b { color: var(--parchment); }
        .paper-card.is-active .tp-row i { color: rgba(241,236,223,0.5); }
        .tp-q {
          font-family: var(--serif-display);
          font-size: 6.5px;
          font-weight: 800;
          color: var(--brand);
          margin: 5px 0 3px;
        }
        .tp-line {
          display: block;
          height: 1.5px;
          background: currentColor;
          opacity: 0.2;
          border-radius: 1px;
          margin-bottom: 2px;
        }
        .tp-line.short { width: 65%; }
        .tp-tiny {
          font-family: var(--serif);
          font-size: 5.2px;
          color: var(--dark-warm);
          line-height: 1.5;
          margin-bottom: 1px;
        }
        .paper-card.is-active .tp-tiny { color: rgba(241,236,223,0.6); }
        /* card 명함 */
        .tp-card { justify-content: center; align-items: stretch; }
        .tp-card-front {
          display: flex;
          flex-direction: column;
          padding: 12px 8px 8px;
          background: var(--ivory);
          border: 0.5px solid var(--border-soft);
          border-radius: 2px;
          flex: 1;
          box-shadow: 0 1px 2px rgba(28,25,22,0.04);
        }
        .paper-card.is-active .tp-card-front {
          background: rgba(245,242,234,0.08);
          border-color: rgba(245,242,234,0.16);
        }
        /* invitation 청첩장 */
        .tp-invitation {
          align-items: center;
          text-align: center;
          padding-top: 4px;
        }
        .tp-inv-head {
          font-family: var(--serif-display);
          font-weight: 800;
          font-size: 10px;
          letter-spacing: 0.32em;
          color: var(--brand);
          margin-bottom: 7px;
        }
        .tp-inv-names {
          font-family: var(--serif-display);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .tp-inv-names em { font-style: normal; }
        .tp-dot { color: var(--brand); }
        .tp-inv-date {
          font-family: var(--serif);
          font-size: 6px;
          font-weight: 700;
          margin-top: 4px;
        }
        .tp-inv-date-cn {
          font-family: var(--serif-display);
          font-size: 6px;
          font-weight: 400;
          color: var(--olive);
          letter-spacing: 0.06em;
        }
        .paper-card.is-active .tp-inv-date-cn { color: rgba(241,236,223,0.5); }
        .tp-inv-time {
          font-family: var(--serif);
          font-size: 5.5px;
          color: var(--dark-warm);
          margin-top: 2px;
        }
        .paper-card.is-active .tp-inv-time { color: rgba(241,236,223,0.55); }
        .tp-inv-loc {
          font-family: var(--serif);
          font-size: 5.5px;
          color: var(--dark-warm);
        }
        .paper-card.is-active .tp-inv-loc { color: rgba(241,236,223,0.55); }
        /* new-year-card 연하장 */
        .tp-newyear {
          align-items: center;
          text-align: center;
          justify-content: center;
          padding-top: 8px;
        }
        .tp-ny-year {
          font-family: var(--serif-display);
          font-size: 6.5px;
          letter-spacing: 0.16em;
          color: var(--gold);
          font-weight: 700;
          margin-bottom: 6px;
        }
        .tp-ny-main {
          font-family: var(--serif-display);
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: var(--brand);
          margin-bottom: 8px;
          line-height: 1;
        }
        .tp-ny-msg {
          font-family: var(--serif);
          font-size: 5.5px;
          line-height: 1.55;
          color: var(--dark-warm);
        }
        .paper-card.is-active .tp-ny-msg { color: rgba(241,236,223,0.6); }
        /* proposal 제안서 */
        .tp-prop-title {
          font-family: var(--serif-display);
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: -0.01em;
          line-height: 1.15;
          margin: 1px 0 6px;
        }
        .tp-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          margin: 3px 0 4px;
        }
        .tp-metrics > span {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2px 1px;
          border-left: 0.5px solid var(--hairline);
        }
        .tp-metrics > span:first-child { border-left: none; }
        .tp-metrics b {
          font-family: var(--serif-display);
          font-size: 7.5px;
          font-weight: 800;
          color: var(--brand);
          line-height: 1;
        }
        .tp-metrics i {
          font-family: var(--sans);
          font-style: normal;
          font-size: 4.5px;
          color: var(--olive);
          letter-spacing: 0.08em;
          margin-top: 1px;
        }
        .paper-card.is-active .tp-metrics i { color: rgba(241,236,223,0.5); }
        /* newsletter 뉴스레터 */
        .tp-ns-head {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .tp-ns-no {
          font-family: var(--serif-display);
          font-size: 5.5px;
          letter-spacing: 0.08em;
          color: var(--brand);
          font-weight: 800;
        }
        .tp-ns-date {
          font-family: var(--sans);
          font-size: 5px;
          color: var(--olive);
          letter-spacing: 0.06em;
        }
        .paper-card.is-active .tp-ns-date { color: rgba(241,236,223,0.5); }
        .tp-ns-title {
          font-family: var(--serif-display);
          font-size: 9px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.015em;
          margin-bottom: 5px;
        }
        /* portfolio 포트폴리오 */
        .tp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 3px;
          flex: 1;
          margin-top: 4px;
        }
        .tp-work {
          background: var(--warm-sand);
          border-radius: 1.5px;
          min-height: 18px;
        }
        .tp-work:nth-child(2) { background: var(--jade); opacity: 0.6; }
        .tp-work:nth-child(3) { background: var(--brand); opacity: 0.5; }
        .tp-work:nth-child(4) { background: var(--gold); opacity: 0.65; }
        .paper-card.is-active .tp-work { opacity: 0.42; }

        .paper-meta { display: flex; flex-direction: column; gap: 3px; }
        .paper-name {
          font-family: var(--serif-display);
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.015em;
          color: inherit;
        }
        .paper-voice {
          font-family: var(--serif);
          font-size: 12.5px;
          color: var(--olive);
        }
        .paper-card.is-active .paper-voice { color: rgba(241, 236, 223, 0.7); }
        .paper-format {
          font-family: var(--sans);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--stone);
          margin-top: 4px;
        }
        .paper-card.is-active .paper-format { color: rgba(241, 236, 223, 0.5); }

        /* PROMPT */
        .prompt-wrap { position: relative; display: block; }
        .prompt-textarea {
          width: 100%;
          padding: 24px 26px 42px;
          background: var(--ivory);
          color: var(--near-black);
          border: 1px solid var(--border, #DDD6C4);
          border-radius: 8px;
          font-family: var(--serif);
          font-size: 16px;
          line-height: 1.85;
          letter-spacing: -0.005em;
          resize: vertical;
          box-sizing: border-box;
          word-break: keep-all;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .prompt-textarea::placeholder {
          color: var(--stone);
          font-style: italic;
          line-height: 1.7;
        }
        .prompt-textarea:focus {
          outline: none;
          border-color: var(--near-black);
          box-shadow: 0 0 0 3px rgba(155, 27, 27, 0.08);
        }
        .prompt-counter {
          position: absolute;
          right: 20px;
          bottom: 16px;
          font-family: var(--sans);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--stone);
          pointer-events: none;
        }

        /* GENERATE BTN */
        .generate-btn {
          all: unset;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          width: 100%;
          margin-top: 28px;
          padding: 22px 30px;
          background: var(--near-black);
          color: var(--parchment);
          border-radius: 8px;
          font-family: var(--serif-display);
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.005em;
          text-align: center;
          transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
          box-shadow: 0 0 0 1pt var(--near-black);
        }
        .generate-btn:hover:not(:disabled) {
          background: #0e0c0a;
          transform: translateY(-1px);
          box-shadow: 0 0 0 1pt var(--brand), 0 12pt 28pt rgba(28,25,22,0.2);
        }
        .generate-btn:disabled {
          cursor: not-allowed;
          background: var(--border);
          color: var(--stone);
          box-shadow: 0 0 0 1pt var(--border);
        }
        .generate-btn.is-loading { background: var(--dark-warm, #3A3833); }
        .btn-glyph {
          font-family: var(--serif-display);
          font-size: 24px;
          font-weight: 800;
          color: var(--gold);
        }
        .generate-btn:disabled .btn-glyph { color: var(--stone); }
        .btn-label { flex: 1; text-align: left; }
        .btn-arrow {
          font-family: var(--sans);
          font-size: 20px;
          opacity: 0.75;
          transition: transform 0.18s ease, opacity 0.18s ease;
        }
        .generate-btn:hover:not(:disabled) .btn-arrow {
          transform: translateX(4px);
          opacity: 1;
        }

        /* ERROR */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 22px;
          padding: 14px 18px;
          background: #F4ECE9;
          border: 1px solid var(--brand);
          border-radius: 8px;
          color: var(--brand);
          font-family: var(--serif);
          font-size: 14px;
          line-height: 1.6;
        }
        .error-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--brand);
          color: var(--parchment);
          font-family: var(--serif-display);
          font-weight: 800;
          font-size: 14px;
          flex-shrink: 0;
        }

        /* RESULT */
        .result-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 24px 28px;
          background: var(--near-black);
          color: var(--parchment);
          border-radius: 8px;
          box-shadow: 0 12pt 28pt rgba(28,25,22,0.16);
          flex-wrap: wrap;
        }
        .result-label {
          font-family: var(--sans);
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--gold);
          margin: 0 0 4px;
        }
        .result-text {
          font-family: var(--serif-display);
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.015em;
          margin: 0;
        }
        .result-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 22px;
          background: var(--brand);
          color: var(--parchment);
          border-radius: 6px;
          font-family: var(--serif-display);
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.18s ease, transform 0.18s ease;
        }
        .result-link:hover {
          background: #B53030;
          transform: translateX(2px);
        }

        /* BOTTOM */
        .bottom {
          margin-top: 80px;
          padding-top: 32px;
          border-top: 1px solid var(--border);
          text-align: center;
        }
        .bottom p {
          font-family: var(--serif);
          font-size: 13.5px;
          line-height: 1.85;
          color: var(--olive);
          letter-spacing: -0.003em;
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 720px) {
          .satgat-new { padding: 32px 20px 80px; }
          .hero { margin-bottom: 56px; }
          .step { margin-bottom: 56px; }
          .step-title { font-size: 24px; }
          .paper-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
        @media (max-width: 440px) {
          .paper-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
