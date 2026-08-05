import { packages, type NpmPackage } from '../npm';
import type { MCP } from './types';

export type { MCP };

function slugify(name: string): string {
  return name.replace(/^@/, '').replace(/\//g, '-');
}

/** Categorização derivada das keywords reais do pacote npm (fonte: packages.json). */
const CATEGORY_RULES: { match: string[]; category: string }[] = [
  { match: ['browser', 'chrome', 'devtools'], category: 'Browser' },
  { match: ['memory', 'context', 'rag', 'notes', 'obsidian'], category: 'Memória e Contexto' },
  { match: ['telemetry', 'observability', 'monitoring', 'sentry'], category: 'Observabilidade' },
  { match: ['git', 'github', 'claude'], category: 'Git e Integração' },
  { match: ['orchestrat', 'multi-agent', 'agent', 'routing'], category: 'Orquestração' },
  { match: ['governance', 'config', 'adapter', 'host'], category: 'Infraestrutura' },
];

function getCategory(pkg: NpmPackage): string {
  const kw = pkg.keywords.map((k) => k.toLowerCase()).join(' ');
  for (const rule of CATEGORY_RULES) {
    if (rule.match.some((m) => kw.includes(m))) return rule.category;
  }
  return 'MCP';
}

function getTags(pkg: NpmPackage): string[] {
  return [...new Set(pkg.keywords)].slice(0, 12);
}

function toMCP(pkg: NpmPackage): MCP {
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
 * MCPs reais: pacotes npm do snapshot `src/data/npm/packages.json`
 * que se declaram como MCP na keyword. Nenhum dado inventado.
 */
export const mcps: MCP[] = packages
  .filter((pkg) => pkg.keywords.map((k) => k.toLowerCase()).includes('mcp'))
  .map(toMCP);

export function getMCPBySlug(slug: string): MCP | undefined {
  return mcps.find(m => m.slug === slug);
}

export function getMCPCategories(): string[] {
  const catSet = new Set<string>();
  mcps.forEach(m => catSet.add(m.category));
  return [...catSet].sort();
}

export function getMCPTags(): string[] {
  const tagSet = new Set<string>();
  mcps.forEach(m => m.tags.forEach(t => tagSet.add(t)));
  return [...tagSet].sort();
}
