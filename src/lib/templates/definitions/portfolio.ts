import type { TemplateCatalogEntry } from '../types';

export const portfolio: TemplateCatalogEntry = {
  id: 'portfolio',
  name: '포트폴리오',
  description: '프로젝트 그리드 · 썸네일 · 설명. A4 가로 또는 세로',
  category: 'personal',
  pageSpec: 'a4Landscape',
  slots: [
    { id: 'name', type: 'text', required: true, label: '이름' },
    { id: 'title', type: 'text', required: true, label: '직함/역할' },
    { id: 'bio', type: 'textarea', required: false, label: '소개' },
    { id: 'projects', type: 'list', required: true, label: '프로젝트', placeholder: 'JSON: {"title":"...","description":"...","image":"..."}' },
    { id: 'skills', type: 'textarea', required: false, label: '스킬' },
    { id: 'contact', type: 'text', required: false, label: '연락처' },
  ],
  contentOutline: [
    { type: 'hero', slots: ['name', 'title'] },
    { type: 'text', slots: ['bio'] },
    { type: 'grid', slots: ['projects'] },
    { type: 'text', slots: ['skills'] },
    { type: 'footer', slots: ['contact'] },
  ],
  promptSeeds: [
    '브랜드 디자이너 이상윤의 포트폴리오입니다. 대표 작업 4개, 역할, 과정, 성과, 연락처를 전시 도록처럼 구성해 주세요.',
    '건축 사진가 포트폴리오입니다. 작업 철학, 프로젝트 목록, 클라이언트, 전시 이력, 문의 정보를 고급스럽게 정리해 주세요.',
  ],
  factChecklist: ['작업자 소개', '대표 작업', '역할·성과', '연락처'],
  specimen: {
    title: '스튜디오결 포트폴리오',
    alt: '스튜디오결 포트폴리오 완성 예시',
    prompt: "브랜딩 스튜디오 '결'의 포트폴리오 한 장을 만들어줘. 대표 작업 6개를 그리드로 보여주고, 스튜디오 소개와 연락처를 담아.",
  },
};
