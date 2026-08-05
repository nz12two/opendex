import { packages, type NpmPackage } from '../npm';
import type { Plugin } from './types';

export type { Plugin };

function slugify(name: string): string {
  return name.replace(/^@/, '').replace(/\//g, '-');
}

/** Categorização derivada das keywords reais do pacote npm (fonte: packages.json). */
const CATEGORY_RULES: { match: string[]; category: string }[] = [
  { match: ['auth', 'oauth', 'security', 'secrets', 'privacy'], category: 'Segurança' },
  { match: ['memory', 'mem', 'context', 'pruning', 'cache', 'rag'], category: 'Memória e Contexto' },
  { match: ['browser', 'chrome', 'devtools'], category: 'Browser' },
  { match: ['telemetry', 'observability', 'monitoring', 'otel', 'sentry', 'langfuse'], category: 'Observabilidade' },
  { match: ['scheduler', 'cron', 'automation', 'orchestrat', 'background', 'scheduling'], category: 'Automação' },
  { match: ['provider', 'router', 'model', 'llm', 'gateway', 'proxy'], category: 'Provedores' },
  { match: ['git', 'gitea', 'github', 'gitlab'], category: 'Git' },
  { match: ['workflow', 'skills', 'rules', 'planning', 'sdd'], category: 'Workflow' },
  { match: ['slack', 'telegram', 'notification', 'notify'], category: 'Notificações' },
  { match: ['snippet', 'tui', 'statusline', 'logo', 'terminal'], category: 'Interface' },
  { match: ['sdk', 'api', 'client', 'typescript'], category: 'SDK' },
];

function getCategory(pkg: NpmPackage): string {
  const kw = pkg.keywords.map((k) => k.toLowerCase()).join(' ');
  for (const rule of CATEGORY_RULES) {
    if (rule.match.some((m) => kw.includes(m))) return rule.category;
  }
  return 'Plugin';
}

function getTags(pkg: NpmPackage): string[] {
  return [...new Set(pkg.keywords)].slice(0, 12);
}

function toPlugin(pkg: NpmPackage): Plugin {
  return {
    name: pkg.name,
    slug: slugify(pkg.name),
    description: pkg.description,
    category: getCategory(pkg),
    tags: getTags(pkg),
    author: pkg.publisher || 'Desconhecido',
    downloads: pkg.downloads,
    version: pkg.version,
    npm: pkg.npm || `https://www.npmjs.com/package/${pkg.name}`,
    repository: pkg.repository,
  };
}

/**
 * Plugins reais: pacotes npm do snapshot `src/data/npm/packages.json`
 * que se declaram como plugin na keyword. Nenhum dado inventado.
 */
export const plugins: Plugin[] = packages
  .filter((pkg) => pkg.keywords.map((k) => k.toLowerCase()).includes('plugin'))
  .map(toPlugin);

export function getPluginBySlug(slug: string): Plugin | undefined {
  return plugins.find(p => p.slug === slug);
}

export function getPluginCategories(): string[] {
  const catSet = new Set<string>();
  plugins.forEach(p => catSet.add(p.category));
  return [...catSet].sort();
}

export function getPluginTags(): string[] {
  const tagSet = new Set<string>();
  plugins.forEach(p => p.tags.forEach(t => tagSet.add(t)));
  return [...tagSet].sort();
}
