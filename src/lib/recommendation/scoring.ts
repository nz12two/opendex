import type { Projeto, Recomendacao, PontuacaoDetalhada, CatalogItem } from './types';
import { PESOS } from './types';

/**
 * Calcula o match de frameworks entre o projeto e um item do catálogo.
 * Retorna score entre 0 e 1.
 */
function calcularFrameworkMatch(projeto: Projeto, item: CatalogItem): number {
  if (!projeto.frameworks || projeto.frameworks.length === 0) return 0;

  const itemText = [item.name, item.description, ...item.tags]
    .join(' ')
    .toLowerCase();

  const matches = projeto.frameworks.filter((fw) => itemText.includes(fw.toLowerCase()));
  if (matches.length === 0) return 0;

  // Score proporcional: quantos frameworks do projeto foram encontrados
  return Math.min(matches.length / projeto.frameworks.length, 1);
}

/**
 * Calcula overlap de tags entre o projeto e o item.
 * Retorna score entre 0 e 1 baseado na proporção de tags coincidentes.
 */
function calcularTagMatch(projeto: Projeto, item: CatalogItem): number {
  const projectTags = [
    ...(projeto.frameworks || []),
    ...(projeto.bancos || []),
    ...(projeto.features || []),
    ...(projeto.tags || []),
  ].map((t) => t.toLowerCase());

  if (projectTags.length === 0) return 0;

  const itemTags = [...item.tags, item.name, item.category || ''].map((t) => t.toLowerCase());

  let overlap = 0;
  for (const pTag of projectTags) {
    if (itemTags.some((iTag) => iTag.includes(pTag) || pTag.includes(iTag))) {
      overlap++;
    }
  }

  if (overlap === 0) return 0;

  const ratio = overlap / projectTags.length;

  // Tag overlap > 50% = 0.25 weight contribution
  if (ratio > 0.5) return 1;
  // Tag overlap > 25% = 0.10 weight contribution  
  if (ratio > 0.25) return 0.4;
  return 0.1;
}

/**
 * Calcula score de popularidade baseado em downloads.
 * Downloads > 1000 = score alto
 */
function calcularPopularidade(item: CatalogItem): number {
  const downloads = item.downloads || 0;

  if (downloads >= 4000) return 1;
  if (downloads >= 3000) return 0.9;
  if (downloads >= 2000) return 0.75;
  if (downloads >= 1000) return 0.6;
  if (downloads >= 500) return 0.4;
  if (downloads > 0) return 0.2;
  return 0;
}

/**
 * Calcula compatibilidade com a stack do projeto.
 * Itens que têm tags que se alinham com frameworks/bancos/features do projeto.
 */
function calcularCompatibilidade(projeto: Projeto, item: CatalogItem): number {
  if (!projeto.tags || projeto.tags.length === 0) return 0;

  const projectTags = projeto.tags.map((t) => t.toLowerCase());
  const itemTags = [...item.tags, item.category || '', item.description].map((t) => t.toLowerCase());

  let matches = 0;
  for (const pTag of projectTags) {
    if (itemTags.some((iTag) => iTag.includes(pTag))) {
      matches++;
    }
  }

  if (matches === 0) return 0;
  return Math.min(matches / projectTags.length, 1);
}

/**
 * Calcula match de categoria do projeto com a categoria do item.
 */
function calcularCategoria(projeto: Projeto, item: CatalogItem): number {
  if (!item.category) return 0;
  if (!projeto.tags || projeto.tags.length === 0) return 0;

  const itemCategory = item.category.toLowerCase();
  const projectTags = projeto.tags.map((t) => t.toLowerCase());

  // Verifica se alguma tag do projeto corresponde à categoria do item
  if (projectTags.some((t) => itemCategory.includes(t) || t.includes(itemCategory))) {
    return 1;
  }

  // Verifica na descrição
  const descMatch = projeto.descricao.toLowerCase().includes(itemCategory);
  return descMatch ? 0.5 : 0;
}

/**
 * Calcula o score total ponderado para um item de catálogo em relação ao projeto.
 */
export function calcularScore(
  projeto: Projeto,
  item: CatalogItem,
): PontuacaoDetalhada {
  const framework_match = calcularFrameworkMatch(projeto, item);
  const tag_match = calcularTagMatch(projeto, item);
  const popularidade = calcularPopularidade(item);
  const compatibilidade = calcularCompatibilidade(projeto, item);
  const categoria = calcularCategoria(projeto, item);

  const total =
    framework_match * PESOS.framework_match +
    tag_match * PESOS.tag_match +
    popularidade * PESOS.popularidade +
    compatibilidade * PESOS.compatibilidade +
    categoria * PESOS.categoria;

  return {
    framework_match,
    tag_match,
    popularidade,
    compatibilidade,
    categoria,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Gera o motivo legível para a recomendação baseado na pontuação.
 */
export function gerarMotivo(
  projeto: Projeto,
  item: CatalogItem,
  score: PontuacaoDetalhada,
): string {
  const motivos: string[] = [];

  if (score.framework_match > 0 && projeto.frameworks && projeto.frameworks.length > 0) {
    motivos.push(`Framework ${projeto.frameworks[0]} detectado`);
  }

  if (score.tag_match > 0.5) {
    motivos.push('Tags compatíveis com seu projeto');
  } else if (score.tag_match > 0.25) {
    motivos.push('Tags parcialmente compatíveis');
  }

  if (score.popularidade >= 0.6) {
    motivos.push('Item muito popular na comunidade');
  } else if (score.popularidade > 0) {
    motivos.push('Popularidade moderada');
  }

  if (score.compatibilidade > 0.5) {
    motivos.push('Alta compatibilidade com sua stack');
  }

  if (score.categoria > 0) {
    motivos.push(`Categoria ${item.category || 'relacionada'} ao seu projeto`);
  }

  if (motivos.length === 0) {
    // Fallback baseado na descrição
    const descLower = projeto.descricao.toLowerCase();
    if (item.tags.some((t) => descLower.includes(t.toLowerCase()))) {
      motivos.push('Palavras-chave relacionadas');
    } else {
      motivos.push('Recomendação geral');
    }
  }

  return motivos[0]; // Principal motivo
}
