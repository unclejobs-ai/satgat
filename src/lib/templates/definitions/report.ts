import type { SatgatTemplate } from '../types';

export const report: SatgatTemplate = {
  id: 'report',
  name: '보고서',
  description: '일의 기록. A4 · 개요·추진·성과·계획 · 단청 강조',
  format: 'a4',
  slots: [
    { id: 'title', type: 'text', required: true, label: '보고 제목', placeholder: '2026년 1분기 운영 보고' },
    { id: 'report_no', type: 'text', required: false, label: '문서번호', placeholder: 'RPT-2026-001' },
    { id: 'date', type: 'text', required: false, label: '작성일', placeholder: '2026년 4월 1일' },
    { id: 'author', type: 'text', required: false, label: '작성자·부서', placeholder: '김도윤 · 사업기획팀' },
    { id: 'period', type: 'text', required: false, label: '보고 기간', placeholder: '2026년 1월 — 3월' },
    { id: 'summary', type: 'textarea', required: true, label: '개요·요약', placeholder: '이번 분기의 주요 성과와 현황을 요약합니다' },
    { id: 'background', type: 'textarea', required: false, label: '배경·목적', placeholder: '보고의 배경과 목적을 기술합니다' },
    { id: 'progress', type: 'list', required: true, label: '추진 내용', placeholder: 'JSON: {"title":"항목명","description":"세부 내용"}' },
    { id: 'results', type: 'table', required: false, label: '성과·지표', placeholder: '{"headers":["지표","목표","실적"],"rows":[["전환율","15%","18%"]]}' },
    { id: 'issues', type: 'textarea', required: false, label: '이슈·리스크', placeholder: '현재 이슈 및 리스크 사항' },
    { id: 'plan', type: 'textarea', required: false, label: '향후 계획', placeholder: '다음 분기 추진 계획' },
    { id: 'closing', type: 'textarea', required: false, label: '맺음말', placeholder: '보고를 마치며 드리는 말씀' },
  ],
  sections: [
    { type: 'hero', slots: ['title'] },
    { type: 'text', slots: ['report_no', 'date', 'author', 'period'] },
    { type: 'divider', slots: [], config: { variant: 'dancheong', weight: 'medium' } },
    { type: 'text', slots: ['summary'] },
    { type: 'text', slots: ['background'] },
    { type: 'grid', slots: ['progress'] },
    { type: 'table', slots: ['results'] },
    { type: 'text', slots: ['issues'] },
    { type: 'text', slots: ['plan'] },
    { type: 'footer', slots: ['closing'] },
  ],
};
