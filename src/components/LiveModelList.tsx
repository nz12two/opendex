import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Brain,
  Search,
  X,
  ChevronDown,
  Sparkles,
  Zap,
  Eye,
  AlertCircle,
  RefreshCw,
  Server,
  Cpu,
  Coins,
  ExternalLink,
  Gauge,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCachedData } from '@/lib/api';
import SkeletonCard from './ui/SkeletonCard';

/* ------------------------------------------------------------------ */
/*  Types — OpenRouter API shape                                      */
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

interface OpenRouterReasoning {
  mandatory: boolean;
  default_enabled: boolean;
}

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: OpenRouterPricing;
  architecture: OpenRouterArchitecture;
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  reasoning?: OpenRouterReasoning;
}

interface OpenRouterResponse {
  data: OpenRouterModel[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const CACHE_KEY = 'opendex_openrouter_models';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const API_URL = 'https://openrouter.ai/api/v1/models';
const PAGE_SIZE = 20;

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Extract provider name from model id (e.g. "google/gemini-3.6-flash" → "google") */
function extractProvider(id: string): string {
  const parts = id.split('/');
  return parts.length >= 2 ? parts[0] : 'unknown';
}

/** Format pricing string from numeric string */
function formatPrice(priceStr: string): string {
  const n = parseFloat(priceStr);
  if (n === 0) return 'Free';
  if (n < 0.000001) return `$${n.toExponential(0)}`;
  if (n < 0.001) return `$${(n * 1_000_000).toFixed(2)}/M`;
  return `$${n.toFixed(4)}`;
}

/** Format context length for display */
function formatContext(ctx: number): string {
  if (ctx >= 1_000_000) {
    const m = ctx / 1_000_000;
    return m >= 10 ? `${m.toFixed(0)}M` : `${m.toFixed(1)}M`;
  }
  if (ctx >= 1_000) return `${(ctx / 1_000).toFixed(0)}K`;
  return `${ctx}`;
}

/** Check if a model is "fast" based on name keywords */
function isFast(name: string): boolean {
  const lower = name.toLowerCase();
  return /mini|haiku|flash|small/.test(lower);
}

/** Provider colour dot */
function providerColor(provider: string): string {
  const colors: Record<string, string> = {
    google: 'bg-blue-500',
    openai: 'bg-emerald-500',
    anthropic: 'bg-amber-500',
    meta: 'bg-indigo-500',
    mistral: 'bg-cyan-500',
    deepseek: 'bg-orange-500',
    cohere: 'bg-rose-500',
    microsoft: 'bg-teal-500',
    amazon: 'bg-violet-500',
  };
  return colors[provider] ?? 'bg-muted-foreground';
}

/* ------------------------------------------------------------------ */
/*  Fetch                                                             */
/* ------------------------------------------------------------------ */

async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error(`Erro ${res.status}: ${res.statusText}`);
  }
  const json: OpenRouterResponse = await res.json();
  return json.data;
}

/* ------------------------------------------------------------------ */
/*  Filter type                                                        */
/* ------------------------------------------------------------------ */

type FilterKey = 'free' | 'paid' | 'vision' | 'reasoning' | 'fast' | 'longContext';

const FILTER_LABELS: Record<FilterKey, string> = {
  free: 'Free',
  paid: 'Pago',
  vision: 'Vision',
  reasoning: 'Reasoning',
  fast: 'Rápido',
  longContext: 'Long Context',
};

const FILTER_ICONS: Record<FilterKey, React.ReactNode> = {
  free: <Coins className="h-3.5 w-3.5" />,
  paid: <Sparkles className="h-3.5 w-3.5" />,
  vision: <Eye className="h-3.5 w-3.5" />,
  reasoning: <Brain className="h-3.5 w-3.5" />,
  fast: <Zap className="h-3.5 w-3.5" />,
  longContext: <Server className="h-3.5 w-3.5" />,
};

/* ------------------------------------------------------------------ */
/*  Skeleton                                                          */
/* ------------------------------------------------------------------ */

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ModelCard                                                         */
/* ------------------------------------------------------------------ */

