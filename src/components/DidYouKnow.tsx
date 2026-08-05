import { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Curiosity } from '@/data/curiosities';
import { curiosities } from '@/data/curiosities';

interface DidYouKnowProps {
  curiosity?: Curiosity;
}

export default function DidYouKnow({ curiosity: propCuriosity }: DidYouKnowProps) {
  const [curiosity, setCuriosity] = useState<Curiosity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (propCuriosity) {
      setCuriosity(propCuriosity);
      setLoading(false);
      return;
    }

    try {
      if (!curiosities || curiosities.length === 0) {
        setError(true);
        return;
      }
      const randomIndex = Math.floor(Math.random() * curiosities.length);
      setCuriosity(curiosities[randomIndex]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [propCuriosity]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-6 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-lg bg-muted h-9 w-9" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !curiosity) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 rounded-lg bg-muted p-2">
            <Lightbulb className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Curiosidade não disponível no momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border/50 bg-card p-6',
        'hover:shadow-lg transition-shadow duration-200',
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Sabia que?
          </h3>
          <p className="text-sm font-medium text-card-foreground mb-2 leading-relaxed">
            {curiosity.fact}
          </p>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            {curiosity.details}
          </p>
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'inline-flex items-center rounded-full border border-border/50',
                'bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary',
              )}
            >
              {curiosity.category}
            </span>
            <div className="flex items-center gap-3">
              <a
                href={curiosity.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Fonte ↗
              </a>
              <a
                href="/opendex/curiosidades/"
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Learn more →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
