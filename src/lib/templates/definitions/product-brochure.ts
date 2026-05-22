import type { SatgatTemplate } from '../types';

export const productBrochure: SatgatTemplate = {
  id: 'product-brochure',
  name: '제품 소개서',
  description: '제품 스펙 · 효능 · 사용법 · 인증. A4 세로 2-4p',
  format: 'a4',
  slots: [
    { id: 'product_name', type: 'text', required: true, label: '제품명' },
    { id: 'category', type: 'text', required: true, label: '카테고리' },
    { id: 'hero_image', type: 'image', required: false, label: '대표 이미지' },
    { id: 'overview', type: 'textarea', required: true, label: '제품 개요' },
    { id: 'features', type: 'list', required: true, label: '주요 특징' },
    { id: 'specs', type: 'table', required: false, label: '스펙 테이블' },
    { id: 'usage', type: 'textarea', required: false, label: '사용법' },
    { id: 'certifications', type: 'list', required: false, label: '인증/수상' },
    { id: 'contact', type: 'text', required: false, label: '연락처' },
  ],
  sections: [
    { type: 'hero', slots: ['product_name', 'category'] },
    { type: 'image-text', slots: ['hero_image', 'product_name', 'overview'] },
    { type: 'divider', slots: [], config: { variant: 'dancheong', weight: 'thin' } },
    { type: 'grid', slots: ['features'] },
    { type: 'table', slots: ['specs'] },
    { type: 'text', slots: ['usage'] },
    { type: 'grid', slots: ['certifications'] },
    { type: 'footer', slots: ['contact'] },
  ],
};
