import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getCachedData } from '@/lib/api';
import {
  Coins,
  Ruler,
  Zap,
  ArrowUpDown,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface OpenRouterPricing {
  prompt: string;
  completion: string;
  input_cache_read?: string;
}

interface OpenRouterArchitecture {
  modality: string;
  input_modalities: string[];
  output_modalities: string[];
  tokenizer?: string;
  instruct_type?: string | null;
}

interface OpenRouterTopProvider {
  context_length?: number;
  max_completion_tokens?: number;
  is_moderated?: boolean;
}

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: OpenRouterPricing;
  architecture: OpenRouterArchitecture;
  top_provider?: OpenRouterTopProvider;
  reasoning?: { mandatory: boolean; default_enabled: boolean };
}

interface OpenRouterResponse {
  data: OpenRouterModel[];
}

/** Data shape after parsing */
interface ModelChartData {
  id: string;
  name: string;
  provider: string;
  context_length: number;
  promptPrice: number;
  completionPrice: number;
  pricePer1M: number;
  maxCompletionTokens: number;
}

/* ------------------------------------------------------------------ */
/*  Metric type & config                                              */
/* ------------------------------------------------------------------ */

type MetricKey = 'price' | 'context' | 'speed';

interface MetricConfig {
  key: MetricKey;
  label: string;
  icon: React.ReactNode;
  unit: string;
  getValue: (m: ModelChartData) => number;
  format: (v: number) => string;
  color: string;
}

const METRICS: MetricConfig[] = [
  {
    key: 'price',
    label: 'Preço',
    icon: <Coins className="h-4 w-4" />,
    unit: '/1M tokens',
    getValue: (m) => m.pricePer1M,
    format: (v) => `$${v.toFixed(2)}`,
    color: 'from-emerald-500/80 to-emerald-600',
  },
  {
    key: 'context',
    label: 'Contexto',
    icon: <Ruler className="h-4 w-4" />,
    unit: 'tokens',
    getValue: (m) => m.context_length,
    format: (v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : `${v}`),
    color: 'from-violet-500/80 to-violet-600',
  },
  {
    key: 'speed',
    label: 'Velocidade',
    icon: <Zap className="h-4 w-4" />,
    unit: 'max tokens',
    getValue: (m) => m.maxCompletionTokens,
    format: (v) => (v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : `${v}`),
    color: 'from-sky-500/80 to-sky-600',
  },
];

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const API_URL = 'https://openrouter.ai/api/v1/models';
const CACHE_KEY = 'opendex_model_comparison_data';
const CACHE_TTL = 5 * 60 * 1000;
const TOP_BAR_COUNT = 20;
const SCATTER_MAX = 50;

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function extractProvider(id: string): string {
  const parts = id.split('/');
  return parts.length >= 2 ? parts[0] : 'unknown';
}

function parseModel(raw: OpenRouterModel): ModelChartData {
  const promptPrice = parseFloat(raw.pricing.prompt) || 0;
  const completionPrice = parseFloat(raw.pricing.completion) || 0;
  return {
    id: raw.id,
    name: raw.name,
    provider: extractProvider(raw.id),
    context_length: raw.context_length ?? 0,
    promptPrice,
    completionPrice,
    pricePer1M: (promptPrice + completionPrice) * 1_000_000,
    maxCompletionTokens: raw.top_provider?.max_completion_tokens ?? 0,
  };
}

