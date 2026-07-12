import type React from "react";
import Link from "next/link";
import styles from "./new-document.module.css";

export function buildPrivatePreviewHref(lang: string, draftId: string): string {
  return `/${encodeURIComponent(lang)}/preview?draft=${encodeURIComponent(draftId)}`;
}

type CreateResultProps = {
  href: string;
  linkRef: React.RefObject<HTMLAnchorElement | null>;
};

export default function CreateResult({
  href,
  linkRef,
}: CreateResultProps) {
  return (
    <section className={styles.result} aria-live="polite">
      <div>
        <p className={styles.eyebrow}>문서 완성</p>
        <h2>비공개 초안이 준비되었습니다.</h2>
        <p>이 브라우저에서 초안을 확인하고 PDF로 내려받을 수 있습니다.</p>
      </div>
      <Link className={styles.resultLink} href={href} ref={linkRef}>
        비공개 초안 미리보기
      </Link>
    </section>
  );
}
