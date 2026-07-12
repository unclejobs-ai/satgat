'use client';

import React from 'react';
import { getPageSpec } from '@/lib/templates/registry';
import type { PageSpecId } from '@/lib/templates/types';
import {
  CANVAS,
  FONT_BATANG,
  HAIRLINE,
  PAGE_MARGIN_X,
  PAGE_MARGIN_Y,
} from '@/lib/design-system/constraint';

const PAGE_PADDING: Readonly<Record<PageSpecId, { className: string; value: string }>> = {
  a4Portrait: { className: 'satgat-page-padding-standard', value: `${PAGE_MARGIN_Y} ${PAGE_MARGIN_X}` },
  a4Landscape: { className: 'satgat-page-padding-standard', value: `${PAGE_MARGIN_Y} ${PAGE_MARGIN_X}` },
  slide16x9: { className: 'satgat-page-padding-standard', value: `${PAGE_MARGIN_Y} ${PAGE_MARGIN_X}` },
  businessCard8Up: { className: 'satgat-page-padding-full-sheet', value: '0' },
  postcardPortrait: { className: 'satgat-page-padding-compact', value: '8mm 7mm' },
};

interface SatgatDocumentProps {
  children: React.ReactNode;
  pageSpec: PageSpecId;
  className?: string;
}

type DensityMeasurement = {
  state: 'ok' | 'sparse' | 'unknown';
  fill: number;
};

interface DensityGeometry {
  contentInsetTop: number;
  contentHeight: number;
  lowestLayoutBottom: number;
}

export function calculateNestedOffsetBottom(
  offsetTopChain: readonly number[],
  offsetHeight: number,
): number {
  return offsetTopChain.reduce((bottom, offsetTop) => bottom + offsetTop, offsetHeight);
}

export function calculateDensityMeasurement({
  contentInsetTop,
  contentHeight,
  lowestLayoutBottom,
}: DensityGeometry): DensityMeasurement {
  if (
    contentHeight <= 0 ||
    !Number.isFinite(contentHeight) ||
    !Number.isFinite(contentInsetTop) ||
    !Number.isFinite(lowestLayoutBottom)
  ) {
    return { state: 'unknown', fill: 0 };
  }

  const lowestContentPoint = lowestLayoutBottom - contentInsetTop;
  // CSS zoom can round text line boxes by a few layout pixels. A five-point
  // density bucket keeps this advisory value invariant without reading visual
  // DOMRect coordinates or changing the sparse/ok signal's useful precision.
  const rawFill = Math.min(1, Math.max(0, lowestContentPoint / contentHeight));
  const fill = Math.round(rawFill * 20) * 5;
  return {
    state: fill < 50 ? 'sparse' : 'ok',
    fill,
  };
}

/**
 * 삿갓 문서 루트 — PageSpec 캔버스
 *
 * 철학: "한지 위의 먹글씨"
 * - 평평한 백자지 캔버스 + 회녹빛 1px 구분선
 * - 절대 pure white 금지
 * - 브라우저와 인쇄가 같은 물리 캔버스와 서체를 사용
 * - 인쇄(@media print)는 SatgatPrintStyles가 단독 소유 (M4 단일 권위 전략)
 *
 * 렌더 시 밀도 힌트(VAL-DENSITY-005): 각 페이지가 자기 자신을 측정한다. 페인트
 * 이후 useEffect에서 인쇄 가능 콘텐츠 박스의 채움률을 계산해, 50% 미만이면
 * `data-density="sparse"` + 프리뷰 전용 `.density-warn` 배지를 **React 트리로**
 * 렌더한다. 예전에는 PreviewClient가 useLayoutEffect에서 배지를 DOM에 직접
 * appendChild 했는데, lazy Suspense 렌더러의 하이드레이션 창과 경쟁해 sparse
 * 페이지를 가진 템플릿(product-brochure·brand-storybook)이 hydration-mismatch
 * 에러를 던졌다(M4 visual-qa). 측정/배지를 페이지 자신의 마운트 이후(useEffect)로
 * 옮겨, 배지는 항상 하이드레이션 완료 후 React 상태로만 추가된다 — 더 이상
 * 명령형 DOM 변형이 하이드레이션과 경쟁하지 않는다.
 */
