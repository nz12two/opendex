import type { Gargalo } from '@/lib/recommendation/types';
import { AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';
import { useState } from 'react';

interface GargaloAlertProps {
  gargalos: Gargalo[];
}

const TIPO_STYLES: Record<string, { icon: React.ReactNode; border: string; bg: string; title: string }> = {
  danger: {
    icon: <AlertOctagon className="h-5 w-5 text-red-500" />,
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    title: 'Atenção',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    title: 'Sugestão',
  },
  info: {
    icon: <Info className="h-5 w-5 text-blue-500" />,
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    title: 'Dica',
  },
};

export default function GargaloAlert({ gargalos }: GargaloAlertProps) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  if (gargalos.length === 0) return null;

  const visibleGargalos = gargalos.filter((_, i) => !dismissed.has(i));

  if (visibleGargalos.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Diagnóstico do Projeto
      </h3>
      <div className="space-y-2">
        {visibleGargalos.map((gargalo, index) => {
          const style = TIPO_STYLES[gargalo.tipo] || TIPO_STYLES.info;
          return (
            <div
              key={index}
              className={`relative rounded-lg border ${style.border} ${style.bg} p-4 pr-10`}
            >
              <button
                type="button"
                onClick={() => setDismissed((prev) => new Set(prev).add(index))}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dispensar"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex gap-3">
                <div className="mt-0.5 shrink-0">{style.icon}</div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {style.title}: {gargalo.mensagem}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {gargalo.sugestao}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
