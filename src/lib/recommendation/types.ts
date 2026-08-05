export interface Projeto {
  descricao: string;
  frameworks?: string[];
  bancos?: string[];
  features?: string[];
  tags?: string[];
}

export interface Recomendacao {
  tipo: 'agente' | 'plugin' | 'mcp' | 'workflow' | 'prompt' | 'script';
  item: string;
  slug: string;
  score: number;
  motivo: string;
  categoria?: string;
  tags?: string[];
  downloads?: number;
  rating?: number;
}

export interface PontuacaoDetalhada {
  framework_match: number;
  tag_match: number;
  popularidade: number;
  compatibilidade: number;
  categoria: number;
  total: number;
}

export interface Gargalo {
  tipo: 'warning' | 'danger' | 'info';
  mensagem: string;
  sugestao: string;
}

export interface ResultadoRecomendacao {
  recomendacoes: Recomendacao[];
  gargalos: Gargalo[];
}

export interface CatalogItem {
  name: string;
  slug: string;
  description: string;
  tags: string[];
  category?: string;
  rating?: number;
  downloads?: number;
}

export const PESOS = {
  framework_match: 0.3,
  tag_match: 0.25,
  popularidade: 0.15,
  compatibilidade: 0.15,
  categoria: 0.15,
} as const;
