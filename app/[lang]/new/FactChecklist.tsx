import type { TemplateCatalogEntry } from "@/lib/templates/types";
import styles from "./new-document.module.css";

type FactChecklistProps = {
  template: TemplateCatalogEntry;
};

export default function FactChecklist({ template }: FactChecklistProps) {
  return (
    <section className={styles.factChecklist} aria-labelledby="fact-checklist-heading">
      <p className={styles.eyebrow}>선택한 템플릿</p>
      <h3>{template.name}</h3>
      <p id="fact-checklist-heading" className={styles.factHeading}>넣으면 좋은 사실</p>
      <ul>
        {template.factChecklist.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
    </section>
  );
}
