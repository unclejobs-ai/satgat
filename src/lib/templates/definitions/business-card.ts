import type { SatgatTemplate } from '../types';

export const businessCard: SatgatTemplate = {
  id: 'business-card',
  name: '명함',
  description: '한 사람의 표지. 90×55mm · A4 8-up 인쇄',
  format: 'a4',
  slots: [
    { id: 'name', type: 'text', required: true, label: '이름' },
    { id: 'hanja_name', type: 'text', required: false, label: '한자 이름', placeholder: '朴詳細' },
    { id: 'title', type: 'text', required: true, label: '직함', placeholder: '대표 / Founder' },
    { id: 'company', type: 'text', required: false, label: '회사명' },
    { id: 'email', type: 'text', required: true, label: '이메일' },
    { id: 'phone', type: 'text', required: false, label: '전화번호' },
    { id: 'website', type: 'text', required: false, label: '웹사이트' },
    { id: 'address', type: 'textarea', required: false, label: '주소' },
  ],
  sections: [
    { type: 'hero', slots: ['name', 'hanja_name'] },
    { type: 'text', slots: ['title', 'company'] },
    { type: 'divider', slots: [], config: { variant: 'dancheong', weight: 'thin' } },
    { type: 'footer', slots: ['email', 'phone', 'website', 'address'] },
  ],
};
