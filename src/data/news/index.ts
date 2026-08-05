import type { NewsItem } from './types';
import communityPosts from '../blog/community-posts.json';

export { type NewsItem };

interface DevtoPost {
  id: number;
  url: string;
  title: string;
  description: string;
  tags: string;
  publishedAt: string;
  author: string;
}

/**
 * Releases reais do repositório anomalyco/opencode (feed Atom público de releases,
 * github.com/anomalyco/opencode/releases.atom). Cada item aponta para a URL real da release.
 */
const releases: NewsItem[] = [
  {
    id: 'release-1-18-10',
    title: 'OpenCode v1.18.10',
    description: 'Core: descoberta automática de modelos Modal. Desktop: melhorias em abas, toasts e botão de nova sessão; correção de abas corrompidas persistidas.',
    date: '2026-07-30',
    type: 'release',
    icon: 'Rocket',
    url: 'https://github.com/anomalyco/opencode/releases/tag/v1.18.10',
    source: 'GitHub Releases',
    tags: ['release', 'core', 'desktop'],
  },
  {
    id: 'release-1-18-9',
    title: 'OpenCode v1.18.9',
    description: 'Core: compatibilidade restaurada com clientes legados de MCP SDK. Desktop: correções de crash no Solid, carregamento da home e melhorias no layout V2.',
    date: '2026-07-28',
    type: 'release',
    icon: 'Rocket',
    url: 'https://github.com/anomalyco/opencode/releases/tag/v1.18.9',
    source: 'GitHub Releases',
    tags: ['release', 'core', 'desktop'],
  },
  {
    id: 'release-1-18-8',
    title: 'OpenCode v1.18.8',
    description: 'Core: melhor compatibilidade com servidores MCP e fluxos OAuth; reconexão de MCP após sessões de SDK expiradas e honra de portas de callback.',
    date: '2026-07-28',
    type: 'release',
    icon: 'Rocket',
    url: 'https://github.com/anomalyco/opencode/releases/tag/v1.18.8',
    source: 'GitHub Releases',
    tags: ['release', 'core', 'mcp'],
  },
  {
    id: 'release-1-18-7',
    title: 'OpenCode v1.18.7',
    description: 'Desktop: correção do inset da titlebar em fullscreen no macOS, ajustes no command palette e seletor de projetos com rolagem. Contribuições de 2 membros da comunidade.',
    date: '2026-07-27',
    type: 'release',
    icon: 'Rocket',
    url: 'https://github.com/anomalyco/opencode/releases/tag/v1.18.7',
    source: 'GitHub Releases',
    tags: ['release', 'desktop', 'comunidade'],
  },
  {
    id: 'release-1-18-6',
    title: 'OpenCode v1.18.6',
    description: 'Core: correção de caches de repositório por branch. Desktop: melhor compatibilidade com a nova API do client e correções de MCP/Providers no V1.',
    date: '2026-07-27',
    type: 'release',
    icon: 'Rocket',
    url: 'https://github.com/anomalyco/opencode/releases/tag/v1.18.6',
    source: 'GitHub Releases',
    tags: ['release', 'core', 'desktop'],
  },
  {
    id: 'release-1-18-5',
    title: 'OpenCode v1.18.5',
    description: 'Core: melhorias em adaptive thinking (Claude), correções de reasoning e cache de prompt no Mistral, e preservação de symlinks em resultados de grep.',
    date: '2026-07-24',
    type: 'release',
    icon: 'Rocket',
    url: 'https://github.com/anomalyco/opencode/releases/tag/v1.18.5',
    source: 'GitHub Releases',
    tags: ['release', 'core'],
  },
  {
    id: 'release-1-18-4',
    title: 'OpenCode v1.18.4',
    description: 'Core: controles de adaptive thinking para modelos Kimi em provedores Anthropic-compatible; suporte a Azure Cognitive Services restaurado.',
    date: '2026-07-20',
    type: 'release',
    icon: 'Rocket',
    url: 'https://github.com/anomalyco/opencode/releases/tag/v1.18.4',
    source: 'GitHub Releases',
    tags: ['release', 'core'],
  },
];

/**
 * Posts reais coletados do Dev.to (src/data/blog/community-posts.json).
 * Cada item aponta para a URL real do post no Dev.to.
 */
const communityNews: NewsItem[] = (communityPosts as DevtoPost[]).map((post) => ({
  id: `post-${post.id}`,
  title: post.title,
  description: post.description,
  date: post.publishedAt.slice(0, 10),
  type: 'community',
  icon: 'Users',
  url: post.url,
  source: 'Dev.to',
  author: post.author,
  tags: post.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean),
}));

export const newsItems: NewsItem[] = [...releases, ...communityNews];

export function getNewsByType(type: NewsItem['type']): NewsItem[] {
  return newsItems.filter(n => n.type === type);
}

export function getNewsTypes(): NewsItem['type'][] {
  return [...new Set(newsItems.map(n => n.type))];
}
