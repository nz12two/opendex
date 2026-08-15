import { useState } from 'react';
import { newsItems, type NewsItem } from '@/data/news';
import { cn } from '@/lib/utils';
import {
  Rocket,
  Puzzle,
  BrainCircuit,
  GitPullRequest,
  Map,
  Trophy,
  Bot,
  BarChart3,
  FolderKanban,
  Search,
  Users,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type FilterType = NewsItem['type'] | 'all';

/* ------------------------------------------------------------------ */
/*  Icon map                                                          */
/* ------------------------------------------------------------------ */

const iconMap: Record<string, React.ReactNode> = {
  Rocket: <Rocket className="h-5 w-5" />,
  Puzzle: <Puzzle className="h-5 w-5" />,
  BrainCircuit: <BrainCircuit className="h-5 w-5" />,
  GitPullRequest: <GitPullRequest className="h-5 w-5" />,
  Map: <Map className="h-5 w-5" />,
  Trophy: <Trophy className="h-5 w-5" />,
  Bot: <Bot className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  FolderKanban: <FolderKanban className="h-5 w-5" />,
  Search: <Search className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
};

/* ------------------------------------------------------------------ */
/*  Type config                                                       */
/* ------------------------------------------------------------------ */

const typeConfig: Record<string, { label: string; color: string }> = {
  release: { label: 'Release', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  plugin: { label: 'Plugin', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  pr: { label: 'Pull Request', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  roadmap: { label: 'Roadmap', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  event: { label: 'Evento', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  mcp: { label: 'MCP', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  benchmark: { label: 'Benchmark', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  project: { label: 'Projeto', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  tool: { label: 'Ferramenta', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
  community: { label: 'Comunidade', color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
};

/* ------------------------------------------------------------------ */
/*  CommunityNews                                                     */
/* ------------------------------------------------------------------ */

export default function CommunityNews() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [visibleCount, setVisibleCount] = useState(6);

  const types = ['all', ...new Set(newsItems.map(n => n.type))] as FilterType[];

  const filtered = filter === 'all'
    ? newsItems
    : newsItems.filter(n => n.type === filter);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  function loadMore() {
    setVisibleCount(prev => prev + 6);
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          Últimas Novidades
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fique por dentro do que acontece no ecossistema OpenCode
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {types.map(t => (
          <button
            key={t}
            onClick={() => { setFilter(t); setVisibleCount(6); }}
            className={cn(
              'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all',
              filter === t
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground',
            )}
          >
            {t === 'all' ? 'Todas' : typeConfig[t]?.label || t}
          </button>
        ))}
      </div>

      {/* News grid */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border/50 bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma novidade encontrada para este filtro.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
          >
            <ChevronDown className="h-4 w-4" />
            Mostrar mais ({sorted.length - visibleCount} restantes)
          </button>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  NewsCard sub-component                                             */
/* ------------------------------------------------------------------ */

function NewsCard({ item }: { item: NewsItem }) {
  const cfg = typeConfig[item.type];
  const icon = iconMap[item.icon] || <Rocket className="h-5 w-5" />;

  return (
    <article className="group relative rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap">
            {cfg && (
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${cfg.color}`}>
                {cfg.label}
              </span>
            )}
            <time className="text-xs text-muted-foreground">
              {new Date(item.date).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </time>
            {item.source && (
              <span className="text-xs text-muted-foreground">· {item.source}</span>
            )}
            {item.author && (
              <span className="text-xs text-muted-foreground">· {item.author}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="mt-2 font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="group-hover:text-primary transition-colors">
                {item.title}
                <ExternalLink className="inline-block h-3.5 w-3.5 ml-1 text-muted-foreground group-hover:text-primary align-[-2px]" />
              </a>
            ) : (
              item.title
            )}
          </h3>

          {/* Description */}
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground/70">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
