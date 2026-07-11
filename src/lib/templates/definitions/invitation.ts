import type { TemplateCatalogEntry } from '../types';

export const invitation: TemplateCatalogEntry = {
  id: 'invitation',
  name: '청첩장',
  description: '두 사람의 시작. 엽서 · 날짜와 장소 + RSVP',
  category: 'occasion',
  pageSpec: 'postcardPortrait',
  slots: [
    { id: 'groom_name', type: 'text', required: true, label: '신랑 이름' },
    { id: 'groom_parents', type: 'text', required: false, label: '신랑 부모', placeholder: '아버지 박상세 · 어머니 김한지' },
    { id: 'bride_name', type: 'text', required: true, label: '신부 이름' },
    { id: 'bride_parents', type: 'text', required: false, label: '신부 부모', placeholder: '아버지 이먹 · 어머니 정단청' },
    { id: 'date', type: 'text', required: true, label: '날짜', placeholder: '2026년 6월 14일 토요일 오후 2시' },
    { id: 'venue', type: 'textarea', required: true, label: '예식 장소', placeholder: '서울 그랜드인터컨티넨탈 · 그랜드 볼룸' },
    { id: 'message', type: 'textarea', required: false, label: '인사말' },
    { id: 'rsvp_url', type: 'text', required: false, label: 'RSVP 링크' },
  ],
  contentOutline: [
    { type: 'hero', slots: ['groom_name', 'bride_name'] },
    { type: 'text', slots: ['message'] },
    { type: 'divider', slots: [], config: { variant: 'dancheong', weight: 'medium' } },
    { type: 'two-column', slots: ['groom_parents', 'bride_parents'] },
    { type: 'text', slots: ['date', 'venue'] },
    { type: 'footer', slots: ['rsvp_url'] },
  ],
  promptSeeds: [
    '지수와 민호의 결혼식입니다. 2026년 10월 18일 일요일 오후 2시, 서울 정동길 예식장. 부모님 성함과 감사 인사를 단정하게 담아 주세요.',
    '전통 혼례 분위기의 초대장입니다. 두 사람의 시작, 장소 안내, 교통 안내, 짧은 초대 문구를 포함해 주세요.',
  ],
  factChecklist: ['두 사람 이름', '날짜·시간', '장소', '초대 문구'],
  specimen: {
    title: '지수와 민호 청첩장',
    alt: '지수와 민호 청첩장 완성 예시',
    prompt: '지수와 민호의 청첩장을 만들어줘. 과하게 화려하지 않고, 가족 어른들이 읽기 편한 한글 중심의 따뜻한 문장으로.',
  },
};
