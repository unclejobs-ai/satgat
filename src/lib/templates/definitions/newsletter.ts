import type { SatgatTemplate } from '../types';

export const newsletter: SatgatTemplate = {
  id: 'newsletter',
  name: '뉴스레터',
  description: '업데이트 · 프로모션 · 큐레이션. 이메일 폭 또는 A4',
  format: 'a4',
  slots: [
    { id: 'issue_title', type: 'text', required: true, label: '제목' },
    { id: 'issue_date', type: 'text', required: false, label: '발행일' },
    { id: 'greeting', type: 'textarea', required: false, label: '인사말' },
    { id: 'articles', type: 'list', required: true, label: '아티클 목록', placeholder: 'JSON: {"title":"...","summary":"..."}' },
    { id: 'issue_chart', type: 'visual', required: false, label: '호별 요약 차트', placeholder: 'donut, bar, timeline' },
    { id: 'promotion', type: 'textarea', required: false, label: '프로모션' },
    { id: 'cta', type: 'text', required: false, label: 'CTA 문구' },
    { id: 'unsubscribe', type: 'text', required: false, label: '구독 해지 안내' },
  ],
  sections: [
    { type: 'hero', slots: ['issue_title', 'issue_date'] },
    { type: 'text', slots: ['greeting'] },
    { type: 'grid', slots: ['articles'] },
    { type: 'visual', slots: ['issue_chart'] },
    { type: 'text', slots: ['promotion'] },
    { type: 'divider', slots: [], config: { variant: 'dancheong', weight: 'thin' } },
    { type: 'text', slots: ['cta'] },
    { type: 'footer', slots: ['unsubscribe'] },
  ],
};
