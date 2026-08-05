import type { Recomendacao } from '@/lib/recommendation/types';
import {
  Users,
  Puzzle,
  Globe,
  GitBranch,
  FileText,
  Code,
  ExternalLink,
  ArrowUpDown,
  Search,
} from 'lucide-react';

interface RecommendationResultProps {
  recomendacoes: Recomendacao[];
}

const TIPO_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; href: string }
> = {
  agente: {
    label: 'Agente',
    icon: <Users className="h-4 w-4" />,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    href: '/agents',
  },
  plugin: {
    label: 'Plugin',
    icon: <Puzzle className="h-4 w-4" />,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    href: '/plugins',
  },
  mcp: {
    label: 'MCP',
    icon: <Globe className="h-4 w-4" />,
    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    href: '/mcps',
  },
  workflow: {
    label: 'Workflow',
    icon: <GitBranch className="h-4 w-4" />,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    href: '/workflows',
  },
  prompt: {
    label: 'Prompt',
    icon: <FileText className="h-4 w-4" />,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    href: '/prompts',
  },
  script: {
    label: 'Script',
    icon: <Code className="h-4 w-4" />,
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    href: '/scripts',
  },
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-emerald-400';
  if (score >= 40) return 'bg-amber-400';
  if (score >= 20) return 'bg-orange-400';
  return 'bg-red-400';
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  if (score >= 20) return 'text-orange-400';
  return 'text-red-400';
}

export default function RecommendationResult({ recomendacoes }: RecommendationResultProps) {
  if (recomendacoes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Nenhuma recomendação encontrada</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Tente descrever melhor seu projeto, incluindo frameworks, bancos de dados ou tecnologias que pretende usar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            Recomendações
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({recomendacoes.length} resultados)
            </span>
          </h2>
        </div>
      </div>

      <div className="grid gap-4">
        {recomendacoes.map((rec, index) => {
          const tipoConfig = TIPO_CONFIG[rec.tipo] || TIPO_CONFIG.script;
          const scoreColor = getScoreColor(rec.score);
          const scoreTextColor = getScoreTextColor(rec.score);

          return (
            <div
              key={`${rec.tipo}-${rec.slug}`}
              className="group relative rounded-lg border border-border/50 bg-card p-5 transition-all hover:border-border hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                {/* Score visual */}
                <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
                  <div className="relative h-14 w-14">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${rec.score}, 100`}
                        className={scoreTextColor}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${scoreTextColor}`}>
                      {rec.score}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    SCORE
                  </span>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${tipoConfig.color}`}
                    >
                      {tipoConfig.icon}
                      {tipoConfig.label}
                    </span>
                    {rec.categoria && (
                      <span className="text-[10px] text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">
                        {rec.categoria}
                      </span>
                    )}
                    {index === 0 && (
                      <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 rounded-full px-2 py-0.5">
                        MELHOR MATCH
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {rec.item}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {rec.motivo}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    {rec.downloads !== undefined && (
                      <span className="text-[11px] text-muted-foreground">
                        {rec.downloads.toLocaleString()} downloads
                      </span>
                    )}
                    {rec.rating !== undefined && (
                      <span className="text-[11px] text-muted-foreground">
                        ★ {rec.rating}/5
                      </span>
                    )}
                  </div>
                </div>

                {/* Link */}
                <a
                  href={`/opendex${tipoConfig.href}/${rec.slug}`}
                  className="inline-flex items-center justify-center rounded-md border border-border/50 p-2 text-muted-foreground transition-all hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                  title={`Ver ${rec.item}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

