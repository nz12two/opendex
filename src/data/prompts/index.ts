import type { Prompt } from './types';

export { type Prompt };

export const prompts: Prompt[] = [
  {
    name: "Criar API REST",
    slug: "criar-api-rest",
    description: "Prompt para criar uma API REST completa com autenticação e documentação",
    category: "Desenvolvimento",
    tags: ["api", "rest", "backend", "crud", "jwt"],
    content: "Crie uma API REST em [framework] com os seguintes endpoints:\n- CRUD para [entidade]\n- Autenticação JWT\n- Validação com [lib]\n- Documentação Swagger\n- Testes unitários e de integração"
  },
  {
    name: "Criar Plugin",
    slug: "criar-plugin",
    description: "Prompt para criar plugins OpenCode seguindo a estrutura padrão",
    category: "Desenvolvimento",
    tags: ["plugin", "opencode", "extensão", "api"],
    content: "Crie um plugin para OpenCode que:\n- Nome: [nome do plugin]\n- Funcionalidade: [descrição]\n- Use a API de plugins do OpenCode\n- Inclua configuração via opencode.json\n- Tenha testes e documentação\nSiga o template oficial de plugins."
  },
  {
    name: "Refatorar Projeto",
    slug: "refatorar-projeto",
    description: "Prompt para refatoração completa de projeto com segurança",
    category: "Manutenção",
    tags: ["refatoração", "manutenção", "clean-code", "melhoria"],
    content: "Refatore o projeto em [linguagem/framework]:\n1. Analise o código atual e identifique problemas\n2. Proponha uma arquitetura melhorada\n3. Execute a refatoração em etapas\n4. Mantenha testes passando em cada etapa\n5. Gere relatório das mudanças\n\nÁreas focais:\n- Performance\n- Legibilidade\n- Manutenibilidade\n- Padrões de design"
  },
  {
    name: "Debug",
    slug: "debug",
    description: "Prompt estruturado para diagnóstico e correção de bugs",
    category: "Depuração",
    tags: ["debug", "diagnóstico", "erro", "troubleshooting"],
    content: "Ajude a depurar o seguinte problema:\n\n**Problema**: [descrição do erro]\n**Contexto**: [stack trace / comportamento esperado]\n**Já tentei**: [soluções tentadas]\n\nAnalise:\n1. Causa raiz do problema\n2. Impacto e severity\n3. Solução proposta\n4. Prevenção futura"
  },
  {
    name: "Documentação",
    slug: "documentacao",
    description: "Prompt para gerar documentação técnica completa",
    category: "Docs",
    tags: ["docs", "documentação", "markdown", "guia", "technical-writing"],
    content: "Gere documentação técnica para [projeto/módulo]:\n\nSeções obrigatórias:\n- Visão geral\n- Instalação e configuração\n- Guia de uso com exemplos\n- API Reference\n- FAQ e troubleshooting\n\nFormato: Markdown\nTom: Técnico mas acessível para iniciantes"
  },
  {
    name: "Arquitetura",
    slug: "arquitetura",
    description: "Prompt para projetar arquitetura de software com diagramas",
    category: "Design",
    tags: ["arquitetura", "design", "diagramas", "c4", "planejamento"],
    content: "Projete a arquitetura para [sistema/aplicação]:\n\n1. **Requisitos**: [lista de requisitos]\n2. **Stack**: [tecnologias escolhidas]\n3. **Diagramas C4**:\n   - Contexto (nível 1)\n   - Container (nível 2)\n   - Component (nível 3)\n4. **Decisões arquiteturais** (ADRs)\n5. **Trade-offs** considerados\n\nConsidere: escalabilidade, segurança, custo e manutenibilidade."
  },
  {
    name: "Criar Testes",
    slug: "criar-testes",
    description: "Prompt para gerar suites de teste abrangentes",
    category: "QA",
    tags: ["testes", "jest", "vitest", "cobertura", "tdd"],
    content: "Crie testes para [módulo/função] usando [framework]:\n\nCobertura:\n- Testes unitários para todas as funções\n- Testes de integração para fluxos principais\n- Mocks para dependências externas\n- Casos de borda e erro\n- Testes de regressão\n\nMeta de cobertura: >80%\nFramework: [jest/vitest/cypress]"
  },
  {
    name: "Revisar Código",
    slug: "revisar-codigo",
    description: "Prompt para code review completo com checklist",
    category: "QA",
    tags: ["revisão", "code-review", "qualidade", "boas-práticas"],
    content: "Revise o seguinte código [arquivo/módulo]:\n\nChecklist:\n- [ ] Segurança (SQL injection, XSS, auth)\n- [ ] Performance (loops, queries, memória)\n- [ ] Manutenibilidade (nomes, complexidade)\n- [ ] Tratamento de erros\n- [ ] Testes existentes\n- [ ] Boas práticas da linguagem\n\nPara cada issue encontrada, informe:\n1. Localização (linha)\n2. Severidade (critical/major/minor)\n3. Sugestão de correção\n4. Exemplo de código"
  }
];

export function getPromptBySlug(slug: string): Prompt | undefined {
  return prompts.find(p => p.slug === slug);
}

export function getPromptsByCategory(category: string): Prompt[] {
  return prompts.filter(p => p.category === category);
}

export function getPromptCategories(): string[] {
  return [...new Set(prompts.map(p => p.category))];
}

export function getPromptTags(): string[] {
  const tagSet = new Set<string>();
  prompts.forEach(p => p.tags.forEach(t => tagSet.add(t)));
  return [...tagSet].sort();
}
