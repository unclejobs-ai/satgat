import type { SatgatTemplate } from '../types';

export const portfolio: SatgatTemplate = {
  id: 'portfolio',
  name: '포트폴리오',
  description: '프로젝트 그리드 · 썸네일 · 설명. A4 가로 또는 세로',
  format: 'a4-landscape',
  slots: [
    { id: 'name', type: 'text', required: true, label: '이름' },
    { id: 'title', type: 'text', required: true, label: '직함/역할' },
    { id: 'bio', type: 'textarea', required: false, label: '소개' },
    { id: 'projects', type: 'list', required: true, label: '프로젝트', placeholder: 'JSON: {"title":"...","description":"...","image":"..."}' },
    { id: 'skills', type: 'textarea', required: false, label: '스킬' },
    { id: 'contact', type: 'text', required: false, label: '연락처' },
  ],
  sections: [
    { type: 'hero', slots: ['name', 'title'] },
    { type: 'text', slots: ['bio'] },
    { type: 'grid', slots: ['projects'] },
    { type: 'text', slots: ['skills'] },
    { type: 'footer', slots: ['contact'] },
  ],
};
