export interface FAQItem {
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

export const faqItems: FAQItem[] = [
  // ─── Conceitos ───
  {
    question: 'O que é Context?',
    answer: 'Context é a janela de tokens que o modelo de IA pode processar em uma única interação. No OpenCode, o contexto inclui todo o histórico da conversa, arquivos abertos e instruções do sistema. Um contexto maior permite que o agente "lembre" de mais informações, mas consome mais tokens.',
    category: 'conceitos',
    tags: ['context', 'tokens', 'memoria'],
  },
  {
    question: 'O que é High Context?',
    answer: 'High Context é um modo avançado do OpenCode onde o agente mantém um contexto estendido entre sessões. Isso permite continuidade em projetos complexos, mas consome mais tokens. Ideal para projetos grandes com múltiplos arquivos e requisitos interconectados.',
    category: 'conceitos',
    tags: ['context', 'high-context', 'sessoes'],
  },
  {
    question: 'O que é um agente no OpenCode?',
    answer: 'Um agente no OpenCode é uma IA especializada em uma função específica, como Planner (planejamento), Builder (implementação), Reviewer (revisão de código) ou Tester (testes). Cada agente tem instruções, ferramentas e comportamentos próprios para executar tarefas com excelência.',
    category: 'conceitos',
    tags: ['agente', 'definicao', 'arquitetura'],
  },
  {
    question: 'O que é um Skill no OpenCode?',
    answer: 'Skills são módulos de conhecimento que estendem as capacidades dos agentes. Uma skill pode conter instruções especializadas, exemplos de código, workflows e padrões para uma área específica (ex: segurança, performance, testes). Skills são reutilizáveis entre agentes.',
    category: 'conceitos',
    tags: ['skill', 'extensao', 'conhecimento'],
  },
  {
    question: 'O que é um plugin no OpenCode?',
    answer: 'Plugins são extensões que adicionam funcionalidades ao OpenCode, como integração com ferramentas externas (Git, Docker), otimização de prompts, ou proteção de secrets. Eles são instalados via `opencode install <plugin>` e podem ser configurados no opencode.json.',
    category: 'conceitos',
    tags: ['plugin', 'extensao', 'integracao'],
  },

  // ─── Economia ───
  {
    question: 'Como economizar tokens no OpenCode?',
    answer: 'Para economizar tokens: 1) Use o OpenCode DCP (Context Pruning) para limpar contexto obsoleto automaticamente. 2) Prefira modelos free como Gemini 2.5 Flash para tarefas simples. 3) Seja específico nos prompts — menos idas e vindas. 4) Use o modo "econômico" nas configurações. 5) Agrupe múltiplas alterações em um único comando.',
    category: 'economia',
    tags: ['tokens', 'economia', 'otimizacao', 'dcp'],
  },
  {
    question: 'Qual a diferença entre modelo Free e Pago?',
    answer: 'Modelos free (como Gemini 2.5 Flash) oferecem boa performance para tarefas do dia a dia sem custo. Modelos pagos (como Claude 3.5 Sonnet e GPT-4o) oferecem capacidade superior em raciocínio complexo, código e contexto. A escolha depende da complexidade da tarefa e do orçamento disponível.',
    category: 'economia',
    tags: ['modelo', 'free', 'pago', 'custo'],
  },
  {
    question: 'O OpenCode tem limite de uso gratuito?',
    answer: 'O OpenCode em si é open-source e gratuito. Porém, os modelos de IA podem ter limites: modelos free (Gemini) têm cotas diárias generosas, enquanto modelos pagos cobram por token. Consulte a documentação do seu provedor de API para limites específicos.',
    category: 'economia',
    tags: ['limite', 'gratuito', 'cota'],
  },

  // ─── Modelos ───
  {
    question: 'Qual o melhor modelo para programação?',
    answer: 'Para programação, recomendamos: Claude 3.5 Sonnet (excelente em código complexo), GPT-4o (bom equilíbrio) e Gemini 2.5 Flash (ótimo para tarefas simples sem custo). A escolha depende do seu orçamento e complexidade do projeto.',
    category: 'modelos',
    tags: ['modelo', 'programacao', 'recomendacao'],
  },
  {
    question: 'Qual modelo usar no dia a dia?',
    answer: 'Para o dia a dia, Gemini 2.5 Flash oferece o melhor custo-benefício. Ele é gratuito, rápido e capaz para a maioria das tarefas. Reserve modelos pagos para tarefas complexas que exigem raciocínio profundo ou contextos muito grandes.',
    category: 'modelos',
    tags: ['modelo', 'dia-a-dia', 'recomendacao'],
  },
  {
    question: 'Qual o limite de contexto dos modelos?',
    answer: 'Os limites variam: Gemini 2.5 Flash tem 1M tokens, Claude 3.5 Sonnet tem 200K tokens, GPT-4o tem 128K tokens. Na prática, recomendamos manter o contexto abaixo de 80% do limite para evitar degradação de performance.',
    category: 'modelos',
    tags: ['contexto', 'limite', 'tokens', 'modelo'],
  },

  // ─── Instalação ───
  {
    question: 'Como instalar o OpenCode?',
    answer: 'Para instalar o OpenCode, use o gerenciador de pacotes da sua preferência: `npm install -g opencode` ou via curl: `curl -fsSL https://opencode.sh/install | bash`. Após instalar, configure sua chave de API no arquivo opencode.json.',
    category: 'instalacao',
    tags: ['instalacao', 'setup', 'npm'],
  },
  {
    question: 'Como atualizar o OpenCode?',
    answer: 'Para atualizar, use `npm update -g opencode` (se instalou via npm) ou execute o script de instalação novamente. Verifique a versão atual com `opencode --version` e confira o changelog no blog para novidades.',
    category: 'instalacao',
    tags: ['atualizacao', 'update', 'versao'],
  },
  {
    question: 'O OpenCode funciona no Windows?',
    answer: 'Sim! O OpenCode tem suporte completo para Windows (PowerShell 7+), Linux e macOS. No Windows, recomendamos o PowerShell 7 para melhor experiência com os comandos shell e integrações.',
    category: 'instalacao',
    tags: ['windows', 'compatibilidade', 'sistema'],
  },

  // ─── Criação ───
  {
    question: 'Como criar um agente no OpenCode?',
    answer: 'Para criar um agente: 1) Crie um arquivo YAML em `.opencode/agents/` com nome, descrição, instruções e ferramentas. 2) Use o comando `opencode agent create` para um wizard interativo. 3) Configure o agente no `opencode.json`. Consulte a documentação de agentes para detalhes.',
    category: 'criacao',
    tags: ['criar', 'agente', 'yaml', 'config'],
  },
  {
    question: 'Como criar um plugin no OpenCode?',
    answer: 'Para criar um plugin: 1) Use o template inicial com `opencode plugin init`. 2) Implemente as funções principais (activate, deactivate, execute). 3) Publique em um repositório Git. 4) Instale com `opencode install <seu-plugin>`. Veja o guia de criação de plugins para um tutorial completo.',
    category: 'criacao',
    tags: ['criar', 'plugin', 'template', 'publicar'],
  },
  {
    question: 'Como criar um MCP no OpenCode?',
    answer: 'Para criar um MCP (Model Context Protocol): 1) Implemente um servidor seguindo o protocolo MCP oficial. 2) Registre-o no `opencode.json` na seção `mcps`. 3) Defina ferramentas e recursos que o servidor expõe. MCPs permitem integrar APIs externas, bancos de dados e serviços ao ecossistema.',
    category: 'criacao',
    tags: ['criar', 'mcp', 'protocolo', 'integracao'],
  },
  {
    question: 'Como criar um workflow no OpenCode?',
    answer: 'Workflows são sequências de passos automatizados. Crie um arquivo YAML em `.opencode/workflows/` definindo etapas, agentes envolvidos e condições. Use o Workflow Builder no playground OpenDex para criar visualmente arrastando e soltando blocos.',
    category: 'criacao',
    tags: ['criar', 'workflow', 'automacao', 'yaml'],
  },

  // ─── Cache ───
  {
    question: 'Como funciona o cache no OpenCode?',
    answer: 'O OpenCode utiliza cache inteligente para armazenar respostas frequentes, reduzindo custos e latência. O cache é automático para consultas similares em um curto período. Você pode limpar o cache manualmente com `opencode cache clear` ou configurar TTL personalizado.',
    category: 'cache',
    tags: ['cache', 'performance', 'economia'],
  },
  {
    question: 'Como limpar o cache do OpenCode?',
    answer: 'Use `opencode cache clear` para limpar todo o cache. Para limpar cache de um projeto específico, use `opencode cache clear --project <nome>`. O cache também expira automaticamente conforme o TTL configurado (padrão: 30 minutos).',
    category: 'cache',
    tags: ['cache', 'limpar', 'clear'],
  },
  {
    question: 'O cache do OpenCode é seguro?',
    answer: 'Sim, o cache é local e armazenado no seu disco. Nenhuma informação é enviada para servidores externos. Dados sensíveis não são cacheados — o sistema detecta automaticamente credenciais e secrets e os exclui do cache.',
    category: 'cache',
    tags: ['cache', 'seguranca', 'privacidade'],
  },
  {
    question: 'Cache vs Context: qual a diferença?',
    answer: 'Cache armazena respostas prontas para consultas repetidas (ex: "como instalar o OpenCode?"), economizando tokens. Context é a janela de informações atuais da conversa. Cache é persistente entre sessões; Context é volátil e resetado ao iniciar nova sessão (a menos que use High Context).',
    category: 'cache',
    tags: ['cache', 'context', 'diferenca', 'conceitos'],
  },
  {
    question: 'Como funciona o Dispatcher no OpenCode?',
    answer: 'O Dispatcher é o sistema de roteamento que decide qual agente executa qual tarefa. Ele analisa o comando do usuário, verifica as skills disponíveis e despacha para o agente mais adequado. Suporta execução paralela de tarefas independentes e fallback para o agente padrão.',
    category: 'conceitos',
    tags: ['dispatcher', 'roteamento', 'agente'],
  },
  {
    question: 'O que é o Event Bus?',
    answer: 'O Event Bus é o barramento de eventos do OpenCode que permite comunicação assíncrona entre agentes, plugins e MCPs. Eventos como "task.completed", "file.changed" ou "error.occurred" são emitidos e qualquer componente inscrito pode reagir. Isso permite workflows reativos e desacoplados.',
    category: 'conceitos',
    tags: ['event-bus', 'eventos', 'comunicacao', 'assincrono'],
  },
  {
    question: 'O que são Islands no Astro?',
    answer: 'Islands (Ilhas) são componentes interativos em uma página Astro estática. No OpenDex, usamos Islands React para funcionalidades como busca, questionários e ferramentas interativas. O resto da página permanece HTML estático e rápido, e apenas os componentes com `client:load` ou `client:idle` são hidratados.',
    category: 'conceitos',
    tags: ['islands', 'astro', 'interatividade', 'frontend'],
  },
];

export function getFAQCategories(): string[] {
  return [...new Set(faqItems.map((item) => item.category))];
}

export function getFAQByCategory(category: string): FAQItem[] {
  return faqItems.filter((item) => item.category === category);
}

export const categoryLabels: Record<string, string> = {
  conceitos: 'Conceitos',
  economia: 'Economia',
  modelos: 'Modelos',
  instalacao: 'Instalação',
  criacao: 'Criação',
  cache: 'Cache',
};
