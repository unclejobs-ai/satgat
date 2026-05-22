import type { SatgatTemplate } from '../types';

export const brandOnepager: SatgatTemplate = {
  id: 'brand-onepager',
  name: '브랜드 원페이지',
  description: '핵심 가치 · 제품 3줄 · CTA. A4 세로',
  format: 'a4',
  slots: [
    { id: 'brand_name', type: 'text', required: true, label: '브랜드명', placeholder: '상세' },
    { id: 'tagline', type: 'text', required: true, label: '슬로건', placeholder: 'AI로 만드는 완벽한 상세페이지' },
    { id: 'description', type: 'textarea', required: true, label: '브랜드 설명', placeholder: '브랜드의 핵심 가치와 비전을 2-3문장으로 작성하세요.' },
    { id: 'products', type: 'list', required: false, label: '제품/서비스 목록', placeholder: 'JSON: {"title":"...","description":"..."}' },
    { id: 'contact', type: 'text', required: false, label: '연락처', placeholder: 'contact@sangse.page' },
    { id: 'website', type: 'text', required: false, label: '웹사이트', placeholder: 'www.sangse.page' },
  ],
  sections: [
    { type: 'hero', slots: ['brand_name', 'tagline', 'website'] },
    { type: 'text', slots: ['description'] },
    { type: 'divider', slots: [], config: { variant: 'dancheong', weight: 'medium' } },
    { type: 'grid', slots: ['products'] },
    { type: 'divider', slots: [], config: { variant: 'ink', weight: 'thin' } },
    { type: 'footer', slots: ['contact', 'website'] },
  ],
};
