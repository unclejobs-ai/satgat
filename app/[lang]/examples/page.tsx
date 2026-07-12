import Link from 'next/link';

import specimenManifest from '../../../public/satgat/assets/examples/ko/manifest.json';
import { getPageSpec, PAGE_SPECS } from '@/lib/templates/registry';
import type { PageSpecId } from '@/lib/templates/types';
import styles from './examples.module.css';

type SpecimenRecord = {
  readonly id: string;
  readonly name: string;
  readonly pageSpec: string;
  readonly title: string;
  readonly alt: string;
  readonly prompt: string;
  readonly png: string;
  readonly pdf: string;
  readonly width: number;
  readonly height: number;
  readonly pageCount: number;
};

const specimens: readonly SpecimenRecord[] = specimenManifest;

function localizedCreateHref(lang: string, id: string): string {
  return `/${encodeURIComponent(lang)}/new?template=${encodeURIComponent(id)}`;
}

function isPageSpecId(value: string): value is PageSpecId {
  return Object.prototype.hasOwnProperty.call(PAGE_SPECS, value);
}

function specimenPageSpec(value: string) {
  if (!isPageSpecId(value)) throw new Error(`Unknown specimen page spec: ${value}`);
  return getPageSpec(value);
}

export default async function ExamplesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <main id="main-content" className={styles.examples} tabIndex={-1}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>완성 예시</p>
        <h1>문서는 화면이 아니라<br />종이에서 완성됩니다.</h1>
        <p className={styles.description}>
          실제 미리보기 화면에서 만든 열네 가지 결과입니다. 규격과 쪽 수를 확인하고,
          같은 서식으로 새 문서를 시작해 보세요.
        </p>
      </header>

      {specimens.length > 0 ? (
        <section className={styles.catalog} aria-label="문서 완성 예시 목록">
          {specimens.map((specimen, index) => {
            const pageSpec = specimenPageSpec(specimen.pageSpec);
            return (
              <article className={styles.card} id={specimen.id} key={specimen.id}>
                <Link
                  className={styles.cardLink}
                  href={localizedCreateHref(lang, specimen.id)}
                  prefetch={false}
                >
                  <span className={styles.imageFrame}>
                    <img
                      src={`/satgat/assets/examples/ko/${encodeURIComponent(specimen.png)}`}
                      alt={specimen.alt}
                      width={specimen.width}
                      height={specimen.height}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className={styles.index} aria-hidden>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </span>
                  <span className={styles.cardCopy}>
                    <span className={styles.cardHeading}>
                      <strong>{specimen.name}</strong>
                      <span>새 문서 만들기</span>
                    </span>
                    <span className={styles.title}>{specimen.title}</span>
                    <span className={styles.facts}>
                      {pageSpec.label} · {pageSpec.canvas.widthMm} × {pageSpec.canvas.heightMm} mm · {specimen.pageCount}쪽
                    </span>
                  </span>
                </Link>
              </article>
            );
          })}
        </section>
      ) : (
        <section className={styles.empty} aria-live="polite">
          <h2>아직 공개된 완성 예시가 없습니다.</h2>
          <p>새 예시가 준비되면 이곳에서 문서 규격과 함께 보여드립니다.</p>
        </section>
      )}
    </main>
  );
}
