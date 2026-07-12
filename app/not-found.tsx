import Link from "next/link";

export default function NotFound() {
  return (
    <div className="nf-shell">
      <div className="nf-card">
        <p className="nf-num">404 · 찾을 수 없음</p>
        <h1 className="nf-title">
          여기엔 종이가
          <br />
          <em>없습니다</em>
        </h1>
        <p className="nf-sub">
          찾으시는 한 장의 문서를 찾지 못했습니다.
          <br />
          새 종이를 펴거나, 처음으로 돌아가 주세요.
        </p>
        <div className="nf-actions">
          <Link href="/ko/new" className="nf-cta primary">새 문서 펴기</Link>
          <Link href="/ko" className="nf-cta">처음으로</Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .nf-shell {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          font-family: var(--satgat-font-body);
          color: var(--satgat-ink);
          word-break: keep-all;
        }
        .nf-card {
          max-width: 520px;
          text-align: center;
          padding: 64px 40px;
          background: var(--satgat-surface);
          border: 1px solid var(--satgat-line-strong);
          border-radius: 12px;
          box-shadow: 0 0 0 1px var(--satgat-line);
        }
        .nf-num {
          font-family: var(--satgat-font-label);
          font-size: 11.5px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--satgat-accent);
          margin: 0 0 12px;
        }
        .nf-title {
          font-family: var(--satgat-font-display);
          font-size: 38px;
          font-weight: 800;
          line-height: 1.12;
          letter-spacing: -0.02em;
          color: var(--satgat-ink);
          margin: 0 0 16px;
        }
        .nf-title em {
          font-family: var(--satgat-font-display);
          font-style: italic;
          font-weight: 600;
          color: var(--satgat-accent);
        }
        .nf-sub {
          font-family: var(--satgat-font-body);
          font-size: 14.5px;
          line-height: 1.75;
          color: var(--satgat-ink-muted);
          margin: 0 0 32px;
        }
        .nf-actions {
          display: inline-flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .nf-cta {
          font-family: var(--satgat-font-display);
          font-size: 14.5px;
          font-weight: 700;
          padding: 12px 26px;
          border-radius: 6px;
          text-decoration: none;
          letter-spacing: -0.005em;
          transition: background 0.18s ease, transform 0.18s ease;
          background: var(--satgat-surface);
          color: var(--satgat-ink);
          border: 1px solid var(--satgat-line-strong);
        }
        .nf-cta.primary {
          background: var(--satgat-accent);
          color: var(--satgat-canvas);
          border-color: var(--satgat-accent);
        }
        .nf-cta:hover { transform: translateY(-1px); }
        .nf-cta.primary:hover { background: var(--satgat-accent-hover); }
      `}} />
    </div>
  );
}
