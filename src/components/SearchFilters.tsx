import { useState, useMemo, useEffect } from 'react';
import { Search, X, ChevronDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface SearchFiltersProps<T> {
  items: T[];
  onFilteredItems: (items: T[]) => void;
  searchKeys: (keyof T)[];
  categories: string[];
  getCategory: (item: T) => string;
  getTags?: (item: T) => string[];
  placeholder?: string;
}

export default function SearchFilters<T>({
  items,
  onFilteredItems,
  searchKeys,
  categories,
  getCategory,
  getTags,
  placeholder = 'Buscar...',
}: SearchFiltersProps<T>) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Extract all unique tags
  const allTags = useMemo(() => {
    if (!getTags) return [];
    const tagSet = new Set<string>();
    items.forEach((item) => {
      const tags = getTags(item);
      tags?.forEach((t) => tagSet.add(t));
    });
    return [...tagSet].sort();
  }, [items, getTags]);

  // Filter logic
  const filtered = useMemo(() => {
    let result = [...items];

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const val = item[key];
          if (typeof val === 'string') {
            return val.toLowerCase().includes(q);
          }
          return false;
        })
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((item) => getCategory(item) === selectedCategory);
    }

    // Tags filter
    if (selectedTags.length > 0 && getTags) {
      result = result.filter((item) => {
        const itemTags = getTags(item);
        return selectedTags.every((tag) => itemTags?.includes(tag));
      });
    }

    return result;
  }, [items, query, selectedCategory, selectedTags, searchKeys, getCategory, getTags]);

  // Notify parent of filtered items
  useEffect(() => {
    onFilteredItems(filtered);
  }, [filtered, onFilteredItems]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedTags([]);
  };

  const hasActiveFilters = query || selectedCategory || selectedTags.length > 0;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-8"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filtros
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-transform duration-200',
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

      {/* Filter panels */}
      {showFilters && (
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          {/* Categories */}
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-2 block">
              Categoria
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                  !selectedCategory
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                )}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-2 block">
                Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                      selectedTags.includes(tag)
                        ? 'bg-secondary text-secondary-foreground border-secondary'
                        : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
        {hasActiveFilters && ' encontrados'}
      </p>
    </div>
  );
}
