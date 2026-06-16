"use client";

import React from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { SatgatVisual } from "@/components/diagrams";
import type { SatgatVisualSlot } from "@/lib/engine/slot-visual";
import { listTemplates, getTemplate, TEMPLATE_SEAL, TEMPLATE_VOICE } from "@/lib/templates/registry";

const PROMPT_MIN_LENGTH = 10;
const PROMPT_MAX_LENGTH = 8000;
const HERO_SPECIMENS = ['resume', 'brand-onepager', 'investor-deck'];
const VISUAL_SCENE_SAMPLES: Array<{
  label: string;
  copy: string;
  template: string;
  visual: SatgatVisualSlot;
}> = [
  {
    label: "제안서 장면",
    copy: "도입 효과를 폭포 차트로 한 장 안에 놓습니다.",
    template: "proposal",
    visual: {
      kind: "waterfall",
      title: "제작 시간 변화",
      data: [
        { label: "기존", value: 100 },
        { label: "기획", value: -18 },
        { label: "작성", value: -42 },
        { label: "검수", value: -12 },
        { label: "효과", value: 20 },
      ],
    },
  },
  {
    label: "IR 장면",
    copy: "traction을 선 차트로 슬라이드 위계에 맞춥니다.",
    template: "investor-deck",
    visual: {
      kind: "line",
      title: "월 생성 문서",
      data: [
        { label: "1월", value: 120 },
        { label: "2월", value: 210 },
        { label: "3월", value: 360 },
        { label: "4월", value: 520 },
      ],
    },
  },
  {
    label: "회사소개 장면",
    copy: "연혁과 운영 흐름을 타임라인으로 정리합니다.",
    template: "company-profile",
    visual: {
      kind: "timeline",
      title: "도입 연혁",
      data: [
        { year: "2023", title: "파일럿" },
        { year: "2024", title: "런칭" },
        { year: "2025", title: "확장" },
        { year: "2026", title: "전국" },
      ],
    },
  },
  {
    label: "브랜드 장면",
    copy: "포지셔닝을 사분면으로 단정하게 보여줍니다.",
    template: "brand-onepager",
    visual: {
      kind: "quadrant",
      title: "브랜드 포지션",
      quadrants: {
        tl: "전통",
        tr: "우리",
        bl: "일상",
        br: "선물",
        xLabel: "현대성",
        yLabel: "격식",
      },
    },
  },
  {
    label: "제품소개 장면",
    copy: "특징 비교를 가로 막대 차트로 압축합니다.",
    template: "product-brochure",
    visual: {
      kind: "bar-horizontal",
      title: "특징 비교",
      data: [
        { label: "질감", value: 82 },
        { label: "펼침", value: 64 },
        { label: "내구", value: 94 },
      ],
    },
  },
  {
    label: "뉴스레터 장면",
    copy: "호별 구성비를 도넛 차트로 요약합니다.",
    template: "newsletter",
    visual: {
      kind: "donut",
      title: "호별 구성",
      data: [
        { label: "큐레이션", value: 42 },
        { label: "행사", value: 28 },
        { label: "소식", value: 30 },
      ],
    },
  },
];

const COMPLETE_EXAMPLE_GROUPS = [
  {
    title: "개인 문서",
    examples: [
      { type: "이력서", title: "김수민 이력서", meta: "A4 세로 · 단면", image: "resume-kim-sumin.png", html: "resume-kim-sumin.html" },
      { type: "자기소개서", title: "윤하진 자기소개서", meta: "A4 세로 · 4문항", image: "self-intro-yoon-hajin.png", html: "self-intro-yoon-hajin.html" },
      { type: "명함", title: "박상세 명함", meta: "90x55mm · 앞뒷면", image: "business-card-parksangse.png", html: "business-card-parksangse.html" },
    ],
  },
  {
    title: "브랜드·제품",
    examples: [
      { type: "브랜드 원페이지", title: "백자 브랜드 원페이지", meta: "A4 가로 · 1p", image: "one-pager-baekja.png", html: "one-pager-baekja.html" },
      { type: "제품 소개서", title: "온정 제품 소개서", meta: "A4 세로 · 1p", image: "product-sheet-onjeong.png", html: "product-sheet-onjeong.html" },
      { type: "회사 소개서", title: "달빛식품 회사 소개서", meta: "A4 세로 · 1p", image: "company-profile-dalbit.png", html: "company-profile-dalbit.html" },
      { type: "브랜드 스토리북", title: "술도가 한울 브랜드 스토리북", meta: "A4 세로 · 1p", image: "brand-storybook-sool.png", html: "brand-storybook-sool.html" },
      { type: "포트폴리오", title: "스튜디오결 포트폴리오", meta: "A4 가로 · 1p", image: "portfolio-studio-gyeol.png", html: "portfolio-studio-gyeol.html" },
    ],
  },
  {
    title: "제안·투자",
    examples: [
      { type: "제안서", title: "한지 리테일 전환 제안서", meta: "A4 세로 · 1p", image: "proposal-hanji-retail.png", html: "proposal-hanji-retail.html" },
      { type: "투자 IR 덱", title: "마루AI 투자 IR 덱", meta: "16:9 · 6 slides", image: "investor-deck-maruai.png", html: "investor-deck-maruai.html" },
    ],
  },
  {
    title: "초대·소식",
    examples: [
      { type: "청첩장", title: "지수와 민호 청첩장", meta: "엽서 105x148mm", image: "invitation-jisoo-minho.png", html: "invitation-jisoo-minho.html" },
      { type: "연하장", title: "박상세 가족 연하장", meta: "엽서 105x148mm", image: "newyear-card-park.png", html: "newyear-card-park.html" },
      { type: "뉴스레터", title: "장소리 월간 뉴스레터", meta: "A4 세로 · 1p", image: "newsletter-jangsori.png", html: "newsletter-jangsori.html" },
    ],
  },
];

/* 템플릿별 미니프리뷰 — 실제 문서 결.
 * 각각 A4 비율 thumbnail 안에 들어가는 typography-driven 미니 mock. */
