import LiveGitHubStats from './LiveGitHubStats';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  CommunityDashboard — Orchestrator de métricas da comunidade        */
/* ------------------------------------------------------------------ */

export default function CommunityDashboard() {
  return (
    <section className="space-y-8">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            Métricas ao Vivo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Estatísticas em tempo real do ecossistema OpenCode no GitHub
          </p>
        </div>
      </div>

      {/* LiveGitHubStats expandido com 8 métricas */}
      <LiveGitHubStats />
    </section>
  );
}
