import type { OpenRouterModel, ModelFilters } from './types';
import rawModels from './models.json';

export type { OpenRouterModel, ModelFilters };

/** Lista completa de modelos do OpenRouter (dados estáticos) */
export const models = rawModels as OpenRouterModel[];

/**
 * Busca um modelo pelo ID (ex: "openai/gpt-4o").
 */
export function getModelById(id: string): OpenRouterModel | undefined {
  return models.find(m => m.id === id);
}

/**
 * Retorna todos os modelos de um provedor específico.
 * O provedor é extraído do prefixo do ID (ex: "openai", "anthropic").
 */
export function getModelsByProvider(provider: string): OpenRouterModel[] {
  const q = provider.toLowerCase();
  return models.filter(m => {
    const parts = m.id.split('/');
    return parts.length >= 2 && parts[0].toLowerCase() === q;
  });
}

/**
 * Lista todos os provedores únicos disponíveis, extraídos do prefixo dos IDs.
 */
export function getUniqueProviders(): string[] {
  const providers = new Set<string>();
  for (const m of models) {
    const parts = m.id.split('/');
    if (parts.length >= 2) {
      providers.add(parts[0]);
    }
  }
  return [...providers].sort();
}

/**
 * Filtra modelos com base em critérios flexíveis.
 * Todos os filtros são opcionais — apenas os fornecidos são aplicados.
 */
export function getFilteredModels(filters: ModelFilters): OpenRouterModel[] {
  return models.filter(m => {
    // Filtro por provedor
    if (filters.provider) {
      const parts = m.id.split('/');
      if (parts.length < 2 || parts[0].toLowerCase() !== filters.provider.toLowerCase()) {
        return false;
      }
    }

    // Apenas modelos gratuitos (prompt price === 0)
    if (filters.free) {
      const promptPrice = parseFloat(m.pricing.prompt);
      if (promptPrice !== 0) return false;
    }

    // Apenas modelos com suporte a imagem (vision)
    if (filters.vision) {
      if (!m.architecture?.input_modalities?.includes('image')) return false;
    }

    // Apenas modelos com reasoning habilitado por padrão
    if (filters.reasoning) {
      if (!m.reasoning?.default_enabled) return false;
    }

    // Contexto mínimo
    if (filters.minContext !== undefined) {
      if (m.context_length < filters.minContext) return false;
    }

    // Contexto máximo
    if (filters.maxContext !== undefined) {
      if (m.context_length > filters.maxContext) return false;
    }

    // Busca textual por nome ou ID
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !m.name.toLowerCase().includes(q) &&
        !m.id.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    return true;
  });
}
