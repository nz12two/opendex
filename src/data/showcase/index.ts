import type { ShowcaseProject } from './types';
import ecosystemRepos from '../github/ecosystem-repos.json';

export { type ShowcaseProject };

interface EcosystemRepo {
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  html_url: string;
  pushed_at: string;
  collectedAt: string;
  lastUpdated: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  score: number;
}

const repos = ecosystemRepos as EcosystemRepo[];
const repoLookup = new Map<string, EcosystemRepo>(
  repos.map((repo) => [repo.full_name, repo] as [string, EcosystemRepo])
);

const SHOWCASE_FULL_NAMES = [
  'code-yeongyu/oh-my-openagent',
  'kepano/obsidian-skills',
  'nickjvandyke/opencode.nvim',
  'awesome-opencode/awesome-opencode',
  'DeusData/codebase-memory-mcp',
  'mksglu/context-mode',
  'diegosouzapw/OmniRoute',
  'affaan-m/ECC',
];

const DISPLAY_NAMES: Record<string, string> = {
  'code-yeongyu/oh-my-openagent': 'Oh My OpenAgent',
  'kepano/obsidian-skills': 'Obsidian Skills',
  'nickjvandyke/opencode.nvim': 'OpenCode Neovim',
  'mksglu/context-mode': 'Context Mode',
  'awesome-opencode/awesome-opencode': 'Awesome OpenCode',
  'DeusData/codebase-memory-mcp': 'Codebase Memory MCP',
  'diegosouzapw/OmniRoute': 'OmniRoute',
  'affaan-m/ECC': 'ECC',
};

function slugify(fullName: string): string {
  const repo = fullName.split('/')[1];
  return repo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function readableName(fullName: string): string {
  const known = DISPLAY_NAMES[fullName];
  if (known) return known;
  const repo = fullName.split('/')[1];
  return repo.replace(/[-_.]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function deriveType(topics: string[]): string {
  const joined = topics.join(' ').toLowerCase();
  if (joined.includes('mcp')) return 'MCP';
  if (joined.includes('plugin')) return 'Plugins';
  if (joined.includes('neovim') || joined.includes('editor')) return 'Plugins';
  if (joined.includes('agent')) return 'Agentes';
  if (topics.length === 0) return 'Recursos';
  return 'Ferramentas';
}

export const projects: ShowcaseProject[] = SHOWCASE_FULL_NAMES.map((fullName, index) => {
  const repo = repoLookup.get(fullName);
  // Repo não está mais no coletor — não inventar, apenas pular.
  if (!repo) return null;
  return {
    name: readableName(repo.full_name),
    slug: slugify(repo.full_name),
    description: repo.description ?? '',
    author: repo.owner.login,
    tags: repo.topics,
    type: deriveType(repo.topics),
    url: repo.html_url,
    featured: index < 4,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    avatar: repo.owner.avatar_url,
    score: repo.score,
    lastUpdated: repo.lastUpdated,
  };
}).filter((project): project is ShowcaseProject => project !== null);

export const collectedAt = repos.reduce(
  (max, repo) => (repo.collectedAt > max ? repo.collectedAt : max),
  ''
);

export function getProjectBySlug(slug: string): ShowcaseProject | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectTypes(): string[] {
  const typeSet = new Set<string>();
  projects.forEach((p) => typeSet.add(p.type));
  return [...typeSet].sort();
}

export function getFeaturedProjects(): ShowcaseProject[] {
  return projects.filter((p) => p.featured);
}
