<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# satgat — 한국형 문서 디자인 시스템

자연어 한 문장이면 한국 문서 한 장이 됩니다. 14종 한국 문서. 단청 단일 강조 (≤ 5%/page), 명조 위계, 회녹 백자지 캔버스.

## 디자인 원칙 (skill brief)

전체 룰은 `skills/satgat/SKILL.md`에 있습니다. 코드 수정 시 다음 8조를 따릅니다:

1. Canvas `#F7F7F2`, 순백 금지.
2. 단청 `#9B1B1B` 한 페이지 5% 이내.
3. 보조 액센트 취색/금박 중 하나만.
4. 모든 회색은 회녹빛, cool blue 금지.
5. 제목 명조 600-700, 본문 바탕 400. 위계는 크기.
6. solid hex만 사용. rgba 금지.
7. xl/2xl 여백을 두려워하지 말 것.
8. 합성 볼드 금지. 한자는 본문 옆 괄호 보조만.

## 디렉토리 핵심

- `src/lib/design-system/constraint.ts` — 색·폰트·shadow 토큰
- `src/lib/templates/` — 14종 정의 + registry
- `src/components/templates/` — 14개 React 렌더러
- `src/lib/engine/` — 렌더 + 슬롯 정규화
- `src/lib/generation/` — AI 슬롯 fill
- `scripts/verify-template-catalog.mjs` — 계약 검증 (CI 게이트)
- `scripts/template-preview-fixtures.mjs` — 14종 미리보기 fixture
- `skills/satgat/SKILL.md` — AI agent용 single-file brief
- `references/` — 디자인·글쓰기·이력서·안티패턴 가이드
- `bin/satgat.mjs` — npx CLI (init / skill / dev / build / start)

## 작업 시 체크

- 새 템플릿 추가: 정의(`src/lib/templates/definitions/`) + 렌더러(`src/components/templates/`) + registry + landing card + create page seed + fixture + verify:templates 통과.
- 디자인 변경: constraint.ts 또는 overrides.css. 데모 카드 캡처로 비주얼 회귀 확인.
- 한자 장식 추가 금지. 본문 옆 괄호만 OK.
