"use client";

import React from "react";
import type { SatgatVisualSlot } from "@/lib/engine/slot-visual";
import { normalizeVisualSlot } from "@/lib/engine/slot-visual";
import {
  CANVAS,
  IVORY,
  INK,
  INK_LIGHT,
  INK_MUTED,
  MUTED,
  BORDER,
  HAIRLINE,
  DANCHEONG,
  JADE,
  GOLD,
  FONT_MYEONGJO,
  FONT_BATANG,
  FONT_DODUM,
} from "@/lib/design-system/constraint";

const NEUTRAL_1 = "#ECEDE4";
const NEUTRAL_2 = "#E2E5DA";
const DANCHEONG_WASH = "#F1E5E2";
const JADE_WASH = "#E3EDE7";
const GOLD_WASH = "#F0E8D6";
const INK_WASH = "#E8E7DE";
const SERIES = [INK_LIGHT, INK_MUTED, MUTED, BORDER, DANCHEONG, JADE, GOLD];

type Point = { x: number; y: number };
type NumericDatum = { label: string; value: number };

function svgProps(width: number, height: number) {
  return {
    width: "100%",
    viewBox: `0 0 ${width} ${height}`,
    xmlns: "http://www.w3.org/2000/svg",
    role: "img",
    style: { display: "block", overflow: "hidden" },
  };
}

function textValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function numberValue(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replaceAll(",", "").replace(/[^\d.+-]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function numericData(data: SatgatVisualSlot["data"], fallback: NumericDatum[]): NumericDatum[] {
  const rows = data ?? [];
  const normalized = rows
    .map((row, index) => ({
      label: textValue(row.label ?? row.name ?? row.title ?? row.metric ?? row.year) || String(index + 1),
      value: numberValue(row.value ?? row.amount ?? row.score ?? row.count ?? row.rate, Number.NaN),
    }))
    .filter((row) => Number.isFinite(row.value));

  return normalized.length > 0 ? normalized : fallback;
}

function chartFrame(children: React.ReactNode, width = 520, height = 280) {
  return (
    <svg {...svgProps(width, height)}>
      <rect x="0" y="0" width={width} height={height} fill={CANVAS} />
      {children}
    </svg>
  );
}

function axis({ left, top, width, height }: { left: number; top: number; width: number; height: number }) {
  return (
    <g>
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
        const y = top + height - tick * height;
        return <line key={tick} x1={left} y1={y} x2={left + width} y2={y} stroke={HAIRLINE} strokeWidth={0.8} />;
      })}
      <line x1={left} y1={top + height} x2={left + width} y2={top + height} stroke={INK_LIGHT} strokeWidth={1.2} />
    </g>
  );
}

