import type { SatgatTemplate } from '@/lib/templates/types';
import type { BrandProfile } from '@/lib/design-system/brand-resolver';

/**
 * 삿갓 AI 프롬프트 빌더
 * 템플릿 정의 + 브랜드 프로필 + 사용자 요청 → AI system prompt
 */

export function buildGenerationPrompt(
  template: SatgatTemplate,
  userPrompt: string,
  brandProfile?: BrandProfile | null
): string {
  const slotDescriptions = template.slots
    .map((slot) => {
      const requiredMark = slot.required ? '(필수)' : '(선택)';
      const placeholder = slot.placeholder ? ` — 예: ${slot.placeholder}` : '';
      return `- ${slot.id} [${slot.type}] ${requiredMark}: ${slot.label}${placeholder}`;
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

{
${template.slots.map((s) => `  "${s.id}": "..."`).join(',\n')}
}
`;
}
