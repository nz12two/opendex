import rawPackages from './packages.json';

export interface NpmPackage {
  name: string;
  version: string;
  description: string;
  keywords: string[];
  publisher: string | null;
  downloads: number;
  date: string | null;
  repository: string | null;
  npm: string | null;
}

/** Lista completa de pacotes npm do ecossistema OpenCode */
export const packages = rawPackages as NpmPackage[];

/**
 * Busca um pacote pelo nome exato.
 */
export function getPackageById(name: string): NpmPackage | undefined {
  return packages.find(p => p.name === name);
}

/**
 * Retorna os N pacotes com maior número de downloads mensais.
 * @param limit Número máximo de pacotes a retornar (default: 10)
 */
export function getTopDownloads(limit = 10): NpmPackage[] {
  return [...packages]
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, limit);
}

/**
 * Agrupa pacotes por keywords, retornando um mapa de keyword → pacotes.
 * Útil para categorizar o ecossistema.
 */
export function getCategories(): Record<string, NpmPackage[]> {
  const categories: Record<string, NpmPackage[]> = {};

  for (const pkg of packages) {
    const keywords = pkg.keywords;

    if (keywords.length === 0) {
      // Pacotes sem keyword vão para "uncategorized"
      if (!categories['uncategorized']) {
        categories['uncategorized'] = [];
      }
      categories['uncategorized'].push(pkg);
      continue;
    }

    for (const keyword of keywords) {
      if (!categories[keyword]) {
        categories[keyword] = [];
      }
      categories[keyword].push(pkg);
    }
  }

  return categories;
}
