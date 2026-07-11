import type { TemplateCatalogEntry } from '../types';

export const productBrochure: TemplateCatalogEntry = {
  id: 'product-brochure',
  name: '제품 소개서',
  description: '제품 스펙 · 효능 · 사용법 · 인증. A4 세로 2-4p',
  category: 'business',
  pageSpec: 'a4Portrait',
  slots: [
    { id: 'product_name', type: 'text', required: true, label: '제품명' },
    { id: 'category', type: 'text', required: true, label: '카테고리' },
    { id: 'hero_image', type: 'image', required: false, label: '대표 이미지' },
    { id: 'overview', type: 'textarea', required: true, label: '제품 개요' },
    { id: 'features', type: 'list', required: true, label: '주요 특징' },
    { id: 'feature_chart', type: 'visual', required: false, label: '특징 비교 차트', placeholder: 'bar, radar 대체 bar, layer-stack' },
    { id: 'specs', type: 'table', required: false, label: '스펙 테이블' },
    { id: 'usage', type: 'textarea', required: false, label: '사용법' },
    { id: 'certifications', type: 'list', required: false, label: '인증/수상' },
    { id: 'contact', type: 'text', required: false, label: '연락처' },
  ],
  contentOutline: [
    { type: 'hero', slots: ['product_name', 'category'] },
    { type: 'image-text', slots: ['hero_image', 'product_name', 'overview'] },
    { type: 'divider', slots: [], config: { variant: 'dancheong', weight: 'thin' } },
    { type: 'grid', slots: ['features'] },
    { type: 'visual', slots: ['feature_chart'] },
    { type: 'table', slots: ['specs'] },
    { type: 'text', slots: ['usage'] },
    { type: 'grid', slots: ['certifications'] },
    { type: 'footer', slots: ['contact'] },
  ],
  promptSeeds: [
    '제품명은 다담 노트입니다. 한지 질감의 프리미엄 기록 노트이며, 제품 개요, 주요 특징, 특징 비교 막대 차트, 스펙, 사용 장면, 구매 문의를 담아 주세요.',
    '전통 차 선물 세트 소개서입니다. 구성품, 맛의 특징, 구성비 도넛 차트, 포장 방식, 인증 정보, 기업 선물 문의 문구를 품격 있게 정리해 주세요.',
  ],
  factChecklist: ['제품명', '제품 개요', '주요 특징', '비교 차트', '스펙·문의'],
  specimen: {
    title: '온정 제품 소개서',
    alt: '온정 제품 소개서 완성 예시',
    prompt: "1인 가구용 스마트 약탕기 '온정'의 제품 소개서를 만들어줘. 무엇이 다른지, 사양, 사용 장면이 분명하게.",
  },
};
