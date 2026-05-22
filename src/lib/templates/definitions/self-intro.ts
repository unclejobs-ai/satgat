import type { SatgatTemplate } from '../types';

export const selfIntro: SatgatTemplate = {
  id: 'self-intro',
  name: '자기소개서',
  description: '나의 결을 풀어 적다. A4 · 4문항 표준',
  format: 'a4',
  slots: [
    { id: 'name', type: 'text', required: true, label: '이름' },
    { id: 'target', type: 'text', required: true, label: '지원처', placeholder: '회사·학교명' },
    { id: 'role', type: 'text', required: false, label: '지원 직무' },
    { id: 'q1_motivation', type: 'textarea', required: true, label: '지원 동기', placeholder: '왜 이곳에 지원하는가' },
    { id: 'q2_competence', type: 'textarea', required: true, label: '직무 역량', placeholder: '내가 가진 강점·경험' },
    { id: 'q3_growth', type: 'textarea', required: true, label: '성장 과정', placeholder: '나를 만든 경험들' },
    { id: 'q4_aspiration', type: 'textarea', required: true, label: '입사 후 포부', placeholder: '5년 뒤 내가 만들 가치' },
  ],
  sections: [
    { type: 'hero', slots: ['name', 'target', 'role'] },
    { type: 'divider', slots: [], config: { variant: 'ink', weight: 'medium' } },
    { type: 'text', slots: ['q1_motivation'] },
    { type: 'text', slots: ['q2_competence'] },
    { type: 'text', slots: ['q3_growth'] },
    { type: 'text', slots: ['q4_aspiration'] },
  ],
};
