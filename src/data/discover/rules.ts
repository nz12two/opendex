export type Linguagem = 'python' | 'go' | 'rust' | 'java' | 'node';
export type TipoProjeto = 'api' | 'bot' | 'minecraft' | 'cli' | 'web';
export type TipoModelo = 'free' | 'paid';
export type Experiencia = 'iniciante' | 'intermediario' | 'avancado';

export interface DiscoverAnswers {
  linguagem: Linguagem | null;
  projeto: TipoProjeto | null;
  modelo: TipoModelo | null;
  experiencia: Experiencia | null;
}

export interface DiscoverRecommendation {
  modelo: string;
  plugins: string[];
  mcps: string[];
  agents: string[];
  templates: string[];
  guides: { title: string; href: string }[];
  reasoning: string;
}

const languageStack: Record<Linguagem, string> = {
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  node: 'JavaScript/TypeScript',
};

const projectSuggestions: Record<TipoProjeto, { framework: string; desc: string }> = {
  api: { framework: 'Fastify/Express', desc: 'APIs REST e GraphQL' },
  bot: { framework: 'Discord.js/Telegraf', desc: 'Bots para Discord e Telegram' },
  minecraft: { framework: 'Fabric/Spigot', desc: 'Plugins e mods Minecraft' },
  cli: { framework: 'Commander/Click', desc: 'Ferramentas de linha de comando' },
  web: { framework: 'Next.js/Astro', desc: 'Aplicações web full-stack' },
};

const modelOptions: Record<TipoModelo, string> = {
  free: 'Gemini 2.5 Flash',
  paid: 'Claude 3.5 Sonnet / GPT-4o',
};

const experienceGuides: Record<Experiencia, { level: string; focus: string }> = {
  iniciante: { level: 'Iniciante', focus: 'Passo a passo e exemplos práticos' },
  intermediario: { level: 'Intermediário', focus: 'Padrões de design e otimização' },
  avancado: { level: 'Avançado', focus: 'Arquitetura e performance' },
};

export function getRecommendation(answers: DiscoverAnswers): DiscoverRecommendation {
  if (!answers.linguagem || !answers.projeto || !answers.modelo || !answers.experiencia) {
    throw new Error('Responda todas as perguntas para obter uma recomendação.');
  }

  const lang = languageStack[answers.linguagem];
  const proj = projectSuggestions[answers.projeto];
  const model = modelOptions[answers.modelo];
  const exp = experienceGuides[answers.experiencia];

  const reasoning = `Com base no seu perfil — **${lang}**, projeto do tipo **${proj.desc}**, modelo **${model}** e nível **${exp.level}** — preparamos recomendações personalizadas.`;

  // Regras de recomendação baseadas nas combinações
  const plugins: string[] = ['opencode-plugin-gitea', 'opencode-browser'];
  const mcps: string[] = ['Filesystem', 'GitHub'];
  const agents: string[] = ['Planner', 'Reviewer'];
  const templates: string[] = [];

  if (answers.linguagem === 'node') {
    plugins.push('opencode-vibeguard', '@tarquinen/opencode-dcp');
    mcps.push('Playwright', 'PostgreSQL');
    agents.push('Tester');
    templates.push('FastAPI' as string, 'Express Scaffold');
  } else if (answers.linguagem === 'python') {
    plugins.push('@tarquinen/opencode-dcp', 'opencode-rules-md');
    mcps.push('Playwright', 'Sentry');
    agents.push('Researcher');
    templates.push('FastAPI');
  } else if (answers.linguagem === 'go') {
    plugins.push('opencode-scheduler', 'opencode-rag-plugin');
    mcps.push('Redis', 'Supabase');
    agents.push('Tester');
    templates.push('Go API');
  } else if (answers.linguagem === 'rust') {
    plugins.push('opencode-rag-plugin', 'opencode-rules-md');
    mcps.push('Redis', 'PostgreSQL');
    agents.push('Researcher');
    templates.push('Rust CLI');
  } else if (answers.linguagem === 'java') {
    plugins.push('opencode-scheduler', 'opencode-plugin-gitea');
    mcps.push('PostgreSQL', 'Sentry');
    agents.push('Reviewer', 'Tester');
    templates.push('Spring Boot');
  }

  if (answers.projeto === 'api') {
    mcps.push('Supabase');
    agents.push('Tester');
  } else if (answers.projeto === 'bot') {
    mcps.push('Redis');
    plugins.push('opencode-telegram');
    agents.push('Debugger');
  } else if (answers.projeto === 'minecraft') {
    mcps.push('Redis');
    plugins.push('opencode-scheduler');
  } else if (answers.projeto === 'cli') {
    templates.push('CLI Starter');
  } else if (answers.projeto === 'web') {
    mcps.push('Playwright');
    plugins.push('opencode-plugin-flow');
  }

  if (answers.modelo === 'free') {
    mcps.push('Context7');
  } else {
    mcps.push('Context7');
    agents.push('Debugger');
  }

  if (answers.experiencia === 'iniciante') {
    templates.push('Tutorial: Primeiros passos');
  } else if (answers.experiencia === 'avancado') {
    agents.push('Debugger');
    plugins.push('opencode-sentry-monitor');
  }

  const guides = getGuidesForProfile(answers);

  return {
    modelo: model,
    plugins: [...new Set(plugins)],
    mcps: [...new Set(mcps)],
    agents: [...new Set(agents)],
    templates: [...new Set(templates)],
    guides,
    reasoning,
  };
}

function getGuidesForProfile(answers: DiscoverAnswers): { title: string; href: string }[] {
  const guides: { title: string; href: string }[] = [
    { title: 'Como criar seu primeiro agente OpenCode', href: '/opendex/blog/tutorial-criar-primeiro-agente/' },
    { title: 'Entendendo o sistema de agentes', href: '/opendex/docs/agentes' },
    { title: 'Guia de plugins essenciais', href: '/opendex/docs/plugins' },
  ];

  if (answers.experiencia === 'iniciante') {
    guides.push({ title: 'Guia de instalação do OpenCode', href: '/opendex/docs/instalacao' });
  } else if (answers.experiencia === 'avancado') {
    guides.push({ title: 'Otimização de performance', href: '/opendex/blog/analise-performance/' });
  }

  if (answers.modelo === 'free') {
    guides.push({ title: 'Como economizar tokens', href: '/opendex/docs/modelos' });
  }

  return guides;
}
