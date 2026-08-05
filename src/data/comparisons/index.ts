import type { Comparison, Benchmark, BenchmarkModel } from './types';

export { type Comparison, type Benchmark, type BenchmarkModel };

export const comparisons: Comparison[] = [
  {
    tool: "Claude Code",
    vs: "OpenCode",
    slug: "claude-code",
    description: "Comparativo detalhado entre OpenCode e Claude Code, duas ferramentas de coding assisted por IA.",
    difficulty: "beginner",
    tags: ["opencode", "claude-code", "comparação", "ferramentas"],
    table: [
      { feature: "Multiagentes", opencode: "✅ Nativo com orquestração", other: "❌ Apenas agente único" },
      { feature: "Paralelismo", opencode: "✅ Promise.all concorrente", other: "❌ Execução sequencial" },
      { feature: "Spec-Driven (SDD)", opencode: "✅ Spec-Driven Development", other: "❌ Apenas prompts diretos" },
      { feature: "Plugins e MCPs", opencode: "✅ Marketplace completo", other: "⚠️ Limitado" },
      { feature: "Open Source", opencode: "✅ Código aberto", other: "❌ Proprietário" },
      { feature: "Personalização de agentes", opencode: "✅ Agentes customizáveis", other: "⚠️ Limitado a regras" },
      { feature: "Custo", opencode: "✅ Grátis + BYOK", other: "⚠️ Assinatura mensal" },
      { feature: "Modo offline", opencode: "✅ Suporte offline", other: "❌ Requer internet" },
    ],
    pros: ["Arquitetura multiagente única no mercado", "SDD permite desenvolvimento estruturado", "Completamente open source e customizável"],
    cons: ["Comunidade ainda crescendo", "Documentação em expansão"],
    verdict: "OpenCode é ideal para desenvolvedores que buscam uma ferramenta open source, multiagente e altamente customizável. Claude Code é mais adequado para quem prefere uma solução plug-and-play com suporte comercial."
  },
  {
    tool: "Codex",
    vs: "OpenCode",
    slug: "codex",
    description: "Comparativo entre OpenCode e Codex (OpenAI), explorando diferenças de arquitetura e capacidades.",
    difficulty: "beginner",
    tags: ["opencode", "codex", "comparação", "ferramentas"],
    table: [
      { feature: "Multiagentes", opencode: "✅ Nativo com orquestração", other: "❌ Assistente único" },
      { feature: "Execução local", opencode: "✅ Totalmente local", other: "⚠️ Parcial (nuvem)" },
      { feature: "Customização", opencode: "✅ Agentes e skills customizáveis", other: "⚠️ Limitado a instruções" },
      { feature: "Suporte a modelos", opencode: "✅ Múltiplos modelos (BYOK)", other: "❌ Apenas OpenAI" },
      { feature: "SDD", opencode: "✅ Spec-Driven nativo", other: "❌ Não suporta" },
      { feature: "Git integration", opencode: "✅ Nativa", other: "✅ Nativa" },
    ],
    pros: ["Execução 100% local sem dependência de nuvem", "Suporte a múltiplos provedores de LLM", "Arquitetura extensível com plugins"],
    cons: ["Menos integrações nativas com IDEs", "Interface CLI menos madura"],
    verdict: "OpenCode oferece mais flexibilidade e privacidade com execução local e suporte multi-modelo, enquanto Codex se destaca pela integração nativa com o ecossistema OpenAI."
  },
  {
    tool: "Cursor",
    vs: "OpenCode",
    slug: "cursor",
    description: "Comparativo entre OpenCode e Cursor, explorando abordagens de edição de código e automação.",
    difficulty: "beginner",
    tags: ["opencode", "cursor", "comparação", "ferramentas"],
    table: [
      { feature: "Multiagentes", opencode: "✅ Nativo com orquestração", other: "❌ Editor com IA" },
      { feature: "Ambiente", opencode: "✅ CLI + qualquer editor", other: "❌ Editor próprio (VS Code fork)" },
      { feature: "Automação", opencode: "✅ Workflows automatizados", other: "⚠️ Composer manual" },
      { feature: "SDD", opencode: "✅ Spec-Driven Development", other: "❌ Chat-based" },
      { feature: "Extensibilidade", opencode: "✅ Plugins, MCPs, scripts", other: "⚠️ Extensões VS Code" },
      { feature: "Paralelismo", opencode: "✅ Execução paralela", other: "❌ Sequencial" },
      { feature: "Custo", opencode: "✅ Grátis + BYOK", other: "⚠️ Assinatura" },
    ],
    pros: ["Funciona com qualquer editor (VS Code, JetBrains, Vim)", "Automação completa com workflows e scripts", "Zero custo com seu próprio modelo"],
    cons: ["Sem interface GUI nativa", "Curva de aprendizado maior"],
    verdict: "OpenCode é melhor para automação e workflows multiagente, enquanto Cursor oferece uma experiência mais integrada de edição com IA."
  },
  {
    tool: "Aider",
    vs: "OpenCode",
    slug: "aider",
    description: "Comparativo entre OpenCode e Aider, duas ferramentas open source de coding assistido por IA.",
    difficulty: "intermediate",
    tags: ["opencode", "aider", "comparação", "open-source"],
    table: [
      { feature: "Multiagentes", opencode: "✅ Nativo com orquestração", other: "❌ Agente único" },
      { feature: "Arquitetura", opencode: "✅ Modular com agentes especializados", other: "⚠️ Monolítico" },
      { feature: "Mapa de código", opencode: "✅ Cartografia automática", other: "✅ Tree-sitter analysis" },
      { feature: "SDD", opencode: "✅ Spec-Driven Development", other: "❌ Prompt-based" },
      { feature: "Paralelismo", opencode: "✅ Promise.all concorrente", other: "❌ Sequencial" },
      { feature: "Plugins", opencode: "✅ Sistema de plugins completo", other: "❌ Sem plugins" },
      { feature: "Linguagens", opencode: "✅ Qualquer linguagem", other: "✅ Qualquer linguagem" },
    ],
    pros: ["Arquitetura multiagente mais sofisticada", "Spec-Driven para projetos estruturados", "Ecossistema rico com plugins e MCPs"],
    cons: ["Mais complexo de configurar", "Requer mais recursos do sistema"],
    verdict: "Ambos são open source e poderosos. OpenCode se destaca pela arquitetura multiagente e SDD, enquanto Aider é mais simples e direto para edições rápidas."
  }
];

export const benchmark: Benchmark = {
  description: "Comparativo de performance entre os principais modelos de linguagem suportados pelo OpenCode. Avaliação baseada em velocidade de resposta, custo por token e qualidade geral das respostas.",
  models: [
    { name: "GPT-5.5", speed: 5, cost: "$$$", quality: 5 },
    { name: "Claude 4", speed: 4, cost: "$$$", quality: 5 },
    { name: "Gemini 2.5", speed: 5, cost: "$$", quality: 4 },
    { name: "DeepSeek V4", speed: 4, cost: "$", quality: 4 },
    { name: "Llama 4", speed: 3, cost: "$", quality: 3 },
    { name: "Mistral Large", speed: 4, cost: "$$", quality: 4 },
  ]
};

export function getComparisonBySlug(slug: string): Comparison | undefined {
  return comparisons.find(c => c.slug === slug);
}
