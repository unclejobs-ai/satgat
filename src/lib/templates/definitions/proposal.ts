import type { TemplateCatalogEntry } from '../types';

export const proposal: TemplateCatalogEntry = {
  id: 'proposal',
  name: '제안서',
  description: '사업의 길. A4 5-10장 · 메트릭 카드 · 단청 강조',
  category: 'business',
  pageSpec: 'a4Portrait',
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
  contentOutline: [
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
  promptSeeds: [
    '한지 리테일 브랜드의 온라인 상세페이지 자동 생성 도입안입니다. 문제, 목표, 일정, 기대 효과 폭포 차트, 예산을 임원 보고용으로 정리해 주세요.',
    '지역 문화재단 제안서입니다. 전시 홍보물을 AI로 자동 제작하는 사업이며, 운영 방식과 검수 체계 흐름도를 설득력 있게 담아 주세요.',
  ],
  factChecklist: ['문제 정의', '해결안', '일정·예산', '효과 도표'],
  specimen: {
    title: '한지 리테일 전환 제안서',
    alt: '한지 리테일 전환 제안서 완성 예시',
    prompt: '지역 공예 브랜드의 온라인 매출을 높이기 위한 3개월 제안서를 만들어줘. 상세페이지, 뉴스레터, 명절 선물 기획을 하나의 실행안으로 묶어줘.',
  },
};
