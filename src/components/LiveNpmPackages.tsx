import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package,
  Search,
  ExternalLink,
  AlertCircle,
  SearchX,
  ArrowUpDown,
  X,
  ChevronDown,
  Github,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { packages, type NpmPackage } from '@/data/npm';

/* ------------------------------------------------------------------ */
/*  Types — npm registry API shape                                    */
/* ------------------------------------------------------------------ */

interface NpmRegistryPackage {
  package: {
    name: string;
    version: string;
    description: string;
    keywords?: string[];
    publisher?: { username?: string };
    date: string;
    links?: {
      npm?: string;
      homepage?: string;
      repository?: string;
      bugs?: string;
    };
  };
  downloads?: {
    monthly?: number;
    weekly?: number;
    daily?: number;
  };
}

interface NpmRegistryResponse {
  objects: NpmRegistryPackage[];
  total: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 20;

/* ------------------------------------------------------------------ */
/*  Category definitions                                               */
/* ------------------------------------------------------------------ */

type CategoryKey = 'all' | 'sdk' | 'plugin' | 'ferramenta';

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'sdk', label: 'SDK' },
  { key: 'plugin', label: 'Plugin' },
  { key: 'ferramenta', label: 'Ferramenta' },
];

type SortKey = 'downloads' | 'name' | 'recent';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'downloads', label: 'Mais downloads' },
  { key: 'name', label: 'Nome A-Z' },
  { key: 'recent', label: 'Recentes' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Extract GitHub URL from repository string, or null */
function getGitHubUrl(repo: string | null): string | null {
  if (!repo) return null;
  const match = repo.match(
    /(?:https?:\/\/|git@|git\+https?:\/\/)(?:www\.)?(?:github\.com\/)([^/]+\/[^/.]+)/i,
  );
  if (match) return `https://github.com/${match[1]}`;
  if (repo.includes('github.com')) {
    const m = repo.match(/(https?:\/\/github\.com\/[^/\s]+(?:\/[^/\s]+?)?)/i);
    if (m) return m[1]?.replace(/\.git$/, '');
  }
  return null;
}

/** Format large numbers */
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

/** Format date string to relative */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = Date.now();
    const diff = now - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `Há ${days} dias`;
    if (days < 30) return `Há ${Math.floor(days / 7)} sem.`;
    if (days < 365) return `Há ${Math.floor(days / 30)} meses`;
    return `Há ${Math.floor(days / 365)} anos`;
  } catch {
    return '';
  }
}

/** Categorize a package based on its keywords */
function getPackageCategories(pkg: NpmPackage): CategoryKey[] {
  const cats: CategoryKey[] = [];
  const kw = pkg.keywords.map((k) => k.toLowerCase());

  if (kw.includes('sdk') || kw.includes('api') || kw.includes('client')) {
    cats.push('sdk');
  }
  if (kw.includes('plugin') || kw.includes('extension')) {
    cats.push('plugin');
  }
  if (
    !cats.includes('sdk') &&
    !cats.includes('plugin') &&
    kw.some((k) =>
      [
        'automation',
        'tool',
        'manager',
        'orchestration',
        'sandbox',
        'memory',
        'bridge',
        'router',
        'terminal',
        'scheduler',
        'skill',
        'telemetry',
        'observability',
        'cli',
        'binary',
        'browser',
        'cdp',
        'cron',
        'forge',
        'goal',
        'notifications',
        'optimization',
        'simulation',
        'warp',
      ].includes(k),
    )
  ) {
    cats.push('ferramenta');
  }

  return cats;
}

/** Check if a package matches a given category */
function matchesCategory(pkg: NpmPackage, category: CategoryKey): boolean {
  if (category === 'all') return true;
  return getPackageCategories(pkg).includes(category);
}

/** Sort packages based on selected sort key */
function sortPackages(list: NpmPackage[], sort: SortKey): NpmPackage[] {
  const sorted = [...list];
  switch (sort) {
    case 'downloads':
      return sorted.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'recent':
      return sorted.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    default:
      return sorted;
  }
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                          */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-muted" />
        <div className="h-6 w-20 rounded-full bg-muted" />
        <div className="h-6 w-14 rounded-full bg-muted" />
      </div>
    </div>
  );
}

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
/*  PackageCard                                                       */
/* ------------------------------------------------------------------ */

