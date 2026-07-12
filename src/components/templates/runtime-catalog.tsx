'use client';

import React from 'react';
import { isTemplateId } from '@/lib/templates/registry';
import { TEMPLATE_IDS } from '@/lib/templates/types';
import type {
  SatgatDocumentData,
  TemplateId,
} from '@/lib/templates/types';

export type RuntimeRenderer = React.LazyExoticComponent<
  React.ComponentType<{ data: SatgatDocumentData }>
>;

const RENDERERS = {
  resume: React.lazy(() => import('./Resume')),
  'self-intro': React.lazy(() => import('./SelfIntro')),
  'business-card': React.lazy(() => import('./BusinessCard')),
  'brand-onepager': React.lazy(() => import('./BrandOnepager')),
  'product-brochure': React.lazy(() => import('./ProductBrochure')),
  'company-profile': React.lazy(() => import('./CompanyProfile')),
  'investor-deck': React.lazy(() => import('./InvestorDeck')),
  'brand-storybook': React.lazy(() => import('./BrandStorybook')),
  invitation: React.lazy(() => import('./Invitation')),
  'new-year-card': React.lazy(() => import('./NewYearCard')),
  proposal: React.lazy(() => import('./Proposal')),
  newsletter: React.lazy(() => import('./Newsletter')),
  portfolio: React.lazy(() => import('./Portfolio')),
  report: React.lazy(() => import('./Report')),
} satisfies Record<TemplateId, RuntimeRenderer>;

export const runtimeRendererIds = TEMPLATE_IDS;

export function getRuntimeRenderer(id: string): RuntimeRenderer | undefined {
  return isTemplateId(id) ? RENDERERS[id] : undefined;
}
