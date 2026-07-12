/**
 * 삿갓 템플릿 타입 시스템
 *
 * 템플릿 = 레이아웃 청사진 + slot 정의 + 섹션 구성
 * 데이터 = slot에 채워질 실제 콘텐츠
 */

export const PAGE_SPEC_IDS = [
  'a4Portrait',
  'a4Landscape',
  'slide16x9',
  'businessCard8Up',
  'postcardPortrait',
] as const;

export type PageSpecId = (typeof PAGE_SPEC_IDS)[number];

export interface PageCanvas {
  readonly widthMm: number;
  readonly heightMm: number;
}

export interface PageSpec {
  readonly id: PageSpecId;
  readonly label: string;
  readonly canvas: PageCanvas;
  readonly cssSize: `${number}mm ${number}mm`;
  readonly imposition?: {
    readonly columns: number;
    readonly rows: number;
    readonly cardWidthMm: number;
    readonly cardHeightMm: number;
  };
}

export const TEMPLATE_IDS = [
  'resume',
  'self-intro',
  'business-card',
  'brand-onepager',
  'product-brochure',
  'company-profile',
  'investor-deck',
  'brand-storybook',
  'invitation',
  'new-year-card',
  'proposal',
  'newsletter',
  'portfolio',
  'report',
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];
export type TemplateCategory = 'personal' | 'business' | 'occasion';

export interface SpecimenMetadata {
  title: string;
  alt: string;
  prompt: string;
}

export type SlotType = 'text' | 'textarea' | 'image' | 'list' | 'table' | 'visual';

export interface TemplateSlot {
  id: string;
  type: SlotType;
  required: boolean;
  label: string;
  placeholder?: string;
}

export type SectionType =
  | 'hero'
  | 'text'
  | 'grid'
  | 'two-column'
  | 'image-text'
  | 'table'
  | 'visual'
  | 'divider'
  | 'footer';

export interface SectionDef {
  type: SectionType;
  /** 이 섹션에서 사용할 slot id 목록 */
  slots: string[];
  /** 섹션별 추가 설정 */
  config?: Record<string, unknown>;
}

export interface TemplateCatalogEntry {
  id: TemplateId;
  name: string;
  description: string;
  category: TemplateCategory;
  pageSpec: PageSpecId;
  slots: TemplateSlot[];
  /**
   * 문서를 구성하는 섹션 순서(메타데이터 전용).
   *
   * 렌더러(src/components/templates/*.tsx)가 렌더의 진실 원천이다. 이 배열은
   * 정의 일관성과 문서 구조 가독성을 위한 보조 메타데이터로만 쓰인다.
   */
  contentOutline: SectionDef[];
  promptSeeds: readonly string[];
  factChecklist: readonly string[];
  specimen: SpecimenMetadata;
}

/**
 * 실제 문서 인스턴스 데이터
 */
export interface SatgatDocumentData {
  templateId: string;
  title?: string;
  /** slot id → 값 매핑 */
  slots: Record<string, unknown>;
}
