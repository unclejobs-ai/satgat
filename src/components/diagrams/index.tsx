"use client";

import React from "react";
import { INK, INK_MUTED, DANCHEONG, JADE, GOLD, HAIRLINE } from "@/lib/design-system/constraint";

const palette = [DANCHEONG, JADE, GOLD, "#8A8478", "#5C5C5C", "#B8954F"];

function svgProps(width: number, height: number) {
  return {
    width: "100%",
    viewBox: `0 0 ${width} ${height}`,
    xmlns: "http://www.w3.org/2000/svg",
    style: { display: "block" },
  };
}

// ─── 1. Architecture Diagram ────────────────────────────────────────────────
export function ArchitectureDiagram({ nodes, edges }: { nodes: string[]; edges: [number, number][] }) {
  const w = 480, h = 280, pad = 40;
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const cellW = (w - pad * 2) / cols;
  const cellH = (h - pad * 2) / Math.ceil(nodes.length / cols);

  const positions = nodes.map((_, i) => ({
    x: pad + (i % cols) * cellW + cellW / 2,
    y: pad + Math.floor(i / cols) * cellH + cellH / 2,
  }));

  return (
    <svg {...svgProps(w, h)}>
      {edges.map(([from, to], i) => (
        <line
          key={`e${i}`}
          x1={positions[from].x}
          y1={positions[from].y + 16}
          x2={positions[to].x}
          y2={positions[to].y - 16}
          stroke={HAIRLINE}
          strokeWidth={1.5}
          markerEnd="url(#arrow)"
        />
      ))}
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 L2,4 Z" fill={INK_MUTED} />
        </marker>
      </defs>
      {nodes.map((n, i) => (
        <g key={i}>
          <rect
            x={positions[i].x - 48}
            y={positions[i].y - 16}
            width={96}
            height={32}
            rx={4}
            fill="#F7F7F2"
            stroke={INK}
            strokeWidth={1.5}
          />
          <text
            x={positions[i].x}
            y={positions[i].y + 4}
            textAnchor="middle"
            fontSize={11}
            fill={INK}
            fontFamily="'Gowun Dodum', sans-serif"
          >
            {n}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── 2. Flowchart ───────────────────────────────────────────────────────────
export function Flowchart({ steps }: { steps: string[] }) {
  const w = 400, h = steps.length * 56 + 32;
  return (
    <svg {...svgProps(w, h)}>
      {steps.map((s, i) => {
        const y = 28 + i * 56;
        return (
          <g key={i}>
            {i < steps.length - 1 && (
              <line x1={w / 2} y1={y + 20} x2={w / 2} y2={y + 56 - 20} stroke={HAIRLINE} strokeWidth={1.5} markerEnd="url(#arrow2)" />
            )}
            <rect x={w / 2 - 80} y={y - 20} width={160} height={40} rx={20} fill={i % 2 === 0 ? `${DANCHEONG}10` : `${JADE}10`} stroke={i % 2 === 0 ? DANCHEONG : JADE} strokeWidth={1.5} />
            <text x={w / 2} y={y + 4} textAnchor="middle" fontSize={12} fill={INK} fontFamily="'Gowun Batang', serif">{s}</text>
          </g>
        );
      })}
      <defs>
        <marker id="arrow2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 L1,3 Z" fill={INK_MUTED} />
        </marker>
      </defs>
    </svg>
  );
}

// ─── 3. Quadrant ────────────────────────────────────────────────────────────
export function Quadrant({ tl, tr, bl, br, xLabel, yLabel }: { tl: string; tr: string; bl: string; br: string; xLabel?: string; yLabel?: string }) {
  const w = 400, h = 360, pad = 48;
  return (
    <svg {...svgProps(w, h)}>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke={INK} strokeWidth={1.5} />
      <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke={INK} strokeWidth={1.5} />
      <line x1={pad} y1={h / 2} x2={w - pad} y2={h / 2} stroke={HAIRLINE} strokeWidth={1} strokeDasharray="4 4" />
      <line x1={w / 2} y1={pad} x2={w / 2} y2={h - pad} stroke={HAIRLINE} strokeWidth={1} strokeDasharray="4 4" />
      <text x={w / 4} y={h / 4 + 4} textAnchor="middle" fontSize={13} fill={INK} fontFamily="'Nanum Myeongjo', serif" fontWeight={700}>{tl}</text>
      <text x={(w * 3) / 4} y={h / 4 + 4} textAnchor="middle" fontSize={13} fill={INK} fontFamily="'Nanum Myeongjo', serif" fontWeight={700}>{tr}</text>
      <text x={w / 4} y={(h * 3) / 4 + 4} textAnchor="middle" fontSize={13} fill={INK} fontFamily="'Nanum Myeongjo', serif" fontWeight={700}>{bl}</text>
      <text x={(w * 3) / 4} y={(h * 3) / 4 + 4} textAnchor="middle" fontSize={13} fill={INK} fontFamily="'Nanum Myeongjo', serif" fontWeight={700}>{br}</text>
      {xLabel && <text x={w - pad - 8} y={h - pad + 20} textAnchor="end" fontSize={10} fill={INK_MUTED} fontFamily="'Gowun Dodum', sans-serif">{xLabel}</text>}
      {yLabel && <text x={pad} y={pad - 8} textAnchor="middle" fontSize={10} fill={INK_MUTED} fontFamily="'Gowun Dodum', sans-serif">{yLabel}</text>}
    </svg>
  );
}

// ─── 4. Bar Chart ───────────────────────────────────────────────────────────
export function BarChart({ data, horizontal = false }: { data: { label: string; value: number }[]; horizontal?: boolean }) {
  const w = 480, h = 280, pad = { t: 24, r: 24, b: 48, l: 64 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;
  const barW = (chartW / data.length) * 0.6;

  if (horizontal) {
    const barH = (chartH / data.length) * 0.6;
    return (
      <svg {...svgProps(w, h)}>
        {data.map((d, i) => {
          const bw = (d.value / max) * chartW;
          const y = pad.t + i * (chartH / data.length) + (chartH / data.length - barH) / 2;
          return (
            <g key={i}>
              <rect x={pad.l} y={y} width={bw} height={barH} fill={palette[i % palette.length]} opacity={0.85} rx={2} />
              <text x={pad.l - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize={11} fill={INK} fontFamily="'Gowun Dodum', sans-serif">{d.label}</text>
              <text x={pad.l + bw + 6} y={y + barH / 2 + 4} fontSize={11} fill={INK_MUTED} fontFamily="'Gowun Dodum', sans-serif">{d.value}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <svg {...svgProps(w, h)}>
      {data.map((d, i) => {
        const bh = (d.value / max) * chartH;
        const x = pad.l + i * (chartW / data.length) + (chartW / data.length - barW) / 2;
        return (
          <g key={i}>
            <rect x={x} y={pad.t + chartH - bh} width={barW} height={bh} fill={palette[i % palette.length]} opacity={0.85} rx={2} />
            <text x={x + barW / 2} y={pad.t + chartH + 16} textAnchor="middle" fontSize={10} fill={INK_MUTED} fontFamily="'Gowun Dodum', sans-serif">{d.label}</text>
            <text x={x + barW / 2} y={pad.t + chartH - bh - 6} textAnchor="middle" fontSize={10} fill={INK} fontFamily="'Gowun Dodum', sans-serif">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── 5. Line Chart ──────────────────────────────────────────────────────────
export function LineChart({ data }: { data: { label: string; value: number }[] }) {
  const w = 480, h = 260, pad = { t: 24, r: 24, b: 40, l: 48 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;

  const points = data.map((d, i) => ({
    x: pad.l + (i / (data.length - 1 || 1)) * chartW,
    y: pad.t + chartH - (d.value / max) * chartH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg {...svgProps(w, h)}>
      <line x1={pad.l} y1={pad.t + chartH} x2={pad.l + chartW} y2={pad.t + chartH} stroke={HAIRLINE} strokeWidth={1} />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + chartH} stroke={HAIRLINE} strokeWidth={1} />
      <path d={pathD} fill="none" stroke={DANCHEONG} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={DANCHEONG} stroke={"#F7F7F2"} strokeWidth={2} />
          <text x={p.x} y={pad.t + chartH + 16} textAnchor="middle" fontSize={9} fill={INK_MUTED} fontFamily="'Gowun Dodum', sans-serif">{data[i].label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── 6. Donut Chart ─────────────────────────────────────────────────────────
export function DonutChart({ data }: { data: { label: string; value: number }[] }) {
  const w = 280, h = 280, cx = w / 2, cy = h / 2, r = 90, innerR = 56;
  const total = data.reduce((s, d) => s + d.value, 0);
  const arcs = data.reduce<Array<{ start: number; end: number; label: string; value: number }>>((items, d) => {
    const start = items.at(-1)?.end ?? -Math.PI / 2;
    const end = start + (d.value / total) * Math.PI * 2;
    return [...items, { start, end, ...d }];
  }, []);

  function arcPath(start: number, end: number, radius: number) {
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  }

  return (
    <svg {...svgProps(w, h + 40)}>
      {arcs.map((d, i) => (
        <g key={i}>
          <path d={`${arcPath(d.start, d.end, r)} L ${cx + innerR * Math.cos(d.end)} ${cy + innerR * Math.sin(d.end)} ${arcPath(d.end, d.start, innerR).replace("M", "L")} Z`} fill={palette[i % palette.length]} opacity={0.85} />
        </g>
      ))}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={14} fontWeight={700} fill={INK} fontFamily="'Nanum Myeongjo', serif">{total}</text>
      <g transform={`translate(0, ${h + 8})`}>
        {data.map((d, i) => (
          <g key={i} transform={`translate(${i * 90 + 20}, 0)`}>
            <rect width={8} height={8} fill={palette[i % palette.length]} rx={2} />
            <text x={12} y={7} fontSize={10} fill={INK_MUTED} fontFamily="'Gowun Dodum', sans-serif">{d.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ─── 7. State Machine ───────────────────────────────────────────────────────
export function StateMachine({ states, transitions }: { states: string[]; transitions: [number, number, string][] }) {
  const w = 480, h = 200;
  const positions = states.map((_, i) => ({
    x: 60 + (i * (w - 120)) / (states.length - 1 || 1),
    y: h / 2,
  }));

  return (
    <svg {...svgProps(w, h)}>
      {transitions.map(([from, to, label], i) => (
        <g key={i}>
          <path
            d={`M ${positions[from].x + 24} ${positions[from].y} Q ${(positions[from].x + positions[to].x) / 2} ${positions[from].y - (from < to ? 40 : -40)} ${positions[to].x - 24} ${positions[to].y}`}
            fill="none"
            stroke={HAIRLINE}
            strokeWidth={1.5}
            markerEnd="url(#arrow3)"
          />
          <text x={(positions[from].x + positions[to].x) / 2} y={positions[from].y - (from < to ? 48 : -32)} textAnchor="middle" fontSize={9} fill={INK_MUTED} fontFamily="'Gowun Dodum', sans-serif">{label}</text>
        </g>
      ))}
      <defs>
        <marker id="arrow3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 L1,3 Z" fill={INK_MUTED} />
        </marker>
      </defs>
      {states.map((s, i) => (
        <g key={i}>
          <circle cx={positions[i].x} cy={positions[i].y} r={24} fill="#F7F7F2" stroke={i === 0 ? DANCHEONG : INK} strokeWidth={i === 0 ? 2.5 : 1.5} />
          <text x={positions[i].x} y={positions[i].y + 4} textAnchor="middle" fontSize={10} fill={INK} fontFamily="'Gowun Dodum', sans-serif">{s}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── 8. Timeline ────────────────────────────────────────────────────────────
export function Timeline({ events }: { events: { year: string; title: string }[] }) {
  const w = 600, h = 120, pad = 40;
  return (
    <svg {...svgProps(w, h)}>
      <line x1={pad} y1={h / 2} x2={w - pad} y2={h / 2} stroke={INK} strokeWidth={2} />
      {events.map((e, i) => {
        const x = pad + (i / (events.length - 1 || 1)) * (w - pad * 2);
        const top = i % 2 === 0;
        return (
          <g key={i}>
            <circle cx={x} cy={h / 2} r={5} fill={top ? DANCHEONG : JADE} stroke="#F7F7F2" strokeWidth={2} />
            <text x={x} y={top ? h / 2 - 16 : h / 2 + 28} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK} fontFamily="'Nanum Myeongjo', serif">{e.year}</text>
            <text x={x} y={top ? h / 2 - 32 : h / 2 + 44} textAnchor="middle" fontSize={10} fill={INK_MUTED} fontFamily="'Gowun Dodum', sans-serif">{e.title}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── 9. Swimlane ────────────────────────────────────────────────────────────
export function Swimlane({ lanes, phases }: { lanes: string[]; phases: { name: string; lane: number; start: number; end: number }[] }) {
  const w = 600, h = lanes.length * 48 + 32, pad = { t: 24, r: 16, b: 8, l: 100 };
  const chartW = w - pad.l - pad.r;

  return (
    <svg {...svgProps(w, h)}>
      {lanes.map((l, i) => (
        <g key={i}>
          <text x={pad.l - 8} y={pad.t + i * 48 + 28} textAnchor="end" fontSize={11} fill={INK} fontFamily="'Gowun Dodum', sans-serif">{l}</text>
          <line x1={pad.l} y1={pad.t + i * 48 + 40} x2={w - pad.r} y2={pad.t + i * 48 + 40} stroke={HAIRLINE} strokeWidth={1} />
        </g>
      ))}
      {phases.map((p, i) => (
        <rect
          key={i}
          x={pad.l + p.start * chartW}
          y={pad.t + p.lane * 48 + 8}
          width={(p.end - p.start) * chartW}
          height={28}
          rx={3}
          fill={palette[i % palette.length]}
          opacity={0.2}
          stroke={palette[i % palette.length]}
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}

// ─── 10. Tree Diagram ───────────────────────────────────────────────────────
export function TreeDiagram({ root, children }: { root: string; children: { name: string; sub?: string[] }[] }) {
  const w = 480, h = 240, cx = w / 2;
  const childW = w / (children.length || 1);

  return (
    <svg {...svgProps(w, h)}>
      <rect x={cx - 48} y={16} width={96} height={32} rx={4} fill={DANCHEONG} opacity={0.1} stroke={DANCHEONG} strokeWidth={1.5} />
      <text x={cx} y={38} textAnchor="middle" fontSize={12} fontWeight={700} fill={INK} fontFamily="'Nanum Myeongjo', serif">{root}</text>
      {children.map((c, i) => {
        const x = childW * i + childW / 2;
        return (
          <g key={i}>
            <line x1={cx} y1={48} x2={x} y2={96} stroke={HAIRLINE} strokeWidth={1.5} />
            <rect x={x - 44} y={96} width={88} height={28} rx={4} fill="#F7F7F2" stroke={INK} strokeWidth={1.5} />
            <text x={x} y={114} textAnchor="middle" fontSize={10} fill={INK} fontFamily="'Gowun Dodum', sans-serif">{c.name}</text>
            {c.sub?.map((s, j) => (
              <g key={j}>
                <line x1={x} y1={124} x2={x - 30 + j * 60} y2={164} stroke={HAIRLINE} strokeWidth={1} />
                <rect x={x - 44 + j * 60} y={164} width={56} height={20} rx={3} fill={`${JADE}10`} stroke={JADE} strokeWidth={1} />
                <text x={x - 16 + j * 60} y={178} textAnchor="middle" fontSize={9} fill={INK} fontFamily="'Gowun Dodum', sans-serif">{s}</text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ─── 11. Layer Stack ────────────────────────────────────────────────────────
export function LayerStack({ layers }: { layers: { name: string; color?: string }[] }) {
  const w = 320, h = layers.length * 36 + 24;
  return (
    <svg {...svgProps(w, h)}>
      {layers.map((l, i) => {
        const y = 12 + i * 36;
        const offset = i * 6;
        return (
          <g key={i}>
            <rect x={16 + offset} y={y} width={w - 32 - offset * 2} height={28} rx={3} fill={l.color ? `${l.color}20` : `${palette[i % palette.length]}20`} stroke={l.color || palette[i % palette.length]} strokeWidth={1.5} />
            <text x={w / 2} y={y + 18} textAnchor="middle" fontSize={11} fill={INK} fontFamily="'Gowun Dodum', sans-serif">{l.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── 12. Venn Diagram ───────────────────────────────────────────────────────
export function VennDiagram({ a, b, ab }: { a: string; b: string; ab: string }) {
  const w = 360, h = 200;
  return (
    <svg {...svgProps(w, h)}>
      <circle cx={130} cy={h / 2} r={70} fill={`${DANCHEONG}15`} stroke={DANCHEONG} strokeWidth={1.5} />
      <circle cx={230} cy={h / 2} r={70} fill={`${JADE}15`} stroke={JADE} strokeWidth={1.5} />
      <text x={90} y={h / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK} fontFamily="'Nanum Myeongjo', serif">{a}</text>
      <text x={270} y={h / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK} fontFamily="'Nanum Myeongjo', serif">{b}</text>
      <text x={180} y={h / 2 + 4} textAnchor="middle" fontSize={10} fill={INK} fontFamily="'Gowun Dodum', sans-serif">{ab}</text>
    </svg>
  );
}

// ─── 13. Candlestick Chart ──────────────────────────────────────────────────
export function CandlestickChart({ data }: { data: { label: string; open: number; high: number; low: number; close: number }[] }) {
  const w = 520, h = 260, pad = { t: 16, r: 16, b: 32, l: 48 };
  const max = Math.max(...data.map((d) => d.high), 1);
  const min = Math.min(...data.map((d) => d.low), 0);
  const range = max - min || 1;
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;
  const bw = (chartW / data.length) * 0.5;

  return (
    <svg {...svgProps(w, h)}>
      {data.map((d, i) => {
        const x = pad.l + i * (chartW / data.length) + (chartW / data.length) / 2;
        const up = d.close >= d.open;
        const color = up ? DANCHEONG : INK;
        const bodyTop = pad.t + chartH - ((Math.max(d.open, d.close) - min) / range) * chartH;
        const bodyBot = pad.t + chartH - ((Math.min(d.open, d.close) - min) / range) * chartH;
        const highY = pad.t + chartH - ((d.high - min) / range) * chartH;
        const lowY = pad.t + chartH - ((d.low - min) / range) * chartH;
        return (
          <g key={i}>
            <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth={1} />
            <rect x={x - bw / 2} y={bodyTop} width={bw} height={Math.max(bodyBot - bodyTop, 1)} fill={up ? color : "#F7F7F2"} stroke={color} strokeWidth={1} />
            <text x={x} y={h - 8} textAnchor="middle" fontSize={9} fill={INK_MUTED} fontFamily="'Gowun Dodum', sans-serif">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── 14. Waterfall Chart ────────────────────────────────────────────────────
export function WaterfallChart({ data }: { data: { label: string; value: number }[] }) {
  const w = 480, h = 260, pad = { t: 16, r: 16, b: 40, l: 48 };
  const max = Math.max(...data.map((d) => Math.abs(d.value)), 1);
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;
  const barW = (chartW / data.length) * 0.6;
  const yBase = pad.t + chartH / 2;

  return (
    <svg {...svgProps(w, h)}>
      <line x1={pad.l} y1={yBase} x2={pad.l + chartW} y2={yBase} stroke={HAIRLINE} strokeWidth={1} strokeDasharray="4 4" />
      {data.map((d, i) => {
        const x = pad.l + i * (chartW / data.length) + (chartW / data.length - barW) / 2;
        const bh = (d.value / max) * (chartH / 2);
        const y = d.value >= 0 ? yBase - bh : yBase;
        const color = d.value >= 0 ? JADE : DANCHEONG;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={Math.abs(bh)} fill={color} opacity={0.7} rx={2} />
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={10} fill={INK} fontFamily="'Gowun Dodum', sans-serif">{d.value > 0 ? `+${d.value}` : d.value}</text>
            <text x={x + barW / 2} y={h - 8} textAnchor="middle" fontSize={9} fill={INK_MUTED} fontFamily="'Gowun Dodum', sans-serif">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
