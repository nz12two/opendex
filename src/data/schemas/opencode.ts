// ========================================
// OpenDex Schema — Padrão opencode.json
// ========================================
// Este schema define o formato de metadados para plugins, agentes, MCPs, skills
// e outros ativos do ecossistema OpenCode.
//
// Repositórios podem incluir um arquivo opencode.json na raiz ou
// .github/opendex.json com estes campos para descoberta automática.

/** Tipos de ativos suportados */
export type AssetType = 'agent' | 'plugin' | 'mcp' | 'skill' | 'template' | 'tool' | 'theme' | 'unknown';

/** Categorias para cada tipo */
export type AgentCategory = 'planner' | 'builder' | 'reviewer' | 'tester' | 'debugger' | 'researcher' | 'coding' | 'writing' | 'data' | 'general';
export type PluginCategory = 'productivity' | 'git' | 'database' | 'docker' | 'mcp' | 'music' | 'image' | 'text' | 'terminal';
export type MCPCategory = 'filesystem' | 'database' | 'api' | 'search' | 'communication' | 'code' | 'custom';
export type SkillCategory = 'prompt' | 'workflow' | 'instruction' | 'template' | 'integration';

/** Informação de compatibilidade */
export interface Compatibility {
  /** Versão mínima do OpenCode (ex: >=1.3.0) */
  opencode?: string;
  /** Sistema operacional suportado */
  os?: string[];
  /** Engine/browser suportado */
  engine?: string;
}

/** Informação de licenciamento */
export interface License {
  spdx: string; // Ex: MIT, Apache-2.0, GPL-3.0
  commercial?: boolean;
  fee?: number;
}

/** Fonte/origem do ativo */
export interface AssetSource {
  /** URL do repositório GitHub */
  github?: string;
  /** Pacote npm */
  npm?: string;
  /** URL do site oficial */
  website?: string;
  /** Documentação */
  docs?: string;
}

/** Plugin de compatibilidade */
export interface OpenCodeAsset {
  /** Tipo do ativo */
  type: AssetType;
  /** Nome do ativo */
  name: string;
  /** Versão semântica */
  version: string;
  /** Descrição curta (máx 280 caracteres) */
  description: string;
  /** Autor(es) */
  author: string | { name: string; email?: string; url?: string };
  /** Licença */
  license?: string | License;
  /** Categoria principal */
  category: string;
  /** Tags para categorização */
  tags: string[];
  /** Compatibilidade */
  compatibility?: Compatibility;
  /** Fontes */
  source: AssetSource;
  /** Data de criação (ISO 8601) */
  createdAt?: string;
  /** Data da última atualização (ISO 8601) */
  updatedAt?: string;
}

// ========================================
// Tipos para Score/Relevância
// ========================================

export interface RelevanceScore {
  total: number;       // 0-100
  stars: number;       // 0-30
  recency: number;     // 0-20 (último commit)
  downloads: number;   // 0-20 (se aplicável)
  matchQuality: number;// 0-20 (quão bem o nome/descrição corresponde)
  community: number;   // 0-10 (issues, forks, contribuidores)
}

export function calculateScore(data: {
  stargazers_count?: number;
  pushed_at?: string;
  downloads?: number;
  name?: string;
  description?: string;
  forks_count?: number;
  open_issues_count?: number;
}): RelevanceScore {
  const now = new Date();

  // Stars: 0-30
  const stars = Math.min(30, (data.stargazers_count || 0) / 6000 * 30);

  // Recency: 0-20
  let recency = 0;
  if (data.pushed_at) {
    const daysSincePush = (now.getTime() - new Date(data.pushed_at).getTime()) / (1000 * 60 * 60 * 24);
    recency = Math.max(0, 20 - (daysSincePush / 15));
  }

  // Downloads (npm): 0-20
  const downloads = Math.min(20, (data.downloads || 0) / 50000 * 20);

  // Match quality: 0-20
  const name = (data.name || '').toLowerCase();
  const desc = (data.description || '').toLowerCase();
  let matchQuality = 0;
  if (name.includes('opencode')) matchQuality += 10;
  if (desc.includes('opencode')) matchQuality += 5;
  if (name.startsWith('@opencode')) matchQuality += 5;
  matchQuality = Math.min(20, matchQuality);

  // Community: 0-10
  const community = Math.min(10, ((data.forks_count || 0) + (data.open_issues_count || 0)) / 1000 * 10);

  const total = Math.round(Math.min(100, stars + recency + downloads + matchQuality + community));

  return { total, stars: Math.round(stars), recency: Math.round(recency), downloads: Math.round(downloads), matchQuality: Math.round(matchQuality), community: Math.round(community) };
}

// ========================================
// Source Tracking
// ========================================

export interface SourceInfo {
  /** Nome da fonte (GitHub, npm, Dev.to, etc) */
  source: string;
  /** URL direta */
  url: string;
  /** Data da última coleta */
  collectedAt: string;
  /** Hash/commit da versão coletada */
  version?: string;
  /** Timestamp da última atualização na fonte original */
  lastUpdated?: string;
}

/** Item unificado com score + fonte */
export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  type: AssetType;
  category: string;
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  score?: RelevanceScore;
  source: SourceInfo;
  url: string; // URL no OpenDex
  githubUrl?: string;
  npmUrl?: string;
}

// ========================================
// Coletores — Tipos de configuração
// ========================================

export type CollectorSource = 'github' | 'npm' | 'rss' | 'reddit' | 'youtube' | 'discord';

export interface CollectorConfig {
  source: CollectorSource;
  enabled: boolean;
  interval: number; // em minutos
  queries?: string[];
  maxResults?: number;
}
