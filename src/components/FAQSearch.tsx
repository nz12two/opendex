import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { FAQItem } from '@/data/faq';

interface FAQSearchProps {
  items: FAQItem[];
  onSelect: (item: FAQItem) => void;
  placeholder?: string;
}

export default function FAQSearch({
  items,
  onSelect,
  placeholder = 'Pergunte algo...',
}: FAQSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return items
      .filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [query, items]);

  return (
    <div className="relative w-full max-w-md">
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
          placeholder={placeholder}
          className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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

      {/* Results dropdown */}
      {isOpen && query && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="p-1.5 space-y-0.5">
            {results.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(item);
                  setQuery('');
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition-colors"
              >
                <span className="font-medium">{item.question}</span>
                <span className="block text-xs text-muted-foreground mt-0.5">
                  {item.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-card shadow-lg p-4 text-center text-sm text-muted-foreground">
          Nenhum resultado para "{query}"
        </div>
      )}
    </div>
  );
}
