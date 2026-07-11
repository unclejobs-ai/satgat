import type { TemplateCatalogEntry } from '../types';

export const companyProfile: TemplateCatalogEntry = {
  id: 'company-profile',
  name: '회사 소개서',
  description: '비전 · 미션 · 핵심 가치 · 팀 · 연혁. A4 세로 2-6p',
  category: 'business',
  pageSpec: 'a4Portrait',
  slots: [
    { id: 'company_name', type: 'text', required: true, label: '회사명' },
    { id: 'tagline', type: 'text', required: true, label: '슬로건' },
    { id: 'vision', type: 'textarea', required: true, label: '비전' },
    { id: 'mission', type: 'textarea', required: false, label: '미션' },
    { id: 'values', type: 'list', required: false, label: '핵심 가치', placeholder: 'JSON: {"title":"...","description":"..."}' },
    { id: 'history', type: 'list', required: false, label: '연혁', placeholder: 'JSON: {"year":"...","event":"..."}' },
    { id: 'growth_chart', type: 'visual', required: false, label: '성장/운영 도표', placeholder: 'timeline, line, architecture' },
    { id: 'team', type: 'list', required: false, label: '팀', placeholder: 'JSON: {"name":"...","role":"..."}' },
    { id: 'contact', type: 'text', required: false, label: '연락처' },
    { id: 'website', type: 'text', required: false, label: '웹사이트' },
  ],
  contentOutline: [
    { type: 'hero', slots: ['company_name', 'tagline', 'website'] },
    { type: 'text', slots: ['vision'] },
    { type: 'text', slots: ['mission'] },
    { type: 'grid', slots: ['values'] },
    { type: 'grid', slots: ['history'] },
    { type: 'visual', slots: ['growth_chart'] },
    { type: 'grid', slots: ['team'] },
    { type: 'footer', slots: ['contact', 'website'] },
  ],
  promptSeeds: [
    '회사명은 북촌랩스입니다. 로컬 문화 공간의 예약·운영을 돕는 SaaS 회사이며, 비전, 미션, 핵심 가치, 연혁 타임라인 도표, 팀, 연락처를 포함해 주세요.',
    '사회적 기업 온기공방 소개서입니다. 시니어 장인의 수공예품을 유통하며, 설립 배경, 핵심 가치, 주요 성과 추이 차트, 팀, 협업 문의를 정리해 주세요.',
  ],
  factChecklist: ['회사명', '비전·미션', '핵심 가치', '연혁 도표', '팀·연락처'],
  specimen: {
    title: '달빛식품 회사 소개서',
    alt: '달빛식품 회사 소개서 완성 예시',
    prompt: '프리미엄 전통 간편식 브랜드 달빛식품의 회사 소개서를 만들어줘. 투자자와 유통 MD가 함께 볼 문서라서 브랜드 철학과 숫자가 균형 있게 보여야 해.',
  },
};
