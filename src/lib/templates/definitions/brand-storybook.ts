import type { TemplateCatalogEntry } from '../types';

export const brandStorybook: TemplateCatalogEntry = {
  id: 'brand-storybook',
  name: '브랜드 스토리북',
  description: '브랜드 내러티브 · 비주얼 · 톤앤매너. A4 세로 4-8p',
  category: 'business',
  pageSpec: 'a4Portrait',
  slots: [
    { id: 'brand_name', type: 'text', required: true, label: '브랜드명' },
    { id: 'origin_story', type: 'textarea', required: true, label: '브랜드 탄생 이야기' },
    { id: 'values', type: 'list', required: true, label: '핵심 가치', placeholder: 'JSON: {"title":"...","description":"..."}' },
    { id: 'visual_concept', type: 'textarea', required: false, label: '비주얼 컨셉' },
    { id: 'tone_manner', type: 'textarea', required: false, label: '톤앤매너' },
    { id: 'milestones', type: 'list', required: false, label: '주요 Milestone', placeholder: 'JSON: {"year":"...","event":"..."}' },
    { id: 'contact', type: 'text', required: false, label: '연락처' },
  ],
  contentOutline: [
    { type: 'hero', slots: ['brand_name', 'origin_story'] },
    { type: 'text', slots: ['origin_story'] },
    { type: 'grid', slots: ['values'] },
    { type: 'text', slots: ['visual_concept'] },
    { type: 'text', slots: ['tone_manner'] },
    { type: 'grid', slots: ['milestones'] },
    { type: 'footer', slots: ['contact'] },
  ],
  promptSeeds: [
    '한옥 숙박 브랜드 달빛서가의 스토리북입니다. 탄생 배경, 브랜드 가치, 공간의 장면, 고객에게 남기고 싶은 감정을 서사적으로 정리해 주세요.',
    '로컬 식품 브랜드 고요장의 브랜드 이야기입니다. 발효 장인의 기원, 핵심 가치, 톤앤매너, 주요 연혁을 따뜻하지만 절제된 문장으로 써 주세요.',
  ],
  factChecklist: ['탄생 배경', '핵심 가치', '톤앤매너', '주요 장면'],
  specimen: {
    title: '술도가 한울 브랜드 스토리북',
    alt: '술도가 한울 브랜드 스토리북 완성 예시',
    prompt: "전통주 양조장 '한울'의 브랜드 스토리북 한 장을 만들어줘. 창업 계기, 철학, 만드는 사람의 이야기가 잡지처럼 읽히게.",
  },
};
