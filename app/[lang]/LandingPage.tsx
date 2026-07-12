import Link from "next/link";
import specimenManifest from "../../public/satgat/assets/examples/ko/manifest.json";
import { listTemplates } from "@/lib/templates/registry";
import type { TemplateCategory } from "@/lib/templates/types";
import {
  buildLandingTemplateGroups,
  buildRepresentativeResults,
  getLandingCtas,
  getLandingTemplateHref,
  type LandingTemplate,
} from "./landing-model";
import styles from "./landing.module.css";

type LandingPageProps = {
  lang: string;
};

type SpecimenRecord = {
  readonly id: string;
  readonly pageSpec: string;
  readonly alt: string;
  readonly png: string;
  readonly width: number;
  readonly height: number;
};

const specimenById = new Map<string, SpecimenRecord>(
  specimenManifest.map((specimen) => [specimen.id, specimen]),
);

const categoryLabel: Readonly<Record<TemplateCategory, string>> = {
  personal: "개인",
  business: "업무",
  occasion: "초대",
};

function specimenFor(template: LandingTemplate): SpecimenRecord | null {
  return specimenById.get(template.id) ?? null;
}

function SpecimenImage({
  template,
  priority = false,
}: {
  template: LandingTemplate;
  priority?: boolean;
}) {
  const specimen = specimenFor(template);
  if (!specimen) return null;

  return (
    <img
      className={styles.specimenImage}
      src={`/satgat/assets/examples/ko/${encodeURIComponent(specimen.png)}`}
      alt={specimen.alt}
      width={specimen.width}
      height={specimen.height}
      data-page-spec={specimen.pageSpec}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

export default function LandingPage({ lang }: LandingPageProps) {
  const groups = buildLandingTemplateGroups(listTemplates());
  const ctas = getLandingCtas(lang);
  const representatives = buildRepresentativeResults(groups, lang);
  const catalogCount = groups.reduce((count, group) => count + group.templates.length, 0);
  const heroTemplate = representatives[0]?.template;

  return (
    <main id="main-content" className={styles.landing} tabIndex={-1}>
      <section className={styles.hero} aria-labelledby="landing-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>한국 문서 생성기</p>
          <h1 id="landing-title">한 문장으로 시작해<br />인쇄 문서로 끝납니다.</h1>
          <p className={styles.heroDescription}>
            목적을 고르고 사실을 적으면, 삿갓이 한국어에 맞는 위계와 여백으로
            문서를 정리합니다.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href={ctas.primary} prefetch={false}>문서 만들기</Link>
            <Link className={styles.secondaryAction} href={ctas.secondary} prefetch={false}>{catalogCount}가지 문서 보기</Link>
          </div>
        </div>
        {heroTemplate ? (
          <figure className={styles.heroSpecimen}>
            <div className={styles.paperStack}>
              <SpecimenImage template={heroTemplate} priority />
            </div>
            <figcaption>{heroTemplate.specimen.title} · {heroTemplate.format}</figcaption>
          </figure>
        ) : null}
      </section>

      <section className={styles.catalog} aria-labelledby="catalog-title">
        <header className={styles.sectionHeading}>
          <p className={styles.sectionNumber}>01</p>
          <div>
            <h2 id="catalog-title">무엇을 만들까요?</h2>
            <p>{catalogCount}가지 문서를 쓰임에 따라 세 갈래로 나눴습니다.</p>
          </div>
        </header>
        <div className={styles.catalogGroups}>
          {groups.map((group) => (
            <div
              className={styles.catalogGroup}
              key={group.id}
              aria-labelledby={`catalog-group-${group.id}`}
            >
              <div className={styles.groupHeading}>
                <h3 id={`catalog-group-${group.id}`}>{group.title}</h3>
                <p>{group.description}</p>
                <span>{group.templates.length}종</span>
              </div>
              <ul className={styles.templateList}>
                {group.templates.map((template) => (
                  <li key={template.id}>
                    <Link href={getLandingTemplateHref(lang, template.id)} prefetch={false}>
                      <span className={styles.templateName}>{template.name}</span>
                      <span className={styles.templateFormat}>{template.format}</span>
                      <span className={styles.templateArrow} aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.process} aria-labelledby="process-title">
        <header className={styles.sectionHeading}>
          <p className={styles.sectionNumber}>02</p>
          <div>
            <h2 id="process-title">세 번의 선택이면 충분합니다.</h2>
            <p>꾸미기보다 내용에 집중하고, 결과는 바로 인쇄합니다.</p>
          </div>
        </header>
        <ol className={styles.steps}>
          <li><span>하나</span><h3>종이 선택</h3><p>문서의 목적과 실제 출력 규격을 고릅니다.</p></li>
          <li><span>둘</span><h3>사실 입력</h3><p>전하고 싶은 내용과 확인할 사실을 자연어로 적습니다.</p></li>
          <li><span>셋</span><h3>미리보기와 PDF</h3><p>표와 도표까지 확인한 뒤 PDF로 내려받거나 인쇄합니다.</p></li>
        </ol>
      </section>

      <section className={styles.results} aria-labelledby="results-title">
        <header className={styles.sectionHeading}>
          <p className={styles.sectionNumber}>03</p>
          <div>
            <h2 id="results-title">쓰임이 달라도 한글은 또렷하게.</h2>
            <p>개인, 업무, 초대 문서에서 한 장씩 골랐습니다.</p>
          </div>
        </header>
        <div className={styles.resultRail}>
          {representatives.map((result) => (
            <a className={styles.resultLink} href={result.href} key={result.category}>
              <span className={styles.resultImage}>
                <SpecimenImage template={result.template} />
              </span>
              <span className={styles.resultMeta}>
                <span>{categoryLabel[result.category]}</span>
                <strong>{result.template.specimen.title}</strong>
                <small>{result.template.format} · 완성 예시 보기</small>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.trust} aria-labelledby="trust-title">
        <div className={styles.trustLead}>
          <p className={styles.sectionNumber}>04</p>
          <h2 id="trust-title">문서를 맡길 때<br />알아야 할 것만.</h2>
        </div>
        <dl className={styles.trustList}>
          <div><dt>한국어 문서</dt><dd>한글 명조 위계와 한국 문서의 읽기 흐름을 기준으로 만듭니다.</dd></div>
          <div><dt>PDF와 인쇄</dt><dd>실제 종이 규격으로 미리 보고 PDF로 내려받거나 바로 인쇄합니다.</dd></div>
          <div><dt>무료 글꼴</dt><dd>문서에는 공개 글꼴 라이선스가 적용된 한글 글꼴을 사용합니다.</dd></div>
          <div><dt>비공개 초안</dt><dd>초안은 이 브라우저에 보관하며, 내용이 담긴 공유 링크는 사용자가 명시적으로 만들 때만 생성합니다.</dd></div>
        </dl>
      </section>

      <section className={styles.closing} aria-labelledby="faq-title">
        <div className={styles.faq}>
          <header>
            <p className={styles.sectionNumber}>05</p>
            <h2 id="faq-title">자주 묻는 질문</h2>
          </header>
          <div className={styles.questions}>
            <details><summary>어떤 문서를 만들 수 있나요?</summary><p>이력서부터 회사 소개서, 청첩장까지 개인·업무·인사 문서 {catalogCount}가지를 만들 수 있습니다.</p></details>
            <details><summary>인쇄 전에 고칠 수 있나요?</summary><p>미리보기에서 완성도를 확인한 뒤 다시 만들고, 준비되면 PDF 또는 인쇄를 선택할 수 있습니다.</p></details>
            <details><summary>공유하면 문서가 공개되나요?</summary><p>일반 미리보기 주소에는 본문이 없습니다. 내용을 포함한 공유 링크는 확인 절차를 거쳐 직접 만들 때만 생깁니다.</p></details>
          </div>
        </div>
        <footer className={styles.footer}>
          <strong>삿갓</strong>
          <p>한국어를 위한 문서 생성기</p>
          <small>{catalogCount}가지 문서 · PDF와 인쇄 · 공개 글꼴 라이선스</small>
        </footer>
      </section>
    </main>
  );
}