export function BarChart({ data, horizontal = false }: { data: NumericDatum[]; horizontal?: boolean }) {
  const w = 520;
  const h = 286;
  const pad = { t: 26, r: 28, b: 44, l: horizontal ? 92 : 42 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;

  if (horizontal) {
    const band = chartH / Math.max(data.length, 1);
    const barH = Math.min(22, band * 0.56);

    return chartFrame(
      <>
        {axis({ left: pad.l, top: pad.t, width: chartW, height: chartH })}
        {data.map((d, i) => {
          const bw = (d.value / max) * chartW;
          const y = pad.t + i * band + (band - barH) / 2;
          return (
            <g key={`${d.label}-${i}`}>
              <text x={pad.l - 10} y={y + barH / 2 + 4} textAnchor="end" fontSize={11} fill={INK_MUTED} fontFamily={FONT_DODUM}>
                {d.label}
              </text>
              <rect x={pad.l} y={y} width={Math.max(bw, 2)} height={barH} fill={i === 0 ? DANCHEONG : SERIES[i % SERIES.length]} rx={2} />
              <text x={pad.l + bw + 8} y={y + barH / 2 + 4} fontSize={11} fill={INK} fontFamily={FONT_DODUM}>
                {d.value}
              </text>
            </g>
          );
        })}
      </>,
      w,
      h,
    );
  }

  const band = chartW / Math.max(data.length, 1);
  const barW = Math.min(44, band * 0.58);

  return chartFrame(
    <>
      {axis({ left: pad.l, top: pad.t, width: chartW, height: chartH })}
      {data.map((d, i) => {
        const bh = (d.value / max) * chartH;
        const x = pad.l + i * band + (band - barW) / 2;
        return (
          <g key={`${d.label}-${i}`}>
            <rect x={x} y={pad.t + chartH - bh} width={barW} height={Math.max(bh, 2)} fill={i === data.length - 1 ? DANCHEONG : SERIES[i % SERIES.length]} rx={2} />
            <text x={x + barW / 2} y={pad.t + chartH + 18} textAnchor="middle" fontSize={10} fill={INK_MUTED} fontFamily={FONT_DODUM}>
              {d.label}
            </text>
            <text x={x + barW / 2} y={pad.t + chartH - bh - 7} textAnchor="middle" fontSize={10} fill={INK} fontFamily={FONT_DODUM}>
              {d.value}
            </text>
          </g>
        );
      })}
    </>,
    w,
    h,
  );
}

export function LineChart({ data }: { data: NumericDatum[] }) {
  const w = 520;
  const h = 280;
  const pad = { t: 28, r: 28, b: 44, l: 44 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;
  const points = data.map<Point>((d, i) => ({
    x: pad.l + (i / Math.max(data.length - 1, 1)) * chartW,
    y: pad.t + chartH - ((d.value - min) / range) * chartH,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${pad.l + chartW} ${pad.t + chartH} L ${pad.l} ${pad.t + chartH} Z`;

  return chartFrame(
    <>
      {axis({ left: pad.l, top: pad.t, width: chartW, height: chartH })}
      <path d={areaD} fill={DANCHEONG_WASH} />
      <path d={pathD} fill="none" stroke={DANCHEONG} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={`${data[i].label}-${i}`}>
          <circle cx={p.x} cy={p.y} r={4.2} fill={DANCHEONG} stroke={CANVAS} strokeWidth={2} />
          <text x={p.x} y={pad.t + chartH + 18} textAnchor="middle" fontSize={9.5} fill={INK_MUTED} fontFamily={FONT_DODUM}>
            {data[i].label}
          </text>
        </g>
      ))}
    </>,
    w,
    h,
  );
}

export function DonutChart({ data }: { data: NumericDatum[] }) {
  const w = 360;
  const h = 300;
  const cx = 148;
  const cy = 132;
  const r = 82;
  const innerR = 50;
  const total = Math.max(data.reduce((sum, d) => sum + Math.max(d.value, 0), 0), 1);
  const arcs = data.reduce<Array<NumericDatum & { start: number; end: number }>>((items, datum) => {
    const start = items.length > 0 ? items[items.length - 1].end : -Math.PI / 2;
    const end = start + (Math.max(datum.value, 0) / total) * Math.PI * 2;
    return [...items, { ...datum, start, end }];
  }, []);

  function point(angle: number, radius: number) {
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  function ringSegment(start: number, end: number) {
    const outerStart = point(start, r);
    const outerEnd = point(end, r);
    const innerStart = point(start, innerR);
    const innerEnd = point(end, innerR);
    const large = end - start > Math.PI ? 1 : 0;
    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${r} ${r} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${innerStart.x} ${innerStart.y}`,
      "Z",
    ].join(" ");
  }

  return (
    <svg {...svgProps(w, h)}>
      <rect width={w} height={h} fill={CANVAS} />
      {arcs.map((d, i) => (
        <path key={`${d.label}-${i}`} d={ringSegment(d.start, d.end)} fill={i === 0 ? DANCHEONG : SERIES[i % SERIES.length]} stroke={CANVAS} strokeWidth={2} />
      ))}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize={22} fontWeight={700} fill={INK} fontFamily={FONT_MYEONGJO}>
        {total}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize={10} fill={INK_MUTED} fontFamily={FONT_DODUM}>
        합계
      </text>
      <g transform="translate(250, 58)">
        {data.slice(0, 5).map((d, i) => (
          <g key={`${d.label}-${i}`} transform={`translate(0, ${i * 28})`}>
            <rect width={10} height={10} fill={i === 0 ? DANCHEONG : SERIES[i % SERIES.length]} rx={1.5} />
            <text x={16} y={9} fontSize={10.5} fill={INK_MUTED} fontFamily={FONT_DODUM}>
              {d.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export function WaterfallChart({ data }: { data: NumericDatum[] }) {
  const w = 520;
  const h = 282;
  const pad = { t: 24, r: 26, b: 42, l: 44 };
  const max = Math.max(...data.map((d) => Math.abs(d.value)), 1);
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;
  const band = chartW / Math.max(data.length, 1);
  const barW = Math.min(40, band * 0.58);
  const yBase = pad.t + chartH / 2;

  return chartFrame(
    <>
      <line x1={pad.l} y1={yBase} x2={pad.l + chartW} y2={yBase} stroke={INK_LIGHT} strokeWidth={1.2} />
      {data.map((d, i) => {
        const x = pad.l + i * band + (band - barW) / 2;
        const bh = (d.value / max) * (chartH / 2 - 12);
        const y = d.value >= 0 ? yBase - bh : yBase;
        const fill = d.value >= 0 ? JADE : DANCHEONG;
        return (
          <g key={`${d.label}-${i}`}>
            <rect x={x} y={y} width={barW} height={Math.max(Math.abs(bh), 2)} fill={fill} rx={2} />
            <text x={x + barW / 2} y={d.value >= 0 ? y - 7 : y + Math.abs(bh) + 15} textAnchor="middle" fontSize={10} fill={INK} fontFamily={FONT_DODUM}>
              {d.value > 0 ? `+${d.value}` : d.value}
            </text>
            <text x={x + barW / 2} y={h - 14} textAnchor="middle" fontSize={9.5} fill={INK_MUTED} fontFamily={FONT_DODUM}>
              {d.label}
            </text>
          </g>
        );
      })}
    </>,
    w,
    h,
  );
}

export function Timeline({ events }: { events: { year: string; title: string }[] }) {
  const w = 560;
  const h = 150;
  const pad = 42;

  return (
    <svg {...svgProps(w, h)}>
      <rect width={w} height={h} fill={CANVAS} />
      <line x1={pad} y1={h / 2} x2={w - pad} y2={h / 2} stroke={INK_LIGHT} strokeWidth={1.8} />
      {events.map((event, i) => {
        const x = pad + (i / Math.max(events.length - 1, 1)) * (w - pad * 2);
        const top = i % 2 === 0;
        return (
          <g key={`${event.year}-${i}`}>
            <circle cx={x} cy={h / 2} r={5} fill={i === events.length - 1 ? DANCHEONG : INK_LIGHT} stroke={CANVAS} strokeWidth={2} />
            <line x1={x} y1={h / 2} x2={x} y2={top ? 38 : 112} stroke={HAIRLINE} strokeWidth={1} />
            <text x={x} y={top ? 30 : 126} textAnchor="middle" fontSize={12} fontWeight={700} fill={INK} fontFamily={FONT_MYEONGJO}>
              {event.year}
            </text>
            <text x={x} y={top ? 45 : 108} textAnchor="middle" fontSize={10} fill={INK_MUTED} fontFamily={FONT_DODUM}>
              {event.title}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Flowchart({ steps }: { steps: string[] }) {
  const w = 430;
  const h = Math.max(steps.length * 56 + 36, 180);

  return (
    <svg {...svgProps(w, h)}>
      <defs>
        <marker id="satgat-flow-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 L2,4 Z" fill={INK_MUTED} />
        </marker>
      </defs>
      <rect width={w} height={h} fill={CANVAS} />
      {steps.map((step, i) => {
        const y = 30 + i * 56;
        return (
          <g key={`${step}-${i}`}>
            {i < steps.length - 1 && <line x1={w / 2} y1={y + 22} x2={w / 2} y2={y + 42} stroke={HAIRLINE} strokeWidth={1.4} markerEnd="url(#satgat-flow-arrow)" />}
            <rect x={w / 2 - 92} y={y - 20} width={184} height={40} rx={4} fill={i === 0 ? DANCHEONG_WASH : IVORY} stroke={i === 0 ? DANCHEONG : HAIRLINE} strokeWidth={1.2} />
            <text x={w / 2} y={y + 4} textAnchor="middle" fontSize={12} fill={INK} fontFamily={FONT_BATANG}>
              {step}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ArchitectureDiagram({ nodes, edges }: { nodes: string[]; edges: [number, number][] }) {
  const w = 540;
  const h = 300;
  const pad = 44;
  const cols = Math.ceil(Math.sqrt(Math.max(nodes.length, 1)));
  const rows = Math.ceil(Math.max(nodes.length, 1) / cols);
  const cellW = (w - pad * 2) / cols;
  const cellH = (h - pad * 2) / rows;
  const positions = nodes.map((_, i) => ({
    x: pad + (i % cols) * cellW + cellW / 2,
    y: pad + Math.floor(i / cols) * cellH + cellH / 2,
  }));

  return (
    <svg {...svgProps(w, h)}>
      <defs>
        <marker id="satgat-arch-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 L2,4 Z" fill={INK_MUTED} />
        </marker>
      </defs>
      <rect width={w} height={h} fill={CANVAS} />
      {edges.map(([from, to], i) => {
        const start = positions[from];
        const end = positions[to];
        if (!start || !end) return null;
        return <line key={`${from}-${to}-${i}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={HAIRLINE} strokeWidth={1.3} markerEnd="url(#satgat-arch-arrow)" />;
      })}
      {nodes.map((node, i) => (
        <g key={`${node}-${i}`}>
          <rect x={positions[i].x - 56} y={positions[i].y - 18} width={112} height={36} rx={4} fill={i === 0 ? INK_WASH : IVORY} stroke={i === 0 ? INK_LIGHT : HAIRLINE} strokeWidth={1.2} />
          <text x={positions[i].x} y={positions[i].y + 4} textAnchor="middle" fontSize={11} fill={INK} fontFamily={FONT_DODUM}>
            {node}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Quadrant({ tl, tr, bl, br, xLabel, yLabel }: { tl: string; tr: string; bl: string; br: string; xLabel?: string; yLabel?: string }) {
  const w = 430;
  const h = 330;
  const pad = 50;

  return (
    <svg {...svgProps(w, h)}>
      <rect width={w} height={h} fill={CANVAS} />
      <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} fill={IVORY} stroke={HAIRLINE} strokeWidth={1} />
      <line x1={w / 2} y1={pad} x2={w / 2} y2={h - pad} stroke={HAIRLINE} strokeWidth={1} />
      <line x1={pad} y1={h / 2} x2={w - pad} y2={h / 2} stroke={HAIRLINE} strokeWidth={1} />
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke={INK_LIGHT} strokeWidth={1.3} />
      <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke={INK_LIGHT} strokeWidth={1.3} />
      {[
        [w / 4, h / 4, tl, GOLD_WASH],
        [(w * 3) / 4, h / 4, tr, DANCHEONG_WASH],
        [w / 4, (h * 3) / 4, bl, INK_WASH],
        [(w * 3) / 4, (h * 3) / 4, br, JADE_WASH],
      ].map(([x, y, label, fill], i) => (
        <g key={`${label}-${i}`}>
          <rect x={Number(x) - 62} y={Number(y) - 20} width={124} height={40} fill={String(fill)} stroke={HAIRLINE} strokeWidth={1} rx={3} />
          <text x={Number(x)} y={Number(y) + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill={INK} fontFamily={FONT_MYEONGJO}>
            {String(label)}
          </text>
        </g>
      ))}
      {xLabel && (
        <text x={w - pad} y={h - pad + 24} textAnchor="end" fontSize={10} fill={INK_MUTED} fontFamily={FONT_DODUM}>
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={pad} y={pad - 14} textAnchor="middle" fontSize={10} fill={INK_MUTED} fontFamily={FONT_DODUM}>
          {yLabel}
        </text>
      )}
    </svg>
  );
}

export function VennDiagram({ a, b, ab }: { a: string; b: string; ab: string }) {
  const w = 380;
  const h = 220;
  return (
    <svg {...svgProps(w, h)}>
      <rect width={w} height={h} fill={CANVAS} />
      <circle cx={145} cy={110} r={76} fill={DANCHEONG_WASH} stroke={DANCHEONG} strokeWidth={1.4} />
      <circle cx={235} cy={110} r={76} fill={JADE_WASH} stroke={JADE} strokeWidth={1.4} />
      <text x={105} y={114} textAnchor="middle" fontSize={12} fontWeight={700} fill={INK} fontFamily={FONT_MYEONGJO}>
        {a}
      </text>
      <text x={275} y={114} textAnchor="middle" fontSize={12} fontWeight={700} fill={INK} fontFamily={FONT_MYEONGJO}>
        {b}
      </text>
      <text x={190} y={114} textAnchor="middle" fontSize={11} fill={INK} fontFamily={FONT_DODUM}>
        {ab}
      </text>
    </svg>
  );
}

export function Swimlane({ lanes, phases }: { lanes: string[]; phases: { name: string; lane: number; start: number; end: number }[] }) {
  const w = 560;
  const h = Math.max(lanes.length * 48 + 48, 180);
  const pad = { t: 28, r: 18, b: 14, l: 94 };
  const chartW = w - pad.l - pad.r;
  return (
    <svg {...svgProps(w, h)}>
      <rect width={w} height={h} fill={CANVAS} />
      {lanes.map((lane, i) => (
        <g key={`${lane}-${i}`}>
          <text x={pad.l - 10} y={pad.t + i * 48 + 28} textAnchor="end" fontSize={11} fill={INK} fontFamily={FONT_DODUM}>
            {lane}
          </text>
          <line x1={pad.l} y1={pad.t + i * 48 + 38} x2={w - pad.r} y2={pad.t + i * 48 + 38} stroke={HAIRLINE} strokeWidth={1} />
        </g>
      ))}
      {phases.map((phase, i) => (
        <g key={`${phase.name}-${i}`}>
          <rect x={pad.l + phase.start * chartW} y={pad.t + Math.min(phase.lane, lanes.length - 1) * 48 + 8} width={Math.max((phase.end - phase.start) * chartW, 12)} height={26} rx={3} fill={i === 0 ? DANCHEONG_WASH : NEUTRAL_2} stroke={i === 0 ? DANCHEONG : BORDER} strokeWidth={1.2} />
          <text x={pad.l + phase.start * chartW + 8} y={pad.t + Math.min(phase.lane, lanes.length - 1) * 48 + 25} fontSize={10} fill={INK} fontFamily={FONT_DODUM}>
            {phase.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function TreeDiagram({ root, children }: { root: string; children: { name: string; sub?: string[] }[] }) {
  const w = 520;
  const h = 260;
  const cx = w / 2;
  const childW = w / Math.max(children.length, 1);
  return (
    <svg {...svgProps(w, h)}>
      <rect width={w} height={h} fill={CANVAS} />
      <rect x={cx - 58} y={20} width={116} height={38} rx={4} fill={DANCHEONG_WASH} stroke={DANCHEONG} strokeWidth={1.3} />
      <text x={cx} y={44} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK} fontFamily={FONT_MYEONGJO}>
        {root}
      </text>
      {children.map((child, i) => {
        const x = childW * i + childW / 2;
        return (
          <g key={`${child.name}-${i}`}>
            <line x1={cx} y1={58} x2={x} y2={98} stroke={HAIRLINE} strokeWidth={1.2} />
            <rect x={x - 48} y={98} width={96} height={30} rx={4} fill={IVORY} stroke={HAIRLINE} strokeWidth={1.1} />
            <text x={x} y={117} textAnchor="middle" fontSize={10.5} fill={INK} fontFamily={FONT_DODUM}>
              {child.name}
            </text>
            {(child.sub ?? []).slice(0, 3).map((sub, j) => {
              const sx = x - 36 + j * 36;
              return (
                <g key={`${sub}-${j}`}>
                  <line x1={x} y1={128} x2={sx} y2={166} stroke={HAIRLINE} strokeWidth={1} />
                  <rect x={sx - 24} y={166} width={48} height={22} rx={3} fill={NEUTRAL_1} stroke={HAIRLINE} strokeWidth={1} />
                  <text x={sx} y={181} textAnchor="middle" fontSize={8.5} fill={INK_MUTED} fontFamily={FONT_DODUM}>
                    {sub}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export function LayerStack({ layers }: { layers: { name: string }[] }) {
  const w = 360;
  const h = Math.max(layers.length * 38 + 28, 160);
  return (
    <svg {...svgProps(w, h)}>
      <rect width={w} height={h} fill={CANVAS} />
      {layers.map((layer, i) => {
        const y = 16 + i * 38;
        const offset = i * 8;
        return (
          <g key={`${layer.name}-${i}`}>
            <rect x={22 + offset} y={y} width={w - 44 - offset * 2} height={30} rx={3} fill={i === 0 ? DANCHEONG_WASH : NEUTRAL_1} stroke={i === 0 ? DANCHEONG : HAIRLINE} strokeWidth={1.2} />
            <text x={w / 2} y={y + 20} textAnchor="middle" fontSize={11} fill={INK} fontFamily={FONT_DODUM}>
              {layer.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function CandlestickChart({ data }: { data: SatgatVisualSlot["data"] }) {
  const rows = data?.length
    ? data
    : [
        { label: "1월", open: 42, high: 54, low: 38, close: 50 },
        { label: "2월", open: 50, high: 58, low: 44, close: 46 },
        { label: "3월", open: 46, high: 66, low: 43, close: 62 },
      ];
  const w = 520;
  const h = 280;
  const pad = { t: 22, r: 24, b: 38, l: 46 };
  const highs = rows.map((d) => numberValue(d.high ?? d.value, 1));
  const lows = rows.map((d) => numberValue(d.low ?? d.value, 0));
  const max = Math.max(...highs, 1);
  const min = Math.min(...lows, 0);
  const range = max - min || 1;
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;
  const band = chartW / Math.max(rows.length, 1);
  const candleW = Math.min(26, band * 0.42);
  const y = (value: number) => pad.t + chartH - ((value - min) / range) * chartH;

  return chartFrame(
    <>
      {axis({ left: pad.l, top: pad.t, width: chartW, height: chartH })}
      {rows.map((d, i) => {
        const x = pad.l + i * band + band / 2;
        const open = numberValue(d.open, numberValue(d.value, 0));
        const high = numberValue(d.high, open);
        const low = numberValue(d.low, open);
        const close = numberValue(d.close, open);
        const up = close >= open;
        const color = up ? DANCHEONG : INK_LIGHT;
        const top = y(Math.max(open, close));
        const bottom = y(Math.min(open, close));
        return (
          <g key={`${textValue(d.label)}-${i}`}>
            <line x1={x} y1={y(high)} x2={x} y2={y(low)} stroke={color} strokeWidth={1.2} />
            <rect x={x - candleW / 2} y={top} width={candleW} height={Math.max(bottom - top, 2)} fill={up ? color : CANVAS} stroke={color} strokeWidth={1.1} />
            <text x={x} y={h - 12} textAnchor="middle" fontSize={9.5} fill={INK_MUTED} fontFamily={FONT_DODUM}>
              {textValue(d.label) || String(i + 1)}
            </text>
          </g>
        );
      })}
    </>,
    w,
    h,
  );
}

export function SatgatVisual({ visual, compact = false }: { visual: SatgatVisualSlot | unknown; compact?: boolean }) {
  const normalized = normalizeVisualSlot(visual);
  if (!normalized) return null;

  const fallbackData = [
    { label: "기준", value: 42 },
    { label: "개선", value: 68 },
    { label: "목표", value: 84 },
  ];
  const data = numericData(normalized.data, fallbackData);
  const timelineEvents = (normalized.data ?? []).map((item, index) => ({
    year: textValue(item.year ?? item.label) || String(index + 1),
    title: textValue(item.title ?? item.event ?? item.name) || textValue(item.label) || "단계",
  }));

  let body: React.ReactNode;
  switch (normalized.kind) {
    case "bar-horizontal":
      body = <BarChart data={data} horizontal />;
      break;
    case "line":
      body = <LineChart data={data} />;
      break;
    case "donut":
      body = <DonutChart data={data} />;
      break;
    case "waterfall":
      body = <WaterfallChart data={data} />;
      break;
    case "timeline":
      body = <Timeline events={timelineEvents.length ? timelineEvents : [{ year: "1", title: "시작" }, { year: "2", title: "확장" }, { year: "3", title: "완성" }]} />;
      break;
    case "flow":
      body = <Flowchart steps={(normalized.steps ?? []).length ? normalized.steps ?? [] : data.map((item) => item.label)} />;
      break;
    case "architecture":
      body = <ArchitectureDiagram nodes={(normalized.nodes ?? []).length ? normalized.nodes ?? [] : data.map((item) => item.label)} edges={normalized.edges ?? []} />;
      break;
    case "quadrant":
      body = normalized.quadrants ? <Quadrant {...normalized.quadrants} /> : null;
      break;
    case "venn":
      body = normalized.venn ? <VennDiagram {...normalized.venn} /> : null;
      break;
    case "swimlane":
      body = <Swimlane lanes={(normalized.lanes ?? []).length ? normalized.lanes ?? [] : ["기획", "실행", "검토"]} phases={normalized.phases ?? []} />;
      break;
    case "tree":
      body = normalized.tree ? <TreeDiagram {...normalized.tree} /> : null;
      break;
    case "layer-stack":
      body = <LayerStack layers={(normalized.layers ?? []).length ? normalized.layers ?? [] : data.map((item) => ({ name: item.label }))} />;
      break;
    case "candlestick":
      body = <CandlestickChart data={normalized.data} />;
      break;
    case "bar":
    default:
      body = <BarChart data={data} />;
      break;
  }

  if (!body) return null;

  return (
    <figure
      className="satgat-visual"
      style={{
        margin: 0,
        padding: compact ? 14 : 18,
        background: IVORY,
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 5,
        breakInside: "avoid",
      }}
    >
      {normalized.title && (
        <figcaption
          style={{
            fontFamily: FONT_MYEONGJO,
            fontSize: compact ? 14 : 16,
            fontWeight: 700,
            lineHeight: 1.35,
            color: INK,
            marginBottom: 12,
            wordBreak: "keep-all",
          }}
        >
          {normalized.title}
        </figcaption>
      )}
      {body}
      {normalized.caption && (
        <p
          style={{
            fontFamily: FONT_BATANG,
            fontSize: compact ? 10.5 : 11.5,
            lineHeight: 1.62,
            color: INK_MUTED,
            margin: "12px 0 0",
            wordBreak: "keep-all",
          }}
        >
          {normalized.caption}
        </p>
      )}
    </figure>
  );
}
