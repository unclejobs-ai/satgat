export type SatgatVisualKind =
  | 'bar'
  | 'bar-horizontal'
  | 'line'
  | 'donut'
  | 'waterfall'
  | 'timeline'
  | 'flow'
  | 'architecture'
  | 'quadrant'
  | 'venn'
  | 'swimlane'
  | 'tree'
  | 'layer-stack'
  | 'candlestick';

export type SatgatVisualDatum = Record<string, string | number | boolean | null | undefined>;

export interface SatgatVisualSlot {
  kind: SatgatVisualKind;
  title?: string;
  caption?: string;
  data?: SatgatVisualDatum[];
  steps?: string[];
  nodes?: string[];
  edges?: [number, number][];
  lanes?: string[];
  phases?: { name: string; lane: number; start: number; end: number }[];
  quadrants?: { tl: string; tr: string; bl: string; br: string; xLabel?: string; yLabel?: string };
  venn?: { a: string; b: string; ab: string };
  tree?: { root: string; children: { name: string; sub?: string[] }[] };
  layers?: { name: string }[];
}

const KIND_ALIASES: Record<string, SatgatVisualKind> = {
  bar: 'bar',
  bars: 'bar',
  column: 'bar',
  'bar-chart': 'bar',
  막대: 'bar',
  막대차트: 'bar',
  'horizontal-bar': 'bar-horizontal',
  horizontal: 'bar-horizontal',
  가로막대: 'bar-horizontal',
  line: 'line',
  trend: 'line',
  'line-chart': 'line',
  선: 'line',
  선차트: 'line',
  추이: 'line',
  donut: 'donut',
  doughnut: 'donut',
  pie: 'donut',
  도넛: 'donut',
  비중: 'donut',
  waterfall: 'waterfall',
  waterfallchart: 'waterfall',
  폭포: 'waterfall',
  증감: 'waterfall',
  timeline: 'timeline',
  history: 'timeline',
  roadmap: 'timeline',
  연혁: 'timeline',
  일정: 'timeline',
  flow: 'flow',
  flowchart: 'flow',
  process: 'flow',
  흐름도: 'flow',
  프로세스: 'flow',
  architecture: 'architecture',
  system: 'architecture',
  map: 'architecture',
  구성도: 'architecture',
  구조도: 'architecture',
  quadrant: 'quadrant',
  matrix: 'quadrant',
  사분면: 'quadrant',
  매트릭스: 'quadrant',
  venn: 'venn',
  벤: 'venn',
  교집합: 'venn',
  swimlane: 'swimlane',
  gantt: 'swimlane',
  간트: 'swimlane',
  tree: 'tree',
  hierarchy: 'tree',
  조직도: 'tree',
  계층도: 'tree',
  'layer-stack': 'layer-stack',
  layer: 'layer-stack',
  layers: 'layer-stack',
  stack: 'layer-stack',
  레이어: 'layer-stack',
  candlestick: 'candlestick',
  candle: 'candlestick',
  주가: 'candlestick',
};

const LABEL_KEYS = ['label', 'name', 'title', 'metric', 'category', 'period', 'month', 'week', 'year', 'stage'];
const VALUE_KEYS = ['value', 'amount', 'score', 'count', 'rate', 'percent', 'ratio', 'revenue', 'users', 'volume'];

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function text(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function firstText(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = text(record[key]);
    if (value) return value;
  }
  return '';
}

function numberValue(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.replaceAll(',', '').replace(/[^\d.+-]/g, '');
    const parsed = Number.parseFloat(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function firstNumber(record: Record<string, unknown>, keys: string[], fallback: number): number {
  for (const key of keys) {
    if (!(key in record)) continue;
    const value = numberValue(record[key], Number.NaN);
    if (Number.isFinite(value)) return value;
  }
  return fallback;
}

function normalizeKind(value: unknown): SatgatVisualKind {
  const key = text(value).toLowerCase().replace(/\s+/g, '-');
  return KIND_ALIASES[key] ?? 'bar';
}

function normalizeData(raw: unknown): SatgatVisualDatum[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => {
      const parsed = parseMaybeJson(item);
      if (typeof parsed === 'string') {
        return { label: parsed, value: index + 1 };
      }
      if (typeof parsed === 'number') {
        return { label: String(index + 1), value: parsed };
      }

      const record = asRecord(parsed);
      if (!record) return undefined;

      const label = firstText(record, LABEL_KEYS) || String(index + 1);
      const value = firstNumber(record, VALUE_KEYS, index + 1);
      return {
        ...record,
        label,
        value,
      } as SatgatVisualDatum;
    })
    .filter((item): item is SatgatVisualDatum => Boolean(item));
}

function normalizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(text).filter(Boolean);
}

function normalizeEdges(raw: unknown, nodes: string[]): [number, number][] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((edge) => {
      if (Array.isArray(edge)) {
        const from = numberValue(edge[0], -1);
        const to = numberValue(edge[1], -1);
        return [from, to] as [number, number];
      }

      const record = asRecord(edge);
      if (!record) return undefined;
      const fromRaw = record.from ?? record.source ?? record.start;
      const toRaw = record.to ?? record.target ?? record.end;
      const fromText = text(fromRaw);
      const toText = text(toRaw);
      const from = fromText ? nodes.indexOf(fromText) : numberValue(fromRaw, -1);
      const to = toText ? nodes.indexOf(toText) : numberValue(toRaw, -1);
      return [from, to] as [number, number];
    })
    .filter((edge): edge is [number, number] => Array.isArray(edge) && edge[0] >= 0 && edge[1] >= 0);
}

