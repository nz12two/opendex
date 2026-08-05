import { useState } from 'react';

interface Curiosity {
  fact: string;
  category: string;
  details: string;
  source: string;
}

interface CuriosityCardProps {
  curiosity: Curiosity;
}

const categoryColors: Record<string, string> = {
  repositorio: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
  licenca: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
  npm: 'from-orange-500/20 to-orange-600/5 border-orange-500/30',
};

const categoryLabels: Record<string, string> = {
  repositorio: '📦 Repositório',
  licenca: '📜 Licença',
  npm: '⬇️ npm',
};

export default function CuriosityCard({ curiosity }: CuriosityCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const colorClass = categoryColors[curiosity.category] || 'from-primary/20 to-primary/5 border-primary/30';
  const label = categoryLabels[curiosity.category] || curiosity.category;

  return (
    <div
      className="group relative h-64 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsFlipped(!isFlipped); } }}
      tabIndex={0}
      role="button"
      aria-label={isFlipped ? 'Virar card para frente' : 'Virar card para verso'}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front */}
        <div className={`absolute inset-0 rounded-xl border border-border/50 bg-card p-6 backface-hidden overflow-hidden bg-gradient-to-br ${categoryColors[curiosity.category] || 'from-primary/20 to-primary/5 border-primary/30'}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center rounded-full border border-border/50 bg-background/50 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {categoryLabels[curiosity.category] || curiosity.category}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-center text-sm font-medium leading-relaxed text-card-foreground">
                {curiosity.fact}
              </p>
            </div>
            <div className="mt-3 text-center">
              <span className="text-xs text-muted-foreground">Clique para virar</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className={`absolute inset-0 rounded-xl border border-border/50 bg-card p-6 backface-hidden rotate-y-180 overflow-hidden bg-gradient-to-br ${categoryColors[curiosity.category] || 'from-primary/20 to-primary/5 border-primary/30'}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center rounded-full border border-border/50 bg-background/50 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {categoryLabels[curiosity.category] || curiosity.category}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground leading-relaxed text-center">
                {curiosity.details}
              </p>
            </div>
            <div className="mt-3 text-center">
              <a
                href={curiosity.source}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Fonte ↗
              </a>
            </div>
            <div className="mt-1 text-center">
              <span className="text-xs text-muted-foreground">Clique para voltar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
