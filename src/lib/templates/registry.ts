import type { SatgatTemplate } from './types';
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

/**
 * 삿갓 — 한국 문서 14종 라인업
 * 순서: 개인 문서에서 브랜드/회사 문서, 인사 문서로.
 */
const templates: Record<string, SatgatTemplate> = {
  [resume.id]: resume,            // 履
  [selfIntro.id]: selfIntro,      // 介
  [businessCard.id]: businessCard,// 名
  [brandOnepager.id]: brandOnepager,// 品
  [productBrochure.id]: productBrochure,// 品
  [companyProfile.id]: companyProfile,// 社
  [proposal.id]: proposal,        // 案
  [investorDeck.id]: investorDeck,// 投
  [brandStorybook.id]: brandStorybook,// 話
  [invitation.id]: invitation,    // 牒
  [newYearCard.id]: newYearCard,  // 賀
  [newsletter.id]: newsletter,    // 報
  [portfolio.id]: portfolio,      // 作
  [report.id]: report,            // 報告
};

export function getTemplate(id: string): SatgatTemplate | undefined {
  return templates[id];
}

export function listTemplates(): SatgatTemplate[] {
  return Object.values(templates);
}

export function getTemplateIds(): string[] {
  return Object.keys(templates);
}

/** 인장(印章) 글자 매핑 — UI에서 카드 배지로 사용 */
export const TEMPLATE_SEAL: Record<string, { glyph: string; variant: 'ink' | 'dancheong' | 'jade' | 'gold' }> = {
  resume: { glyph: '履', variant: 'ink' },
  'self-intro': { glyph: '介', variant: 'dancheong' },
  'business-card': { glyph: '名', variant: 'jade' },
  'brand-onepager': { glyph: '品', variant: 'dancheong' },
  'product-brochure': { glyph: '製', variant: 'jade' },
  'company-profile': { glyph: '社', variant: 'jade' },
  'investor-deck': { glyph: '投', variant: 'gold' },
  'brand-storybook': { glyph: '話', variant: 'gold' },
  invitation: { glyph: '牒', variant: 'dancheong' },
  'new-year-card': { glyph: '賀', variant: 'gold' },
  proposal: { glyph: '案', variant: 'dancheong' },
  newsletter: { glyph: '報', variant: 'gold' },
  portfolio: { glyph: '作', variant: 'jade' },
  report: { glyph: '報', variant: 'ink' },
};

/** 한 줄 시(詩) — 카드 부제로 사용 */
export const TEMPLATE_VOICE: Record<string, string> = {
  resume: '한 사람의 자취',
  'self-intro': '나의 결을 풀어 적다',
  'business-card': '한 사람의 표지',
  'brand-onepager': '브랜드의 첫 장',
  'product-brochure': '제품을 펼치다',
  'company-profile': '회사의 결',
  'investor-deck': '투자의 설득',
  'brand-storybook': '기원을 엮다',
  invitation: '두 사람의 시작',
  'new-year-card': '한 해의 인사',
  proposal: '사업의 길',
  newsletter: '정기 소식',
  portfolio: '솜씨를 펼치다',
  report: '일의 기록',
};
