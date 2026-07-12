import type { TemplateCatalogEntry } from '../types';

export const selfIntro: TemplateCatalogEntry = {
  id: 'self-intro',
  name: '자기소개서',
  description: '나의 결을 풀어 적다. A4 · 4문항 표준',
  category: 'personal',
  pageSpec: 'a4Portrait',
  slots: [
    { id: 'name', type: 'text', required: true, label: '이름' },
    { id: 'target', type: 'text', required: true, label: '지원처', placeholder: '회사·학교명' },
    { id: 'role', type: 'text', required: false, label: '지원 직무' },
    { id: 'q1_motivation', type: 'textarea', required: true, label: '지원 동기', placeholder: '왜 이곳에 지원하는가' },
    { id: 'q2_competence', type: 'textarea', required: true, label: '직무 역량', placeholder: '내가 가진 강점·경험' },
    { id: 'q3_growth', type: 'textarea', required: true, label: '성장 과정', placeholder: '나를 만든 경험들' },
    { id: 'q4_aspiration', type: 'textarea', required: true, label: '입사 후 포부', placeholder: '5년 뒤 내가 만들 가치' },
  ],
  contentOutline: [
    { type: 'hero', slots: ['name', 'target', 'role'] },
    { type: 'divider', slots: [], config: { variant: 'ink', weight: 'medium' } },
    { type: 'text', slots: ['q1_motivation'] },
    { type: 'text', slots: ['q2_competence'] },
    { type: 'text', slots: ['q3_growth'] },
    { type: 'text', slots: ['q4_aspiration'] },
  ],
  promptSeeds: [
    '지원 회사는 한옥 스테이 플랫폼입니다. 저는 고객 경험과 운영 자동화 사이를 잇는 사람이고, 실패를 개선한 사례를 진솔하게 담고 싶습니다.',
    '문항은 성장 과정, 지원 동기, 직무 역량, 입사 후 계획입니다. 과장 없이 단단한 문장으로 자기소개서를 만들어 주세요.',
  ],
  factChecklist: ['지원 맥락', '문항 구조', '대표 사례', '입사 후 계획'],
  specimen: {
    title: '윤하진 자기소개서',
    alt: '윤하진 자기소개서 완성 예시',
    prompt: 'AI 서비스 기획자 윤하진이 B2B SaaS 회사에 지원하는 자기소개서를 써줘. 과장하지 말고, 고객 인터뷰와 제품 실험을 통해 배운 점이 보이게.',
  },
};
