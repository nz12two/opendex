import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Search, SearchX, ChevronDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchIndex, type SearchItem, getSearchTypes, getTopSearchTags } from '@/data/search';

const ITEMS_PER_PAGE = 30;

const TYPE_LABELS: Record<SearchItem['type'], string> = {
  modelo: 'Modelo',
  plugin: 'Plugin',
  mcp: 'MCP',
  script: 'Script',
  agente: 'Agente',
  workflow: 'Workflow',
  comparacao: 'Comparação',
  showcase: 'Showcase',
  ferramenta: 'Ferramenta',
  termo: 'Termo',
  doc: 'Doc',
  blog: 'Blog',
};

const TYPE_COLORS: Record<SearchItem['type'], string> = {
  modelo: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  plugin: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  mcp: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  script: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  agente: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  workflow: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  comparacao: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  showcase: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  ferramenta: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  termo: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  doc: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  blog: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', color: 'text-green-600 dark:text-green-400', icon: '🟢' },
  intermediate: { label: 'Intermediate', color: 'text-yellow-600 dark:text-yellow-400', icon: '🟡' },
  advanced: { label: 'Advanced', color: 'text-red-600 dark:text-red-400', icon: '🔴' },
} as const;

const TOP_TAGS = [
  'Contexto', 'Performance', 'Tokens', 'Prompt', 'Models',
  'Compaction', 'Arquitetura', 'Automação', 'Ferramentas',
  'Agentes', 'Segurança', 'Economia',
];

// Fuse.js instance (built once)
let fuseInstance: Fuse<SearchItem> | null = null;

function getFuse(): Fuse<SearchItem> {
  if (!fuseInstance) {
    fuseInstance = new Fuse(searchIndex, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'tags', weight: 0.2 },
        { name: 'category', weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
    });
  }
  return fuseInstance;
}

function SearchSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/50 bg-card p-5 animate-pulse space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 rounded-full bg-muted" />
            <div className="h-5 w-20 rounded-full bg-muted" />
          </div>
          <div className="h-5 w-3/4 rounded bg-muted" />
          <div className="space-y-1.5">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
          <div className="flex gap-1.5">
            <div className="h-5 w-14 rounded-full bg-muted" />
            <div className="h-5 w-16 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultCard({ item }: { item: SearchItem }) {
  const diff = item.difficulty ? DIFFICULTY_CONFIG[item.difficulty] : null;

  return (
    <a
      href={item.url}
      className="group block rounded-xl border border-border/50 bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
    >
      {/* Badges row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
            TYPE_COLORS[item.type]
          )}
        >
          {TYPE_LABELS[item.type]}
        </span>
        {diff && (
          <span className={cn('inline-flex items-center gap-1 text-xs font-medium', diff.color)}>
            <span>{diff.icon}</span>
            {diff.label}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
        {item.title}
      </h3>

      {/* Description */}
      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
        {item.description}
      </p>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground/70 self-center">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </a>
  );
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | SearchItem['type']>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce: 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setVisibleCount(ITEMS_PER_PAGE);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Search results with Fuse
  const results = useMemo(() => {
    let filtered: SearchItem[];

    if (debouncedQuery.trim()) {
      const fuse = getFuse();
      filtered = fuse.search(debouncedQuery.trim()).map((r) => r.item);
    } else {
      filtered = [...searchIndex];
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((item) => item.difficulty === selectedDifficulty);
    }

    // Tags filter (AND logic)
    if (selectedTags.length > 0) {
      filtered = filtered.filter((item) =>
        selectedTags.every((tag) =>
          item.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
        )
      );
    }

    return filtered;
  }, [debouncedQuery, selectedType, selectedDifficulty, selectedTags]);

  const visibleResults = useMemo(
    () => results.slice(0, visibleCount),
    [results, visibleCount]
  );

  const hasMore = visibleCount < results.length;
  const totalResults = results.length;

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  const clearFilters = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedType('all');
    setSelectedDifficulty('all');
    setSelectedTags([]);
    setVisibleCount(ITEMS_PER_PAGE);
    inputRef.current?.focus();
  }, []);

  const hasActiveFilters =
    debouncedQuery.trim() !== '' ||
    selectedType !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar no ecossistema OpenCode..."
          className="flex h-14 w-full rounded-xl border border-border bg-card pl-12 pr-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-shadow"
        />
      </div>

      {/* Filter Toggle + Clear */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'inline-flex items-center gap-2 text-sm font-medium transition-colors',
            showFilters
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Filter className="h-4 w-4" />
          Filtros
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-200',
              showFilters && 'rotate-180'
            )}
          />
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-xl border border-border/50 bg-card p-5 space-y-5 animate-in">
          {/* Type filter */}
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">
              Tipo
            </span>
            <div className="flex flex-wrap gap-2">
              {(['all', 'modelo', 'plugin', 'mcp', 'script', 'agente', 'workflow', 'ferramenta', 'termo'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setVisibleCount(ITEMS_PER_PAGE);
                  }}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all border',
                    selectedType === type
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {type === 'all' ? 'Todos' : TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty filter */}
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">
              Dificuldade
            </span>
            <div className="flex flex-wrap gap-2">
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    setSelectedDifficulty(diff);
                    setVisibleCount(ITEMS_PER_PAGE);
                  }}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all border',
                    selectedDifficulty === diff
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {diff === 'all'
                    ? 'Todos'
                    : `${DIFFICULTY_CONFIG[diff].icon} ${DIFFICULTY_CONFIG[diff].label}`}
                </button>
              ))}
            </div>
          </div>

          {/* Tags filter */}
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">
              Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {TOP_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all border',
                    selectedTags.includes(tag)
                      ? 'bg-secondary text-secondary-foreground border-secondary shadow-sm'
                      : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-sm text-muted-foreground">
          {totalResults} {totalResults === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </p>
      )}

      {/* Results Grid */}
      {visibleResults.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleResults.map((item, idx) => (
              <ResultCard key={`${item.type}-${item.slug}-${idx}`} item={item} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={loadMore}
                className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                <ChevronDown className="h-4 w-4" />
                Mostrar mais ({results.length - visibleCount} restantes)
              </button>
            </div>
          )}
        </>
      ) : hasActiveFilters ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <SearchX className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Nenhum resultado encontrado</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Tente ajustar os termos da busca ou remover alguns filtros para encontrar mais resultados.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        /* Initial state — show all items */
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchIndex.slice(0, ITEMS_PER_PAGE).map((item, idx) => (
              <ResultCard key={`${item.type}-${item.slug}-${idx}`} item={item} />
            ))}
          </div>
          {searchIndex.length > ITEMS_PER_PAGE && (
            <div className="flex justify-center pt-2">
              <button
                onClick={loadMore}
                className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                <ChevronDown className="h-4 w-4" />
                Mostrar mais ({searchIndex.length - ITEMS_PER_PAGE} restantes)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