function normalizeQuadrants(record: Record<string, unknown>, data: SatgatVisualDatum[]) {
  const quadrants = asRecord(record.quadrants);
  if (quadrants) {
    return {
      tl: text(quadrants.tl ?? quadrants.topLeft) || '높은 가치',
      tr: text(quadrants.tr ?? quadrants.topRight) || '우선 실행',
      bl: text(quadrants.bl ?? quadrants.bottomLeft) || '관찰',
      br: text(quadrants.br ?? quadrants.bottomRight) || '효율화',
      xLabel: text(quadrants.xLabel ?? quadrants.x_axis),
      yLabel: text(quadrants.yLabel ?? quadrants.y_axis),
    };
  }

  return {
    tl: text(data[0]?.label) || '고객 가치',
    tr: text(data[1]?.label) || '성장 여지',
    bl: text(data[2]?.label) || '운영 부담',
    br: text(data[3]?.label) || '즉시 효과',
    xLabel: text(record.xLabel ?? record.x_axis) || '실행 난도',
    yLabel: text(record.yLabel ?? record.y_axis) || '사업 효과',
  };
}

function normalizeVenn(record: Record<string, unknown>, data: SatgatVisualDatum[]) {
  const venn = asRecord(record.venn);
  return {
    a: text(venn?.a ?? record.a ?? data[0]?.label) || '시장',
    b: text(venn?.b ?? record.b ?? data[1]?.label) || '제품',
    ab: text(venn?.ab ?? record.ab ?? record.overlap ?? data[2]?.label) || '기회',
  };
}

function normalizePhases(raw: unknown, lanes: string[]): { name: string; lane: number; start: number; end: number }[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => {
      const record = asRecord(parseMaybeJson(item));
      if (!record) return undefined;
      const laneText = text(record.lane);
      const lane = laneText ? lanes.indexOf(laneText) : numberValue(record.lane, index % Math.max(lanes.length, 1));
      const start = Math.max(0, Math.min(1, numberValue(record.start, index / Math.max(raw.length, 1))));
      const end = Math.max(start + 0.08, Math.min(1, numberValue(record.end, start + 0.28)));

      return {
        name: firstText(record, ['name', 'title', 'label', 'phase']) || `단계 ${index + 1}`,
        lane: Math.max(0, lane),
        start,
        end: Math.min(1, end),
      };
    })
    .filter((item): item is { name: string; lane: number; start: number; end: number } => Boolean(item));
}

function normalizeTree(record: Record<string, unknown>, data: SatgatVisualDatum[]) {
  const tree = asRecord(record.tree);
  const rawChildren = Array.isArray(tree?.children) ? tree.children : Array.isArray(record.children) ? record.children : data;

  return {
    root: text(tree?.root ?? record.root ?? record.title) || '핵심',
    children: rawChildren.slice(0, 4).map((item, index) => {
      const child = asRecord(item);
      const subRaw = Array.isArray(child?.sub) ? child.sub : Array.isArray(child?.children) ? child.children : [];
      return {
        name: firstText(child ?? {}, ['name', 'title', 'label']) || text(item) || `항목 ${index + 1}`,
        sub: normalizeStringArray(subRaw).slice(0, 3),
      };
    }),
  };
}

export function normalizeVisualSlot(value: unknown): SatgatVisualSlot | undefined {
  const parsed = parseMaybeJson(value);
  const record = Array.isArray(parsed) ? { kind: 'bar', data: parsed } : asRecord(parsed);
  if (!record) return undefined;

  const kind = normalizeKind(record.kind ?? record.type ?? record.chart_type ?? record.diagram_type);
  const data = normalizeData(record.data ?? record.items ?? record.series ?? record.values ?? record.rows);
  const steps = normalizeStringArray(record.steps ?? record.flow ?? record.process);
  const nodes = normalizeStringArray(record.nodes).length
    ? normalizeStringArray(record.nodes)
    : data.map((item) => text(item.label)).filter(Boolean);
  const lanes = normalizeStringArray(record.lanes).length
    ? normalizeStringArray(record.lanes)
    : [...new Set(data.map((item) => text(item.lane)).filter(Boolean))];

  return {
    kind,
    title: text(record.title ?? record.name),
    caption: text(record.caption ?? record.note ?? record.source),
    data,
    steps: steps.length ? steps : data.map((item) => text(item.label)).filter(Boolean),
    nodes,
    edges: normalizeEdges(record.edges ?? record.links, nodes),
    lanes,
    phases: normalizePhases(record.phases ?? record.data ?? record.items, lanes.length ? lanes : ['기획', '실행', '검토']),
    quadrants: normalizeQuadrants(record, data),
    venn: normalizeVenn(record, data),
    tree: normalizeTree(record, data),
    layers: normalizeStringArray(record.layers).map((name) => ({ name })),
  };
}
