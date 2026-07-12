import { getPageSpec } from "@/lib/templates/registry";
import type {
  TemplateCatalogEntry,
  TemplateCategory,
  TemplateId,
} from "@/lib/templates/types";

const GROUPS: ReadonlyArray<{
  id: TemplateCategory;
  title: string;
  description: string;
}> = [
  {
    id: "personal",
    title: "개인 문서",
    description: "나의 경험과 이름을 또렷하게 전하는 문서",
  },
  {
    id: "business",
    title: "브랜드·업무",
    description: "생각과 성과를 설득력 있게 정리하는 문서",
  },
  {
    id: "occasion",
    title: "초대·인사",
    description: "마음을 한글로 단정하게 건네는 문서",
  },
];

export type LandingTemplate = TemplateCatalogEntry & {
  readonly format: string;
};

export type LandingTemplateGroup = {
  readonly id: TemplateCategory;
  readonly title: string;
  readonly description: string;
  readonly templates: readonly LandingTemplate[];
};

export type RepresentativeResult = {
  readonly category: TemplateCategory;
  readonly template: LandingTemplate;
  readonly href: string;
};

function localizedPath(lang: string, suffix: string): string {
  return `/${encodeURIComponent(lang)}${suffix}`;
}

export function buildLandingTemplateGroups(
  templates: readonly TemplateCatalogEntry[],
): LandingTemplateGroup[] {
  return GROUPS.map((group) => ({
    ...group,
    templates: templates
      .filter((template) => template.category === group.id)
      .map((template) => ({
        ...template,
        format: getPageSpec(template.pageSpec).label,
      })),
  }));
}

export function getLandingCtas(lang: string): {
  primary: string;
  secondary: string;
} {
  return {
    primary: localizedPath(lang, "/new"),
    secondary: localizedPath(lang, "/examples"),
  };
}

export function getLandingTemplateHref(lang: string, id: TemplateId): string {
  return `${localizedPath(lang, "/new")}?template=${encodeURIComponent(id)}`;
}

export function buildRepresentativeResults(
  groups: readonly LandingTemplateGroup[],
  lang: string,
): RepresentativeResult[] {
  return groups.flatMap((group) => {
    const template = group.templates[0];
    return template
      ? [{
          category: group.id,
          template,
          href: `${localizedPath(lang, "/examples")}#${encodeURIComponent(template.id)}`,
        }]
      : [];
  });
}