export function SatgatDocument({
  children,
  pageSpec,
  className = '',
}: SatgatDocumentProps) {
  const spec = getPageSpec(pageSpec);
  const ref = React.useRef<HTMLDivElement>(null);
  const [density, setDensity] = React.useState<DensityMeasurement | null>(null);

  // 페인트 후(useEffect — useLayoutEffect 아님)에만 측정/상태 갱신한다. SSR과
  // 클라이언트 첫 렌더는 density=null(속성·배지 없음)로 동일하므로 하이드레이션
  // 불일치가 없고, 배지는 측정 이후 React 재렌더로만 나타난다.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;

    const apply = (state: 'ok' | 'sparse' | 'unknown', fill: number) => {
      if (cancelled) return;
      setDensity((prev) => (prev && prev.state === state && prev.fill === fill ? prev : { state, fill }));
    };

    const measure = () => {
      if (cancelled) return;
      const cs = window.getComputedStyle(el);
      const padTop = parseFloat(cs.paddingTop) || 0;
      const padBot = parseFloat(cs.paddingBottom) || 0;
      const borderTop = parseFloat(cs.borderTopWidth) || 0;
      const innerH = el.clientHeight - padTop - padBot;
      if (innerH <= 0) {
        apply('unknown', 0);
        return;
      }

      let lowestLayoutBottom = borderTop + padTop;
      el.querySelectorAll('*').forEach((candidate) => {
        if (!(candidate instanceof HTMLElement)) return;
        if (candidate.closest('.density-warn, [data-density-hint]')) return;
        if (candidate.offsetWidth === 0 && candidate.offsetHeight === 0) return;

        const offsetTopChain: number[] = [];
        let current: HTMLElement | null = candidate;
        while (current && current !== el) {
          offsetTopChain.push(current.offsetTop);
          const offsetParent: Element | null = current.offsetParent;
          current = offsetParent instanceof HTMLElement ? offsetParent : null;
        }
        if (current !== el) return;

        const bottom = calculateNestedOffsetBottom(offsetTopChain, candidate.offsetHeight);
        if (bottom > lowestLayoutBottom) lowestLayoutBottom = bottom;
      });
      const measurement = calculateDensityMeasurement({
        contentInsetTop: borderTop + padTop,
        contentHeight: innerH,
        lowestLayoutBottom,
      });
      apply(measurement.state, measurement.fill);
    };

    measure();
    // lazy 렌더러 마운트·웹폰트 정착(self-hosted woff2 reflow) 후 재측정.
    // ResizeObserver가 이후 레이아웃 변화를 잡는다.
    const t1 = window.setTimeout(measure, 350);
    const t2 = window.setTimeout(measure, 900);
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => measure()).catch(() => {});
    }
    return () => {
      cancelled = true;
      ro.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);


  return (
    <>
      <div
        ref={ref}
        className={`satgat-document ${PAGE_PADDING[pageSpec].className} ${className}`}
        data-page-spec={pageSpec}
        data-page-padding={PAGE_PADDING[pageSpec].className}
        data-layout-ready={density ? '' : undefined}
        data-density={density?.state ?? undefined}
        data-density-fill={density ? String(density.fill) : undefined}
        style={{
          width: `${spec.canvas.widthMm}mm`,
          height: `${spec.canvas.heightMm}mm`,
          backgroundColor: CANVAS,
          color: 'var(--satgat-ink)',
          fontFamily: FONT_BATANG,
          fontSize: '15px',
          lineHeight: 1.72,
          letterSpacing: '-0.005em',
          wordBreak: 'keep-all',
          padding: PAGE_PADDING[pageSpec].value,
          overflow: 'hidden',
          boxSizing: 'border-box',
          position: 'relative',
          margin: '0 auto',
          boxShadow: `0 0 0 1px ${HAIRLINE}`,
          breakAfter: 'page',
        }}
      >
        {children}
        {density?.state === 'sparse' && (
          <div
            className="density-warn no-print"
            data-density-hint=""
            role="status"
            aria-label={`밀도 경고 — 희소 페이지, 채움 ${density.fill}%`}
          >
            {`희소 ${density.fill}%`}
          </div>
        )}
      </div>

      {/* @media screen 여백만 소유. 인쇄(@media print) 규칙은 SatgatPrintStyles가
          단독 소유한다(M4 단일 권위 전략) — 여기서 print를 재정의하지 않는다. */}
      <style jsx global>{`
        /* 마운트 후 flow-root 전환으로 Chromium paged-media가 visual figure를
            anonymous 기본 용지로 승격하지 않도록 새 fragmentation context를 만든다. */
        .satgat-document[data-layout-ready] .satgat-visual {
          display: flow-root;
        }

        @media screen {
          .satgat-document {
            margin-bottom: 48px;
          }
          .satgat-document + .satgat-document {
            margin-top: 48px;
          }
        }
      `}</style>
    </>
  );
}
