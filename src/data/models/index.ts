import type { Model } from './types';

export type { Model };

export const models: Model[] = [
  // === FREE ===
  {
    name: "Gemini 2.5 Flash",
    slug: "gemini-25-flash",
    category: "free",
    speed: 5,
    quality: 4,
    price: "Free",
    context: 1048576,
    toolCalling: true,
    reasoning: true,
    whenToUse: "Projetos que precisam de alto contexto e respostas rápidas sem custo",
    whenNotToUse: "Tarefas que exigem máxima precisão ou raciocínio matemático complexo",
    communityRating: 4.5,
    provider: "Google",
    description: "Modelo gratuito do Google com janela de contexto massiva de 1M tokens e boa qualidade geral.",
    pros: [
      "Contexto de 1M tokens — maior do mercado",
      "Completamente gratuito",
      "Tool calling e reasoning nativos",
      "Velocidade excelente",
      "Suporte a multimodalidade"
    ],
    cons: [
      "Qualidade inferior em tarefas complexas de código",
      "Disponibilidade pode variar por região",
      "Limites de rate limit para uso intenso"
    ]
  },
  {
    name: "Llama 4",
    slug: "llama-4",
    category: "free",
    speed: 3,
    quality: 3,
    price: "Free",
    context: 128000,
    toolCalling: true,
    reasoning: false,
    whenToUse: "Projetos open source, experimentação e fine-tuning local",
    whenNotToUse: "Aplicações que exigem alta precisão ou consistência",
    communityRating: 3.8,
    provider: "Meta",
    description: "Modelo open source da Meta com bom equilíbrio entre custo e qualidade.",
    pros: [
      "Open source e auditável",
      "Pode ser rodado localmente",
      "Bom para experimentação",
      "Grande comunidade"
    ],
    cons: [
      "Qualidade inferior a modelos proprietários",
      "Velocidade mediana",
      "Suporte a ferramentas limitado"
    ]
  },
  {
    name: "Mistral",
    slug: "mistral",
    category: "free",
    speed: 4,
    quality: 3,
    price: "Free",
    context: 32000,
    toolCalling: true,
    reasoning: false,
    whenToUse: "Chatbots simples, classificação de texto e tarefas leves",
    whenNotToUse: "Projetos complexos de código ou análise profunda",
    communityRating: 3.9,
    provider: "Mistral AI",
    description: "Modelo eficiente da Mistral AI, ideal para tarefas leves com boa velocidade.",
    pros: [
      "Eficiente e rápido",
      "Open source disponível",
      "API gratuita generosa",
      "Suporte multilíngue"
    ],
    cons: [
      "Contexto limitado (32K)",
      "Qualidade mediana em tarefas complexas",
      "Sem reasoning nativo"
    ]
  },
  // === CHEAP ===
  {
    name: "DeepSeek",
    slug: "deepseek",
    category: "cheap",
    speed: 4,
    quality: 4,
    price: "~$0.14/M tokens",
    context: 128000,
    toolCalling: true,
    reasoning: true,
    whenToUse: "Coding assistido, análise de dados e tarefas que exigem bom custo-benefício",
    whenNotToUse: "Projetos que precisam de suporte multimodal ou ecossistema maduro",
    communityRating: 4.3,
    provider: "DeepSeek",
    description: "Excelente custo-benefício para coding, com performance próxima de modelos muito mais caros.",
    pros: [
      "Custo extremamente baixo",
      "Ótima qualidade para código",
      "Reasoning nativo presente",
      "Contexto grande (128K)",
      "API estável e rápida"
    ],
    cons: [
      "Sem suporte multimodal",
      "Ecossistema menor que OpenAI/Anthropic",
      "Documentação limitada em português"
    ]
  },
  {
    name: "Qwen",
    slug: "qwen",
    category: "cheap",
    speed: 4,
    quality: 3,
    price: "~$0.08/M tokens",
    context: 128000,
    toolCalling: true,
    reasoning: false,
    whenToUse: "Tarefas em chinês, processamento de texto longo e chatbots econômicos",
    whenNotToUse: "Aplicações que exigem reasoning avançado ou máxima qualidade",
    communityRating: 3.7,
    provider: "Alibaba Cloud",
    description: "Modelo do Alibaba com preço agressivo e bom suporte a multilinguismo.",
    pros: [
      "Preço mais baixo do mercado",
      "Contexto grande (128K)",
      "Excelente para chinês e multilíngue",
      "API compatível com OpenAI"
    ],
    cons: [
      "Qualidade inconsistente",
      "Sem reasoning nativo",
      "Comunidade menor no ocidente"
    ]
  },
  {
    name: "GLM",
    slug: "glm",
    category: "cheap",
    speed: 3,
    quality: 3,
    price: "~$0.10/M tokens",
    context: 128000,
    toolCalling: true,
    reasoning: false,
    whenToUse: "Processamento de texto, classificação e tarefas de baixo custo",
    whenNotToUse: "Projetos que precisam de alta qualidade consistente",
    communityRating: 3.5,
    provider: "Zhipu AI",
    description: "Modelo chinês competitivo em preço, ideal para tarefas de processamento de texto.",
    pros: [
      "Custo muito baixo",
      "Contexto grande",
      "Suporte a tool calling",
      "API acessível"
    ],
    cons: [
      "Qualidade abaixo da média",
      "Velocidade mediana",
      "Documentação principalmente em chinês"
    ]
  },
  // === FAST ===
  {
    name: "GPT-4o Mini",
    slug: "gpt-4o-mini",
    category: "fast",
    speed: 5,
    quality: 4,
    price: "~$0.15/M tokens",
    context: 128000,
    toolCalling: true,
    reasoning: false,
    whenToUse: "Chatbots em tempo real, prototipagem rápida e tarefas de alta frequência",
    whenNotToUse: "Análise profunda, matemática avançada ou tarefas que exigem reasoning",
    communityRating: 4.4,
    provider: "OpenAI",
    description: "Modelo rápido e barato da OpenAI, substituto ideal do GPT-3.5 para a maioria dos usos.",
    pros: [
      "Velocidade altíssima",
      "Qualidade superior para o preço",
      "Ecossistema OpenAI maduro",
      "Tool calling excelente",
      "Disponibilidade global"
    ],
    cons: [
      "Sem reasoning avançado",
      "Contexto limitado comparado a alternativas gratuitas",
      "Custo pode acumular em alto volume"
    ]
  },
  {
    name: "Claude Haiku",
    slug: "claude-haiku",
    category: "fast",
    speed: 5,
    quality: 4,
    price: "~$0.25/M tokens",
    context: 200000,
    toolCalling: true,
    reasoning: false,
    whenToUse: "Aplicações que precisam de resposta rápida com boa qualidade de texto",
    whenNotToUse: "Tarefas de coding complexas ou análise técnica profunda",
    communityRating: 4.2,
    provider: "Anthropic",
    description: "Modelo mais rápido da Anthropic, com excelente qualidade de texto e contexto de 200K tokens.",
    pros: [
      "Velocidade máxima",
      "Contexto grande (200K)",
      "Excelente para texto e análise",
      "Tool calling confiável",
      "Segurança e alinhamento"
    ],
    cons: [
      "Mais caro que concorrentes diretos",
      "Qualidade de código inferior ao Sonnet",
      "Sem reasoning nativo"
    ]
  },
  // === REASONING ===
  {
    name: "o3",
    slug: "o3",
    category: "reasoning",
    speed: 2,
    quality: 5,
    price: "~$10/M tokens",
    context: 200000,
    toolCalling: true,
    reasoning: true,
    whenToUse: "Problemas matemáticos complexos, análise científica e pesquisa avançada",
    whenNotToUse: "Tarefas simples ou que exigem resposta rápida e econômica",
    communityRating: 4.8,
    provider: "OpenAI",
    description: "Modelo de reasoning mais avançado da OpenAI, ideal para problemas complexos.",
    pros: [
      "Qualidade de reasoning líder de mercado",
      "Excelente em matemática e ciência",
      "Tool calling com reasoning integrado",
      "Resultados altamente precisos"
    ],
    cons: [
      "Muito lento (pensa antes de responder)",
      "Caro para uso em larga escala",
      "Excesso de reasoning para tarefas simples"
    ]
  },
  {
    name: "Claude Sonnet",
    slug: "claude-sonnet",
    category: "reasoning",
    speed: 3,
    quality: 5,
    price: "~$3/M tokens",
    context: 200000,
    toolCalling: true,
    reasoning: true,
    whenToUse: "Análise profunda, coding complexo, revisão de código e arquitetura",
    whenNotToUse: "Tarefas simples que não justificam o custo ou exigem velocidade máxima",
    communityRating: 4.7,
    provider: "Anthropic",
    description: "Modelo premium da Anthropic com excelente equilíbrio entre reasoning e velocidade.",
    pros: [
      "Melhor modelo para coding do mercado",
      "Reasoning e tool calling nativos",
      "Contexto grande (200K)",
      "Qualidade consistente"
    ],
    cons: [
      "Custo elevado",
      "Velocidade mediana",
      "Rate limits restritivos na API gratuita"
    ]
  },
  // === LARGE CONTEXT ===
  {
    name: "Gemini Pro",
    slug: "gemini-pro",
    category: "large-context",
    speed: 4,
    quality: 4,
    price: "~$1.00/M tokens",
    context: 2097152,
    toolCalling: true,
    reasoning: true,
    whenToUse: "Processamento de documentos enormes, análise de codebases inteiros, research acadêmico",
    whenNotToUse: "Aplicações que precisam de baixa latência ou têm orçamento limitado",
    communityRating: 4.1,
    provider: "Google",
    description: "Janela de contexto massiva de 2M tokens, ideal para análise de documentos extensos.",
    pros: [
      "Contexto de 2M tokens — único no mercado",
      "Multimodal nativo",
      "Tool calling e reasoning",
      "Boa velocidade mesmo com contexto grande"
    ],
    cons: [
      "Caro para uso intenso",
      "Qualidade de código inferior ao Sonnet",
      "Disponibilidade limitada em algumas regiões"
    ]
  },
  {
    name: "GPT-5.5",
    slug: "gpt-5-5",
    category: "large-context",
    speed: 4,
    quality: 5,
    price: "~$5/M tokens",
    context: 1048576,
    toolCalling: true,
    reasoning: true,
    whenToUse: "Projetos que precisam de máxima qualidade com contexto muito grande",
    whenNotToUse: "Quando o custo é um fator determinante",
    communityRating: 4.6,
    provider: "OpenAI",
    description: "Modelo topo de linha da OpenAI com qualidade máxima e contexto expandido.",
    pros: [
      "Qualidade geral líder",
      "Contexto muito grande (1M tokens)",
      "Ecossistema OpenAI completo",
      "Tool calling e reasoning de ponta"
    ],
    cons: [
      "Muito caro",
      "Pode ser excessivo para tarefas simples",
      "Dependência de API OpenAI"
    ]
  },
  // === LOCAL ===
  {
    name: "Ollama",
    slug: "ollama",
    category: "local",
    speed: 2,
    quality: 3,
    price: "Free (local)",
    context: 32000,
    toolCalling: true,
    reasoning: false,
    whenToUse: "Desenvolvimento offline, privacidade total, experimentação com modelos open source",
    whenNotToUse: "Produção com alta demanda, tarefas que precisam de modelos de ponta",
    communityRating: 4.0,
    provider: "Ollama",
    description: "Plataforma para rodar LLMs localmente com suporte a centenas de modelos open source.",
    pros: [
      "Completamente gratuito",
      "Privacidade total dos dados",
      "Funciona offline",
      "Centenas de modelos disponíveis"
    ],
    cons: [
      "Requer GPU boa para modelos grandes",
      "Qualidade inferior a APIs cloud",
      "Velocidade limitada pelo hardware",
      "Setup técnico necessário"
    ]
  },
  {
    name: "LM Studio",
    slug: "lm-studio",
    category: "local",
    speed: 2,
    quality: 3,
    price: "Free (local)",
    context: 32000,
    toolCalling: false,
    reasoning: false,
    whenToUse: "Prototipagem local, teste de modelos GGUF, ensino e aprendizado",
    whenNotToUse: "Produção, aplicações que precisam de tool calling ou alta performance",
    communityRating: 3.8,
    provider: "LM Studio",
    description: "Interface gráfica para rodar modelos GGUF localmente com descoberta integrada de modelos.",
    pros: [
      "Interface gráfica amigável",
      "Fácil de configurar",
      "Descoberta de modelos integrada (HuggingFace)",
      "Funciona offline"
    ],
    cons: [
      "Sem suporte a tool calling",
      "Limitado a modelos GGUF",
      "Performance dependente de hardware"
    ]
  }
];

export function getModelBySlug(slug: string): Model | undefined {
  return models.find(m => m.slug === slug);
}

export function getModelsByCategory(category: Model['category']): Model[] {
  return models.filter(m => m.category === category);
}

export function getModelCategories(): Model['category'][] {
  const catSet = new Set<Model['category']>();
  models.forEach(m => catSet.add(m.category));
  return [...catSet];
}

export function getCategoryLabel(category: Model['category']): string {
  const labels: Record<Model['category'], string> = {
    'free': 'Free',
    'cheap': 'Cheap',
    'fast': 'Fast',
    'reasoning': 'Reasoning',
    'coding': 'Coding',
    'large-context': 'Large Context',
    'vision': 'Vision',
    'local': 'Local'
  };
  return labels[category];
}

export function getCategoryColor(category: Model['category']): string {
  const colors: Record<Model['category'], string> = {
    'free': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'cheap': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'fast': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'reasoning': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'coding': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'large-context': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'vision': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'local': 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  };
  return colors[category];
}
