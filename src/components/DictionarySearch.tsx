import { useState, useMemo } from 'react';
import { Search, X, BookText } from 'lucide-react';
import type { DictionaryEntry } from '@/data/dictionary';

interface DictionarySearchProps {
  entries: DictionaryEntry[];
  onSelect: (entry: DictionaryEntry) => void;
  placeholder?: string;
}

export default function DictionarySearch({
  entries,
  onSelect,
  placeholder = 'Buscar termo...',
}: DictionarySearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return entries
      .filter(
        (entry) =>
          entry.term.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q) ||
          entry.category.toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [query, entries]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="flex h-12 w-full rounded-xl border border-input bg-background pl-10 pr-10 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {isOpen && query && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="p-1.5 space-y-0.5">
            {results.map((entry, i) => (
              <button
                key={i}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(entry);
                  setQuery('');
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookText className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                  <span className="font-medium">{entry.term}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{entry.category}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {entry.description.substring(0, 80)}...
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-card shadow-lg p-4 text-center text-sm text-muted-foreground">
          Nenhum termo encontrado para "{query}"
        </div>
      )}
    </div>
  );
}
