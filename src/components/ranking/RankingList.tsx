import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Trophy,
  Star,
  ArrowUpDown,
  Tag,
  ExternalLink,
  AlertCircle,
  Github,
  Package,
  Brain,
  Calendar,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface RankingItemData {
  full_name: string;
  description: string;
  stargazers_count: number;
  topics: string[];
  html_url: string;
  pushed_at: string | null;
  score: number;
  source: string;
}

export interface RankingListProps {
  items: RankingItemData[];
}

interface RankingItem {
  rank: number;
  title: string;
  description: string;
  type: 'plugin' | 'mcp' | 'agent' | 'script' | 'tool' | 'modelo' | 'showcase';
  score: number;
  stars?: number;
  url: string;
  tags?: string[];
  source: string;
  lastUpdated?: string;
}

type SortKey = 'score' | 'stars' | 'name';
type TabKey = 'all' | 'plugin' | 'mcp' | 'agent' | 'script' | 'tool' | 'modelo' | 'showcase';

/* ------------------------------------------------------------------ */
/*  Tabs configuration                                                */
/* ------------------------------------------------------------------ */

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'plugin', label: 'Plugins' },
  { key: 'mcp', label: 'MCPs' },
  { key: 'agent', label: 'Agentes' },
  { key: 'script', label: 'Scripts' },
  { key: 'tool', label: 'Ferramentas' },
  { key: 'modelo', label: 'Modelos' },
  { key: 'showcase', label: 'Projetos' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function inferType(topics: string[]): RankingItem['type'] {
  const t = topics.map((s) => s.toLowerCase());
  if (t.some((s) => s.includes('mcp-server') || s === 'mcp')) return 'mcp';
  if (t.some((s) => s.includes('plugin') || s === 'opencode-plugin')) return 'plugin';
  if (t.some((s) => s.includes('agent') || s.includes('ai-agents'))) return 'agent';
  if (t.some((s) => s.includes('skill') || s.includes('skills'))) return 'script';
  if (t.some((s) => s.includes('showcase') || s.includes('project') || s.includes('template'))) return 'showcase';
  return 'tool';
}

function formatScoreBar(score: number): { color: string; bg: string } {
  if (score >= 80) return { color: 'bg-green-500', bg: 'bg-green-500/20' };
  if (score >= 60) return { color: 'bg-blue-500', bg: 'bg-blue-500/20' };
  if (score >= 40) return { color: 'bg-yellow-500', bg: 'bg-yellow-500/20' };
  return { color: 'bg-orange-500', bg: 'bg-orange-500/20' };
}

function formatStars(n?: number): string {
  if (!n) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

function getTypeIcon(type: RankingItem['type']): string {
  const map: Record<string, string> = {
    plugin: '🔌',
    mcp: '🔗',
    agent: '🤖',
    script: '📜',
    tool: '🛠️',
    modelo: '🧠',
    showcase: '📦',
  };
  return map[type] ?? '📦';
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function RankingList({ items: rawItems }: RankingListProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('score');

  // Map raw data to internal items
  const allItems = useMemo<RankingItem[]>(() => {
    return rawItems.map((repo) => {
      const type = inferType(repo.topics);
      return {
        rank: 0,
        title: repo.full_name,
        description: repo.description ?? '',
        type,
        score: repo.score ?? 50,
        stars: repo.stargazers_count,
        url: repo.html_url,
        tags: (repo.topics ?? []).slice(0, 5),
        source: repo.source,
        lastUpdated: repo.pushed_at ?? undefined,
      };
    });
  }, [rawItems]);

  // Filter + sort
  const items = useMemo<RankingItem[]>(() => {
    let filtered = allItems;
    if (activeTab !== 'all') {
      filtered = allItems.filter((item) => item.type === activeTab);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'stars':
          return (b.stars ?? 0) - (a.stars ?? 0);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'score':
        default:
          return b.score - a.score;
      }
    });

    return sorted.map((item, i) => ({ ...item, rank: i + 1 }));
  }, [allItems, activeTab, sortKey]);

  /* ---- error state ---- */
  if (rawItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-12 text-center">
        <AlertCircle className="mb-3 h-10 w-10 text-destructive" />
        <h3 className="text-lg font-semibold">Erro ao carregar dados</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Nenhum item disponível para o ranking.
        </p>
      </div>
    );
  }

  /* ---- empty state (after filter) ---- */
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-12 text-center">
        <Trophy className="mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Nenhum item encontrado</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeTab === 'all'
            ? 'Nenhum repositório disponível no momento.'
            : `Nenhum item do tipo "${TABS.find((t) => t.key === activeTab)?.label}" encontrado.`}
        </p>
      </div>
    );
  }

  /* ---- main render ---- */
  return (
    <div className="space-y-6">
      {/* Tabs + Sort Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Ordenar:</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-lg border border-border/40 bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground outline-none transition-colors focus:border-primary"
          >
            <option value="score">Score</option>
            <option value="stars">Estrelas</option>
            <option value="name">Nome</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {items.length} {items.length === 1 ? 'item encontrado' : 'itens encontrados'}
      </p>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const bar = formatScoreBar(item.score);
          return (
            <a
              key={`${item.source}-${item.title}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-xl border border-border/40 bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            >
              {/* Rank badge */}
              <div className="absolute right-3 top-3 flex h-7 min-w-[28px] items-center justify-center rounded-full bg-muted/60 px-2 text-xs font-bold text-muted-foreground">
                #{item.rank}
              </div>

              {/* Header */}
              <div className="flex items-start gap-3">
                {/* Type icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-base">
                  {getTypeIcon(item.type)}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Title + source icon */}
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    {item.source === 'GitHub' || item.source === 'github' ? (
                      <Github className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : item.source === 'npm' ? (
                      <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <Brain className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </div>

                  {/* Type badge */}
                  <div className="mt-0.5">
                    <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {item.description || 'Sem descrição disponível.'}
              </p>

              {/* Score bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Score: {item.score}</span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <div className={cn('mt-1 h-2 w-full rounded-full', bar.bg)}>
                  <div
                    className={cn('h-2 rounded-full transition-all duration-500', bar.color)}
                    style={{ width: `${Math.min(100, item.score)}%` }}
                  />
                </div>
              </div>

              {/* Meta row */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                {item.stars !== undefined && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    {formatStars(item.stars)}
                  </span>
                )}

                {item.tags && item.tags.length > 0 && (
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <Tag className="h-3 w-3 shrink-0" />
                    <span className="truncate">{item.tags.slice(0, 3).join(', ')}</span>
                  </span>
                )}

                {item.lastUpdated && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.lastUpdated).toLocaleDateString('pt-BR')}
                  </span>
                )}

                <span className="flex items-center gap-1 ml-auto">
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
