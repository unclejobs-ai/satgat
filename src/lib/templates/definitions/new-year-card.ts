import type { SatgatTemplate } from '../types';

export const newYearCard: SatgatTemplate = {
  id: 'new-year-card',
  name: '연하장',
  description: '한 해의 인사. 엽서 · 가족 명단',
  format: 'a4',
  slots: [
    { id: 'occasion', type: 'text', required: true, label: '계기', placeholder: '신년 / 추석 / 설날' },
    { id: 'year_hanja', type: 'text', required: false, label: '한자 연도', placeholder: '丙午年 / 새해' },
    { id: 'greeting', type: 'text', required: true, label: '인사말', placeholder: '謹賀新年 · 새해 복 많이 받으세요' },
    { id: 'message', type: 'textarea', required: true, label: '메시지', placeholder: '한 해를 돌아보고 보내는 마음' },
    { id: 'sender_family', type: 'textarea', required: true, label: '보내는 사람', placeholder: '박상세 · 김한지 · 박단청 드림' },
    { id: 'recipient', type: 'text', required: false, label: '받는 사람' },
  ],
  sections: [
    { type: 'hero', slots: ['greeting', 'year_hanja'] },
    { type: 'divider', slots: [], config: { variant: 'gold', weight: 'thin' } },
    { type: 'text', slots: ['message'] },
    { type: 'footer', slots: ['sender_family', 'recipient'] },
  ],
};
