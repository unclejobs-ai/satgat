import { getPageSpec } from "@/lib/templates/registry";
import type { TemplateCatalogEntry, TemplateId } from "@/lib/templates/types";
import styles from "./new-document.module.css";
import TemplatePreview from "./TemplatePreview";

type TemplateCardProps = {
  template: TemplateCatalogEntry;
  selected: boolean;
  disabled: boolean;
  onSelect: (id: TemplateId) => void;
};

export function templateCardLabel(template: TemplateCatalogEntry): string {
  return `${template.name} 템플릿 선택`;
}

export function templateCardMetadata(template: TemplateCatalogEntry) {
  return {
    category: template.category,
    pageSpecLabel: getPageSpec(template.pageSpec).label,
  } as const;
}

export default function TemplateCard({
  template,
  selected,
  disabled,
  onSelect,
}: TemplateCardProps) {
  const metadata = templateCardMetadata(template);

  return (
    <button
      type="button"
      className={`${styles.templateCard} ${selected ? styles.templateCardSelected : ""}`}
      aria-label={templateCardLabel(template)}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect(template.id)}
    >
      <span className={styles.previewFrame} aria-hidden="true">
        <TemplatePreview template={template} />
      </span>
      <span className={styles.cardCopy}>
        <strong>{template.name}</strong>
        <span>{metadata.pageSpecLabel}</span>
      </span>
    </button>
  );
}
