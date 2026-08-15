import { useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import type { FAQItem } from '@/data/faq';

interface FAQAccordionProps {
  items: FAQItem[];
  categoryFilter: string | null;
}

const categoryColors: Record<string, string> = {
  conceitos: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  economia: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  modelos: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  instalacao: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  criacao: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  cache: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};

export default function FAQAccordion({ items, categoryFilter }: FAQAccordionProps) {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = !categoryFilter || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpenIndex(null); }}
          placeholder="Buscar perguntas..."
          className="flex h-12 w-full rounded-xl border border-input bg-background pl-10 pr-10 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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

      <p className="text-sm text-muted-foreground text-center">
        {filtered.length} pergunta{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Accordion */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma pergunta encontrada. Tente outros termos.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-200 hover:border-primary/20"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-accent/50"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{item.question}</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        categoryColors[item.category] || 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === i && (
                <div className="px-5 pb-4 animate-in">
                  <div className="border-t border-border/30 pt-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
