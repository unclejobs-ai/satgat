import type { CSSProperties } from "react";
import { getPageSpec } from "@/lib/templates/registry";
import type { TemplateCatalogEntry } from "@/lib/templates/types";
import styles from "./new-document.module.css";

type TemplatePreviewProps = {
  template: TemplateCatalogEntry;
};

type PreviewStyle = CSSProperties & {
  "--preview-aspect": string;
};

export default function TemplatePreview({ template }: TemplatePreviewProps) {
  const pageSpec = getPageSpec(template.pageSpec);
  const style: PreviewStyle = {
    "--preview-aspect": `${pageSpec.canvas.widthMm} / ${pageSpec.canvas.heightMm}`,
  };

  return (
    <span className={styles.templatePreview} style={style} aria-hidden="true">
      <span className={styles.previewHeader} />
      <span className={styles.previewTitle} />
      <span className={styles.previewRule} />
      <span className={styles.previewColumns}>
        <span />
        <span />
      </span>
      <span className={styles.previewFooter} />
    </span>
  );
}