function PackageCard({ pkg }: { pkg: NpmPackage }) {
  const ghUrl = getGitHubUrl(pkg.repository);
  const pkgCategories = getPackageCategories(pkg);
  const MAX_KEYWORDS_VISIBLE = 3;
  const visibleKeywords = pkg.keywords.slice(0, MAX_KEYWORDS_VISIBLE);
  const extraKeywords = pkg.keywords.length - MAX_KEYWORDS_VISIBLE;

  return (
    <div className="group relative flex flex-col rounded-lg border border-border/50 bg-card p-5 card-hover">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors text-sm truncate">
              {pkg.name}
            </h3>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
              v{pkg.version}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {pkg.description && (
        <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {pkg.description}
        </p>
      )}

      {/* Downloads + Date */}
      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ArrowUpDown className="h-3 w-3" />
          {formatNumber(pkg.downloads)}/mês
        </span>
        {pkg.date && (
          <span className="inline-flex items-center gap-1">
            {formatDate(pkg.date)}
          </span>
        )}
      </div>

      {/* Keywords badges */}
      {visibleKeywords.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {visibleKeywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center rounded-full border border-border/30 bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {kw}
            </span>
          ))}
          {extraKeywords > 0 && (
            <span className="text-[10px] text-muted-foreground/60">
              +{extraKeywords}
            </span>
          )}
        </div>
      )}

      {/* Category indicator */}
      {pkgCategories.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pkgCategories.map((cat) => {
            const catDef = CATEGORIES.find((c) => c.key === cat);
            if (!catDef) return null;
            return (
              <span
                key={cat}
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                  cat === 'sdk' &&
                    'bg-sky-500/10 text-sky-400 border border-sky-500/20',
                  cat === 'plugin' &&
                    'bg-violet-500/10 text-violet-400 border border-violet-500/20',
                  cat === 'ferramenta' &&
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                )}
              >
                {catDef.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Links */}
      <div className="mt-auto pt-3 flex items-center gap-2 border-t border-border/20">
        {pkg.npm && (
          <a
            href={pkg.npm}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
            title="Ver no npm"
          >
            <ExternalLink className="h-3 w-3" />
            npm
          </a>
        )}
        {ghUrl && (
          <a
            href={ghUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
            title="Ver no GitHub"
          >
            <Github className="h-3 w-3" />
            GitHub
          </a>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function LiveNpmPackages() {
  const [livePackages, setLivePackages] = useState<NpmPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'static' | 'live' | 'none'>('none');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryKey>('all');
  const [sort, setSort] = useState<SortKey>('downloads');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showSortMenu, setShowSortMenu] = useState(false);

  /* ---- Load static data (from the bundled JSON) ---- */
  const loadStatic = useCallback(async (): Promise<boolean> => {
    try {
      if (packages && packages.length > 0) {
        setLivePackages(packages);
        setSource('static');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  /* ---- Fetch from npm registry API ---- */
  const loadFromAPI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        'https://registry.npmjs.org/-/v1/search?text=opencode&size=250',
      );
      if (!res.ok) {
        throw new Error(`Erro ${res.status}: ${res.statusText}`);
      }
      const json: NpmRegistryResponse = await res.json();

      const mapped: NpmPackage[] = json.objects.map((obj) => ({
        name: obj.package.name,
        version: obj.package.version,
        description: obj.package.description || '',
        keywords: obj.package.keywords || [],
        publisher: obj.package.publisher?.username || null,
        downloads: obj.downloads?.monthly ?? 0,
        date: obj.package.date || null,
        repository: obj.package.links?.repository || null,
        npm:
          obj.package.links?.npm ||
          `https://www.npmjs.com/package/${obj.package.name}`,
      }));

      setLivePackages(mapped);
      setSource('live');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Falha ao carregar pacotes do npm',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ---- Initialisation: static first, fallback API ---- */
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

  /* ---- Filtered + searched + sorted packages ---- */
  const filteredPackages = useMemo(() => {
    let result = livePackages;

    // Category filter
    result = result.filter((p) => matchesCategory(p, category));

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.keywords.some((k) => k.toLowerCase().includes(q)),
      );
    }

    // Sort
    result = sortPackages(result, sort);

    return result;
  }, [livePackages, search, category, sort]);

  const visiblePackages = filteredPackages.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPackages.length;

  /* ---- Loading state ---- */
  if (isLoading && livePackages.length === 0) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  /* ---- Error state (no data) ---- */
  if (error && livePackages.length === 0) {
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
          <span>{error} — exibindo dados em cache.</span>
          <button
            onClick={loadFromAPI}
            className="ml-auto flex items-center gap-1 text-xs font-medium text-destructive underline underline-offset-2"
          >
            <RefreshCw className="h-3 w-3" />
            Atualizar
          </button>
        </div>
      )}

      {/* Source indicator + refresh */}
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
            {filteredPackages.length} pacote
            {filteredPackages.length !== 1 ? 's' : ''}
            {filteredPackages.length !== livePackages.length && ' (filtrados)'}
          </span>
        </div>
        <button
          onClick={loadFromAPI}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
        >
          <RefreshCw
            className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')}
          />
          Atualizar dados
        </button>
      </div>

      {/* Search + Sort row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Buscar por nome, descrição ou keywords..."
            className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:inline">
              {SORT_OPTIONS.find((o) => o.key === sort)?.label}
            </span>
          </button>
          {showSortMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-border/50 bg-card p-1 shadow-lg">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSort(opt.key);
                      setShowSortMenu(false);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    className={cn(
                      'flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors',
                      sort === opt.key
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-card-foreground',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              setCategory(cat.key);
              setVisibleCount(PAGE_SIZE);
            }}
            className={cn(
              'inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
              category === cat.key
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-card-foreground',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Mostrando {visiblePackages.length} de {filteredPackages.length} pacote
        {filteredPackages.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePackages.map((pkg, i) => (
          <div
            key={pkg.name}
            className={cn(
              'animate-in',
              i < 8 ? `stagger-${i + 1}` : 'stagger-8',
            )}
          >
            <PackageCard pkg={pkg} />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {visiblePackages.length === 0 && !isLoading && (
        <div className="py-16 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-muted p-4">
            <SearchX className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-card-foreground">
            Nenhum pacote encontrado
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Tente ajustar os filtros, categoria ou buscar por outro termo.
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
            Mostrar mais ({filteredPackages.length - visibleCount} restantes)
          </button>
        </div>
      )}

      {/* Footer info */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/50 pt-2">
        <ExternalLink className="h-3 w-3" />
        <span>
          Dados do npm registry —{' '}
          {source === 'live' ? (
            <a
              href="https://www.npmjs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Fonte oficial
            </a>
          ) : (
            'base estática'
          )}
        </span>
      </div>
    </div>
  );
}
