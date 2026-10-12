# Threads 게시 원고 — 삿갓 리디자인

## 본문

한국 문서를 AI로 만들었는데, 화면은 그럴듯하고 PDF에서 무너진 적 있나요?

삿갓은 이번 리디자인에서 ‘한국풍 UI’보다 문서가 생성되고, 검토되고, 공유되고, 인쇄되는 한 흐름을 먼저 고쳤습니다.

14종 문서가 같은 renderer로 화면과 PDF를 오갑니다. 실제 결과는 아래 이미지에서 확인해보세요. 👇
https://satgat.vercel.app/ko

## 답글 1/4

1/4 먼저, 한국 문서처럼 보이게.

순백 대신 백자지 #F7F7F2, 단청 #9B1B1B은 페이지의 5% 이하, 보조색은 취색·금박 중 하나만 썼습니다. 제목은 명조, 본문은 바탕. 굵기를 남발하지 않고 크기와 여백으로 위계를 만들었습니다.

‘한국풍 장식’을 얹은 게 아니라 문서의 질서를 다시 잡았습니다.

## 답글 2/4

2/4 14종이 모두 같은 시스템에서 움직입니다.

이력서부터 제안서, 투자 IR Deck, 뉴스레터, 명함까지 하나의 React renderer가 화면·미리보기·인쇄·PDF를 함께 만듭니다.

자연어 brief → 검증된 타입 슬롯 → 브라우저 탭의 임시 초안. 확인 뒤 공유 링크나 PDF로 내보냅니다. 예전의 정적 HTML 복제품은 걷어냈습니다.

## 답글 3/4

3/4 숫자는 결과를 숨기지 않게 해줍니다.

• 14종 템플릿
• 30개 렌더링 페이지
• 14개 PNG/PDF
• A4 세로·A4 가로·16:9·명함 8-up·엽서

완성 예시의 바이너리·페이지 수·치수를 검증하고, 실제 브라우저에서는 14개 renderer와 모든 PDF 페이지의 규격을 대조합니다. 보기 좋은 한 장보다 반복해서 같은 결과를 내는지가 기준입니다.

## 답글 4/4

4/4 삿갓이 만들고 싶은 건 ‘한국풍 템플릿 모음’이 아닙니다.

짧은 자연어 brief로 시작한 내용이 한국 문서의 위계와 규격을 지킨 채 검토·공유·PDF까지 이어지는 작업 흐름입니다.

그래서 랜딩, 생성, 미리보기, 출력, README와 아키텍처, 삿갓 스킬도 따로 놀지 않게 현재 구조에 맞췄습니다.

여러분이 가장 먼저 맡기고 싶은 한국 문서는 무엇인가요?

GitHub: https://github.com/unclejobs-ai/satgat

## 첨부 이미지 순서

1. `.captures/threads-satgat-redesign/01-landing-hero.png`
2. `.captures/threads-satgat-redesign/02-create-flow.jpg`
3. `.captures/threads-satgat-redesign/03-runtime-preview.png`
4. `.captures/threads-satgat-redesign/04-resume-specimen.png`