/** Robust fetch: try static JSON, fallback to API */
async function fetchModels(): Promise<OpenRouterModel[]> {
  // Try static data bundled at build time
  try {
    const mod = await import('@/data/openrouter/models.json');
    const data = mod.default as OpenRouterModel[];
    if (data && data.length > 0) return data;
  } catch {
    // file not found or empty — fall through
  }

  // Fallback: live API via cache
  const fetcher = async (): Promise<OpenRouterModel[]> => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
    const json: OpenRouterResponse = await res.json();
    return json.data ?? [];
  };

  return getCachedData(CACHE_KEY, fetcher, CACHE_TTL);
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function MetricSelector({
  active,
  onChange,
}: {
  active: MetricKey;
  onChange: (k: MetricKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {METRICS.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all',
            active === m.key
              ? 'border-primary/40 bg-primary/10 text-primary shadow-sm'
              : 'border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-card-foreground',
          )}
        >
          {m.icon}
          {m.label}
          <span className="text-[10px] opacity-60 hidden sm:inline">{m.unit}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Horizontal Bar Chart (CSS puro) ---------- */

function BarChart({
  models,
  metric,
}: {
  models: ModelChartData[];
  metric: MetricConfig;
}) {
  const sorted = useMemo(
    () => [...models].sort((a, b) => metric.getValue(b) - metric.getValue(a)).slice(0, TOP_BAR_COUNT),
    [models, metric],
  );

  const maxValue = sorted.length > 0 ? metric.getValue(sorted[0]) : 1;

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border/50 py-12 text-sm text-muted-foreground">
        Nenhum dado disponível para esta métrica.
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
      {sorted.map((model, i) => {
        const value = metric.getValue(model);
        const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const intensity = maxValue > 0 ? value / maxValue : 0;
        const barOpacity = 0.2 + intensity * 0.6;

        return (
          <div key={model.id} className="group flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/40">
            {/* Rank */}
            <span className="w-5 text-right text-[11px] font-mono text-muted-foreground/70">
              {i + 1}
            </span>

            {/* Model name */}
            <span className="w-36 shrink-0 truncate text-sm font-medium text-card-foreground group-hover:text-primary transition-colors" title={model.name}>
              {model.name}
            </span>

            {/* Bar container */}
            <div className="flex-1 h-5 relative">
              <div
                className="h-full rounded-r-md rounded-l-sm transition-all duration-500 ease-out"
                style={{
                  width: `${Math.max(pct, 1)}%`,
                  backgroundColor: `hsl(var(--primary) / ${barOpacity})`,
                }}
              />
            </div>

            {/* Value */}
            <span className="w-24 shrink-0 text-right text-xs font-mono font-medium text-card-foreground tabular-nums">
              {metric.format(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Scatter Plot (SVG puro) ---------- */

function ScatterPlot({ models }: { models: ModelChartData[] }) {
  const svgW = 700;
  const svgH = 420;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 50;

  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  // Select top ~50 models with most extreme values for interesting spread
  const points = useMemo(() => {
    // Filter out models with zero context or zero price
    const valid = models.filter(
      (m) => m.context_length > 0 && m.pricePer1M > 0 && m.maxCompletionTokens > 0,
    );

    // Sort by "relevance": non-zero data + sort so we get a good spread
    const sorted = [...valid].sort(
      (a, b) => b.context_length * b.maxCompletionTokens - a.context_length * a.maxCompletionTokens,
    );

    return sorted.slice(0, SCATTER_MAX);
  }, [models]);

  // Compute scales
  const scales = useMemo(() => {
    if (points.length === 0) return null;

    // X = price (log-like, but use linear for simplicity with outlier clipping)
    const prices = points.map((p) => p.pricePer1M);
    const ctxs = points.map((p) => p.context_length);
    const comps = points.map((p) => p.completionPrice);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minCtx = Math.min(...ctxs);
    const maxCtx = Math.max(...ctxs);
    const maxComp = Math.max(...comps);

    const xRange = maxPrice - minPrice || 1;
    const yRange = maxCtx - minCtx || 1;

    const xScale = (v: number) => padL + ((v - minPrice) / xRange) * plotW;
    const yScale = (v: number) => padT + plotH - ((v - minCtx) / yRange) * plotH;
    const rScale = (v: number) => {
      const ratio = maxComp > 0 ? v / maxComp : 0;
      return 3 + ratio * 14; // radius 3 to 17px
    };

    return { xScale, yScale, rScale, minPrice, maxPrice, minCtx, maxCtx, maxComp };
  }, [points, plotW, plotH]);

  const [tooltip, setTooltip] = useState<{
    model: ModelChartData;
    x: number;
    y: number;
  } | null>(null);

  if (points.length === 0 || !scales) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border/50 py-12 text-sm text-muted-foreground">
        Dados insuficientes para o gráfico de dispersão.
      </div>
    );
  }

  const { xScale, yScale, rScale, minPrice, maxPrice, minCtx, maxCtx } = scales;

  // Y-axis ticks (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = minCtx + ((maxCtx - minCtx) * (4 - i)) / 4;
    return { val, y: padT + (plotH * i) / 4 };
  });

  // X-axis ticks (5 ticks)
  const xTicks = Array.from({ length: 5 }, (_, i) => {
    const val = minPrice + ((maxPrice - minPrice) * i) / 4;
    return { val, x: padL + (plotW * i) / 4 };
  });

  const formatAxisPrice = (v: number) =>
    v < 0.01 ? `$${v.toFixed(4)}` : v < 1 ? `$${v.toFixed(2)}` : `$${v.toFixed(1)}`;

  const formatAxisCtx = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : `${v}`;

  return (
    <div className="relative overflow-x-auto">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-3xl mx-auto"
        role="img"
        aria-label="Gráfico de dispersão: Preço vs Contexto"
      >
        {/* Y-axis label */}
        <text
          x="14"
          y={padT + plotH / 2}
          text-anchor="middle"
          className="fill-muted-foreground text-[11px] font-medium"
          transform={`rotate(-90, 14, ${padT + plotH / 2})`}
        >
          Contexto (tokens)
        </text>

        {/* X-axis label */}
        <text
          x={padL + plotW / 2}
          y={svgH - 8}
          text-anchor="middle"
          className="fill-muted-foreground text-[11px] font-medium"
        >
          Preço por 1M tokens (USD)
        </text>

        {/* Y-axis ticks & gridlines */}
        {yTicks.map((tick) => (
          <g key={`yt-${tick.val}`}>
            <line
              x1={padL}
              y1={tick.y}
              x2={padL + plotW}
              y2={tick.y}
              className="stroke-border/40"
              strokeWidth="0.5"
            />
            <text
              x={padL - 6}
              y={tick.y + 3}
              text-anchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {formatAxisCtx(tick.val)}
            </text>
          </g>
        ))}

        {/* X-axis ticks & gridlines */}
        {xTicks.map((tick) => (
          <g key={`xt-${tick.val}`}>
            <line
              x1={tick.x}
              y1={padT}
              x2={tick.x}
              y2={padT + plotH}
              className="stroke-border/40"
              strokeWidth="0.5"
            />
            <text
              x={tick.x}
              y={padT + plotH + 16}
              text-anchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {formatAxisPrice(tick.val)}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={padT + plotH}
          className="stroke-border/60"
          strokeWidth="1"
        />
        <line
          x1={padL}
          y1={padT + plotH}
          x2={padL + plotW}
          y2={padT + plotH}
          className="stroke-border/60"
          strokeWidth="1"
        />

        {/* Bubbles */}
        {points.map((model) => {
          const cx = xScale(model.pricePer1M);
          const cy = yScale(model.context_length);
          const r = rScale(model.completionPrice);
          const isHovered = tooltip?.model.id === model.id;

          return (
            <g key={model.id}>
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? r + 2 : r}
                className="fill-primary/60 hover:fill-primary/90 transition-all cursor-pointer"
                stroke={isHovered ? 'hsl(var(--primary))' : 'none'}
                strokeWidth={isHovered ? 1.5 : 0}
                onMouseEnter={(e) => {
                  const rect = (e.target as SVGCircleElement).closest('svg')?.getBoundingClientRect();
                  setTooltip({ model, x: cx, y: cy });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            </g>
          );
        })}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect
              x={Math.min(tooltip.x + 12, svgW - 180)}
              y={Math.max(tooltip.y - 50, 4)}
              width="170"
              height="44"
              rx="6"
              className="fill-background stroke-border/60"
              strokeWidth="1"
              filter="url(#shadow)"
            />
            <text
              x={Math.min(tooltip.x + 18, svgW - 174)}
              y={Math.max(tooltip.y - 32, 16)}
              className="fill-foreground text-[11px] font-semibold"
            >
              {tooltip.model.name.length > 22
                ? tooltip.model.name.slice(0, 22) + '…'
                : tooltip.model.name}
            </text>
            <text
              x={Math.min(tooltip.x + 18, svgW - 174)}
              y={Math.max(tooltip.y - 16, 32)}
              className="fill-muted-foreground text-[10px]"
            >
              Preço: ${tooltip.model.pricePer1M.toFixed(2)} · Contexto: {formatAxisCtx(tooltip.model.context_length)}
            </text>
          </g>
        )}

        {/* Shadow filter */}
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="130%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

/* ---------- Comparison Table ---------- */

type SortCol = 'name' | 'provider' | 'promptPrice' | 'completionPrice' | 'context';
type SortDir = 'asc' | 'desc';

function ComparisonTable({ models }: { models: ModelChartData[] }) {
  const [sortCol, setSortCol] = useState<SortCol>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = useCallback(
    (col: SortCol) => {
      if (sortCol === col) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortCol(col);
        setSortDir(col === 'name' ? 'asc' : 'desc');
      }
    },
    [sortCol],
  );

  const sorted = useMemo(() => {
    const arr = [...models];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortCol) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'provider':
          cmp = a.provider.localeCompare(b.provider);
          break;
        case 'promptPrice':
          cmp = a.promptPrice - b.promptPrice;
          break;
        case 'completionPrice':
          cmp = a.completionPrice - b.completionPrice;
          break;
        case 'context':
          cmp = a.context_length - b.context_length;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [models, sortCol, sortDir]);

  const SortIcon = ({ col }: { col: SortCol }) => {
    if (sortCol !== col) return <ArrowUpDown className="ml-1 h-3 w-3 inline opacity-30" />;
    return (
      <span className="ml-1 inline-block text-primary">
        {sortDir === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  const formatPriceShort = (v: number) => {
    if (v === 0) return 'Free';
    if (v < 0.000001) return `$${v.toExponential(0)}`;
    if (v < 0.001) return `$${(v * 1_000_000).toFixed(2)}/M`;
    return `$${v.toFixed(4)}`;
  };

  if (models.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border/50 py-12 text-sm text-muted-foreground">
        Nenhum modelo para exibir.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-muted/30">
            <th
              className="cursor-pointer px-4 py-3 text-left text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => handleSort('name')}
            >
              Modelo <SortIcon col="name" />
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => handleSort('provider')}
            >
              Provedor <SortIcon col="provider" />
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => handleSort('promptPrice')}
            >
              Preço (prompt) <SortIcon col="promptPrice" />
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => handleSort('completionPrice')}
            >
              Preço (completion) <SortIcon col="completionPrice" />
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => handleSort('context')}
            >
              Contexto <SortIcon col="context" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((model) => (
            <tr
              key={model.id}
              className="border-b border-border/30 transition-colors hover:bg-muted/40 last:border-none"
            >
              <td className="px-4 py-2.5 text-sm font-medium text-card-foreground truncate max-w-[200px]" title={model.name}>
                {model.name}
              </td>
              <td className="px-4 py-2.5 text-sm text-muted-foreground capitalize">
                {model.provider}
              </td>
              <td className="px-4 py-2.5 text-right text-sm font-mono tabular-nums text-card-foreground">
                {formatPriceShort(model.promptPrice)}
              </td>
              <td className="px-4 py-2.5 text-right text-sm font-mono tabular-nums text-card-foreground">
                {formatPriceShort(model.completionPrice)}
              </td>
              <td className="px-4 py-2.5 text-right text-sm font-mono tabular-nums text-muted-foreground">
                {model.context_length >= 1_000_000
                  ? `${(model.context_length / 1_000_000).toFixed(1)}M`
                  : model.context_length >= 1_000
                    ? `${(model.context_length / 1_000).toFixed(0)}K`
                    : `${model.context_length}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Loading skeleton ---------- */

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metric selector skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-28 rounded-lg bg-muted" />
        ))}
      </div>

      {/* Bar chart skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-5 rounded bg-muted" />
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="flex-1 h-5 rounded bg-muted" style={{ opacity: 1 - i * 0.08 }} />
          </div>
        ))}
      </div>

      {/* Scatter skeleton */}
      <div className="h-[420px] rounded-lg bg-muted/50" />

      {/* Table skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 flex-1 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

export default function ModelComparisonChart() {
  const [rawModels, setRawModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<MetricKey>('price');
  const [source, setSource] = useState<'static' | 'live' | 'none'>('none');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchModels();
      if (data && data.length > 0) {
        setRawModels(data);
        setSource('static');
      } else {
        setError('Nenhum modelo disponível.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar dados.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const models = useMemo(() => rawModels.map(parseModel), [rawModels]);
  const metricConfig = METRICS.find((m) => m.key === activeMetric)!;

  /* ---- Loading ---- */
  if (isLoading && models.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 bg-card p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  /* ---- Error (no data at all) ---- */
  if (error && models.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 bg-card p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Dados temporariamente indisponíveis
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  /* ---- Empty state ---- */
  if (models.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 bg-card p-8 text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-muted p-4">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-card-foreground">
          Nenhum dado disponível
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Os dados dos modelos serão carregados quando disponíveis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Source indicator */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <MetricSelector active={activeMetric} onChange={setActiveMetric} />
        <div className="flex items-center gap-2">
          {source === 'static' && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Dados estáticos
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">
            {models.length} modelos
          </span>
        </div>
      </div>

      {/* Error banner (non-blocking) */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>
            {error} — exibindo dados em cache.
          </span>
          <button
            onClick={loadData}
            className="ml-auto flex items-center gap-1 text-xs font-medium text-destructive underline underline-offset-2"
          >
            <RefreshCw className="h-3 w-3" />
            Atualizar
          </button>
        </div>
      )}

      {/* Section: Bar Chart */}
      <section className="rounded-lg border border-border/50 bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-card-foreground">
              Top {TOP_BAR_COUNT} — {metricConfig.label}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Modelos ordenados por {metricConfig.label.toLowerCase()} ({metricConfig.unit})
            </p>
          </div>
        </div>
        <BarChart models={models} metric={metricConfig} />
      </section>

      {/* Section: Scatter Plot */}
      <section className="rounded-lg border border-border/50 bg-card p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-card-foreground">
            Dispersão: Preço vs Contexto
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bolhas proporcionais ao preço de completion. Passe o mouse para detalhes.
          </p>
        </div>
        <ScatterPlot models={models} />
      </section>

      {/* Section: Table */}
      <section className="rounded-lg border border-border/50 bg-card p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-card-foreground">
            Tabela Comparativa
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Clique nos cabeçalhos para ordenar. {models.length} modelos no total.
          </p>
        </div>
        <ComparisonTable models={models} />
      </section>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/70">
        <ExternalLink className="h-3 w-3" />
        <span>
          Dados via{' '}
          <a
            href="https://openrouter.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            OpenRouter API
          </a>
        </span>
      </div>
    </div>
  );
}