function TemplatePreview({ id }: { id: string }) {
  switch (id) {
    case 'resume':
      return (
        <span className="tp tp-resume">
          <span className="tp-eyebrow">履歷書 · 2026</span>
          <span className="tp-name">김상세 <em>金詳細</em></span>
          <span className="tp-role">프로덕트 디자이너 · 7년차</span>
          <span className="tp-divider" />
          <span className="tp-section">경력(經歷)</span>
          <span className="tp-row"><i>2024 — 現</i><b>카카오 · 시각디자인팀</b></span>
          <span className="tp-row"><i>2020 — 2024</i><b>무신사 · UX 리드</b></span>
          <span className="tp-row"><i>2018 — 2020</i><b>29CM</b></span>
        </span>
      );
    case 'self-intro':
      return (
        <span className="tp tp-self-intro">
          <span className="tp-eyebrow">自己紹介書 · 一</span>
          <span className="tp-name">김상세</span>
          <span className="tp-role">프론트엔드 · 7년차</span>
          <span className="tp-q">一. 지원 동기</span>
          <span className="tp-line" />
          <span className="tp-line short" />
          <span className="tp-line" />
          <span className="tp-q">二. 직무 역량</span>
          <span className="tp-line" />
          <span className="tp-line short" />
        </span>
      );
    case 'business-card':
      return (
        <span className="tp tp-card">
          <span className="tp-card-front">
            <span className="tp-name-cn">朴詳細</span>
            <span className="tp-name">박상세</span>
            <span className="tp-role">대표 · Founder</span>
            <span className="tp-divider" />
            <span className="tp-tiny">satgat.vercel.app</span>
            <span className="tp-tiny">@sangse_pjs · 010-0000-0000</span>
          </span>
        </span>
      );
    case 'brand-onepager':
      return (
        <span className="tp tp-brand-onepager">
          <span className="tp-eyebrow">BRAND PAGE · 品</span>
          <span className="tp-name">향유원</span>
          <span className="tp-role">향으로 쉬는 하루</span>
          <span className="tp-divider" />
          <span className="tp-brand-statement">전통 향과 오늘의 웰니스 루틴을 잇다</span>
          <span className="tp-feature-list">
            <span>침향 스틱</span>
            <span>공간 향 컨설팅</span>
            <span>선물 패키지</span>
          </span>
        </span>
      );
    case 'product-brochure':
      return (
        <span className="tp tp-product-brochure">
          <span className="tp-eyebrow">PRODUCT · 製</span>
          <span className="tp-product-hero" />
          <span className="tp-prop-title">다담 노트</span>
          <span className="tp-role">한지 질감 프리미엄 문구</span>
          <span className="tp-feature-pills">
            <span>180도 펼침</span>
            <span>내지 120g</span>
          </span>
        </span>
      );
    case 'company-profile':
      return (
        <span className="tp tp-company-profile">
          <span className="tp-eyebrow">COMPANY · 社</span>
          <span className="tp-name">북촌랩스</span>
          <span className="tp-role">로컬 문화 공간 운영 SaaS</span>
          <span className="tp-metrics">
            <span><b>12곳</b><i>공간</i></span>
            <span><b>4.8</b><i>만족도</i></span>
            <span><b>24h</b><i>응답</i></span>
          </span>
          <span className="tp-line" />
          <span className="tp-line short" />
        </span>
      );
    case 'investor-deck':
      return (
        <span className="tp tp-investor-deck">
          <span className="tp-deck-frame">
            <span className="tp-eyebrow">INVESTOR DECK</span>
            <span className="tp-deck-title">한지AI<br />Series A</span>
            <span className="tp-deck-bar" />
            <span className="tp-metrics">
              <span><b>10분</b><i>생성</i></span>
              <span><b>14종</b><i>문서</i></span>
              <span><b>20억</b><i>ASK</i></span>
            </span>
          </span>
        </span>
      );
    case 'brand-storybook':
      return (
        <span className="tp tp-brand-storybook">
          <span className="tp-eyebrow">STORYBOOK · 話</span>
          <span className="tp-name">달빛서가</span>
          <span className="tp-story-quote">오래된 한옥의 밤 독서에서 시작한 브랜드</span>
          <span className="tp-story-rows">
            <span><b>一</b><i>탄생</i></span>
            <span><b>二</b><i>고요</i></span>
            <span><b>三</b><i>환대</i></span>
          </span>
        </span>
      );
    case 'invitation':
      return (
        <span className="tp tp-invitation">
          <span className="tp-inv-head">청 첩 장</span>
          <span className="tp-inv-names">
            <em>상세</em><span className="tp-dot">·</span><em>한지</em>
          </span>
          <span className="tp-inv-date">2026년 6월 14일</span>
          <span className="tp-inv-date-cn">丙午年 六月 十四日</span>
          <span className="tp-inv-time">토요일 오후 2시</span>
          <span className="tp-divider thin" />
          <span className="tp-inv-loc">서울 그랜드인터컨티넨탈</span>
        </span>
      );
    case 'new-year-card':
      return (
        <span className="tp tp-newyear">
          <span className="tp-ny-year">丙午年</span>
          <span className="tp-ny-main">謹賀新年</span>
          <span className="tp-ny-msg">
            새해에도 건강과 평안이<br />가득하시기를 빕니다
          </span>
        </span>
      );
    case 'proposal':
      return (
        <span className="tp tp-proposal">
          <span className="tp-eyebrow">PROPOSAL · 2026</span>
          <span className="tp-prop-title">한국형 PDP<br />AI 생성 도입안</span>
          <span className="tp-metrics">
            <span><b>+18%</b><i>전환율</i></span>
            <span><b>10분</b><i>생성</i></span>
            <span><b>14종</b><i>양식</i></span>
          </span>
          <span className="tp-divider thin" />
          <span className="tp-tiny">― 평균 작성 2주 → 10분</span>
          <span className="tp-tiny">― 한국 인쇄 14종 모두 지원</span>
        </span>
      );
    case 'newsletter':
      return (
        <span className="tp tp-newsletter">
          <span className="tp-ns-head">
            <span className="tp-ns-no">第 拾貳 號</span>
            <span className="tp-ns-date">2026.05</span>
          </span>
          <span className="tp-ns-title">한지 위에<br />먹으로 옮긴다</span>
          <span className="tp-line" />
          <span className="tp-line short" />
          <span className="tp-tiny">― 무궁화로 시선 모으기</span>
          <span className="tp-tiny">― 14종 문서 확장</span>
        </span>
      );
    case 'portfolio':
      return (
        <span className="tp tp-portfolio">
          <span className="tp-eyebrow">PORTFOLIO · 作品集</span>
          <span className="tp-name">이상세</span>
          <span className="tp-role">디자이너 · 솜씨를 펼치다</span>
          <span className="tp-grid">
            <span className="tp-work" />
            <span className="tp-work" />
            <span className="tp-work" />
            <span className="tp-work" />
          </span>
        </span>
      );
    case 'report':
      return (
        <span className="tp tp-report">
          <span className="tp-eyebrow">REPORT · 報告書</span>
          <span className="tp-prop-title">2026년 1분기<br />운영 보고</span>
          <span className="tp-divider thin" />
          <span className="tp-line" />
          <span className="tp-line short" />
          <span className="tp-tiny">― 추진 내용 · 성과 지표</span>
          <span className="tp-tiny">― 향후 계획</span>
        </span>
      );
    default:
      return (
        <span className="tp tp-default">
          <span className="tp-line title" />
          <span className="tp-line" />
          <span className="tp-line short" />
        </span>
      );
  }
}

const TEMPLATE_PROMPTS: Record<string, string[]> = {
  resume: [
    "김수민, 1992년생. 서울 기반 프로덕트 디자이너. 최근 3년은 B2B SaaS 온보딩 전환율을 개선했고, 숫자로 보이는 성과와 협업 방식을 강조해 주세요.",
    "이직용 이력서입니다. 커리어 전환 이유, 대표 프로젝트 3개, 사용 도구, 수상 이력, 포트폴리오 링크를 품격 있게 정리해 주세요.",
  ],
  "self-intro": [
    "지원 회사는 한옥 스테이 플랫폼입니다. 저는 고객 경험과 운영 자동화 사이를 잇는 사람이고, 실패를 개선한 사례를 진솔하게 담고 싶습니다.",
    "문항은 성장 과정, 지원 동기, 직무 역량, 입사 후 계획입니다. 과장 없이 단단한 문장으로 자기소개서를 만들어 주세요.",
  ],
  "business-card": [
    "브랜드명은 달빛서가, 대표는 윤하진입니다. 한옥 북스테이와 큐레이션 서점을 운영합니다. 연락처, 직함, 짧은 표어를 넣어 주세요.",
    "크리에이티브 디렉터 명함입니다. 이름, 한자 이름, 이메일, 웹사이트, 인스타그램, 차분한 브랜드 문장을 포함해 주세요.",
  ],
  "brand-onepager": [
    "브랜드명은 향유원입니다. 전통 향과 현대적인 웰니스 루틴을 연결하는 브랜드이며, 핵심 문장, 대표 제품 3개, 포지셔닝 사분면 도표, 웹사이트와 연락처를 담아 주세요.",
    "AI 기반 상세페이지 제작 브랜드입니다. 빠른 제작, 한국형 문장 톤, 검수 프로세스, 경쟁 포지션 도표, 상담 CTA를 한 장짜리 소개서처럼 정리해 주세요.",
  ],
  "product-brochure": [
    "제품명은 다담 노트입니다. 한지 질감의 프리미엄 기록 노트이며, 제품 개요, 주요 특징, 특징 비교 막대 차트, 스펙, 사용 장면, 구매 문의를 담아 주세요.",
    "전통 차 선물 세트 소개서입니다. 구성품, 맛의 특징, 구성비 도넛 차트, 포장 방식, 인증 정보, 기업 선물 문의 문구를 품격 있게 정리해 주세요.",
  ],
  "company-profile": [
    "회사명은 북촌랩스입니다. 로컬 문화 공간의 예약·운영을 돕는 SaaS 회사이며, 비전, 미션, 핵심 가치, 연혁 타임라인 도표, 팀, 연락처를 포함해 주세요.",
    "사회적 기업 온기공방 소개서입니다. 시니어 장인의 수공예품을 유통하며, 설립 배경, 핵심 가치, 주요 성과 추이 차트, 팀, 협업 문의를 정리해 주세요.",
  ],
  "investor-deck": [
    "회사명은 한지AI입니다. 한국형 브랜드 문서를 자동 생성하는 B2B SaaS이고, 문제, 해결안, 시장 규모, 초기 성과 추이 선 차트, 투자 요청을 IR 톤으로 구성해 주세요.",
    "로컬 커머스 SaaS 투자 제안입니다. 소상공인의 상품 페이지 제작 병목을 해결하며, 월 반복 매출 막대 차트, 고객 사례, 팀 강점, 시드 투자 요청을 담아 주세요.",
  ],
  "brand-storybook": [
    "한옥 숙박 브랜드 달빛서가의 스토리북입니다. 탄생 배경, 브랜드 가치, 공간의 장면, 고객에게 남기고 싶은 감정을 서사적으로 정리해 주세요.",
    "로컬 식품 브랜드 고요장의 브랜드 이야기입니다. 발효 장인의 기원, 핵심 가치, 톤앤매너, 주요 연혁을 따뜻하지만 절제된 문장으로 써 주세요.",
  ],
  invitation: [
    "지수와 민호의 결혼식입니다. 2026년 10월 18일 일요일 오후 2시, 서울 정동길 예식장. 부모님 성함과 감사 인사를 단정하게 담아 주세요.",
    "전통 혼례 분위기의 초대장입니다. 두 사람의 시작, 장소 안내, 교통 안내, 짧은 초대 문구를 포함해 주세요.",
  ],
  "new-year-card": [
    "고객사에 보낼 2027년 신년 인사입니다. 지난 협업에 대한 감사와 새해의 평안을 담되 지나치게 영업적으로 보이지 않게 해 주세요.",
    "가족 어른께 드리는 연하장입니다. 건강, 평안, 오래 뵙고 싶은 마음을 따뜻하지만 격식 있게 적어 주세요.",
  ],
  proposal: [
    "한지 리테일 브랜드의 온라인 상세페이지 자동 생성 도입안입니다. 문제, 목표, 일정, 기대 효과 폭포 차트, 예산을 임원 보고용으로 정리해 주세요.",
    "지역 문화재단 제안서입니다. 전시 홍보물을 AI로 자동 제작하는 사업이며, 운영 방식과 검수 체계 흐름도를 설득력 있게 담아 주세요.",
  ],
  newsletter: [
    "달빛서가 5월 뉴스레터입니다. 이번 달 큐레이션, 작가와의 밤, 신규 입고 도서, 호별 구성 도넛 차트, 멤버십 소식을 편지처럼 구성해 주세요.",
    "사내 리더십 뉴스레터입니다. 지난달 성과 막대 차트, 다음 달 집중 과제, 구성원 인터뷰, 짧은 에디터 노트를 포함해 주세요.",
  ],
  portfolio: [
    "브랜드 디자이너 이상윤의 포트폴리오입니다. 대표 작업 4개, 역할, 과정, 성과, 연락처를 전시 도록처럼 구성해 주세요.",
    "건축 사진가 포트폴리오입니다. 작업 철학, 프로젝트 목록, 클라이언트, 전시 이력, 문의 정보를 고급스럽게 정리해 주세요.",
  ],
  report: [
    "2026년 1분기 운영 보고서입니다. 사업 현황, 주요 추진 내용, 성과 지표, 이슈, 향후 계획을 임원 보고 형식으로 정리해 주세요.",
    "프로젝트 완료 보고서입니다. 배경, 추진 과정, 결과물, 문제와 대응, 다음 단계를 명확하고 간결하게 기술해 주세요.",
  ],
};

