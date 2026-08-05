import type { Projeto, Recomendacao, ResultadoRecomendacao, CatalogItem } from './types';
import { parseDescricao } from './parser';
import { calcularScore, gerarMotivo } from './scoring';
import { analisarGargalos } from './analyzer';

import { extractKeywords } from './parser';

// Importa dados dos catálogos existentes
import { agents } from '@/data/agents';
import { plugins } from '@/data/plugins';
import { mcps } from '@/data/mcps';
import { workflows } from '@/data/workflows';
import { prompts } from '@/data/prompts';
import { scripts } from '@/data/scripts';

/**
 * Converte um item de catálogo para o formato CatalogItem padronizado.
 */
function toCatalogItem(
  item: any,
  tipo: Recomendacao['tipo'],
  nameKey = 'name',
  slugKey = 'slug',
  descKey = 'description',
  tagsKey = 'tags',
  categoryKey = 'category',
): CatalogItem {
  return {
    name: item[nameKey],
    slug: item[slugKey],
    description: item[descKey],
    tags: item[tagsKey] || [],
    category: item[categoryKey],
    rating: item.rating,
    downloads: item.downloads,
  };
}

/**
 * Monta o catálogo unificado a partir de todos os data sources.
 */
function montarCatalogo(): Array<{ item: CatalogItem; tipo: Recomendacao['tipo'] }> {
  const catalogo: Array<{ item: CatalogItem; tipo: Recomendacao['tipo'] }> = [];

  // Agentes
  for (const agent of agents) {
    catalogo.push({
      item: toCatalogItem(agent, 'agente'),
      tipo: 'agente',
    });
  }

  // Plugins
  for (const plugin of plugins) {
    catalogo.push({
      item: toCatalogItem(plugin, 'plugin'),
      tipo: 'plugin',
    });
  }

  // MCPs
  for (const mcp of mcps) {
    catalogo.push({
      item: toCatalogItem(mcp, 'mcp'),
      tipo: 'mcp',
    });
  }

  // Workflows
  for (const workflow of workflows) {
    catalogo.push({
      item: toCatalogItem(workflow, 'workflow'),
      tipo: 'workflow',
    });
  }

  // Prompts
  for (const prompt of prompts) {
    catalogo.push({
      item: toCatalogItem(prompt, 'prompt'),
      tipo: 'prompt',
    });
  }

  // Scripts
  for (const script of scripts) {
    catalogo.push({
      item: toCatalogItem(script, 'script'),
      tipo: 'script',
    });
  }

  return catalogo;
}

/**
 * Motor principal de recomendação.
 *
 * Recebe uma descrição textual do projeto e retorna recomendações ranqueadas
 * com scores, motivos e gargalos detectados.
 */
export function recomendar(descricao: string, limite = 12): ResultadoRecomendacao {
  // 1. Parse da descrição
  const projeto: Projeto = parseDescricao(descricao);

  // Se não detectou nada, tenta extrair keywords para tags
  if (!projeto.tags || projeto.tags.length === 0) {
    projeto.tags = extractKeywords(descricao);
    projeto.features = projeto.tags;
  }

  // 2. Montar catálogo unificado
  const catalogo = montarCatalogo();

  // 3. Calcular scores para cada item
  const pontuados: Array<{
    score: number;
    item: CatalogItem;
    tipo: Recomendacao['tipo'];
  }> = [];

  for (const { item, tipo } of catalogo) {
    const scoreDetalhado = calcularScore(projeto, item);
    if (scoreDetalhado.total > 0) {
      pontuados.push({
        score: scoreDetalhado.total,
        item,
        tipo,
      });
    }
  }

  // 4. Ordenar por score decrescente
  pontuados.sort((a, b) => b.score - a.score);

  // 5. Pegar top N
  const topN = pontuados.slice(0, limite);

  // 6. Gerar recomendações
  const recomendacoes: Recomendacao[] = topN.map(({ score, item, tipo }) => {
    const scoreDetalhado = calcularScore(projeto, item);
    const motivo = gerarMotivo(projeto, item, scoreDetalhado);

    return {
      tipo,
      item: item.name,
      slug: item.slug,
      score: Math.round(score * 100),
      motivo,
      categoria: item.category,
      tags: item.tags,
      downloads: item.downloads,
      rating: item.rating,
    };
  });

  // 7. Analisar gargalos
  const gargalos = analisarGargalos(projeto);

  return {
    recomendacoes,
    gargalos,
  };
}

/**
 * Versão simplificada que já aceita string direta.
 */
export function recomendarPorTexto(descricao: string, limite = 12): ResultadoRecomendacao {
  return recomendar(descricao, limite);
}

export { parseDescricao } from './parser';
export { analisarGargalos } from './analyzer';
export { calcularScore } from './scoring';
