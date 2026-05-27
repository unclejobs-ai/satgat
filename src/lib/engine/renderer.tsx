'use client';

import React from 'react';
import type { SatgatTemplate, SatgatDocumentData } from '@/lib/templates/types';

// 템플릿별 고유 렌더러 (lazy import로 번들 사이즈 최적화)
const renderers: Record<string, React.ComponentType<{ data: SatgatDocumentData }>> = {
  // 한국 문서 13종
  'resume': React.lazy(() => import('@/components/templates/Resume')),
  'self-intro': React.lazy(() => import('@/components/templates/SelfIntro')),
  'business-card': React.lazy(() => import('@/components/templates/BusinessCard')),
  'brand-onepager': React.lazy(() => import('@/components/templates/BrandOnepager')),
  'product-brochure': React.lazy(() => import('@/components/templates/ProductBrochure')),
  'company-profile': React.lazy(() => import('@/components/templates/CompanyProfile')),
  'investor-deck': React.lazy(() => import('@/components/templates/InvestorDeck')),
  'brand-storybook': React.lazy(() => import('@/components/templates/BrandStorybook')),
  'invitation': React.lazy(() => import('@/components/templates/Invitation')),
  'new-year-card': React.lazy(() => import('@/components/templates/NewYearCard')),
  'proposal': React.lazy(() => import('@/components/templates/Proposal')),
  'newsletter': React.lazy(() => import('@/components/templates/Newsletter')),
  'portfolio': React.lazy(() => import('@/components/templates/Portfolio')),
};

interface SatgatTemplateRendererProps {
  template: SatgatTemplate;
  data: SatgatDocumentData;
}

/**
 * 삿갓 템플릿 렌더러
 * 템플릿 ID에 따라 고유한 렌더러 컴포넌트를 로드.
 *
 * 철학: 각 템플릿은 "문서 장르"다.
 * generic 섹션 조합이 아닌, 장를별 고유한 페이지 구조와 레이아웃을 가진다.
 */
export function SatgatTemplateRenderer({ template, data }: SatgatTemplateRendererProps) {
  const Renderer = renderers[template.id];

  if (!Renderer) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#8A8478' }}>
        <p>템플릿 렌더러를 찾을 수 없습니다: {template.id}</p>
      </div>
    );
  }

  return (
    <React.Suspense
      fallback={
        <div
          style={{
            width: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8A8478',
            fontFamily: "'Gowun Batang', serif",
          }}
        >
          <p>문서를 준비하는 중...</p>
        </div>
      }
    >
      <Renderer data={data} />
    </React.Suspense>
  );
}
