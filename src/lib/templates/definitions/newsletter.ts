import type { TemplateCatalogEntry } from '../types';

export const newsletter: TemplateCatalogEntry = {
  id: 'newsletter',
  name: '뉴스레터',
  description: '업데이트 · 프로모션 · 큐레이션. 이메일 폭 또는 A4',
  category: 'business',
  pageSpec: 'a4Portrait',
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
  contentOutline: [
    { type: 'hero', slots: ['issue_title', 'issue_date'] },
    { type: 'text', slots: ['greeting'] },
    { type: 'grid', slots: ['articles'] },
    { type: 'visual', slots: ['issue_chart'] },
    { type: 'text', slots: ['promotion'] },
    { type: 'divider', slots: [], config: { variant: 'dancheong', weight: 'thin' } },
    { type: 'text', slots: ['cta'] },
    { type: 'footer', slots: ['unsubscribe'] },
  ],
  promptSeeds: [
    '달빛서가 5월 뉴스레터입니다. 이번 달 큐레이션, 작가와의 밤, 신규 입고 도서, 호별 구성 도넛 차트, 멤버십 소식을 편지처럼 구성해 주세요.',
    '사내 리더십 뉴스레터입니다. 지난달 성과 막대 차트, 다음 달 집중 과제, 구성원 인터뷰, 짧은 에디터 노트를 포함해 주세요.',
  ],
  factChecklist: ['발행 주제', '섹션 목록', '요약 차트', '마무리 문장'],
  specimen: {
    title: '장소리 월간 뉴스레터',
    alt: '장소리 월간 뉴스레터 완성 예시',
    prompt: "동네 책방 '장소리'의 월간 뉴스레터를 만들어줘. 이달의 책 한 권을 중심으로, 짧은 소식 몇 개와 다음 모임 안내를 담아.",
  },
};
