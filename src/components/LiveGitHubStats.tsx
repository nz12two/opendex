import { useState, useEffect } from 'react';
import { Star, GitFork, Bug, Clock, Github, AlertCircle, RefreshCw, ExternalLink, Eye, Rocket, GitCommit, Users, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count: number;
  updated_at: string;
  language: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface GitHubSearchResponse {
  total_count: number;
  items: GitHubRepo[];
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
  html_url: string;
}

interface CachedData<T> {
  timestamp: number;
  data: T;
}

interface Aggregated {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  topRepo: GitHubRepo | null;
}

/* ------------------------------------------------------------------ */
/*  Individual metric state types                                      */
/* ------------------------------------------------------------------ */

interface MetricState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const API_BASE = 'https://api.github.com';
const REPO_PATH = 'repos/anomalyco/opencode';

const languageColors: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  Python: 'bg-yellow-500',
  Shell: 'bg-green-500',
  Rust: 'bg-orange-500',
  JavaScript: 'bg-yellow-400',
  Go: 'bg-cyan-500',
  Ruby: 'bg-red-500',
  'C#': 'bg-purple-500',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h atrás`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays}d atrás`;
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const cached: CachedData<T> = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const payload: CachedData<T> = { timestamp: Date.now(), data };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    /* storage might be full — silently ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Individual metric fetchers                                        */
/* ------------------------------------------------------------------ */

async function fetchRepoData(): Promise<GitHubRepo> {
  const cacheKey = 'opendex_github_repo';
  const cached = getCached<GitHubRepo>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/${REPO_PATH}`, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
  const data: GitHubRepo = await res.json();
  setCache(cacheKey, data);
  return data;
}

async function fetchLatestRelease(): Promise<GitHubRelease> {
  const cacheKey = 'opendex_github_release';
  const cached = getCached<GitHubRelease>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/${REPO_PATH}/releases/latest`, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
  const data: GitHubRelease = await res.json();
  setCache(cacheKey, data);
  return data;
}

async function fetchLatestCommit(): Promise<GitHubCommit> {
  const cacheKey = 'opendex_github_commit';
  const cached = getCached<GitHubCommit>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/${REPO_PATH}/commits/main`, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
  const data: GitHubCommit = await res.json();
  setCache(cacheKey, data);
  return data;
}

async function fetchContributorsCount(): Promise<number> {
  const cacheKey = 'opendex_github_contributors';
  const cached = getCached<number>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/${REPO_PATH}/contributors?per_page=1&anon=true`, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);

  // Parse Link header for total count
  const linkHeader = res.headers.get('Link');
  let count = 0;
  if (linkHeader) {
    const match = linkHeader.match(/page=(\d+)>; rel="last"/);
    if (match) {
      count = parseInt(match[1], 10);
    }
  }
  // If no Link header, count the items in the response
  if (count === 0) {
    const body = await res.json();
    count = Array.isArray(body) ? body.length : 0;
  }
  setCache(cacheKey, count);
  return count;
}

