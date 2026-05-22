import type { SatgatTemplate } from '../types';

export const companyProfile: SatgatTemplate = {
  id: 'company-profile',
  name: '회사 소개서',
  description: '비전 · 팀 · 연혁 · 연락처. A4 세로 2-6p',
  format: 'a4',
  slots: [
    { id: 'company_name', type: 'text', required: true, label: '회사명' },
    { id: 'tagline', type: 'text', required: true, label: '슬로건' },
    { id: 'vision', type: 'textarea', required: true, label: '비전' },
    { id: 'mission', type: 'textarea', required: false, label: '미션' },
    { id: 'history', type: 'list', required: false, label: '연혁', placeholder: 'JSON: {"year":"...","event":"..."}' },
    { id: 'team', type: 'list', required: false, label: '팀', placeholder: 'JSON: {"name":"...","role":"..."}' },
    { id: 'contact', type: 'text', required: false, label: '연락처' },
    { id: 'website', type: 'text', required: false, label: '웹사이트' },
  ],
  sections: [
    { type: 'hero', slots: ['company_name', 'tagline', 'website'] },
    { type: 'text', slots: ['vision'] },
    { type: 'text', slots: ['mission'] },
    { type: 'grid', slots: ['history'] },
    { type: 'grid', slots: ['team'] },
    { type: 'footer', slots: ['contact', 'website'] },
  ],
};
