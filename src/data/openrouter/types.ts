export interface OpenRouterPricing {
  prompt: string;
  completion: string;
  input_cache_read?: string;
}

export interface OpenRouterArchitecture {
  modality: string;
  input_modalities: string[];
  output_modalities: string[];
  tokenizer?: string;
  instruct_type?: string | null;
}

export interface OpenRouterReasoning {
  mandatory: boolean;
  default_enabled: boolean;
}

export interface OpenRouterTopProvider {
  context_length?: number;
  max_completion_tokens?: number;
  is_moderated?: boolean;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: OpenRouterPricing;
  architecture: OpenRouterArchitecture;
  top_provider?: OpenRouterTopProvider;
  reasoning?: OpenRouterReasoning;
}

/** Filtros disponíveis para getFilteredModels */
export interface ModelFilters {
  provider?: string;
  free?: boolean;
  vision?: boolean;
  reasoning?: boolean;
  minContext?: number;
  maxContext?: number;
  search?: string;
}