const TEMPLATE_CHECKLIST: Record<string, string[]> = {
  resume: ["이름과 역할", "최근 경력", "정량 성과", "기술·도구"],
  "self-intro": ["지원 맥락", "문항 구조", "대표 사례", "입사 후 계획"],
  "business-card": ["이름·직함", "브랜드 문장", "연락처", "웹·SNS"],
  "brand-onepager": ["브랜드명", "핵심 문장", "제품·서비스", "포지셔닝 도표", "연락처"],
  "product-brochure": ["제품명", "제품 개요", "주요 특징", "비교 차트", "스펙·문의"],
  "company-profile": ["회사명", "비전·미션", "핵심 가치", "연혁 도표", "팀·연락처"],
  "investor-deck": ["문제", "해결안", "성과 차트", "투자 요청"],
  "brand-storybook": ["탄생 배경", "핵심 가치", "톤앤매너", "주요 장면"],
  invitation: ["두 사람 이름", "날짜·시간", "장소", "초대 문구"],
  "new-year-card": ["받는 대상", "새해 연도", "감사 맥락", "인사 톤"],
  proposal: ["문제 정의", "해결안", "일정·예산", "효과 도표"],
  newsletter: ["발행 주제", "섹션 목록", "요약 차트", "마무리 문장"],
  portfolio: ["작업자 소개", "대표 작업", "역할·성과", "연락처"],
  report: ["보고 제목·기간", "개요·요약", "추진 내용", "성과 지표", "향후 계획"],
};

function getPromptQuality(prompt: string) {
  const trimmed = prompt.trim();
  const length = Array.from(trimmed).length;
  const hasConcreteTime = /(\d{4}|년|월|일|분기|최근|현재|現)/.test(trimmed);
  const hasNumbers = /\d/.test(trimmed);
  const hasContext = /(목표|문제|성과|역할|대상|톤|장소|기관|회사|브랜드|프로젝트)/.test(trimmed);
  const paragraphCount = trimmed ? trimmed.split(/\n{2,}|\.\s+/).filter(Boolean).length : 0;
  const score = Math.min(
    100,
    (length >= 80 ? 36 : Math.round(length * 0.45)) +
      (hasConcreteTime ? 18 : 0) +
      (hasNumbers ? 14 : 0) +
      (hasContext ? 18 : 0) +
      (paragraphCount >= 2 ? 14 : 0),
  );

  if (score >= 82) return { score, label: "먹이 잘 스며드는 원고", tone: "ready" };
  if (score >= 52) return { score, label: "조금 더 사실을 얹으면 좋음", tone: "warm" };
  return { score, label: "아직 여백이 많은 초안", tone: "quiet" };
}

async function readGenerationError(response: Response) {
  const fallback = "한지 위에 옮기지 못했습니다. 다시 시도해 주세요.";

  try {
    const payload = (await response.clone().json()) as { message?: unknown; error?: unknown };
    if (typeof payload.message === "string" && payload.message.trim()) return payload.message;
    if (typeof payload.error === "string" && payload.error.trim()) return payload.error;
  } catch {
    const text = await response.text().catch(() => "");
    if (text.trim()) return text;
  }

  return fallback;
}

