import type { SatgatTemplate, TemplateSlot } from '@/lib/templates/types';
import type { BrandProfile } from '@/lib/design-system/brand-resolver';

/**
 * 삿갓 AI 프롬프트 빌더
 * 템플릿 정의 + 브랜드 프로필 + 사용자 요청 → AI system prompt
 */

function slotShapeHint(slot: TemplateSlot): string {
  switch (slot.type) {
    case 'list':
      return '배열. 각 항목은 {"title":"...","description":"..."} 형태의 객체';
    case 'image':
      return '이미지 URL 문자열 또는 {"url":"...","alt":"..."} 객체. 확실한 이미지 URL이 없으면 빈 값';
    case 'image-list':
      return '이미지 객체 배열. 각 항목은 {"url":"...","alt":"..."} 형태';
    case 'table':
      return '표 객체. {"headers":["항목","내용"],"rows":[["...","..."]]} 형태';
    case 'textarea':
    case 'markdown':
      return '문단 문자열. 줄바꿈이 필요하면 \\n 사용';
    case 'text':
    default:
      return '짧은 문자열';
  }
}

function sampleValueForSlot(slot: TemplateSlot): unknown {
  if (!slot.required) {
    switch (slot.type) {
      case 'list':
      case 'image-list':
        return [];
      case 'table':
        return { headers: [], rows: [] };
      case 'image':
      case 'textarea':
      case 'markdown':
      case 'text':
      default:
        return '';
    }
  }

  switch (slot.type) {
    case 'list':
      return [{ title: `${slot.label} 1`, description: '핵심 내용을 구체적으로 작성' }];
    case 'image':
      return '';
    case 'image-list':
      return [{ url: '', alt: slot.label }];
    case 'table':
      return { headers: ['항목', '내용'], rows: [['예시', '구체적인 값']] };
    case 'textarea':
    case 'markdown':
      return `${slot.label} 내용을 2-4문장으로 작성`;
    case 'text':
    default:
      return `${slot.label}`;
  }
}

function buildOutputSkeleton(template: SatgatTemplate): Record<string, unknown> {
  return Object.fromEntries(template.slots.map((slot) => [slot.id, sampleValueForSlot(slot)]));
}

export function buildGenerationPrompt(
  template: SatgatTemplate,
  userPrompt: string,
  brandProfile?: BrandProfile | null
): string {
  const slotDescriptions = template.slots
    .map((slot) => {
      const requiredMark = slot.required ? '(필수)' : '(선택)';
      const placeholder = slot.placeholder ? ` — 예: ${slot.placeholder}` : '';
      return `- ${slot.id} [${slot.type}] ${requiredMark}: ${slot.label}. 형식: ${slotShapeHint(slot)}${placeholder}`;
    })
    .join('\n');

  const brandSection = brandProfile
    ? `
[브랜드 프로필]
- 이름: ${brandProfile.name || '미지정'}
- 역할: ${brandProfile.role || '미지정'}
- 톤: ${brandProfile.tone || '미지정'}
- 브랜드 컬러: ${brandProfile.brandColor || '미지정'}
- 웹사이트: ${brandProfile.website || '미지정'}
${brandProfile.body ? `- 참고: ${brandProfile.body.slice(0, 200)}` : ''}
`
    : '';

  return `당신은 삿갓(Satgat) 문서 생성 엔진입니다.
한국 전통 미학(한지, 먹색, 명조)을 현대적으로 재해석한 문서 디자인 시스템을 사용합니다.

[템플릿 정보]
- 템플릿: ${template.name}
- 형식: ${template.format}
- 설명: ${template.description}

[필요한 데이터]
아래 slot들을 JSON 형태로 생성하세요. 각 slot의 type과 설명을 참고하세요.

slots:
${slotDescriptions}

${brandSection}
[사용자 요청]
${userPrompt}

[출력 형식]
반드시 아래 JSON 형태로만 출력하세요. 추가 설명(markdown 코드블록 포함) 금지.
모든 값은 한국어로 작성하세요.
필수 slot은 반드시 채우고, 선택 slot도 사용자 요청에서 추론 가능한 내용이면 채우세요.
근거 없는 선택 slot은 빈 문자열, 빈 배열, 또는 빈 표로 두세요. 라벨명을 값으로 반복하지 마세요.
list와 table은 문자열이 아니라 지정된 배열/객체 구조로 작성하세요.
이미지 URL을 확실히 알 수 없는 image slot은 빈 문자열로 두세요. 설명문을 이미지 값으로 넣지 마세요.

${JSON.stringify(buildOutputSkeleton(template), null, 2)}
`;
}
