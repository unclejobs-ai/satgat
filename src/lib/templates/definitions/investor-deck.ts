import type { TemplateCatalogEntry } from '../types';

export const investorDeck: TemplateCatalogEntry = {
  id: 'investor-deck',
  name: '투자 IR Deck',
  description: 'Problem · Solution · TAM · Traction · Team. 16:9 가로',
  category: 'business',
  pageSpec: 'slide16x9',
  slots: [
    { id: 'company_name', type: 'text', required: true, label: '회사명' },
    { id: 'deck_title', type: 'text', required: true, label: 'Deck 제목', placeholder: 'Series A 투자 제안' },
    { id: 'problem', type: 'textarea', required: true, label: 'Problem' },
    { id: 'solution', type: 'textarea', required: true, label: 'Solution' },
    { id: 'market_size', type: 'text', required: false, label: '시장 규모 (TAM/SAM/SOM)' },
    { id: 'traction', type: 'list', required: false, label: 'Traction / 성과', placeholder: 'JSON: {"metric":"...","value":"..."}' },
    { id: 'traction_chart', type: 'visual', required: false, label: 'Traction 차트', placeholder: 'bar, line, donut, waterfall' },
    { id: 'business_model', type: 'textarea', required: false, label: '비즈니스 모델' },
    { id: 'team', type: 'list', required: false, label: '팀', placeholder: 'JSON: {"name":"...","role":"...","background":"..."}' },
    { id: 'ask', type: 'text', required: false, label: '투자 유치 규모' },
  ],
  contentOutline: [
    { type: 'hero', slots: ['company_name', 'deck_title'] },
    { type: 'divider', slots: [], config: { variant: 'dancheong', weight: 'medium' } },
    { type: 'text', slots: ['problem'] },
    { type: 'text', slots: ['solution'] },
    { type: 'text', slots: ['market_size'] },
    { type: 'grid', slots: ['traction'] },
    { type: 'visual', slots: ['traction_chart'] },
    { type: 'text', slots: ['business_model'] },
    { type: 'grid', slots: ['team'] },
    { type: 'text', slots: ['ask'] },
    { type: 'footer', slots: [] },
  ],
  promptSeeds: [
    '회사명은 한지AI입니다. 한국형 브랜드 문서를 자동 생성하는 B2B SaaS이고, 문제, 해결안, 시장 규모, 초기 성과 추이 선 차트, 투자 요청을 IR 톤으로 구성해 주세요.',
    '로컬 커머스 SaaS 투자 제안입니다. 소상공인의 상품 페이지 제작 병목을 해결하며, 월 반복 매출 막대 차트, 고객 사례, 팀 강점, 시드 투자 요청을 담아 주세요.',
  ],
  factChecklist: ['문제', '해결안', '성과 차트', '투자 요청'],
  specimen: {
    title: '마루AI 투자 IR 덱',
    alt: '마루AI 투자 IR Deck 완성 예시',
    prompt: '한국 중소기업을 위한 문서 자동화 SaaS 마루AI의 Seed 투자 IR 덱을 만들어줘. 문제, 해결책, 시장, traction, 요청 금액이 한눈에 보이게.',
  },
};