function encodePreviewPayload(data: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

type NewDocumentClientProps = {
  lang: string;
  preselectedTemplate: string | null;
};

export default function NewDocumentClient({ lang, preselectedTemplate }: NewDocumentClientProps) {
  const templates = listTemplates();
  const normalizedPreselected = preselectedTemplate && getTemplate(preselectedTemplate) ? preselectedTemplate : null;
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(normalizedPreselected);
  const [prompt, setPrompt] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const promptSectionRef = React.useRef<HTMLElement | null>(null);
  const resultRef = React.useRef<HTMLElement | null>(null);
  const resultLinkRef = React.useRef<HTMLAnchorElement | null>(null);

  const selected = selectedTemplate ? getTemplate(selectedTemplate) : null;
  const voice = selectedTemplate ? TEMPLATE_VOICE[selectedTemplate] : undefined;
  const seal = selectedTemplate ? TEMPLATE_SEAL[selectedTemplate] : undefined;
  const suggestions = selectedTemplate ? TEMPLATE_PROMPTS[selectedTemplate] ?? [] : [];
  const checklist = selectedTemplate ? TEMPLATE_CHECKLIST[selectedTemplate] ?? [] : [];
  const promptQuality = React.useMemo(() => getPromptQuality(prompt), [prompt]);
  const selectedIndex = selectedTemplate ? templates.findIndex((tmpl) => tmpl.id === selectedTemplate) : -1;
  const localeLabel = lang === "ko" ? "한국어" : lang.toUpperCase();
  const promptLength = prompt.trim().length;
  const promptReady = promptLength >= PROMPT_MIN_LENGTH;
  const heroSpecimenIds = selectedTemplate
    ? [selectedTemplate, ...HERO_SPECIMENS.filter((id) => id !== selectedTemplate)].slice(0, 3)
    : HERO_SPECIMENS;

  const appendPrompt = (text: string) => {
    setPrompt((current) => (current.trim() ? `${current.trim()}\n\n${text}` : text));
    setError(null);
  };

  const chooseTemplate = (id: string) => {
    flushSync(() => {
      setSelectedTemplate(id);
      setResult(null);
      setError(null);
    });
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    promptSectionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !promptReady) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplate, prompt }),
      });
      if (!res.ok) throw new Error(await readGenerationError(res));
      const data = await res.json();
      const previewHref = `/${encodeURIComponent(lang)}/preview?data=${encodePreviewPayload(data)}`;
      flushSync(() => setResult(previewHref));
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
      resultLinkRef.current?.focus({ preventScroll: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "한지 위에 옮기지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={`satgat-new ${selected ? "has-selection" : ""}`}>
      {/* Hero */}
      <header className="hero">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span className="hero-line" />
            <span>제 1 장 · 종이를 고르다</span>
          </div>
          <h1 className="hero-title">
            어떤 <em className="latin">종이</em>에<br />
            옮겨 적을까요
          </h1>
          <p className="hero-sub">
            종이를 고르고, 담을 이야기를 풀어 적으면<br />
            삿갓이 한지 위에 옮겨 적습니다.
          </p>
          <div className="hero-register" aria-label="작성 환경">
            <span>{localeLabel}</span>
            <span>{templates.length}종 문서</span>
            <span>차트·도표</span>
            <span>{selected ? `${selected.name} 선택` : "종이 대기"}</span>
          </div>
        </div>

        <aside className="hero-specimen" aria-hidden="true">
          {heroSpecimenIds.map((id, index) => {
            const specimen = getTemplate(id);
            const specimenSeal = TEMPLATE_SEAL[id] ?? { glyph: '紙', variant: 'ink' as const };
            if (!specimen) return null;

            return (
              <span className={`hero-specimen-sheet hero-specimen-${index + 1}`} key={`${id}-${index}`}>
                <span className="hero-specimen-index">0{index + 1}</span>
                <span className="hero-specimen-thumb">
                  <TemplatePreview id={id} />
                  <span className={`hero-specimen-seal v-${specimenSeal.variant}`}>{specimenSeal.glyph}</span>
                </span>
                <span className="hero-specimen-name">{specimen.name}</span>
              </span>
            );
          })}
        </aside>
      </header>

      <section className="visual-step" aria-label="차트와 도표">
        <div className="visual-copy">
          <span className="visual-kicker">VISUAL SLOTS</span>
          <h2>숫자와 구조도 같이 옮겨 적습니다</h2>
        </div>
        <div className="visual-grid">
          {VISUAL_SCENE_SAMPLES.map((item) => (
            <div className="visual-card" key={item.label}>
              <span className="visual-template">{item.template}</span>
              <SatgatVisual visual={item.visual} compact />
              <strong>{item.label}</strong>
              <span>{item.copy}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 1: Prompt */}
      {selected && (
        <section className="step prompt-step" ref={promptSectionRef}>
          <div className="step-head">
            <span className="step-num">壹 · ONE</span>
            <h2 className="step-title">담을 이야기</h2>
            <p className="step-note">
              인물·사실·맥락을 자연어로 풀어 적으면 AI가 슬롯을 채웁니다. 길수록 결이 풍부합니다.
            </p>
          </div>

          <div className="writing-board">
            <div className="writing-main">
              <div className="prompt-tools">
                <div>
                  <p className="tool-label">원고 씨앗</p>
                  <p className="tool-copy">눌러 넣은 뒤 사실만 바꾸면 바로 쓸 수 있습니다.</p>
                </div>
                <div className="prompt-seeds">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => appendPrompt(suggestion)}
                      className="seed-btn"
                    >
                      예시 {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              <label className="prompt-wrap">
                <span className="prompt-label">자연어 원고</span>
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setResult(null);
                    setError(null);
                  }}
                  placeholder={`예: ${selected.name}에 담을 이야기를 자유롭게 적어 주세요.\n인물·시기·기관·강점·맥락 무엇이든.`}
                  rows={10}
                  className="prompt-textarea"
                  maxLength={PROMPT_MAX_LENGTH}
                  aria-describedby="prompt-readiness"
                />
                <span id="prompt-readiness" className={`prompt-hint ${promptReady ? "is-ready" : ""}`}>
                  {promptReady ? "생성 가능" : `${PROMPT_MIN_LENGTH - promptLength}자 더 필요`}
                </span>
                <span className="prompt-counter">
                  {prompt.length.toLocaleString()} / {PROMPT_MAX_LENGTH.toLocaleString()} 자
                </span>
              </label>

              {error && (
                <div className="error-banner" role="alert">
                  <span className="error-mark">!</span>
                  <span className="error-text">{error}</span>
                  <button
                    type="button"
                    className="error-retry"
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    {generating ? "다시 시도 중…" : "다시 시도"}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !promptReady}
                className={`generate-btn ${generating ? 'is-loading' : ''}`}
              >
                <span className="btn-glyph">墨</span>
                <span className="btn-label">
                  {generating ? '한지 위에 옮겨 적는 중...' : '한지에 옮겨 적기'}
                </span>
                <span className="btn-arrow" aria-hidden>→</span>
              </button>
            </div>

            <aside className="brief-panel" aria-label="선택한 문서 요약">
              <div className="brief-top">
                {seal && <span className={`brief-seal v-${seal.variant}`}>{seal.glyph}</span>}
                <div>
                  <p className="brief-kicker">
                    {selectedIndex + 1} / {templates.length}
                  </p>
                  <h3>{selected.name}</h3>
                  {voice && <p>{voice}</p>}
                </div>
              </div>
              <div className={`quality quality-${promptQuality.tone}`}>
                <div className="quality-head">
                  <span>원고 밀도</span>
                  <strong>{promptQuality.score}</strong>
                </div>
                <span className="quality-track">
                  <span style={{ width: `${promptQuality.score}%` }} />
                </span>
                <p>{promptQuality.label}</p>
              </div>
              <div className="brief-checklist">
                <p>넣으면 좋은 사실</p>
                <ul>
                  {checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* Section 2: Template grid */}
      <section className="step template-step">
        <div className="step-head">
          <span className="step-num">{selected ? "貳 · TWO" : "壹 · ONE"}</span>
          <h2 className="step-title">{selected ? "다른 종이 고르기" : "종이 고르기"}</h2>
          {selected && (
            <p className="step-note">
              현재 선택 — <strong>{selected.name}</strong>
              {voice && <span className="voice"> · {voice}</span>}
            </p>
          )}
        </div>

        <div className="paper-grid">
          {templates.map((tmpl) => {
            const seal = TEMPLATE_SEAL[tmpl.id] ?? { glyph: '紙', variant: 'ink' as const };
            const v = TEMPLATE_VOICE[tmpl.id] ?? '';
            const active = selectedTemplate === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => chooseTemplate(tmpl.id)}
                className={`paper-card ${active ? 'is-active' : ''}`}
                aria-pressed={active}
              >
                <span className="paper-thumb" aria-hidden>
                  <TemplatePreview id={tmpl.id} />
                  <span className={`paper-seal v-${seal.variant}`}>{seal.glyph}</span>
                </span>
                <span className="paper-meta">
                  <span className="paper-name">{tmpl.name}</span>
                  <span className="paper-voice">{v}</span>
                  <span className="paper-format">{tmpl.format}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="step example-step" aria-label="완성형 예시">
        <div className="step-head example-head">
          <div>
            <span className="step-num">{selected ? "參 · THREE" : "貳 · TWO"}</span>
            <h2 className="step-title">완성형 예시</h2>
            <p className="step-note">자연어 한 문장이 실제로 어떤 페이지가 되는지 13종 결과물을 세분화해 볼 수 있습니다.</p>
          </div>
          <Link className="example-pack-link" href="/satgat/assets/examples/ko/index.html">예시팩 전체 보기</Link>
        </div>

        <div className="example-groups">
          {COMPLETE_EXAMPLE_GROUPS.map((group) => (
            <section className="example-group" key={group.title} aria-label={group.title}>
              <h3>{group.title}</h3>
              <div className="example-grid">
                {group.examples.map((example) => (
                  <Link className="example-card" href={`/satgat/assets/examples/ko/${example.html}`} key={example.html}>
                    <span className="example-shot">
                      <Image
                        src={`/satgat/assets/examples/ko/${example.image}`}
                        alt={`${example.title} 완성 예시`}
                        fill
                        sizes="(max-width: 520px) 100vw, 220px"
                        className="example-image"
                      />
                    </span>
                    <span className="example-meta">
                      <span className="example-type">{example.type}</span>
                      <strong>{example.title}</strong>
                      <span>{example.meta}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      {/* Result CTA */}
      {result && (
        <section className="step result-step" ref={resultRef} aria-live="polite">
          <div className="result-banner">
            <div>
              <p className="result-label">완성</p>
              <p className="result-text">한지 위에 옮겨 적었습니다.</p>
            </div>
            <Link href={result} className="result-link" ref={resultLinkRef}>
              <span>미리보기</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      )}

      {/* Footer manifesto reminder */}
      <footer className="bottom">
        <p>
          한지(韓紙) 위에 먹(墨)으로 옮겨 적습니다.<br />
          단청(丹靑) 한 점이면 충분합니다.
        </p>
      </footer>

      <style jsx>{`
        .satgat-new {
          max-width: 1120px;
          margin: 0 auto;
          padding: 52px 32px 104px;
          color: var(--near-black, #1C1916);
          font-family: var(--serif, 'Gowun Batang', serif);
          font-feature-settings: 'palt' 1, 'kern' 1;
          word-break: keep-all;
        }
        /* HERO */
        .hero {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(300px, 0.72fr);
          align-items: center;
          gap: clamp(36px, 8vw, 118px);
          min-height: 468px;
          margin-bottom: 80px;
        }
        .hero-copy {
          min-width: 0;
        }
        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--sans);
          font-size: 11.5px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--stone, #6B6862);
          margin-bottom: 28px;
        }
        .hero-line {
          width: 36px;
          height: 1px;
          background: var(--near-black);
          opacity: 0.42;
        }
        .hero-title {
          font-family: var(--serif-display, 'Nanum Myeongjo');
          font-size: clamp(40px, 6.5vw, 72px);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: var(--near-black);
          text-shadow: 0 0 0.3px rgba(28,25,22,0.12), 0 0 0.7px rgba(28,25,22,0.06);
          margin: 0 0 18px;
          max-width: 14ch;
        }
        .hero-title em {
          font-family: var(--serif-latin, 'Cormorant Garamond');
          font-style: italic;
          font-weight: 600;
          color: var(--brand, #9B1B1B);
        }
        .hero-sub {
          font-family: var(--serif);
          font-size: 16px;
          line-height: 1.85;
          color: var(--dark-warm, #3A3833);
          margin: 0;
          max-width: 460px;
        }
        .hero-register {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 28px;
          font-family: var(--sans);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--stone, #6B6862);
        }
        .hero-register span {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          padding: 0 11px;
          border: 1px solid var(--border-soft, #E8E2D0);
          border-radius: 999px;
          background: rgba(255,255,251,0.46);
        }
        .hero-specimen {
          position: relative;
          min-height: 420px;
          isolation: isolate;
        }
        .hero-specimen::before {
          content: "";
          position: absolute;
          inset: 48px 12px 28px 42px;
          border: 1px solid rgba(155, 27, 27, 0.18);
          border-radius: 999px;
          transform: rotate(-8deg);
          opacity: 0.72;
          z-index: -1;
        }
        .hero-specimen::after {
          content: "";
          position: absolute;
          right: 34px;
          bottom: 38px;
          width: 92px;
          height: 92px;
          border: 1px solid rgba(28, 25, 22, 0.12);
          border-radius: 50%;
          box-shadow: inset 0 0 0 10px rgba(255,255,251,0.5);
          opacity: 0.65;
          z-index: -1;
        }
        .hero-specimen-sheet {
          position: absolute;
          display: block;
          width: 216px;
          padding: 14px 14px 12px;
          background:
            linear-gradient(180deg, rgba(255,255,251,0.96), rgba(247,247,242,0.92)),
            var(--ivory);
          border: 1px solid var(--border-soft);
          border-radius: 6px;
          box-shadow: 0 22px 54px rgba(28,25,22,0.12), inset 0 1px 0 rgba(255,255,255,0.65);
          color: var(--near-black);
          transform-origin: 50% 70%;
        }
        .hero-specimen-1 {
          top: 18px;
          right: 64px;
          transform: rotate(4deg);
          z-index: 3;
        }
        .hero-specimen-2 {
          top: 118px;
          left: 8px;
          transform: rotate(-7deg);
          z-index: 2;
        }
        .hero-specimen-3 {
          right: 10px;
          bottom: 6px;
          transform: rotate(8deg);
          z-index: 1;
        }
        .hero-specimen-index {
          display: block;
          margin-bottom: 8px;
          font-family: var(--sans);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: var(--stone);
        }
        .hero-specimen-thumb {
          position: relative;
          display: block;
          aspect-ratio: 210 / 297;
          padding: 18px 13px 15px;
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.46), rgba(232,226,208,0.24)),
            var(--hanji);
          border: 1px solid rgba(28,25,22,0.08);
          border-radius: 3px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.38);
        }
        .hero-specimen-seal {
          position: absolute;
          right: 9px;
          bottom: 9px;
          width: 24px;
          height: 24px;
          border-radius: 3px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--serif-display);
          font-size: 12px;
          font-weight: 800;
          color: var(--parchment);
          box-shadow: inset 0 0 0 1.2px rgba(255,255,255,0.18);
        }
        .hero-specimen-name {
          display: block;
          margin-top: 10px;
          font-family: var(--serif-display);
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -0.012em;
          color: var(--near-black);
        }

        /* STEP */
        .step { margin-bottom: 80px; }
        .step-head {
          margin-bottom: 28px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border, #DDD6C4);
        }
        .step-num {
          display: inline-block;
          font-family: var(--serif-display);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.3em;
          color: var(--brand);
          margin-bottom: 8px;
        }
        .step-title {
          font-family: var(--serif-display);
          font-size: 30px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--near-black);
          margin: 0 0 8px;
        }
        .step-note {
          font-family: var(--serif);
          font-size: 14px;
          line-height: 1.72;
          color: var(--olive, #4D4B46);
          margin: 0;
        }
        .step-note strong { color: var(--near-black); font-weight: 700; }
        .step-note .voice { color: var(--brand); font-style: italic; }

        .visual-step {
          display: grid;
          grid-template-columns: minmax(220px, 0.72fr) minmax(0, 1fr);
          gap: 28px;
          align-items: stretch;
          margin: -28px 0 78px;
          padding: 26px 0;
          border-top: 1px solid var(--border-soft, #E8E2D0);
          border-bottom: 1px solid var(--border-soft, #E8E2D0);
        }
        .visual-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }
        .visual-kicker {
          font-family: var(--sans);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: var(--brand);
          margin-bottom: 8px;
        }
        .visual-copy h2 {
          font-family: var(--serif-display);
          font-size: 24px;
          font-weight: 700;
          line-height: 1.24;
          color: var(--near-black);
          margin: 0;
          word-break: keep-all;
        }
        .visual-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .visual-card {
          min-width: 0;
          min-height: 286px;
          display: flex;
          flex-direction: column;
          padding: 14px;
          background: var(--ivory, #FFFFFB);
          border: 1px solid var(--border-soft, #E8E2D0);
          border-radius: 6px;
        }
        .visual-template {
          align-self: flex-start;
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--stone, #6B6862);
          margin-bottom: 9px;
        }
        .visual-card .satgat-visual {
          flex: 1 1 auto;
          width: 100%;
        }
        .visual-card strong {
          display: block;
          font-family: var(--serif-display);
          font-size: 15px;
          font-weight: 700;
          line-height: 1.25;
          color: var(--near-black);
          margin: 12px 0 3px;
        }
        .visual-card > span {
          font-family: var(--serif);
          font-size: 11.5px;
          line-height: 1.45;
          color: var(--olive, #4D4B46);
          word-break: keep-all;
        }

        /* PAPER GRID */
        .paper-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 18px;
        }
        .paper-card {
          all: unset;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          padding: 16px 16px 14px;
          background: var(--ivory, #FFFFFB);
          border-radius: 8px;
          box-shadow: 0 0 0 1pt var(--border-soft, #E8E2D0), 0 1pt 2pt rgba(28,25,22,0.04);
          transition: box-shadow 0.18s ease, transform 0.18s ease, background-color 0.18s ease;
        }
        .paper-card:hover {
          box-shadow: 0 0 0 1pt var(--brand), 0 8pt 24pt rgba(28,25,22,0.08);
          transform: translateY(-3px);
        }
        .paper-card:focus-visible,
        .seed-btn:focus-visible,
        .generate-btn:focus-visible,
        .result-link:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 3px;
        }
        .paper-card.is-active {
          background: var(--near-black);
          color: var(--parchment);
          box-shadow: 0 0 0 1pt var(--near-black), 0 12pt 28pt rgba(28,25,22,0.18);
          transform: translateY(-3px);
        }
        .paper-thumb {
          position: relative;
          display: block;
          aspect-ratio: 210 / 297;
          background: var(--hanji, #F7F7F2);
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02 0.25' numOctaves='2' seed='5'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.25 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23f)' opacity='0.05'/%3E%3C/svg%3E");
          background-size: auto, 160px 160px;
          border-radius: 3px;
          padding: 22px 16px 18px;
          margin-bottom: 14px;
          overflow: hidden;
          box-shadow: inset 0 0 0 1px rgba(28,25,22,0.06), 0 1px 0 rgba(255,255,255,0.4) inset;
        }
        .paper-card.is-active .paper-thumb {
          background-color: var(--ivory);
        }
        .t-rule {
          display: block;
          background: var(--near-black);
          opacity: 0.22;
          border-radius: 1px;
        }
        .t-title { height: 9px; width: 64%; margin: 8px 0 14px; opacity: 0.62; }
        .t-sub   { height: 2.5px; width: 38%; margin-bottom: 22px; opacity: 0.32; }
        .t-body  { height: 2px; width: 100%; margin-bottom: 6px; opacity: 0.22; }
        .t-body.short { width: 68%; }
        .paper-seal {
          position: absolute;
          right: 12px;
          bottom: 12px;
          width: 26px;
          height: 26px;
          border-radius: 3px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--serif-display);
          font-size: 13px;
          font-weight: 800;
          color: var(--parchment);
          box-shadow: inset 0 0 0 1.2px rgba(255,255,255,0.18);
        }
        .v-ink       { background: var(--near-black); }
        .v-dancheong { background: var(--brand); }
        .v-jade      { background: var(--jade, #2E6B5E); }
        .v-gold      { background: var(--gold, #B8954F); color: var(--near-black); }

        /* 미니프리뷰 — 8 템플릿별 결 */
        .tp {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          color: var(--near-black);
          font-family: var(--serif);
          font-size: 6px;
          line-height: 1.45;
          text-align: left;
          word-break: keep-all;
          overflow: hidden;
        }
        .paper-card.is-active .tp { color: var(--parchment); }
        .tp-eyebrow {
          font-family: var(--sans);
          font-size: 5.5px;
          letter-spacing: 0.18em;
          color: var(--olive);
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 5px;
        }
        .paper-card.is-active .tp-eyebrow { color: rgba(241,236,223,0.55); }
        .tp-name {
          font-family: var(--serif-display);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: -0.018em;
          line-height: 1;
          margin-bottom: 3px;
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .tp-name em {
          font-family: var(--serif-display);
          font-size: 7px;
          font-weight: 400;
          font-style: normal;
          color: var(--olive);
          letter-spacing: 0.04em;
        }
        .paper-card.is-active .tp-name em { color: rgba(241,236,223,0.5); }
        .tp-name-cn {
          font-family: var(--serif-display);
          font-size: 8px;
          font-weight: 400;
          color: var(--olive);
          letter-spacing: 0.06em;
          margin-bottom: 2px;
        }
        .tp-role {
          font-family: var(--serif);
          font-size: 6px;
          font-weight: 700;
          color: var(--dark-warm);
          margin-bottom: 6px;
        }
        .paper-card.is-active .tp-role { color: rgba(241,236,223,0.7); }
        .tp-divider {
          display: block;
          height: 0.5px;
          background: var(--border);
          margin: 4px 0 5px;
        }
        .tp-divider.thin {
          background: var(--brand);
          opacity: 0.6;
          width: 24px;
          margin: 4px auto 5px;
        }
        .tp-section {
          font-family: var(--serif-display);
          font-size: 6.5px;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin: 0 0 3px;
        }
        .tp-row {
          display: flex;
          align-items: baseline;
          gap: 5px;
          font-size: 5.5px;
          margin-bottom: 2px;
        }
        .tp-row i {
          font-family: var(--sans);
          font-style: normal;
          font-weight: 600;
          color: var(--olive);
          letter-spacing: 0.04em;
          font-size: 5px;
          min-width: 36px;
        }
        .tp-row b {
          font-family: var(--serif);
          font-weight: 700;
          color: var(--near-black);
        }
        .paper-card.is-active .tp-row b { color: var(--parchment); }
        .paper-card.is-active .tp-row i { color: rgba(241,236,223,0.5); }
        .tp-q {
          font-family: var(--serif-display);
          font-size: 6.5px;
          font-weight: 800;
          color: var(--brand);
          margin: 5px 0 3px;
        }
        .tp-line {
          display: block;
          height: 1.5px;
          background: currentColor;
          opacity: 0.2;
          border-radius: 1px;
          margin-bottom: 2px;
        }
        .tp-line.short { width: 65%; }
        .tp-tiny {
          font-family: var(--serif);
          font-size: 5.2px;
          color: var(--dark-warm);
          line-height: 1.5;
          margin-bottom: 1px;
        }
        .paper-card.is-active .tp-tiny { color: rgba(241,236,223,0.6); }
        /* card 명함 */
        .tp-card { justify-content: center; align-items: stretch; }
        .tp-card-front {
          display: flex;
          flex-direction: column;
          padding: 12px 8px 8px;
          background: var(--ivory);
          border: 0.5px solid var(--border-soft);
          border-radius: 2px;
          flex: 1;
          box-shadow: 0 1px 2px rgba(28,25,22,0.04);
        }
        .paper-card.is-active .tp-card-front {
          background: rgba(245,242,234,0.08);
          border-color: rgba(245,242,234,0.16);
        }
        /* brand/company 신규 문서 */
        .tp-brand-onepager .tp-brand-statement {
          font-family: var(--serif-display);
          font-size: 8.5px;
          font-weight: 800;
          line-height: 1.35;
          color: var(--near-black);
          margin: 2px 0 7px;
        }
        .paper-card.is-active .tp-brand-onepager .tp-brand-statement { color: var(--parchment); }
        .tp-feature-list {
          display: grid;
          gap: 3px;
          margin-top: auto;
        }
        .tp-feature-list span {
          position: relative;
          padding-left: 8px;
          font-family: var(--serif);
          font-size: 5.4px;
          color: var(--dark-warm);
          line-height: 1.3;
        }
        .tp-feature-list span::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.42em;
          width: 4px;
          height: 1px;
          background: var(--brand);
        }
        .paper-card.is-active .tp-feature-list span { color: rgba(241,236,223,0.64); }
        .tp-product-brochure {
          padding-top: 3px;
        }
        .tp-product-hero {
          display: block;
          height: 30px;
          margin: 3px 0 7px;
          border: 0.5px solid var(--border-soft);
          border-radius: 2px;
          background:
            radial-gradient(circle at 70% 42%, rgba(46,107,94,0.24) 0 12px, transparent 13px),
            linear-gradient(135deg, rgba(184,149,79,0.22), rgba(185,28,92,0.12)),
            var(--ivory);
        }
        .paper-card.is-active .tp-product-hero {
          border-color: rgba(245,242,234,0.18);
          background:
            radial-gradient(circle at 70% 42%, rgba(245,242,234,0.22) 0 12px, transparent 13px),
            linear-gradient(135deg, rgba(245,242,234,0.16), rgba(245,242,234,0.08));
        }
        .tp-feature-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 3px;
          margin-top: auto;
        }
        .tp-feature-pills span {
          border: 0.5px solid var(--border-soft);
          border-radius: 2px;
          padding: 2px 3px;
          font-family: var(--sans);
          font-size: 4.7px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--olive);
        }
        .paper-card.is-active .tp-feature-pills span {
          border-color: rgba(241,236,223,0.2);
          color: rgba(241,236,223,0.62);
        }
        .tp-company-profile .tp-metrics,
        .tp-investor-deck .tp-metrics {
          margin-top: auto;
        }
        .tp-deck-frame {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 74px;
          margin: auto 0;
          padding: 9px 8px;
          border-radius: 2px;
          border: 0.5px solid var(--near-black);
          background: var(--near-black);
          color: var(--parchment);
        }
        .tp-deck-frame .tp-eyebrow,
        .tp-deck-frame .tp-metrics i {
          color: rgba(241,236,223,0.62);
        }
        .tp-deck-frame .tp-metrics b {
          color: var(--gold);
        }
        .tp-deck-title {
          font-family: var(--serif-display);
          font-size: 11px;
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.012em;
          margin: 3px 0 5px;
        }
        .tp-deck-bar {
          display: block;
          width: 30px;
          height: 1.5px;
          background: var(--brand);
          margin-bottom: 4px;
        }
        .paper-card.is-active .tp-deck-frame {
          background: rgba(245,242,234,0.08);
          border-color: rgba(245,242,234,0.18);
        }
        .tp-story-quote {
          display: block;
          margin: 7px 0 8px;
          padding: 7px 0 7px 8px;
          border-left: 1.5px solid var(--gold);
          font-family: var(--serif);
          font-size: 6.2px;
          font-weight: 700;
          line-height: 1.48;
          color: var(--dark-warm);
        }
        .paper-card.is-active .tp-story-quote { color: rgba(241,236,223,0.64); }
        .tp-story-rows {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          margin-top: auto;
        }
        .tp-story-rows span {
          display: grid;
          gap: 1px;
          text-align: center;
          padding-top: 4px;
          border-top: 0.5px solid var(--border-soft);
        }
        .tp-story-rows b {
          font-family: var(--serif-display);
          font-size: 7px;
          color: var(--gold);
        }
        .tp-story-rows i {
          font-family: var(--sans);
          font-style: normal;
          font-size: 4.7px;
          color: var(--olive);
        }
        .paper-card.is-active .tp-story-rows span { border-top-color: rgba(241,236,223,0.18); }
        .paper-card.is-active .tp-story-rows i { color: rgba(241,236,223,0.54); }
        /* invitation 청첩장 */
        .tp-invitation {
          align-items: center;
          text-align: center;
          padding-top: 4px;
        }
        .tp-inv-head {
          font-family: var(--serif-display);
          font-weight: 800;
          font-size: 10px;
          letter-spacing: 0.32em;
          color: var(--brand);
          margin-bottom: 7px;
        }
        .tp-inv-names {
          font-family: var(--serif-display);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .tp-inv-names em { font-style: normal; }
        .tp-dot { color: var(--brand); }
        .tp-inv-date {
          font-family: var(--serif);
          font-size: 6px;
          font-weight: 700;
          margin-top: 4px;
        }
        .tp-inv-date-cn {
          font-family: var(--serif-display);
          font-size: 6px;
          font-weight: 400;
          color: var(--olive);
          letter-spacing: 0.06em;
        }
        .paper-card.is-active .tp-inv-date-cn { color: rgba(241,236,223,0.5); }
        .tp-inv-time {
          font-family: var(--serif);
          font-size: 5.5px;
          color: var(--dark-warm);
          margin-top: 2px;
        }
        .paper-card.is-active .tp-inv-time { color: rgba(241,236,223,0.55); }
        .tp-inv-loc {
          font-family: var(--serif);
          font-size: 5.5px;
          color: var(--dark-warm);
        }
        .paper-card.is-active .tp-inv-loc { color: rgba(241,236,223,0.55); }
        /* new-year-card 연하장 */
        .tp-newyear {
          align-items: center;
          text-align: center;
          justify-content: center;
          padding-top: 8px;
        }
        .tp-ny-year {
          font-family: var(--serif-display);
          font-size: 6.5px;
          letter-spacing: 0.16em;
          color: var(--gold);
          font-weight: 700;
          margin-bottom: 6px;
        }
        .tp-ny-main {
          font-family: var(--serif-display);
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: var(--brand);
          margin-bottom: 8px;
          line-height: 1;
        }
        .tp-ny-msg {
          font-family: var(--serif);
          font-size: 5.5px;
          line-height: 1.55;
          color: var(--dark-warm);
        }
        .paper-card.is-active .tp-ny-msg { color: rgba(241,236,223,0.6); }
        /* proposal 제안서 */
        .tp-prop-title {
          font-family: var(--serif-display);
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: -0.01em;
          line-height: 1.15;
          margin: 1px 0 6px;
        }
        .tp-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          margin: 3px 0 4px;
        }
        .tp-metrics > span {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2px 1px;
          border-left: 0.5px solid var(--hairline);
        }
        .tp-metrics > span:first-child { border-left: none; }
        .tp-metrics b {
          font-family: var(--serif-display);
          font-size: 7.5px;
          font-weight: 800;
          color: var(--brand);
          line-height: 1;
        }
        .tp-metrics i {
          font-family: var(--sans);
          font-style: normal;
          font-size: 4.5px;
          color: var(--olive);
          letter-spacing: 0.08em;
          margin-top: 1px;
        }
        .paper-card.is-active .tp-metrics i { color: rgba(241,236,223,0.5); }
        /* newsletter 뉴스레터 */
        .tp-ns-head {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .tp-ns-no {
          font-family: var(--serif-display);
          font-size: 5.5px;
          letter-spacing: 0.08em;
          color: var(--brand);
          font-weight: 800;
        }
        .tp-ns-date {
          font-family: var(--sans);
          font-size: 5px;
          color: var(--olive);
          letter-spacing: 0.06em;
        }
        .paper-card.is-active .tp-ns-date { color: rgba(241,236,223,0.5); }
        .tp-ns-title {
          font-family: var(--serif-display);
          font-size: 9px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.015em;
          margin-bottom: 5px;
        }
        /* portfolio 포트폴리오 */
        .tp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 3px;
          flex: 1;
          margin-top: 4px;
        }
        .tp-work {
          background: var(--warm-sand);
          border-radius: 1.5px;
          min-height: 18px;
        }
        .tp-work:nth-child(2) { background: var(--jade); opacity: 0.6; }
        .tp-work:nth-child(3) { background: var(--brand); opacity: 0.5; }
        .tp-work:nth-child(4) { background: var(--gold); opacity: 0.65; }
        .paper-card.is-active .tp-work { opacity: 0.42; }

        .paper-meta { display: flex; flex-direction: column; gap: 3px; }
        .paper-name {
          font-family: var(--serif-display);
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.015em;
          color: inherit;
        }
        .paper-voice {
          font-family: var(--serif);
          font-size: 12.5px;
          color: var(--olive);
        }
        .paper-card.is-active .paper-voice { color: rgba(241, 236, 223, 0.7); }
        .paper-format {
          font-family: var(--sans);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--stone);
          margin-top: 4px;
        }
        .paper-card.is-active .paper-format { color: rgba(241, 236, 223, 0.5); }

        /* COMPLETE EXAMPLES */
        .example-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
        }
        .example-pack-link {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          min-height: 36px;
          padding: 0 14px;
          border: 1px solid var(--near-black, #1C1916);
          border-radius: 4px;
          color: var(--near-black, #1C1916);
          text-decoration: none;
          font-family: var(--sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .example-groups {
          display: grid;
          gap: 34px;
        }
        .example-group h3 {
          font-family: var(--serif-display);
          font-size: 18px;
          font-weight: 800;
          line-height: 1.2;
          color: var(--near-black, #1C1916);
          margin: 0 0 14px;
        }
        .example-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 16px;
        }
        .example-card {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 11px;
          color: inherit;
          text-decoration: none;
        }
        .example-shot {
          position: relative;
          display: block;
          aspect-ratio: 210 / 297;
          padding: 10px;
          background: #FFFFFB;
          border: 1px solid var(--border-soft, #E8E2D0);
          border-radius: 6px;
          overflow: hidden;
        }
        .example-shot .example-image {
          display: block;
          object-fit: contain;
          object-position: top center;
          background: #F7F7F2;
          padding: 10px;
        }
        .example-card:hover .example-shot {
          border-color: var(--near-black, #1C1916);
        }
        .example-meta {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }
        .example-type {
          display: block;
          font-family: var(--mono);
          font-size: 9px;
          line-height: 1.35;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--stone, #6B6862);
        }
        .example-meta strong {
          display: block;
          font-family: var(--serif-display);
          font-size: 15.5px;
          font-weight: 700;
          line-height: 1.32;
          color: var(--near-black, #1C1916);
          word-break: keep-all;
          overflow-wrap: anywhere;
        }
        .example-meta span:last-child {
          display: block;
          font-family: var(--serif);
          font-size: 11.5px;
          line-height: 1.45;
          color: var(--olive, #4D4B46);
        }

        /* PROMPT */
        .writing-board {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 292px;
          gap: 22px;
          align-items: start;
        }
        .writing-main {
          min-width: 0;
        }
        .prompt-tools {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          padding: 18px 20px;
          margin-bottom: 16px;
          background: rgba(255,255,251,0.72);
          border: 1px solid var(--border-soft, #E8E2D0);
          border-radius: 8px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.58);
        }
        .tool-label {
          font-family: var(--serif-display);
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.012em;
          color: var(--near-black);
          margin: 0 0 4px;
        }
        .tool-copy {
          font-family: var(--serif);
          font-size: 12.5px;
          line-height: 1.55;
          color: var(--olive);
          margin: 0;
        }
        .prompt-seeds {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .seed-btn {
          all: unset;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 34px;
          padding: 0 13px;
          border-radius: 999px;
          background: var(--near-black);
          color: var(--parchment);
          font-family: var(--sans);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          transition: transform 0.18s ease, background 0.18s ease;
        }
        .seed-btn:hover {
          background: var(--brand);
          transform: translateY(-1px);
        }
        .prompt-wrap { position: relative; display: block; }
        .prompt-label {
          position: absolute;
          top: 16px;
          left: 26px;
          z-index: 1;
          font-family: var(--sans);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--brand);
          pointer-events: none;
        }
        .prompt-textarea {
          width: 100%;
          min-height: 330px;
          padding: 48px 26px 44px;
          background: var(--ivory);
          color: var(--near-black);
          border: 1px solid var(--border, #DDD6C4);
          border-radius: 8px;
          font-family: var(--serif);
          font-size: 16px;
          line-height: 1.85;
          letter-spacing: -0.005em;
          resize: vertical;
          box-sizing: border-box;
          word-break: keep-all;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .prompt-textarea::placeholder {
          color: var(--stone);
          font-style: italic;
          line-height: 1.7;
        }
        .prompt-textarea:focus {
          outline: none;
          border-color: var(--near-black);
          box-shadow: 0 0 0 3px rgba(155, 27, 27, 0.08);
        }
        .prompt-counter {
          position: absolute;
          right: 20px;
          bottom: 16px;
          font-family: var(--sans);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--stone);
          pointer-events: none;
        }
        .prompt-hint {
          position: absolute;
          left: 26px;
          bottom: 16px;
          font-family: var(--sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--brand);
          pointer-events: none;
        }
        .prompt-hint.is-ready {
          color: var(--jade, #2E6B5E);
        }
        .brief-panel {
          position: sticky;
          top: 24px;
          padding: 20px;
          background:
            linear-gradient(180deg, rgba(255,255,251,0.9), rgba(247,247,242,0.88)),
            var(--ivory);
          border: 1px solid var(--border-soft, #E8E2D0);
          border-radius: 8px;
          box-shadow: 0 18px 44px rgba(28,25,22,0.08);
        }
        .brief-top {
          display: grid;
          grid-template-columns: 46px 1fr;
          gap: 14px;
          align-items: center;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--border-soft);
        }
        .brief-seal {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          border-radius: 5px;
          font-family: var(--serif-display);
          font-size: 23px;
          font-weight: 800;
          color: var(--parchment);
          box-shadow: inset 0 0 0 1.2px rgba(255,255,255,0.18);
        }
        .brief-kicker {
          font-family: var(--sans);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: var(--brand);
          margin: 0 0 3px;
        }
        .brief-top h3 {
          font-family: var(--serif-display);
          font-size: 21px;
          line-height: 1.16;
          font-weight: 800;
          letter-spacing: -0.018em;
          margin: 0 0 4px;
        }
        .brief-top p:last-child {
          font-size: 12.5px;
          line-height: 1.45;
          color: var(--olive);
          margin: 0;
        }
        .quality {
          padding: 18px 0;
          border-bottom: 1px solid var(--border-soft);
        }
        .quality-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 10px;
        }
        .quality-head span {
          font-family: var(--sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--stone);
        }
        .quality-head strong {
          font-family: var(--serif-display);
          font-size: 24px;
          line-height: 1;
          color: var(--near-black);
        }
        .quality-track {
          display: block;
          height: 6px;
          overflow: hidden;
          background: var(--border-soft);
          border-radius: 999px;
        }
        .quality-track span {
          display: block;
          height: 100%;
          min-width: 7%;
          background: var(--stone);
          border-radius: inherit;
          transition: width 0.22s ease, background 0.22s ease;
        }
        .quality-ready .quality-track span { background: var(--jade); }
        .quality-warm .quality-track span { background: var(--gold); }
        .quality-quiet .quality-track span { background: var(--stone); }
        .quality p {
          font-size: 12.5px;
          line-height: 1.62;
          color: var(--olive);
          margin: 10px 0 0;
        }
        .brief-checklist {
          padding-top: 18px;
        }
        .brief-checklist p {
          font-family: var(--serif-display);
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.012em;
          color: var(--near-black);
          margin: 0 0 10px;
        }
        .brief-checklist ul {
          display: grid;
          gap: 8px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .brief-checklist li {
          position: relative;
          padding-left: 16px;
          font-family: var(--serif);
          font-size: 12.8px;
          line-height: 1.5;
          color: var(--dark-warm);
        }
        .brief-checklist li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.68em;
          width: 6px;
          height: 1px;
          background: var(--brand);
        }

        /* GENERATE BTN */
        .generate-btn {
          all: unset;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
          margin-top: 28px;
          padding: 22px 30px;
          background: var(--near-black);
          color: var(--parchment);
          border-radius: 8px;
          font-family: var(--serif-display);
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.005em;
          text-align: center;
          transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
          box-shadow: 0 0 0 1pt var(--near-black);
        }
        .generate-btn:hover:not(:disabled) {
          background: #0e0c0a;
          transform: translateY(-1px);
          box-shadow: 0 0 0 1pt var(--brand), 0 12pt 28pt rgba(28,25,22,0.2);
        }
        .generate-btn:disabled {
          cursor: not-allowed;
          background: var(--border);
          color: var(--stone);
          box-shadow: 0 0 0 1pt var(--border);
        }
        .generate-btn.is-loading { background: var(--dark-warm, #3A3833); }
        .generate-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .btn-glyph {
          font-family: var(--serif-display);
          font-size: 24px;
          font-weight: 800;
          color: var(--gold);
        }
        .generate-btn:disabled .btn-glyph { color: var(--stone); }
        .btn-label { flex: 1; text-align: left; }
        .btn-arrow {
          font-family: var(--sans);
          font-size: 20px;
          opacity: 0.75;
          transition: transform 0.18s ease, opacity 0.18s ease;
        }
        .generate-btn:hover:not(:disabled) .btn-arrow {
          transform: translateX(4px);
          opacity: 1;
        }

        /* ERROR */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 22px;
          padding: 14px 18px;
          background: #F4ECE9;
          border: 1px solid var(--brand);
          border-radius: 8px;
          color: var(--brand);
          font-family: var(--serif);
          font-size: 14px;
          line-height: 1.6;
        }
        .error-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--brand);
          color: var(--parchment);
          font-family: var(--serif-display);
          font-weight: 800;
          font-size: 14px;
          flex-shrink: 0;
        }
        .error-text {
          flex: 1;
          min-width: 0;
        }
        .error-retry {
          flex-shrink: 0;
          cursor: pointer;
          font-family: var(--sans);
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--parchment);
          background: var(--brand);
          border: 1px solid var(--brand);
          border-radius: 4px;
          padding: 7px 14px;
          white-space: nowrap;
          transition: opacity 0.18s ease;
        }
        .error-retry:hover {
          opacity: 0.88;
        }
        .error-retry:disabled {
          opacity: 0.5;
          cursor: default;
        }
        .error-retry:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        /* RESULT */
        .result-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 24px 28px;
          background: var(--near-black);
          color: var(--parchment);
          border-radius: 8px;
          box-shadow: 0 12pt 28pt rgba(28,25,22,0.16);
          flex-wrap: wrap;
        }
        .result-label {
          font-family: var(--sans);
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--gold);
          margin: 0 0 4px;
        }
        .result-text {
          font-family: var(--serif-display);
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.015em;
          margin: 0;
        }
        .result-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 22px;
          background: var(--brand);
          color: var(--parchment);
          border-radius: 6px;
          font-family: var(--serif-display);
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.18s ease, transform 0.18s ease;
        }
        .result-link:hover {
          background: #B53030;
          transform: translateX(2px);
        }

        /* BOTTOM */
        .bottom {
          margin-top: 80px;
          padding-top: 32px;
          border-top: 1px solid var(--border);
          text-align: center;
        }
        .bottom p {
          font-family: var(--serif);
          font-size: 13.5px;
          line-height: 1.85;
          color: var(--olive);
          letter-spacing: -0.003em;
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 940px) {
          .hero {
            grid-template-columns: 1fr;
            min-height: 0;
            gap: 34px;
          }
          .hero-specimen {
            min-height: 310px;
            max-width: 520px;
          }
          .hero-specimen-sheet {
            width: 164px;
          }
          .hero-specimen-1 {
            top: 0;
            right: 18px;
          }
          .hero-specimen-2 {
            top: 72px;
            left: 0;
          }
          .hero-specimen-3 {
            right: 120px;
            bottom: 0;
          }
          .visual-step {
            grid-template-columns: 1fr;
          }
          .visual-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 720px) {
          .satgat-new { padding: 32px 20px 80px; }
          .hero { margin-bottom: 56px; }
          .hero-specimen { display: none; }
          .visual-step {
            margin: -22px 0 56px;
          }
          .step { margin-bottom: 56px; }
          .step-title { font-size: 24px; }
          .hero-register { margin-top: 22px; }
          .paper-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .writing-board {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .brief-panel {
            position: static;
            order: 0;
          }
          .prompt-tools {
            align-items: flex-start;
            flex-direction: column;
          }
          .prompt-seeds {
            justify-content: flex-start;
          }
          .prompt-textarea {
            min-height: 300px;
          }
          .example-head {
            align-items: flex-start;
            flex-direction: column;
          }
          .example-pack-link {
            width: 100%;
            justify-content: center;
          }
        }
        @media (max-width: 520px) {
          .visual-grid { grid-template-columns: 1fr; }
          .paper-grid { grid-template-columns: 1fr; }
          .paper-card {
            display: grid;
            grid-template-columns: 78px minmax(0, 1fr);
            align-items: center;
            gap: 14px;
            padding: 12px 14px;
          }
          .paper-thumb {
            width: 78px;
            aspect-ratio: 3 / 4;
            margin-bottom: 0;
            padding: 12px 9px 10px;
          }
          .paper-seal {
            right: 6px;
            bottom: 6px;
            width: 22px;
            height: 22px;
            font-size: 11px;
          }
          .paper-meta {
            min-width: 0;
          }
          .paper-name {
            font-size: 17px;
          }
          .paper-voice {
            font-size: 13px;
            line-height: 1.45;
          }
          :global(.satgat-new .tp) {
            justify-content: flex-start;
          }
          :global(.satgat-new .tp > *) {
            display: none !important;
          }
          :global(.satgat-new .tp::before),
          :global(.satgat-new .tp::after) {
            content: "";
            display: block;
            border-radius: 1px;
            background: currentColor;
            opacity: 0.2;
          }
          :global(.satgat-new .tp::before) {
            width: 62%;
            height: 6px;
            margin: 2px 0 13px;
          }
          :global(.satgat-new .tp::after) {
            width: 100%;
            height: 34px;
            background:
              linear-gradient(currentColor, currentColor) 0 0 / 100% 2px no-repeat,
              linear-gradient(currentColor, currentColor) 0 8px / 82% 2px no-repeat,
              linear-gradient(currentColor, currentColor) 0 16px / 95% 2px no-repeat,
              linear-gradient(currentColor, currentColor) 0 24px / 68% 2px no-repeat;
          }
          .hero-title {
            font-size: 40px;
          }
          .generate-btn {
            padding: 18px 18px;
            gap: 10px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}
