import { useState, useEffect } from 'react';
import { Package, Star, Download, Building2, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stats, type EcosystemStats } from '@/data/ecosystem/stats';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/* ------------------------------------------------------------------ */
/*  StatCard                                                           */
/* ------------------------------------------------------------------ */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  loading?: boolean;
}

function StatCard({ icon, label, value, subValue, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border/50 bg-card p-5 animate-pulse">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-5 w-5 rounded bg-muted-foreground/10" />
          <div className="h-3 w-20 rounded bg-muted-foreground/10" />
        </div>
        <div className="mt-3 h-8 w-24 rounded bg-muted-foreground/10" />
        <div className="mt-1 h-3 w-16 rounded bg-muted-foreground/10" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-card-foreground">
        {value}
      </p>
      {subValue && (
        <p className="mt-0.5 text-xs text-muted-foreground">{subValue}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function EcosystemStats() {
  const [ecosystemStats, setEcosystemStats] = useState<EcosystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load static stats from the imported data
    try {
      const data = stats as EcosystemStats;
      // Check if it has real data (not all zeros)
      if (data.packages.total > 0 || data.github.totalEcosystemStars > 0) {
        setEcosystemStats(data);
      } else {
        setError('Dados do ecossistema ainda não foram carregados.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCard key={i} icon={null} label="" value="" loading />
        ))}
      </div>
    );
  }

  // Error state
  if (error || !ecosystemStats) {
    return (
      <div className="rounded-lg border border-border/50 bg-card p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Dados indisponíveis</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {error || 'As estatísticas do ecossistema serão carregadas em breve.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { packages: pkg, github: gh } = ecosystemStats;
  const topDownloadsTotal = pkg.topDownloads.reduce((s, d) => s + d.downloads, 0);

  return (
    <div className="space-y-4">
      {/* Last updated */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-500">Estatísticas do ecossistema</span>
        </div>
        <span className="text-[10px] text-muted-foreground/60">
          Atualizado em {formatDate(pkg.generatedAt || ecosystemStats.generatedAt)}
        </span>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={<Package className="h-5 w-5 text-primary" />}
          label="Pacotes npm"
          value={formatNumber(pkg.total)}
          subValue={`${pkg.total.toLocaleString()} no registro`}
        />

        <StatCard
          icon={<Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />}
          label="Estrelas GitHub"
          value={formatNumber(gh.totalEcosystemStars)}
          subValue={`~${gh.totalEcosystemRepos.toLocaleString()} repositórios`}
        />

        <StatCard
          icon={<Download className="h-5 w-5 text-sky-500" />}
          label="Downloads/mês"
          value={formatNumber(topDownloadsTotal)}
          subValue="Top 10 pacotes combinados"
        />

        <StatCard
          icon={<Building2 className="h-5 w-5 text-violet-500" />}
          label="Repositórios"
          value={formatNumber(gh.totalEcosystemRepos)}
          subValue="No ecossistema"
        />

        <StatCard
          icon={<RefreshCw className="h-5 w-5 text-amber-500" />}
          label="Principal"
          value={`${formatNumber(gh.mainRepoStars)} ⭐`}
          subValue={`${formatNumber(gh.mainRepoForks)} forks · ${formatNumber(gh.mainRepoOpenIssues)} issues`}
        />
      </div>

      {/* Top downloads table */}
      {pkg.topDownloads.length > 0 && (
        <div className="rounded-lg border border-border/30 bg-card/50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-card-foreground">
            Top downloads npm
          </h4>
          <div className="space-y-1">
            {pkg.topDownloads.slice(0, 5).map((item, i) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <span className="w-5 text-center text-xs font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="flex-1 truncate font-medium text-card-foreground">
                  {item.name}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatNumber(item.downloads)}/mês
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
