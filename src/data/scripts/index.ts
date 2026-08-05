import { packages, type NpmPackage } from '../npm';
import type { Script } from './types';

export type { Script };

function slugify(name: string): string {
  return name.replace(/^@/, '').replace(/\//g, '-');
}

/** Categorização derivada das keywords reais do pacote npm (fonte: packages.json). */
const CATEGORY_RULES: { match: string[]; category: string }[] = [
  { match: ['sdk', 'api', 'client', 'typescript'], category: 'SDK' },
  { match: ['auth', 'oauth', 'security', 'secrets'], category: 'Segurança' },
  { match: ['memory', 'context', 'pruning', 'rag'], category: 'Memória e Contexto' },
  { match: ['browser', 'chrome', 'devtools', 'playwright'], category: 'Browser' },
  { match: ['telemetry', 'observability', 'monitoring', 'otel', 'sentry'], category: 'Observabilidade' },
  { match: ['automation', 'orchestrat', 'scheduler', 'cron', 'agent'], category: 'Automação' },
  { match: ['git', 'github', 'gitlab', 'gitea'], category: 'Git' },
  { match: ['provider', 'router', 'model', 'llm', 'gateway'], category: 'Provedores' },
  { match: ['terminal', 'tui', 'cli', 'shell'], category: 'Terminal' },
];

function getCategory(pkg: NpmPackage): string {
  const kw = pkg.keywords.map((k) => k.toLowerCase()).join(' ');
  for (const rule of CATEGORY_RULES) {
    if (rule.match.some((m) => kw.includes(m))) return rule.category;
  }
  return 'Ferramenta';
}

function getTags(pkg: NpmPackage): string[] {
  return [...new Set(pkg.keywords)].slice(0, 12);
}

function toScript(pkg: NpmPackage): Script {
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
 * Scripts/ferramentas reais: pacotes npm do snapshot `src/data/npm/packages.json`
 * que NÃO se declaram como plugin nem MCP (os que sobraram do ecossistema).
 * Nenhum dado inventado.
 */
export const scripts: Script[] = packages
  .filter((pkg) => {
    const kw = pkg.keywords.map((k) => k.toLowerCase());
    return !kw.includes('plugin') && !kw.includes('mcp');
  })
  .map(toScript);

export function getScriptBySlug(slug: string): Script | undefined {
  return scripts.find(s => s.slug === slug);
}

export function getScriptsByCategory(category: string): Script[] {
  return scripts.filter(s => s.category === category);
}

export function getScriptCategories(): string[] {
  return [...new Set(scripts.map(s => s.category))];
}

export function getScriptTags(): string[] {
  const tagSet = new Set<string>();
  scripts.forEach(s => s.tags.forEach(t => tagSet.add(t)));
  return [...tagSet].sort();
}
