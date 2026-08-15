interface SkeletonCardProps {
  /** Quantidade de badges (chips) no rodapé do card. Default: 2 */
  badges?: number;
}

/**
 * Card de loading compartilhado (skeleton) usado pelas listas de pacotes
 * e modelos. Padroniza o visual de carregamento em todo o site.
 */
export default function SkeletonCard({ badges = 2 }: SkeletonCardProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
      <div className="mt-4 flex gap-2">
        {Array.from({ length: badges }).map((_, i) => (
          <div
            key={i}
            className={`h-6 rounded-full bg-muted ${i === 0 ? "w-16" : i === 1 ? "w-20" : "w-14"}`}
          />
        ))}
      </div>
    </div>
  );
}
