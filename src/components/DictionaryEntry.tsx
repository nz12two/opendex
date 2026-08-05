import { X, BookText, ExternalLink } from 'lucide-react';
import type { DictionaryEntry as DictionaryEntryType } from '@/data/dictionary';
import { dictionaryEntries } from '@/data/dictionary';

interface DictionaryEntryProps {
  entry: DictionaryEntryType;
  onClose: () => void;
}

const categoryColors: Record<string, string> = {
  conceitos: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  agentes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  arquitetura: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  extensoes: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  economia: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  frontend: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};

export default function DictionaryEntry({ entry, onClose }: DictionaryEntryProps) {
  const seeAlsoEntries = entry.seeAlso
    ? entry.seeAlso
        .map((name) => dictionaryEntries.find((e) => e.term === name))
        .filter(Boolean) as DictionaryEntryType[]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-border/50 bg-card shadow-2xl animate-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BookText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{entry.term}</h3>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium mt-1 ${
                  categoryColors[entry.category] || 'bg-muted text-muted-foreground border-border'
                }`}
              >
                {entry.category}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {entry.description}
          </p>

          {/* See Also */}
          {seeAlsoEntries.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border/30">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Ver também
              </p>
              <div className="flex flex-wrap gap-2">
                {seeAlsoEntries.map((related) => (
                  <span
                    key={related.term}
                    className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground/80"
                  >
                    <ExternalLink className="h-3 w-3 text-primary/60" />
                    {related.term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
