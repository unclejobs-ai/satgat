import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "satgat · 삿갓",
  description: "자연어를 한지 감성의 한국 문서, 차트, 도표로 옮겨 적는 한국형 AI 문서 생성기.",
};

export default async function SatgatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <div className="satgat-shell">
      <header className="satgat-topbar">
        <Link href={`/${lang}`} className="brand">
          <span className="brand-seal" aria-hidden>笠</span>
          <span className="brand-text">
            <span className="brand-name">satgat</span>
            <span className="brand-tag">良紙良文 · 한지 위 먹글씨</span>
          </span>
        </Link>
        <nav className="topnav">
          <Link href={`/${lang}`} className="nav-link">처음</Link>
          <Link href={`/${lang}/new`} className="nav-link is-primary">새 문서</Link>
        </nav>
      </header>
      <main>{children}</main>

      <style dangerouslySetInnerHTML={{ __html: `
        .satgat-shell {
          min-height: 100vh;
        }
        .satgat-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-sizing: border-box;
          width: 100%;
          padding: 14px 32px;
          max-width: 1080px;
          margin: 0 auto;
          background-color: #F7F7F2;
          border-bottom: 1px solid var(--border, #D8DBD1);
        }
        .satgat-topbar .brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
        }
        .satgat-topbar .brand-seal {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: var(--near-black, #1C1916);
          color: var(--parchment, #F7F7F2);
          font-family: var(--serif-display, 'Nanum Myeongjo');
          font-size: 20px;
          font-weight: 800;
          border-radius: 4px;
          box-shadow: inset 0 0 0 1px #4D4B46;
        }
        .satgat-topbar .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }
        .satgat-topbar .brand-name {
          font-family: var(--serif-display);
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -0.005em;
          color: var(--near-black);
        }
        .satgat-topbar .brand-tag {
          font-family: var(--sans);
          font-size: 10px;
          letter-spacing: 0.16em;
          color: var(--stone, #6B6862);
          margin-top: 2px;
        }
        .satgat-topbar .topnav {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .satgat-topbar .nav-link {
          font-family: var(--sans);
          font-size: 12.5px;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: var(--olive, #4D4B46);
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 4px;
          transition: color 0.18s ease, background 0.18s ease;
        }
        .satgat-topbar .nav-link:hover {
          color: var(--brand, #9B1B1B);
          background: #F1E5E2;
        }
        .satgat-topbar .nav-link.is-primary {
          background: var(--near-black);
          color: var(--parchment);
        }
        .satgat-topbar .nav-link.is-primary:hover {
          background: #0E0C0A;
        }
        @media (max-width: 600px) {
          .satgat-topbar { padding: 12px 18px; }
          .satgat-topbar .brand-tag { display: none; }
          .satgat-topbar .topnav .nav-link:not(.is-primary) { display: none; }
          .satgat-topbar .nav-link.is-primary { padding: 8px 12px; }
        }
      `}} />
    </div>
  );
}
