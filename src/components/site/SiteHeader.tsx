import Link from "next/link";
import styles from "./site-header.module.css";

type SiteHeaderProps = {
  lang: string;
};

export default function SiteHeader({ lang }: SiteHeaderProps) {
  const localePath = `/${encodeURIComponent(lang)}`;

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        본문으로 건너뛰기
      </a>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link className={styles.brand} href={localePath} aria-label="삿갓 처음으로" prefetch={false}>
            <strong>삿갓</strong>
            <span>한국 문서 생성기</span>
          </Link>
          <nav className={styles.navigation} aria-label="주요 메뉴">
            <Link className={styles.homeLink} href={localePath} prefetch={false}>
              처음
            </Link>
            <Link className={styles.createLink} href={`${localePath}/new`} prefetch={false}>
              새 문서
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
