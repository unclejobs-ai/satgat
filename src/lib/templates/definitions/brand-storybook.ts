import type { SatgatTemplate } from '../types';

export const brandStorybook: SatgatTemplate = {
  id: 'brand-storybook',
  name: '브랜드 스토리북',
  description: '브랜드 난러티브 · 비주얼 · 톤앤매너. A4 세로 4-8p',
  format: 'a4',
  slots: [
    { id: 'brand_name', type: 'text', required: true, label: '브랜드명' },
    { id: 'origin_story', type: 'textarea', required: true, label: '브랜드 탄생 이야기' },
    { id: 'values', type: 'list', required: true, label: '핵심 가치', placeholder: 'JSON: {"title":"...","description":"..."}' },
    { id: 'visual_concept', type: 'textarea', required: false, label: '비주얼 컨셉' },
    { id: 'tone_manner', type: 'textarea', required: false, label: '톤앤매너' },
    { id: 'milestones', type: 'list', required: false, label: '주요 Milestone', placeholder: 'JSON: {"year":"...","event":"..."}' },
    { id: 'contact', type: 'text', required: false, label: '연락처' },
  ],
  sections: [
    { type: 'hero', slots: ['brand_name', 'origin_story'] },
    { type: 'text', slots: ['origin_story'] },
    { type: 'grid', slots: ['values'] },
    { type: 'text', slots: ['visual_concept'] },
    { type: 'text', slots: ['tone_manner'] },
    { type: 'grid', slots: ['milestones'] },
    { type: 'footer', slots: ['contact'] },
  ],
};
