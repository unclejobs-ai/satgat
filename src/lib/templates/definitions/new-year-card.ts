import type { TemplateCatalogEntry } from '../types';

export const newYearCard: TemplateCatalogEntry = {
  id: 'new-year-card',
  name: '연하장',
  description: '한 해의 인사. 엽서 · 가족 명단',
  category: 'occasion',
  pageSpec: 'postcardPortrait',
  slots: [
    { id: 'occasion', type: 'text', required: true, label: '계기', placeholder: '신년 / 추석 / 설날' },
    { id: 'greeting', type: 'text', required: true, label: '인사말', placeholder: '새해 복 많이 받으세요' },
    { id: 'message', type: 'textarea', required: true, label: '메시지', placeholder: '한 해를 돌아보고 보내는 마음' },
    { id: 'sender_family', type: 'textarea', required: true, label: '보내는 사람', placeholder: '박상세 · 김한지 · 박단청 드림' },
    { id: 'recipient', type: 'text', required: false, label: '받는 사람' },
  ],
  contentOutline: [
    { type: 'hero', slots: ['occasion', 'greeting'] },
    { type: 'divider', slots: [], config: { variant: 'gold', weight: 'thin' } },
    { type: 'text', slots: ['message'] },
    { type: 'footer', slots: ['sender_family', 'recipient'] },
  ],
  promptSeeds: [
    '고객사에 보낼 2027년 신년 인사입니다. 지난 협업에 대한 감사와 새해의 평안을 담되 지나치게 영업적으로 보이지 않게 해 주세요.',
    '가족 어른께 드리는 연하장입니다. 건강, 평안, 오래 뵙고 싶은 마음을 따뜻하지만 격식 있게 적어 주세요.',
  ],
  factChecklist: ['받는 대상', '새해 연도', '감사 맥락', '인사 톤'],
  specimen: {
    title: '박상세 가족 연하장',
    alt: '박상세 가족 연하장 완성 예시',
    prompt: '신년 연하장 — 박상세 가족, 단정한 톤으로. 병오년 새해 인사를 한글 중심으로 따뜻하게.',
  },
};