async function fetchReleasesCount(): Promise<number> {
  const cacheKey = 'opendex_github_releases_count';
  const cached = getCached<number>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/${REPO_PATH}/releases?per_page=1`, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);

  const linkHeader = res.headers.get('Link');
  let count = 0;
  if (linkHeader) {
    const match = linkHeader.match(/page=(\d+)>; rel="last"/);
    if (match) {
      count = parseInt(match[1], 10);
    }
  }
  if (count === 0) {
    const body = await res.json();
    count = Array.isArray(body) ? body.length : 0;
  }
  setCache(cacheKey, count);
  return count;
}

async function fetchRepos(): Promise<GitHubSearchResponse> {
  const cacheKey = 'opendex_github_search';
  const cached = getCached<GitHubSearchResponse>(cacheKey);
  if (cached) return cached;

  const res = await fetch(
    `${API_BASE}/search/repositories?q=opencode+in:name&sort=stars&per_page=5`,
    { headers: { Accept: 'application/vnd.github.v3+json' } },
  );
  if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
  const data: GitHubSearchResponse = await res.json();
  setCache(cacheKey, data);
  return data;
}

/* ------------------------------------------------------------------ */
/*  Skeleton loader                                                    */
/* ------------------------------------------------------------------ */

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-4 animate-pulse rounded-md bg-muted-foreground/10',
        className,
      )}
    />
  );
}

function SkeletonCircle({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-10 w-10 animate-pulse rounded-full bg-muted-foreground/10',
        className,
      )}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border/50 bg-card p-4">
            <SkeletonBar className="mb-2 h-3 w-16" />
            <SkeletonBar className="h-6 w-12" />
          </div>
        ))}
      </div>

      {/* Top repo card */}
      <div className="rounded-lg border border-border/50 bg-card p-5">
        <div className="flex items-start gap-4">
          <SkeletonCircle />
          <div className="flex-1 space-y-2">
            <SkeletonBar className="h-5 w-48" />
            <SkeletonBar className="h-3 w-full" />
            <SkeletonBar className="h-3 w-3/4" />
          </div>
        </div>
        <div className="mt-4 flex gap-4">
          <SkeletonBar className="h-3 w-20" />
          <SkeletonBar className="h-3 w-20" />
          <SkeletonBar className="h-3 w-20" />
        </div>
      </div>

      {/* Table header */}
      <SkeletonBar className="mb-3 h-4 w-32" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border/30 bg-card/50 p-3">
          <SkeletonBar className="h-3 w-3 rounded-full" />
          <SkeletonBar className="h-3 flex-1" />
          <SkeletonBar className="h-3 w-12" />
          <SkeletonBar className="h-3 w-12" />
          <SkeletonBar className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MetricCard sub-component                                           */
/* ------------------------------------------------------------------ */

function MetricCard({
  icon,
  label,
  value,
  loading,
  error,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading?: boolean;
  error?: string | null;
}) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-pulse rounded bg-muted-foreground/10" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted-foreground/10" />
        </div>
        <div className="mt-2 h-7 w-20 animate-pulse rounded bg-muted-foreground/10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border/50 bg-card p-4 opacity-60">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>Indisponível</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-card-foreground">
        {value}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LiveGitHubStats                                                    */
/* ------------------------------------------------------------------ */

export default function LiveGitHubStats() {
  const [data, setData] = useState<GitHubSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Individual metric states
  const [watchers, setWatchers] = useState<MetricState<number>>({ data: null, loading: true, error: null });
  const [latestRelease, setLatestRelease] = useState<MetricState<GitHubRelease>>({ data: null, loading: true, error: null });
  const [latestCommit, setLatestCommit] = useState<MetricState<GitHubCommit>>({ data: null, loading: true, error: null });
  const [contributorsCount, setContributorsCount] = useState<MetricState<number>>({ data: null, loading: true, error: null });
  const [releasesCount, setReleasesCount] = useState<MetricState<number>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchRepos();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao conectar com GitHub API');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Fetch individual metrics
  useEffect(() => {
    let cancelled = false;

    async function loadWatchers() {
      try {
        const repo = await fetchRepoData();
        if (!cancelled) setWatchers({ data: repo.subscribers_count, loading: false, error: null });
      } catch (err) {
        if (!cancelled) setWatchers(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Erro' }));
      }
    }

    async function loadRelease() {
      try {
        const release = await fetchLatestRelease();
        if (!cancelled) setLatestRelease({ data: release, loading: false, error: null });
      } catch (err) {
        if (!cancelled) setLatestRelease(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Erro' }));
      }
    }

    async function loadCommit() {
      try {
        const commit = await fetchLatestCommit();
        if (!cancelled) setLatestCommit({ data: commit, loading: false, error: null });
      } catch (err) {
        if (!cancelled) setLatestCommit(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Erro' }));
      }
    }

    async function loadContributors() {
      try {
        const count = await fetchContributorsCount();
        if (!cancelled) setContributorsCount({ data: count, loading: false, error: null });
      } catch (err) {
        if (!cancelled) setContributorsCount(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Erro' }));
      }
    }

    async function loadReleasesCount() {
      try {
        const count = await fetchReleasesCount();
        if (!cancelled) setReleasesCount({ data: count, loading: false, error: null });
      } catch (err) {
        if (!cancelled) setReleasesCount(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Erro' }));
      }
    }

    loadWatchers();
    loadRelease();
    loadCommit();
    loadContributors();
    loadReleasesCount();
  }, []);

  /* Derive aggregated metrics */
  const aggregated: Aggregated = {
    totalRepos: data?.total_count ?? 0,
    totalStars: data?.items.reduce((s, r) => s + r.stargazers_count, 0) ?? 0,
    totalForks: data?.items.reduce((s, r) => s + r.forks_count, 0) ?? 0,
    topRepo: data?.items[0] ?? null,
  };

  /* ---- Error state ---- */
  if (error && !data) {
    return (
      <div className="rounded-lg border border-border/50 bg-card p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Dados temporariamente indisponíveis</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">Carregando dados ao vivo...</span>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  const repos = data?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-medium text-green-500">Ao vivo</span>
        </div>
        <span className="text-[10px] text-muted-foreground/70">
          Atualizado a cada 5 min
        </span>
      </div>

      {/* Summary cards — 8 metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          icon={<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
          label="Estrelas"
          value={formatNumber(aggregated.totalStars)}
        />
        <MetricCard
          icon={<GitFork className="h-4 w-4" />}
          label="Forks"
          value={formatNumber(aggregated.totalForks)}
        />
        <MetricCard
          icon={<Eye className="h-4 w-4" />}
          label="Watchers"
          value={watchers.data !== null ? formatNumber(watchers.data) : '—'}
          loading={watchers.loading}
          error={watchers.error}
        />
        <MetricCard
          icon={<Bug className="h-4 w-4" />}
          label="Issues abertas"
          value={formatNumber(repos.reduce((s, r) => s + r.open_issues_count, 0))}
        />
        <MetricCard
          icon={<Rocket className="h-4 w-4" />}
          label="Última release"
          value={latestRelease.data ? latestRelease.data.tag_name : '—'}
          loading={latestRelease.loading}
          error={latestRelease.error}
        />
        <MetricCard
          icon={<GitCommit className="h-4 w-4" />}
          label="Último commit"
          value={latestCommit.data ? timeAgo(latestCommit.data.commit.author.date) : '—'}
          loading={latestCommit.loading}
          error={latestCommit.error}
        />
        <MetricCard
          icon={<Users className="h-4 w-4" />}
          label="Contribuidores"
          value={contributorsCount.data !== null ? formatNumber(contributorsCount.data) : '—'}
          loading={contributorsCount.loading}
          error={contributorsCount.error}
        />
        <MetricCard
          icon={<Package className="h-4 w-4" />}
          label="Releases"
          value={releasesCount.data !== null ? formatNumber(releasesCount.data) : '—'}
          loading={releasesCount.loading}
          error={releasesCount.error}
        />
      </div>

      {/* Top repo highlight */}
      {aggregated.topRepo && (
        <a
          href={aggregated.topRepo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block rounded-lg border border-border/50 bg-gradient-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="flex items-start gap-4">
            <img
              src={aggregated.topRepo.owner.avatar_url}
              alt={aggregated.topRepo.owner.login}
              className="h-10 w-10 rounded-full border border-border/50"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {aggregated.topRepo.full_name}
                </h3>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {aggregated.topRepo.description}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              <strong className="text-foreground">{formatNumber(aggregated.topRepo.stargazers_count)}</strong>
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3.5 w-3.5" />
              <strong className="text-foreground">{aggregated.topRepo.forks_count}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Bug className="h-3.5 w-3.5" />
              <strong className="text-foreground">{aggregated.topRepo.open_issues_count}</strong> issues
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="h-3 w-3" />
              {timeAgo(aggregated.topRepo.updated_at)}
            </span>
          </div>

          {/* Language badge */}
          {aggregated.topRepo.language && (
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  languageColors[aggregated.topRepo.language] || 'bg-muted-foreground',
                )}
              />
              <span className="text-[11px] font-medium text-muted-foreground">
                {aggregated.topRepo.language}
              </span>
            </div>
          )}
        </a>
      )}

      {/* Repo list */}
      {repos.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-card-foreground">
            Repositórios em destaque
          </h4>
          <div className="space-y-1.5">
            {repos.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border/30 bg-card/50 px-4 py-2.5 transition-all duration-200 hover:border-primary/30 hover:bg-card hover:shadow-sm group"
              >
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    languageColors[repo.language] || 'bg-muted-foreground',
                  )}
                />
                <span className="flex-1 truncate text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">
                  {repo.full_name}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  {formatNumber(repo.stargazers_count)}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <GitFork className="h-3 w-3" />
                  {repo.forks_count}
                </span>
                {repo.open_issues_count > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Bug className="h-3 w-3" />
                    {repo.open_issues_count}
                  </span>
                )}
                <span className="hidden text-[10px] text-muted-foreground/70 shrink-0 sm:block">
                  {timeAgo(repo.updated_at)}
                </span>
                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Error banner (non-blocking) */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
