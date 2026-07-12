'use client';

import React from 'react';
import { getPageSpec } from '@/lib/templates/registry';
import type {
  SatgatDocumentData,
  TemplateCatalogEntry,
} from '@/lib/templates/types';
import { getRuntimeRenderer } from './runtime-catalog';
import { FONT_BATANG, INK_MUTED } from '@/lib/design-system/constraint';

interface SatgatTemplateRendererProps {
  template: TemplateCatalogEntry;
  data: SatgatDocumentData;
}

export function RendererLoadFailure() {
  return (
    <div
      role="alert"
      data-render-state="error"
      style={{ padding: 48, textAlign: 'center', color: INK_MUTED }}
    >
      <p>문서를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
    </div>
  );
}

interface RendererLoadBoundaryProps {
  children: React.ReactNode;
  resetKey: object;
}

interface RendererLoadBoundaryState {
  failed: boolean;
  resetKey: object;
}

export class RendererLoadBoundary extends React.Component<
  RendererLoadBoundaryProps,
  RendererLoadBoundaryState
> {
  state: RendererLoadBoundaryState = {
    failed: false,
    resetKey: this.props.resetKey,
  };

  static getDerivedStateFromError(): Partial<RendererLoadBoundaryState> {
    return { failed: true };
  }

  static getDerivedStateFromProps(
    props: RendererLoadBoundaryProps,
    state: RendererLoadBoundaryState,
  ): RendererLoadBoundaryState | null {
    if (props.resetKey === state.resetKey) return null;
    return { failed: false, resetKey: props.resetKey };
  }

  render() {
    if (this.state.failed) {
      return <RendererLoadFailure />;
    }

    return this.props.children;
  }
}

export function SatgatTemplateRenderer({ template, data }: SatgatTemplateRendererProps) {
  const Renderer = getRuntimeRenderer(template.id);

  if (!Renderer) {
    return (
      <div
        role="alert"
        data-render-state="missing"
        style={{ padding: 48, textAlign: 'center', color: INK_MUTED }}
      >
        <p>선택한 템플릿의 문서를 표시할 수 없습니다.</p>
      </div>
    );
  }

  const spec = getPageSpec(template.pageSpec);

  return (
    <RendererLoadBoundary key={template.id} resetKey={data}>
      <React.Suspense
        fallback={
          <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            data-render-state="loading"
            style={{
              width: `${spec.canvas.widthMm}mm`,
              height: `${spec.canvas.heightMm}mm`,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: INK_MUTED,
              fontFamily: FONT_BATANG,
            }}
          >
            <p>문서를 준비하는 중...</p>
          </div>
        }
      >
        {React.createElement(Renderer, { data })}
      </React.Suspense>
    </RendererLoadBoundary>
  );
}
