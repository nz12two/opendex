import rawStats from './stats.json';

export interface TopDownload {
  name: string;
  downloads: number;
}

export interface EcosystemStats {
  generatedAt: string;
  packages: {
    total: number;
    totalMonthlyDownloads: number;
    topDownloads: TopDownload[];
  };
  github: {
    totalEcosystemRepos: number;
    totalEcosystemStars: number;
    mainRepoStars: number;
    mainRepoForks: number;
    mainRepoOpenIssues: number;
  };
  community?: {
    totalBlogPosts: number;
    totalRedditPosts: number;
    totalYouTubeVideos: number;
  };
}

/** Estatísticas agregadas do ecossistema OpenCode */
export const stats = rawStats as EcosystemStats;

/**
 * Retorna o total de estrelas combinadas (ecossistema + repositório principal).
 */
export function getTotalStars(): number {
  return stats.github.totalEcosystemStars;
}

/**
 * Retorna o total de pacotes npm no ecossistema.
 */
export function getTotalPackages(): number {
  return stats.packages.total;
}
