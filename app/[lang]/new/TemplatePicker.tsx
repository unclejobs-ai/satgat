import type {
  TemplateCatalogEntry,
  TemplateCategory,
  TemplateId,
} from "@/lib/templates/types";
import styles from "./new-document.module.css";
import TemplateCard from "./TemplateCard";

export const TEMPLATE_GROUPS: ReadonlyArray<{
  id: TemplateCategory;
  heading: string;
}> = [
  { id: "personal", heading: "개인 문서" },
  { id: "business", heading: "브랜드·업무" },
  { id: "occasion", heading: "초대·인사" },
];

export type GroupedTemplates = Record<
  TemplateCategory,
  TemplateCatalogEntry[]
>;

export function groupTemplatesByCategory(
  templates: readonly TemplateCatalogEntry[],
): GroupedTemplates {
  const groups: GroupedTemplates = {
    personal: [],
    business: [],
    occasion: [],
  };

  for (const template of templates) {
    groups[template.category].push(template);
  }

  return groups;
}

type TemplatePickerProps = {
  templates: readonly TemplateCatalogEntry[];
  selectedId: TemplateId | null;
  disabled: boolean;
  onSelect: (id: TemplateId) => void;
};

export default function TemplatePicker({
  templates,
  selectedId,
  disabled,
  onSelect,
}: TemplatePickerProps) {
  const groups = groupTemplatesByCategory(templates);

  return (
    <section className={styles.pickerSection} aria-labelledby="template-picker-heading">
      <div className={styles.sectionHeading}>
        <p className={styles.eyebrow}>문서 만들기</p>
        <h1 id="template-picker-heading">템플릿을 고르세요</h1>
        <p>목적에 맞는 문서를 고르면 필요한 사실과 원고 예시를 안내합니다.</p>
      </div>

      <div className={styles.templateGroups}>
        {TEMPLATE_GROUPS.map((group) => (
          <section className={styles.templateGroup} key={group.id} aria-labelledby={`template-group-${group.id}`}>
            <h2 id={`template-group-${group.id}`}>{group.heading}</h2>
            {groups[group.id].length > 0 ? (
              <div className={styles.templateGrid}>
                {groups[group.id].map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={selectedId === template.id}
                    disabled={disabled}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>표시할 템플릿이 없습니다.</p>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
