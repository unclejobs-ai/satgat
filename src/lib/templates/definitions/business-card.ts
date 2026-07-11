import type { TemplateCatalogEntry } from '../types';

export const businessCard: TemplateCatalogEntry = {
  id: 'business-card',
  name: '명함',
  description: '한 사람의 표지. 90×55mm · A4 8-up 인쇄',
  category: 'personal',
  pageSpec: 'businessCard8Up',
  slots: [
    { id: 'name', type: 'text', required: true, label: '이름' },
    { id: 'title', type: 'text', required: true, label: '직함', placeholder: '대표 / Founder' },
    { id: 'company', type: 'text', required: false, label: '회사명' },
    { id: 'email', type: 'text', required: true, label: '이메일' },
    { id: 'phone', type: 'text', required: false, label: '전화번호' },
    { id: 'website', type: 'text', required: false, label: '웹사이트' },
    { id: 'address', type: 'textarea', required: false, label: '주소' },
  ],
  contentOutline: [
    { type: 'hero', slots: ['name'] },
    { type: 'text', slots: ['title', 'company'] },
    { type: 'divider', slots: [], config: { variant: 'dancheong', weight: 'thin' } },
    { type: 'footer', slots: ['email', 'phone', 'website', 'address'] },
  ],
  promptSeeds: [
    '브랜드명은 달빛서가, 대표는 윤하진입니다. 한옥 북스테이와 큐레이션 서점을 운영합니다. 연락처, 직함, 짧은 표어를 넣어 주세요.',
    '크리에이티브 디렉터 명함입니다. 이름, 이메일, 웹사이트, 인스타그램, 차분한 브랜드 문장을 포함해 주세요.',
  ],
  factChecklist: ['이름·직함', '브랜드 문장', '연락처', '웹·SNS'],
  specimen: {
    title: '박상세 명함',
    alt: '박상세 명함 완성 예시',
    prompt: '삿갓스튜디오 대표 박상세의 명함을 만들어줘. 앞면은 이름과 직함, 뒷면은 브랜드 문장을 단정하게.',
  },
};
