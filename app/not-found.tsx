import Link from "next/link";

export default function NotFound() {
  return (
    <div className="nf-shell">
      <div className="nf-card">
        <span className="nf-seal" aria-hidden>無</span>
        <p className="nf-num">404 · 不存</p>
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
          font-family: var(--serif, 'Gowun Batang', serif);
          color: var(--near-black, #1C1916);
          word-break: keep-all;
        }
        .nf-card {
          max-width: 520px;
          text-align: center;
          padding: 64px 40px;
          background: var(--ivory, #FFFFFB);
          border: 1px solid var(--border, #DDD6C4);
          border-radius: 12px;
          box-shadow: 0 12pt 32pt rgba(28, 25, 22, 0.06);
        }
        .nf-seal {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: var(--near-black, #1C1916);
          color: var(--parchment, #F7F7F2);
          font-family: var(--serif-display, 'Nanum Myeongjo');
          font-size: 32px;
          font-weight: 800;
          border-radius: 6px;
          margin: 0 auto 24px;
          box-shadow: inset 0 0 0 1.5px rgba(255,255,255,0.18);
        }
        .nf-num {
          font-family: var(--sans, 'Gowun Dodum');
          font-size: 11.5px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--brand, #9B1B1B);
          margin: 0 0 12px;
        }
        .nf-title {
          font-family: var(--serif-display, 'Nanum Myeongjo');
          font-size: 38px;
          font-weight: 800;
          line-height: 1.12;
          letter-spacing: -0.02em;
          color: var(--near-black);
          margin: 0 0 16px;
        }
        .nf-title em {
          font-family: var(--serif-latin, 'Cormorant Garamond');
          font-style: italic;
          font-weight: 600;
          color: var(--brand);
        }
        .nf-sub {
          font-family: var(--serif);
          font-size: 14.5px;
          line-height: 1.75;
          color: var(--olive, #4D4B46);
          margin: 0 0 32px;
        }
        .nf-actions {
          display: inline-flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .nf-cta {
          font-family: var(--serif-display);
          font-size: 14.5px;
          font-weight: 700;
          padding: 12px 26px;
          border-radius: 6px;
          text-decoration: none;
          letter-spacing: -0.005em;
          transition: background 0.18s ease, transform 0.18s ease;
          background: var(--ivory);
          color: var(--near-black);
          border: 1px solid var(--border);
        }
        .nf-cta.primary {
          background: var(--brand);
          color: var(--parchment);
          border-color: var(--brand);
        }
        .nf-cta:hover { transform: translateY(-1px); }
        .nf-cta.primary:hover { background: #B53030; }
      `}} />
    </div>
  );
}
