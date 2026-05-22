import type { SatgatTemplate } from '../types';

export const resume: SatgatTemplate = {
  id: 'resume',
  name: '이력서',
  description: '경력 · 프로젝트 · 스킬. A4 세로 1-2p',
  format: 'a4',
  slots: [
    { id: 'name', type: 'text', required: true, label: '이름' },
    { id: 'title', type: 'text', required: true, label: '직함', placeholder: '프로덕트 디자이너 · AI 콘텐츠 생성' },
    { id: 'email', type: 'text', required: false, label: '이메일' },
    { id: 'github', type: 'text', required: false, label: 'GitHub / 포트폴리오' },
    { id: 'summary', type: 'textarea', required: false, label: '자기소개' },
    { id: 'experiences', type: 'list', required: true, label: '경력', placeholder: 'JSON: {"company":"...","role":"...","period":"...","description":"..."}' },
    { id: 'skills', type: 'textarea', required: false, label: '스킬' },
    { id: 'education', type: 'list', required: false, label: '학력', placeholder: 'JSON: {"school":"...","degree":"...","period":"..."}' },
  ],
  sections: [
    { type: 'hero', slots: ['name', 'title'] },
    { type: 'text', slots: ['summary'] },
    { type: 'divider', slots: [], config: { variant: 'ink', weight: 'thin' } },
    { type: 'grid', slots: ['experiences'] },
    { type: 'text', slots: ['skills'] },
    { type: 'grid', slots: ['education'] },
    { type: 'footer', slots: ['email', 'github'] },
  ],
};