function ModelCard({ model }: { model: OpenRouterModel }) {
  const provider = extractProvider(model.id);
  const promptPrice = parseFloat(model.pricing.prompt);
  const isModelFree = promptPrice === 0;

  return (
    <div className="group relative flex flex-col rounded-lg border border-border/50 bg-card p-5 card-hover">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full shrink-0', providerColor(provider))} />
            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors text-sm truncate">
              {model.name}
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground capitalize">
            {provider}
          </p>
        </div>
      </div>

      {/* Description */}
      {model.description && (
        <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {model.description.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')}
        </p>
      )}

      {/* Badges */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {/* Free / Paid badge */}
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
            isModelFree
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          )}
        >
          {isModelFree ? 'Free' : 'Pago'}
        </span>

        {/* Context badge */}
        <span className="inline-flex items-center rounded-full border border-border/30 bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Gauge className="mr-1 h-3 w-3" />
          {formatContext(model.context_length)}
        </span>

        {/* Vision badge */}
        {model.architecture?.input_modalities?.includes('image') && (
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
            <Eye className="h-3 w-3" /> Vision
          </span>
        )}

        {/* Reasoning badge */}
        {model.reasoning?.default_enabled && (
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
            <Brain className="h-3 w-3" /> Reasoning
          </span>
        )}

        {/* Fast badge */}
        {isFast(model.name) && (
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
            <Zap className="h-3 w-3" /> Fast
          </span>
        )}
      </div>

      {/* Pricing details */}
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-md bg-muted/30 p-2.5 text-[11px]">
        <div>
          <span className="text-muted-foreground">Prompt:</span>{' '}
          <span className="font-medium text-card-foreground">
            {formatPrice(model.pricing.prompt)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Completion:</span>{' '}
          <span className="font-medium text-card-foreground">
            {formatPrice(model.pricing.completion)}
          </span>
        </div>
      </div>

      {/* Model ID */}
      <div className="mt-2 text-[10px] text-muted-foreground/70 truncate" title={model.id}>
        <Cpu className="mr-1 inline-block h-3 w-3" />
        {model.id}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ActiveFilterTag                                                    */
/* ------------------------------------------------------------------ */

function ActiveFilterTag({
  filter,
  onRemove,
}: {
  filter: FilterKey;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
    >
      {FILTER_ICONS[filter]}
      {FILTER_LABELS[filter]}
      <X className="h-3 w-3" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function LiveModelList() {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'static' | 'live' | 'none'>('none');
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /* ---- Load static data (import from JSON bundled at build time) ---- */
  const loadStatic = useCallback(async (): Promise<boolean> => {
    try {
      // Dynamic import resolvido pelo Vite no build — se o JSON existir,
      // os dados já vêm inclusos no bundle estático
      const mod = await import('@/data/openrouter/models.json');
      const data = mod.default as OpenRouterModel[];
      if (data && data.length > 0) {
        setModels(data);
        setSource('static');
        return true;
      }
      return false;
    } catch {
      return false; // arquivo não existe ou falhou ao carregar
    }
  }, []);

  /* ---- Fetch from OpenRouter API ---- */
  const loadFromAPI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCachedData(CACHE_KEY, fetchOpenRouterModels, CACHE_TTL);
      setModels(data);
      setSource('live');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao carregar modelos do OpenRouter',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ---- Initialisation: static primero, fallback API ---- */
  const init = useCallback(async () => {
    setIsLoading(true);
    const loaded = await loadStatic();
    if (!loaded) {
      await loadFromAPI();
    } else {
      setIsLoading(false);
    }
  }, [loadStatic, loadFromAPI]);

  useEffect(() => {
    init();
  }, [init]);

  /* ---- Toggle filter ---- */
  const toggleFilter = useCallback((key: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setVisibleCount(PAGE_SIZE); // reset pagination
  }, []);

  /* ---- Filtered + searched models ---- */
  const filteredModels = useMemo(() => {
    let result = models;

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          extractProvider(m.id).toLowerCase().includes(q),
      );
    }

    // Category filters
    if (activeFilters.size > 0) {
      result = result.filter((m) => {
        const promptPrice = parseFloat(m.pricing.prompt);
        const modalities = m.architecture?.input_modalities ?? [];

        if (activeFilters.has('free') && promptPrice !== 0) return false;
        if (activeFilters.has('paid') && promptPrice === 0) return false;
        if (activeFilters.has('vision') && !modalities.includes('image')) return false;
        if (activeFilters.has('reasoning') && !m.reasoning?.default_enabled) return false;
        if (activeFilters.has('fast') && !isFast(m.name)) return false;
        if (activeFilters.has('longContext') && m.context_length <= 128000) return false;

        return true;
      });
    }

    return result;
  }, [models, search, activeFilters]);

  const visibleModels = filteredModels.slice(0, visibleCount);
  const hasMore = visibleCount < filteredModels.length;

  /* ---- Loading state ---- */
  if (isLoading && models.length === 0) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  /* ---- Error state (no data) ---- */
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
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              {error}
            </p>
          </div>
          <button
            onClick={loadFromAPI}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error banner (non-blocking) */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>
            {error} — exibindo dados em cache.
          </span>
          <button
            onClick={loadFromAPI}
            className="ml-auto flex items-center gap-1 text-xs font-medium text-destructive underline underline-offset-2"
          >
            <RefreshCw className="h-3 w-3" />
            Atualizar
          </button>
        </div>
      )}

      {/* Source indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {source === 'static' && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              📦 Dados estáticos
            </span>
          )}
          {source === 'live' && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              📡 Ao vivo
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {models.length} modelo{models.length !== 1 ? 's' : ''}
          </span>
        </div>
        {source === 'static' && (
          <button
            onClick={loadFromAPI}
            disabled={isLoading}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
            Atualizar da API
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          placeholder="Buscar por nome, ID ou provedor..."
          className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">
          Filtros:
        </span>
        {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
          <button
            key={key}
            onClick={() => toggleFilter(key)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              activeFilters.has(key)
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-card-foreground',
            )}
          >
            {FILTER_ICONS[key]}
            {FILTER_LABELS[key]}
          </button>
        ))}

        {/* Active filter tags */}
        {activeFilters.size > 0 && (
          <>
            <span className="text-xs text-muted-foreground/70 mx-1">|</span>
            <button
              onClick={() => {
                setActiveFilters(new Set());
                setVisibleCount(PAGE_SIZE);
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Limpar filtros
            </button>
          </>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Mostrando {visibleModels.length} de {filteredModels.length} modelos
        {activeFilters.size > 0 && ' (filtrados)'}
      </p>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleModels.map((model, i) => (
          <div
            key={model.id}
            className={cn('animate-in', i < 8 ? `stagger-${i + 1}` : 'stagger-8')}
          >
            <ModelCard model={model} />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {visibleModels.length === 0 && !isLoading && (
        <div className="py-16 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-muted p-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-card-foreground">
            Nenhum modelo encontrado
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Tente ajustar os filtros ou buscar por outro termo.
          </p>
        </div>
      )}

      {/* Show more */}
      {hasMore && (
        <div className="text-center pt-2">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card px-6 py-3 text-sm font-medium text-card-foreground transition-colors hover:border-primary/40 hover:text-primary hover:shadow-sm"
          >
            <ChevronDown className="h-4 w-4" />
            Mostrar mais ({filteredModels.length - visibleCount} restantes)
          </button>
        </div>
      )}

      {/* Footer info */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/70 pt-2">
        <ExternalLink className="h-3 w-3" />
        <span>
          Mostrando {filteredModels.length} modelo{filteredModels.length !== 1 ? 's' : ''} — Fonte:{' '}
          {source === 'live' ? (
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              OpenRouter API
            </a>
          ) : (
            'estática'
          )}
        </span>
      </div>
    </div>
  );
}
