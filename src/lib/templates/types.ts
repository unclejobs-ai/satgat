/**
 * 삿갓 템플릿 타입 시스템
 *
 * 템플릿 = 레이아웃 청사진 + slot 정의 + 섹션 구성
 * 데이터 = slot에 채워질 실제 콘텐츠
 */

export type DocumentFormat = 'a4' | 'a4-landscape' | 'slide-16x9';

export type SlotType = 'text' | 'textarea' | 'image' | 'image-list' | 'list' | 'markdown' | 'table' | 'visual';

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
  | 'text-columns'
  | 'grid'
  | 'two-column'
  | 'image'
  | 'image-text'
  | 'table'
  | 'visual'
  | 'divider'
  | 'footer'
  | 'spacer';

export interface SectionDef {
  type: SectionType;
  /** 이 섹션에서 사용할 slot id 목록 */
  slots: string[];
  /** 섹션별 추가 설정 */
  config?: Record<string, unknown>;
}

export interface SatgatTemplate {
  id: string;
  name: string;
  description: string;
  format: DocumentFormat;
  /** 사용자/AI가 채워야 할 slot 정의 */
  slots: TemplateSlot[];
  /** 문서를 구성하는 섹션 순서 */
  sections: SectionDef[];
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
