export interface DictionaryEntry {
  term: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  seeAlso?: string[];
}

export const dictionaryEntries: DictionaryEntry[] = [
  {
    term: 'Agent',
    description: 'Um agente no OpenCode é uma IA especializada em uma função específica (Planner, Builder, Reviewer, Tester, etc.). Cada agente possui instruções personalizadas, acesso a ferramentas específicas e comportamentos próprios para executar tarefas com excelência. Agentes podem ser criados e configurados pelo usuário.',
    category: 'conceitos',
    difficulty: 'intermediate',
    tags: ['Agentes', 'Automação'],
    seeAlso: ['Builder', 'Reviewer', 'Planner'],
  },
  {
    term: 'Aggregator',
    description: 'O Aggregator é um mecanismo que combina múltiplas respostas de diferentes agentes ou fontes em uma única saída coesa. Útil para tarefas que exigem múltiplas perspectivas ou validação cruzada.',
    category: 'conceitos',
    difficulty: 'advanced',
    tags: ['Arquitetura', 'Automação'],
    seeAlso: ['Dispatcher', 'Workflow'],
  },
  {
    term: 'Builder',
    description: 'Builder é o agente implementador do OpenCode. Ele recebe especificações (SDD) e produz código funcional seguindo as regras do projeto. Possui task_budget limitado e pode invocar o debugger em caso de falha. É o agente principal para implementação de features.',
    category: 'agentes',
    difficulty: 'beginner',
    tags: ['Agentes', 'Ferramentas'],
    seeAlso: ['Agent', 'Debugger', 'Reviewer'],
  },
  {
    term: 'Compaction',
    description: 'Compaction é o processo de compactação de contexto que reduz o número de tokens mantendo as informações essenciais. O OpenCode usa técnicas como sumarização seletiva e remoção de histórico obsoleto para manter o contexto enxuto e eficiente.',
    category: 'conceitos',
    difficulty: 'intermediate',
    tags: ['Contexto', 'Tokens', 'Performance'],
    seeAlso: ['Context', 'Cache'],
  },
  {
    term: 'Context',
    description: 'Context é a janela de informações que o modelo de IA pode processar em uma interação. Inclui histórico da conversa, arquivos abertos, instruções do sistema e estado atual. Um contexto maior permite melhor compreensão mas consome mais tokens. O OpenCode suporta contextos de até 1M tokens com certos modelos.',
    category: 'conceitos',
    difficulty: 'beginner',
    tags: ['Contexto', 'Tokens', 'Performance'],
    seeAlso: ['Compaction', 'Cache', 'Prompt'],
  },
  {
    term: 'Cache',
    description: 'Cache no OpenCode é um sistema de armazenamento temporário de respostas frequentes para reduzir custos e latência. Opera automaticamente com TTL configurável (padrão 30 min). Dados sensíveis são automaticamente excluídos do cache por segurança.',
    category: 'economia',
    difficulty: 'intermediate',
    tags: ['Economia', 'Tokens', 'Performance'],
    seeAlso: ['Context', 'Compaction', 'Token'],
  },
  {
    term: 'Dispatcher',
    description: 'O Dispatcher é o roteador central do OpenCode que decide qual agente ou skill deve executar cada tarefa. Ele analisa o comando, verifica disponibilidade, considera o contexto e despacha para o executor mais adequado. Suporta execução paralela e fallback.',
    category: 'arquitetura',
    difficulty: 'advanced',
    tags: ['Arquitetura', 'Automação'],
    seeAlso: ['Agent', 'Event Bus', 'Workflow'],
  },
  {
    term: 'Event Bus',
    description: 'O Event Bus é o barramento de eventos assíncronos do OpenCode. Permite que agentes, plugins e MCPs se comuniquem emitindo e ouvindo eventos como "task.completed", "file.changed" e "error.occurred". Fundamental para workflows reativos e desacoplados.',
    category: 'arquitetura',
    difficulty: 'advanced',
    tags: ['Arquitetura', 'Automação'],
    seeAlso: ['Dispatcher', 'Workflow', 'Plugin'],
  },
  {
    term: 'MCP (Model Context Protocol)',
    description: 'MCP é um protocolo padronizado que permite ao OpenCode se conectar com ferramentas externas como bancos de dados, APIs e serviços. Cada MCP expõe ferramentas e recursos que os agentes podem usar. Exemplos: Filesystem MCP, GitHub MCP, Playwright MCP.',
    category: 'extensoes',
    difficulty: 'intermediate',
    tags: ['Ferramentas', 'Arquitetura'],
    seeAlso: ['Plugin', 'Agent', 'Tool'],
  },
  {
    term: 'Plugin',
    description: 'Plugins são extensões que adicionam funcionalidades ao OpenCode. Diferem de MCPs por serem mais integrados ao core, geralmente afetando o comportamento do sistema. Exemplos: Git Automator, VibeGuard (proteção de secrets), OpenCode DCP (pruning de contexto).',
    category: 'extensoes',
    difficulty: 'intermediate',
    tags: ['Ferramentas', 'Arquitetura'],
    seeAlso: ['MCP', 'Skill', 'Agent'],
  },
  {
    term: 'Skill',
    description: 'Skills são módulos de conhecimento especializado que estendem as capacidades dos agentes. Contêm instruções, exemplos, padrões e workflows para domínios específicos (segurança, performance, testes). Skills são reutilizáveis e podem ser compartilhadas entre projetos.',
    category: 'conceitos',
    difficulty: 'intermediate',
    tags: ['Agentes', 'Ferramentas'],
    seeAlso: ['Agent', 'Plugin', 'Prompt'],
  },
  {
    term: 'Workflow',
    description: 'Workflows são sequências automatizadas de passos que orquestram múltiplos agentes e ferramentas para completar um objetivo. Definidos em YAML, suportam condições, paralelismo e integração com MCPs. Exemplo: workflow de deploy que executa testes, build e publicação.',
    category: 'conceitos',
    difficulty: 'intermediate',
    tags: ['Automação', 'Arquitetura'],
    seeAlso: ['Agent', 'Dispatcher', 'Event Bus'],
  },
  {
    term: 'Prompt',
    description: 'Prompt é a instrução ou comando dado ao modelo de IA. No OpenCode, prompts são estruturados com contexto, exemplos e formato de saída esperado. Prompts bem escritos produzem respostas mais precisas. O Prompt Enhancer plugin pode otimizar prompts automaticamente.',
    category: 'conceitos',
    difficulty: 'beginner',
    tags: ['Prompt', 'Contexto'],
    seeAlso: ['Context', 'Skill', 'Agent'],
  },
  {
    term: 'Token',
    description: 'Token é a unidade básica de processamento dos modelos de IA. Um token equivale aproximadamente a 4 caracteres ou 0.75 palavra em inglês. Tudo no OpenCode consome tokens: prompts, respostas, arquivos e histórico. Gerenciar tokens é essencial para economia e performance.',
    category: 'economia',
    difficulty: 'beginner',
    tags: ['Tokens', 'Economia', 'Performance'],
    seeAlso: ['Context', 'Cache', 'Compaction'],
  },
  {
    term: 'Island',
    description: 'Island (Ilha) é um conceito do Astro onde componentes interativos (React, Vue, Svelte) são "ilhados" em uma página majoritariamente estática. No OpenDex, Islands são usados para funcionalidades interativas como busca, questionários e ferramentas, mantendo o resto da página rápida e leve.',
    category: 'frontend',
    difficulty: 'intermediate',
    tags: ['Frontend', 'Performance'],
    seeAlso: [],
  },
  {
    term: 'Planner',
    description: 'Planner é o agente de planejamento do OpenCode. Ele analisa requisitos, propõe arquitetura, quebra projetos em tarefas e estima esforço. Ideal para o início de projetos novos ou antes de implementar features complexas. Trabalha em conjunto com o Builder.',
    category: 'agentes',
    difficulty: 'beginner',
    tags: ['Agentes', 'Prompt'],
    seeAlso: ['Agent', 'Builder', 'Workflow'],
  },
  {
    term: 'Reviewer',
    description: 'Reviewer é o agente de code review que analisa código em busca de bugs, problemas de segurança, performance e aderência a padrões. Deve ser usado antes de merges e deploys. Produz relatórios detalhados com sugestões de correção.',
    category: 'agentes',
    difficulty: 'beginner',
    tags: ['Agentes', 'Segurança', 'Ferramentas'],
    seeAlso: ['Agent', 'Builder', 'Tester'],
  },
  {
    term: 'Tester',
    description: 'Tester é o agente especializado em testes automatizados. Gera suites de teste, executa em paralelo e reporta cobertura. Suporta múltiplos frameworks (Jest, Vitest, pytest, Go test) e se integra com CI/CD para validação contínua.',
    category: 'agentes',
    difficulty: 'beginner',
    tags: ['Agentes', 'Ferramentas', 'Automação'],
    seeAlso: ['Agent', 'Reviewer', 'Workflow'],
  },
];

export function getAlphabetCategories(): string[] {
  const letters = new Set<string>();
  dictionaryEntries.forEach((entry) => {
    const firstLetter = entry.term[0].toUpperCase();
    letters.add(firstLetter);
  });
  return [...letters].sort();
}

export function getEntriesByLetter(letter: string): DictionaryEntry[] {
  return dictionaryEntries.filter(
    (entry) => entry.term[0].toUpperCase() === letter.toUpperCase(),
  );
}

export function getEntryBySlug(slug: string): DictionaryEntry | undefined {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-');
  return dictionaryEntries.find(e => normalize(e.term) === slug);
}

export function getRelatedEntries(entry: DictionaryEntry, max = 3): DictionaryEntry[] {
  return dictionaryEntries
    .filter(e => e.term !== entry.term && (
      e.tags?.some(t => entry.tags?.includes(t)) ||
      e.category === entry.category
    ))
    .slice(0, max);
}
