import type { SatgatTemplate } from '../types';

export const invitation: SatgatTemplate = {
  id: 'invitation',
  name: '청첩장',
  description: '두 사람의 시작. A5 · 신랑신부 한자명 + 약도 + RSVP',
  format: 'a4',
  slots: [
    { id: 'groom_name', type: 'text', required: true, label: '신랑 이름' },
    { id: 'groom_hanja', type: 'text', required: false, label: '신랑 한자명' },
    { id: 'groom_parents', type: 'text', required: false, label: '신랑 부모', placeholder: '父 박상세 · 母 김한지' },
    { id: 'bride_name', type: 'text', required: true, label: '신부 이름' },
    { id: 'bride_hanja', type: 'text', required: false, label: '신부 한자명' },
    { id: 'bride_parents', type: 'text', required: false, label: '신부 부모', placeholder: '父 이먹 · 母 정단청' },
    { id: 'date', type: 'text', required: true, label: '날짜', placeholder: '2026년 6월 14일 토요일 오후 2시' },
    { id: 'date_hanja', type: 'text', required: false, label: '한자 날짜', placeholder: '丙午年 六月 十四日' },
    { id: 'venue', type: 'textarea', required: true, label: '예식 장소', placeholder: '서울 그랜드인터컨티넨탈 · 그랜드 볼룸' },
    { id: 'message', type: 'textarea', required: false, label: '인사말' },
    { id: 'rsvp_url', type: 'text', required: false, label: 'RSVP 링크' },
  ],
  sections: [
    { type: 'hero', slots: ['groom_name', 'bride_name'] },
    { type: 'text', slots: ['message'] },
    { type: 'divider', slots: [], config: { variant: 'dancheong', weight: 'medium' } },
    { type: 'two-column', slots: ['groom_parents', 'bride_parents'] },
    { type: 'text', slots: ['date', 'date_hanja', 'venue'] },
    { type: 'footer', slots: ['rsvp_url'] },
  ],
};
