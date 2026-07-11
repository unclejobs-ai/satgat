import { TEMPLATE_IDS, type PageSpec, type PageSpecId, type TemplateCatalogEntry, type TemplateId } from './types';
import { resume } from './definitions/resume';
import { selfIntro } from './definitions/self-intro';
import { businessCard } from './definitions/business-card';
import { invitation } from './definitions/invitation';
import { newYearCard } from './definitions/new-year-card';
import { proposal } from './definitions/proposal';
import { newsletter } from './definitions/newsletter';
import { portfolio } from './definitions/portfolio';
import { brandOnepager } from './definitions/brand-onepager';
import { brandStorybook } from './definitions/brand-storybook';
import { companyProfile } from './definitions/company-profile';
import { investorDeck } from './definitions/investor-deck';
import { productBrochure } from './definitions/product-brochure';
import { report } from './definitions/report';

export const PAGE_SPECS: Readonly<Record<PageSpecId, PageSpec>> = {
  a4Portrait: {
    id: 'a4Portrait',
    label: 'A4 세로',
    canvas: { widthMm: 210, heightMm: 297 },
    cssSize: '210mm 297mm',
  },
  a4Landscape: {
    id: 'a4Landscape',
    label: 'A4 가로',
    canvas: { widthMm: 297, heightMm: 210 },
    cssSize: '297mm 210mm',
  },
  slide16x9: {
    id: 'slide16x9',
    label: '16:9 슬라이드',
    canvas: { widthMm: 297, heightMm: 167 },
    cssSize: '297mm 167mm',
  },
  businessCard8Up: {
    id: 'businessCard8Up',
    label: '명함 8-up',
    canvas: { widthMm: 210, heightMm: 297 },
    cssSize: '210mm 297mm',
    imposition: { columns: 2, rows: 4, cardWidthMm: 90, cardHeightMm: 55 },
  },
  postcardPortrait: {
    id: 'postcardPortrait',
    label: '엽서 세로',
    canvas: { widthMm: 105, heightMm: 148 },
    cssSize: '105mm 148mm',
  },
};

export function getPageSpec(id: PageSpecId): PageSpec {
  return PAGE_SPECS[id];
}

/**
 * 삿갓 — 한국 문서 14종 라인업
 * 순서: 개인 문서에서 브랜드/회사 문서, 인사 문서로.
 */
const templates: Record<TemplateId, TemplateCatalogEntry> = {
  resume,
  'self-intro': selfIntro,
  'business-card': businessCard,
  'brand-onepager': brandOnepager,
  'product-brochure': productBrochure,
  'company-profile': companyProfile,
  proposal,
  'investor-deck': investorDeck,
  'brand-storybook': brandStorybook,
  invitation,
  'new-year-card': newYearCard,
  newsletter,
  portfolio,
  report,
};

export function isTemplateId(id: string): id is TemplateId {
  return TEMPLATE_IDS.some((templateId) => templateId === id);
}

export function getTemplate(id: string): TemplateCatalogEntry | undefined {
  return isTemplateId(id) ? templates[id] : undefined;
}

export function listTemplates(): TemplateCatalogEntry[] {
  return TEMPLATE_IDS.map((id) => templates[id]);
}

export function getTemplateIds(): TemplateId[] {
  return [...TEMPLATE_IDS];
}

