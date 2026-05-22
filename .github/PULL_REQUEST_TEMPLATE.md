# 풀 리퀘스트

## 무엇을 바꿨나요

(한 줄로)

## 왜

(맥락·이유)

## 규(規) 점검

- [ ] 페이지 본바탕이 한지(`#F1ECDF`)인지 확인. 순백 #FFF 미사용.
- [ ] 단청(`#9B1B1B`) 사용 면적 5% 이내.
- [ ] 합성 볼드 없음 (실제 weight 400/700/800만).
- [ ] 모든 회색이 따뜻한 황갈 계열 (cool blue-gray 0건).
- [ ] 태그·배지 solid hex만 (rgba 0건).
- [ ] 하드 드롭 그림자 없음 (ring 또는 whisper만).
- [ ] 영문/중문 직역체 카피 0건 (한국 단정문).
- [ ] OFL 무료 폰트만 의존 (TsangerJinKai · Charter 0건).

## 스크린샷

(시각 변경 시 첨부)

## 영향

- [ ] `/ko` specimen 페이지
- [ ] `/ko/new` 생성 페이지
- [ ] `/ko/preview` 미리보기
- [ ] AI 생성 (`/api/generate`)
- [ ] 디자인 토큰 (한지·먹·단청·취색·금박)
- [ ] 8 한국 문서 템플릿
- [ ] 기타: ___

## 체크리스트

- [ ] `npm run build` PASS
- [ ] `npx tsc --noEmit` 0 errors
- [ ] 인쇄 미리보기 검증 (브라우저 print preview)
