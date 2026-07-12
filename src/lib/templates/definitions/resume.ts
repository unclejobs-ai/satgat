import type { TemplateCatalogEntry } from '../types';

export const resume: TemplateCatalogEntry = {
  id: 'resume',
  name: '이력서',
  description: '경력 · 프로젝트 · 스킬. A4 세로 1-2p',
  category: 'personal',
  pageSpec: 'a4Portrait',
  slots: [
    { id: 'name', type: 'text', required: true, label: '이름' },
    { id: 'title', type: 'text', required: true, label: '직함', placeholder: '프로덕트 디자이너 · AI 콘텐츠 생성' },
    { id: 'email', type: 'text', required: false, label: '이메일' },
    { id: 'github', type: 'text', required: false, label: 'GitHub / 포트폴리오' },
    { id: 'summary', type: 'textarea', required: false, label: '자기소개' },
    { id: 'experiences', type: 'list', required: true, label: '경력', placeholder: 'JSON: {"company":"...","role":"...","period":"...","description":"..."}' },
    { id: 'skills', type: 'textarea', required: false, label: '스킬' },
    { id: 'education', type: 'list', required: false, label: '학력', placeholder: 'JSON: {"school":"...","degree":"...","period":"..."}' },
  ],
  contentOutline: [
    { type: 'hero', slots: ['name', 'title'] },
    { type: 'text', slots: ['summary'] },
    { type: 'divider', slots: [], config: { variant: 'ink', weight: 'thin' } },
    { type: 'grid', slots: ['experiences'] },
    { type: 'text', slots: ['skills'] },
    { type: 'grid', slots: ['education'] },
    { type: 'footer', slots: ['email', 'github'] },
  ],
  promptSeeds: [
    '김수민, 1992년생. 서울 기반 프로덕트 디자이너. 최근 3년은 B2B SaaS 온보딩 전환율을 개선했고, 숫자로 보이는 성과와 협업 방식을 강조해 주세요.',
    '이직용 이력서입니다. 커리어 전환 이유, 대표 프로젝트 3개, 사용 도구, 수상 이력, 포트폴리오 링크를 품격 있게 정리해 주세요.',
  ],
  factChecklist: ['이름과 역할', '최근 경력', '정량 성과', '기술·도구'],
  specimen: {
    title: '김수민 이력서',
    alt: '김수민 이력서 완성 예시',
    prompt: '7년차 프론트엔드 개발자 김수민의 이력서를 한국 스타트업 채용 담당자가 빠르게 읽을 수 있게 만들어줘. React, 디자인 시스템, 결제 전환율 개선 경험을 중심으로.',
  },
};
