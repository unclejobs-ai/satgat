import type { SatgatTemplate } from '../types';

export const proposal: SatgatTemplate = {
  id: 'proposal',
  name: '제안서',
  description: '사업의 길. A4 5-10장 · 메트릭 카드 · 단청 강조',
  format: 'a4',
  slots: [
    { id: 'title', type: 'text', required: true, label: '제목', placeholder: '한국형 PDP AI 생성 도입안' },
    { id: 'subtitle', type: 'text', required: false, label: '부제' },
    { id: 'client', type: 'text', required: false, label: '제출처' },
    { id: 'date', type: 'text', required: false, label: '제출일' },
    { id: 'problem', type: 'textarea', required: true, label: '문제', placeholder: '현재 무엇이 어려운가' },
    { id: 'solution', type: 'textarea', required: true, label: '해결안', placeholder: '우리가 제안하는 방식' },
    { id: 'metrics', type: 'list', required: false, label: '핵심 지표', placeholder: 'JSON: {"label":"전환율","value":"+18%"}' },
    { id: 'impact_chart', type: 'visual', required: false, label: '효과 차트/도표', placeholder: 'waterfall, timeline, flow, architecture' },
    { id: 'timeline', type: 'textarea', required: false, label: '추진 일정' },
    { id: 'cost', type: 'textarea', required: false, label: '비용·조건' },
    { id: 'team', type: 'list', required: false, label: '담당' },
  ],
  sections: [
    { type: 'hero', slots: ['title', 'subtitle'] },
    { type: 'text', slots: ['client', 'date'] },
    { type: 'divider', slots: [], config: { variant: 'dancheong', weight: 'medium' } },
    { type: 'text', slots: ['problem'] },
    { type: 'text', slots: ['solution'] },
    { type: 'grid', slots: ['metrics'] },
    { type: 'visual', slots: ['impact_chart'] },
    { type: 'text', slots: ['timeline'] },
    { type: 'text', slots: ['cost'] },
    { type: 'grid', slots: ['team'] },
  ],
};
