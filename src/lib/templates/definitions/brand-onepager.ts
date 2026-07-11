import type { TemplateCatalogEntry } from '../types';

export const brandOnepager: TemplateCatalogEntry = {
  id: 'brand-onepager',
  name: '브랜드 원페이지',
  description: '핵심 가치 · 제품 3줄 · CTA. A4 가로',
  category: 'business',
  pageSpec: 'a4Landscape',
  slots: [
    { id: 'brand_name', type: 'text', required: true, label: '브랜드명', placeholder: '상세' },
    { id: 'tagline', type: 'text', required: true, label: '슬로건', placeholder: 'AI로 만드는 완벽한 상세페이지' },
    { id: 'description', type: 'textarea', required: true, label: '브랜드 설명', placeholder: '브랜드의 핵심 가치와 비전을 2-3문장으로 작성하세요.' },
    { id: 'products', type: 'list', required: false, label: '제품/서비스 목록', placeholder: 'JSON: {"title":"...","description":"..."}' },
    { id: 'positioning_map', type: 'visual', required: false, label: '포지셔닝 도표', placeholder: 'quadrant 또는 venn' },
    { id: 'contact', type: 'text', required: false, label: '연락처', placeholder: 'contact@sangse.page' },
    { id: 'website', type: 'text', required: false, label: '웹사이트', placeholder: 'www.sangse.page' },
  ],
  contentOutline: [
    { type: 'hero', slots: ['brand_name', 'tagline', 'website'] },
    { type: 'text', slots: ['description'] },
    { type: 'divider', slots: [], config: { variant: 'dancheong', weight: 'medium' } },
    { type: 'grid', slots: ['products'] },
    { type: 'visual', slots: ['positioning_map'] },
    { type: 'divider', slots: [], config: { variant: 'ink', weight: 'thin' } },
    { type: 'footer', slots: ['contact', 'website'] },
  ],
  promptSeeds: [
    '브랜드명은 향유원입니다. 전통 향과 현대적인 웰니스 루틴을 연결하는 브랜드이며, 핵심 문장, 대표 제품 3개, 포지셔닝 사분면 도표, 웹사이트와 연락처를 담아 주세요.',
    'AI 기반 상세페이지 제작 브랜드입니다. 빠른 제작, 한국형 문장 톤, 검수 프로세스, 경쟁 포지션 도표, 상담 CTA를 한 장짜리 소개서처럼 정리해 주세요.',
  ],
  factChecklist: ['브랜드명', '핵심 문장', '제품·서비스', '포지셔닝 도표', '연락처'],
  specimen: {
    title: '백자 브랜드 원페이지',
    alt: '백자 브랜드 원페이지 완성 예시',
    prompt: "전통 백자 그릇 브랜드 '백자상회'의 한 장짜리 브랜드 소개를 만들어줘. 한 문장 선언, 세 가지 약속, 핵심 숫자가 한눈에 보이게.",
  },
};
