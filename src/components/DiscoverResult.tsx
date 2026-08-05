import {
  Sparkles,
  Puzzle,
  Server,
  Bot,
  FileCode,
  BookOpen,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';

interface Guide {
  title: string;
  href: string;
}

interface DiscoverResultData {
  modelo: string;
  plugins: string[];
  mcps: string[];
  agents: string[];
  templates: string[];
  guides: Guide[];
  reasoning: string;
}

interface DiscoverResultProps {
  result: DiscoverResultData;
  onRestart: () => void;
}

function BadgeGroup({
  icon: Icon,
  title,
  items,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  color: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">{items.length} itens</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center rounded-md border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground/80"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DiscoverResult({
  result,
  onRestart,
}: DiscoverResultProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Recomendação Personalizada</span>
        </div>
        <h2 className="text-3xl font-extrabold md:text-4xl">
          Seu setup ideal
        </h2>
        <div className="mt-3 max-w-2xl mx-auto text-muted-foreground">
          <p>{result.reasoning}</p>
        </div>
      </div>

      {/* Modelo destacado */}
      <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent p-6 text-center shadow-lg shadow-primary/5">
        <p className="text-sm text-muted-foreground mb-1">Modelo recomendado</p>
        <p className="text-2xl font-bold text-primary">{result.modelo}</p>
      </div>

      {/* Grid de recomendações */}
      <div className="grid gap-4 md:grid-cols-2">
        <BadgeGroup
          icon={Bot}
          title="Agentes"
          items={result.agents}
          color="bg-blue-500/10 text-blue-500"
        />
        <BadgeGroup
          icon={Puzzle}
          title="Plugins"
          items={result.plugins}
          color="bg-emerald-500/10 text-emerald-500"
        />
        <BadgeGroup
          icon={Server}
          title="MCPs"
          items={result.mcps}
          color="bg-violet-500/10 text-violet-500"
        />
        <BadgeGroup
          icon={FileCode}
          title="Templates"
          items={result.templates}
          color="bg-amber-500/10 text-amber-500"
        />
      </div>

      {/* Guias recomendados */}
      {result.guides.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
              <BookOpen className="h-4 w-4 text-rose-500" />
            </div>
            <h3 className="font-semibold">Guias recomendados</h3>
          </div>
          <ul className="space-y-2">
            {result.guides.map((guide, i) => (
              <li key={i}>
                <a
                  href={guide.href}
                  className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <span className="group-hover:text-primary transition-colors">{guide.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" />
          Recomeçar
        </button>
      </div>
    </div>
  );
}
