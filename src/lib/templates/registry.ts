import type { SatgatTemplate } from './types';
import { resume } from './definitions/resume';
import { selfIntro } from './definitions/self-intro';
import { businessCard } from './definitions/business-card';
import { invitation } from './definitions/invitation';
import { newYearCard } from './definitions/new-year-card';
import { proposal } from './definitions/proposal';
import { newsletter } from './definitions/newsletter';
import { portfolio } from './definitions/portfolio';

/**
 * 삿갓 — 한국 문서 8종 라인업
 * 순서: 가장 자주 만드는 것부터.
 */
const templates: Record<string, SatgatTemplate> = {
  [resume.id]: resume,            // 履
  [selfIntro.id]: selfIntro,      // 介
  [businessCard.id]: businessCard,// 名
  [invitation.id]: invitation,    // 牒
  [newYearCard.id]: newYearCard,  // 賀
  [proposal.id]: proposal,        // 案
  [newsletter.id]: newsletter,    // 報
  [portfolio.id]: portfolio,      // 作
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
  invitation: { glyph: '牒', variant: 'dancheong' },
  'new-year-card': { glyph: '賀', variant: 'gold' },
  proposal: { glyph: '案', variant: 'dancheong' },
  newsletter: { glyph: '報', variant: 'gold' },
  portfolio: { glyph: '作', variant: 'jade' },
};

/** 한 줄 시(詩) — 카드 부제로 사용 */
export const TEMPLATE_VOICE: Record<string, string> = {
  resume: '한 사람의 자취',
  'self-intro': '나의 결을 풀어 적다',
  'business-card': '한 사람의 표지',
  invitation: '두 사람의 시작',
  'new-year-card': '한 해의 인사',
  proposal: '사업의 길',
  newsletter: '정기 소식',
  portfolio: '솜씨를 펼치다',
};
