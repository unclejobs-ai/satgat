'use client';

import React from 'react';
import {
  CANVAS,
  TEXTURE_CANVAS_GRADIENT,
  TEXTURE_PAPER_NOISE,
  SHADOW_BOOK,
  PAGE_MARGIN_X,
  PAGE_MARGIN_Y,
} from '@/lib/design-system/constraint';

interface SatgatDocumentProps {
  children: React.ReactNode;
  /** A4 | A4-Landscape | Slide-16x9 */
  format?: 'a4' | 'a4-landscape' | 'slide-16x9';
  className?: string;
  /** 개발용 baseline grid 표시 */
  showBaseline?: boolean;
}

const formatMap = {
  a4: { width: '210mm', height: '297mm' },
  'a4-landscape': { width: '297mm', height: '210mm' },
  'slide-16x9': { width: '297mm', height: '167mm' },
};

/**
 * 삿갓 문서 루트 — A4/16:9 캔버스
 *
 * 철학: "한지 위의 먹글씨"
 * - 한지색 배경 + 미세 노이즈 질감 + 따뜻한 그라데이션
 * - 8px baseline grid (문서의 기준선)
 * - 절대 pure white 금지
 * - 브라우저 프리뷰에서는 고정 크기 + 책자 그림자
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
  format = 'a4',
  className = '',
  showBaseline = false,
}: SatgatDocumentProps) {
  const dims = formatMap[format];
  const ref = React.useRef<HTMLDivElement>(null);
  const [density, setDensity] = React.useState<{ state: 'ok' | 'sparse' | 'unknown'; fill: number } | null>(null);

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
      const bt = parseFloat(cs.borderTopWidth) || 0;
      const innerH = el.clientHeight - padTop - padBot;
      if (innerH <= 0) {
        apply('unknown', 0);
        return;
      }
      const pageRect = el.getBoundingClientRect();
      const contentTop = pageRect.top + bt + padTop;
      let lowest = 0;
      el.querySelectorAll<HTMLElement>('*').forEach((node) => {
        // 배지 자신은 측정에서 제외 (절대배치 오버레이라 채움률을 오염시킨다).
        if (node.closest('.density-warn, [data-density-hint]')) return;
        const r = node.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return; // 보이지 않는/0크기 노드 skip
        const bottomRel = r.bottom - contentTop;
        if (bottomRel > lowest) lowest = bottomRel;
      });
      const fill = Math.min(1, Math.max(0, lowest / innerH));
      const pct = Math.round(fill * 100);
      apply(fill < 0.5 ? 'sparse' : 'ok', pct);
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

  const baselineGrid = showBaseline
    ? `repeating-linear-gradient(to bottom, transparent, transparent 7px, rgba(28,28,28,0.03) 7px, rgba(28,28,28,0.03) 8px), `
    : '';

  return (
    <>
      <div
        ref={ref}
        className={`satgat-document ${className}`}
        data-format={format}
        data-density={density?.state ?? undefined}
        data-density-fill={density ? String(density.fill) : undefined}
        style={{
          width: dims.width,
          minHeight: dims.height,
          backgroundColor: CANVAS,
          backgroundImage: `${baselineGrid}${TEXTURE_CANVAS_GRADIENT}, ${TEXTURE_PAPER_NOISE}`,
          color: 'var(--near-black, #1C1916)',
          fontFamily: "var(--serif, 'Gowun Batang'), 'Nanum Myeongjo', 'Noto Serif KR', 'Batang', Georgia, serif",
          fontSize: '15px',
          lineHeight: 1.72,
          letterSpacing: '-0.005em',
          wordBreak: 'keep-all',
          padding: `${PAGE_MARGIN_Y} ${PAGE_MARGIN_X}`,
          boxSizing: 'border-box',
          position: 'relative',
          margin: '0 auto',
          boxShadow: SHADOW_BOOK,
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
