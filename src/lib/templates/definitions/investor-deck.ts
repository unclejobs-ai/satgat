import type { SatgatTemplate } from '../types';

export const investorDeck: SatgatTemplate = {
  id: 'investor-deck',
  name: '투자 IR Deck',
  description: 'Problem · Solution · TAM · Traction · Team. 16:9 가로',
  format: 'slide-16x9',
  slots: [
    { id: 'company_name', type: 'text', required: true, label: '회사명' },
    { id: 'deck_title', type: 'text', required: true, label: 'Deck 제목', placeholder: 'Series A 투자 제안' },
    { id: 'problem', type: 'textarea', required: true, label: 'Problem' },
    { id: 'solution', type: 'textarea', required: true, label: 'Solution' },
    { id: 'market_size', type: 'text', required: false, label: '시장 규모 (TAM/SAM/SOM)' },
    { id: 'traction', type: 'list', required: false, label: 'Traction / 성과', placeholder: 'JSON: {"metric":"...","value":"..."}' },
    { id: 'business_model', type: 'textarea', required: false, label: '비즈니스 모델' },
    { id: 'team', type: 'list', required: false, label: '팀', placeholder: 'JSON: {"name":"...","role":"...","background":"..."}' },
    { id: 'ask', type: 'text', required: false, label: '투자 유치 규모' },
  ],
  sections: [
    { type: 'hero', slots: ['company_name', 'deck_title'] },
    { type: 'divider', slots: [], config: { variant: 'dancheong', weight: 'medium' } },
    { type: 'text', slots: ['problem'] },
    { type: 'text', slots: ['solution'] },
    { type: 'text', slots: ['market_size'] },
    { type: 'grid', slots: ['traction'] },
    { type: 'text', slots: ['business_model'] },
    { type: 'grid', slots: ['team'] },
    { type: 'text', slots: ['ask'] },
    { type: 'footer', slots: [] },
  ],
};
