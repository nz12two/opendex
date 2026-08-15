import { agents, type Agent } from '../agents';
import { tools, type Tool } from '../tools';
import { plugins, type Plugin } from '../plugins';
import { mcps, type MCP } from '../mcps';
import { scripts, type Script } from '../scripts';
import { workflows, type Workflow } from '../workflows';
import { comparisons, type Comparison } from '../comparisons';
import { projects, type ShowcaseProject } from '../showcase';

import { prompts, type Prompt } from '../prompts';
import { newsItems, type NewsItem } from '../news';

export interface SearchItem {
  title: string;
  description: string;
  slug: string;
  type: 'modelo' | 'plugin' | 'mcp' | 'script' | 'agente' | 'workflow' | 'comparacao' | 'showcase' | 'ferramenta' | 'doc' | 'blog';
  url: string;
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  icon?: string;
}

const DOCS: { title: string; description: string; slug: string; tags: string[] }[] = [
  { title: 'Quickstart', description: 'Comece a usar o OpenCode em minutos', slug: 'quickstart', tags: ['instalação', 'início'] },
  { title: 'Instalação', description: 'Instale o OpenCode no seu ambiente', slug: 'instalacao', tags: ['instalação', 'setup'] },
  { title: 'Configuração', description: 'Configure o OpenCode com opencode.json', slug: 'configuracao', tags: ['config', 'opencode.json'] },
  { title: 'Modelos', description: 'Modelos de IA suportados e como configurá-los', slug: 'modelos', tags: ['modelos', 'ia'] },
  { title: 'Plugins', description: 'Criação e uso de plugins no OpenCode', slug: 'plugins', tags: ['plugins', 'extensões'] },
  { title: 'MCP', description: 'Servidores MCP e integração de ferramentas', slug: 'mcp', tags: ['mcp', 'ferramentas'] },
  { title: 'Agentes', description: 'Crie e configure agentes no OpenCode', slug: 'agentes', tags: ['agentes'] },
  { title: 'Workflows', description: 'Automatize tarefas com workflows', slug: 'workflows', tags: ['workflows', 'automação'] },
  { title: 'API', description: 'Referência da API do OpenCode', slug: 'api', tags: ['api', 'referência'] },
  { title: 'opencode.json', description: 'Referência completa do schema opencode.json', slug: 'opencode-json', tags: ['schema', 'config'] },
  { title: 'FAQ', description: 'Perguntas frequentes sobre o OpenCode', slug: 'faq', tags: ['faq', 'dúvidas'] },
];

/**
 * Agrega todos os itens pesquisáveis das fontes de dados.
 */
export const searchIndex: SearchItem[] = [
  // Agentes
  ...agents.map((a: Agent): SearchItem => ({
    title: a.name,
    description: a.description,
    slug: a.slug,
    type: 'agente',
    url: `/opendex/agents/${a.slug}/`,
    tags: a.tags || [],
    difficulty: undefined,
    icon: 'Bot',
  })),

  // Ferramentas
  ...tools.map((t: Tool): SearchItem => ({
    title: t.name,
    description: t.description,
    slug: t.slug,
    type: 'ferramenta',
    url: `/opendex/ferramentas/${t.slug}/`,
    tags: t.tags || [],
    difficulty: t.difficulty,
    category: t.category,
    icon: t.icon,
  })),

  // Plugins
  ...plugins.map((p: Plugin): SearchItem => ({
    title: p.name,
    description: p.description,
    slug: p.slug,
    type: 'plugin',
    url: `/opendex/plugins/${p.slug}/`,
    tags: p.tags,
    category: p.category,
    icon: p.icon,
  })),

  // MCPs
  ...mcps.map((m: MCP): SearchItem => ({
    title: m.name,
    description: m.description,
    slug: m.slug,
    type: 'mcp',
    url: `/opendex/mcps/${m.slug}/`,
    tags: m.tags,
    category: m.category,
    icon: m.icon,
  })),

  // Scripts
  ...scripts.map((s: Script): SearchItem => ({
    title: s.name,
    description: s.description,
    slug: s.slug,
    type: 'script',
    url: `/opendex/scripts/${s.slug}/`,
    tags: s.tags,
    category: s.category,
  })),

  // Workflows
  ...workflows.map((w: Workflow): SearchItem => ({
    title: w.name,
    description: w.description,
    slug: w.slug,
    type: 'workflow',
    url: `/opendex/workflows/${w.slug}/`,
    tags: w.tags || [],
  })),

  // Comparações
  ...comparisons.map((c: Comparison): SearchItem => ({
    title: `${c.tool} vs ${c.vs}`,
    description: c.description,
    slug: c.slug,
    type: 'comparacao',
    url: `/opendex/comparacoes/${c.slug}/`,
    tags: c.tags || [],
    difficulty: c.difficulty,
  })),

  // Showcase
  ...projects.map((p: ShowcaseProject): SearchItem => ({
    title: p.name,
    description: p.description,
    slug: p.slug,
    type: 'showcase',
    url: `/opendex/showcase/${p.slug}/`,
    tags: p.tags,
    category: p.type,
  })),

  // Prompts
  ...prompts.map((p: Prompt): SearchItem => ({
    title: p.name,
    description: p.description,
    slug: p.slug,
    type: 'script',
    url: `/opendex/prompts/${p.slug}/`,
    tags: p.tags,
    category: p.category,
  })),

  // News
  ...newsItems.map((n: NewsItem): SearchItem => ({
    title: n.title,
    description: n.description,
    slug: n.id,
    type: 'blog',
    url: `/opendex/news/`,
    tags: n.tags || [],
  })),

  // Docs (Starlight) — unifica a busca do site com a documentação
  ...DOCS.map((d): SearchItem => ({
    title: d.title,
    description: d.description,
    slug: d.slug,
    type: 'doc',
    url: `/opendex/docs/${d.slug}/`,
    tags: ['docs', ...d.tags],
  })),
];

/**
 * Retorna todos os tipos únicos disponíveis no índice.
 */
export function getSearchTypes(): SearchItem['type'][] {
  const types = new Set<SearchItem['type']>();
  searchIndex.forEach(item => types.add(item.type));
  return [...types];
}

/**
 * Retorna todas as tags únicas disponíveis no índice, ordenadas por frequência (mais usadas primeiro).
 */
export function getSearchTags(): string[] {
  const freq = new Map<string, number>();
  searchIndex.forEach(item => {
    item.tags.forEach(tag => {
      freq.set(tag, (freq.get(tag) || 0) + 1);
    });
  });
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}

/**
 * Retorna as top N tags mais comuns.
 */
export function getTopSearchTags(n = 20): string[] {
  return getSearchTags().slice(0, n);
}

/**
 * Filtra o índice por tipo.
 */
export function filterByType(type: SearchItem['type'] | 'all'): SearchItem[] {
  if (type === 'all') return searchIndex;
  return searchIndex.filter(item => item.type === type);
}

/**
 * Filtra o índice por dificuldade.
 */
export function filterByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all'): SearchItem[] {
  if (difficulty === 'all') return searchIndex;
  return searchIndex.filter(item => item.difficulty === difficulty);
}
