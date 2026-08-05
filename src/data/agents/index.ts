import type { Agent } from './types';

export { type Agent };

export const agents: Agent[] = [
  {
    name: "Planner",
    slug: "planner",
    description: "Agente especializado em planejamento e arquitetura",
    whatItDoes: "Analisa requisitos, propõe arquitetura, quebra em tasks",
    whenToUse: "No início de projetos novos ou features complexas",
    inputs: ["Descrição do projeto", "Stack tecnológica", "Requisitos"],
    outputs: ["Arquitetura proposta", "Lista de tasks", "Estimativa"],
    example: "Use o Planner quando precisar estruturar um novo projeto",
    tags: ["planejamento", "arquitetura", "tasks", "design"]
  },
  {
    name: "Reviewer",
    slug: "reviewer",
    description: "Agente de code review com análise de segurança e performance",
    whatItDoes: "Revisa código, aponta bugs, sugere melhorias e verifica padrões",
    whenToUse: "Antes de fazer merge de PRs ou após implementação",
    inputs: ["Código fonte", "Contexto do projeto", "Padrões definidos"],
    outputs: ["Lista de issues", "Sugestões de correção", "Relatório de qualidade"],
    example: "Use o Reviewer para garantir qualidade antes de um deploy",
    tags: ["revisão", "qualidade", "segurança", "code-review"]
  },
  {
    name: "Tester",
    slug: "tester",
    description: "Agente de testes automatizados com geração e execução",
    whatItDoes: "Cria suites de teste, executa e reporta resultados com cobertura",
    whenToUse: "Após implementar novas funcionalidades",
    inputs: ["Código implementado", "Casos de uso", "Framework de teste"],
    outputs: ["Suites de teste", "Relatório de cobertura", "Resultados da execução"],
    example: "Use o Tester para validar que novas features não quebram o existente",
    tags: ["testes", "qa", "cobertura", "automação"]
  },
  {
    name: "Researcher",
    slug: "researcher",
    description: "Agente de pesquisa técnica com acesso à web e documentação",
    whatItDoes: "Busca documentação, APIs e soluções para problemas técnicos",
    whenToUse: "Quando precisa de informação externa ou atualizada",
    inputs: ["Pergunta técnica", "Contexto do problema", "Stack tecnológica"],
    outputs: ["Resposta pesquisada", "Fontes consultadas", "Recomendações"],
    example: "Use o Researcher para descobrir a melhor biblioteca para um problema",
    tags: ["pesquisa", "documentação", "web", "aprendizado"]
  },
  {
    name: "Builder",
    slug: "builder",
    description: "Agente implementador que converte specs em código funcional",
    whatItDoes: "Recebe especificações SDD e produz código seguindo as regras do projeto",
    whenToUse: "Após o Planner definir a arquitetura, para implementar features",
    inputs: ["Spec SDD", "Contexto do projeto", "Stack tecnológica"],
    outputs: ["Código implementado", "Testes básicos", "Resumo de mudanças"],
    example: "Use o Builder para implementar novas funcionalidades seguindo as specs",
    tags: ["implementação", "código", "features", "desenvolvimento"]
  },
  {
    name: "Debugger",
    slug: "debugger",
    description: "Agente de diagnóstico com competing hypotheses para falhas",
    whatItDoes: "Analisa falhas, gera hipóteses concorrentes e diagnostica causa raiz",
    whenToUse: "Quando uma task falha 2x seguidas ou para debug complexo",
    inputs: ["Logs de erro", "Stack trace", "Contexto da falha"],
    outputs: ["Causa raiz", "Sugestão de correção", "Linha e severidade"],
    example: "Use o Debugger quando o Builder falhar 2x na mesma task",
    tags: ["debug", "diagnóstico", "falhas", "erros"]
  }
];

export function getAgentBySlug(slug: string): Agent | undefined {
  return agents.find(a => a.slug === slug);
}

export function getAgentTags(): string[] {
  const tagSet = new Set<string>();
  agents.forEach(a => a.tags.forEach(t => tagSet.add(t)));
  return [...tagSet].sort();
}
