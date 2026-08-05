import type { Projeto } from './types';

// Mapas de palavras-chave para detecção
const FRAMEWORK_PATTERNS: Record<string, RegExp[]> = {
  fastify: [/fastify/i],
  express: [/express/i],
  react: [/react/i, /next\.?js/i, /nextjs/i],
  vue: [/vue/i, /nuxt/i],
  angular: [/angular/i],
  svelte: [/svelte/i],
  astro: [/astro/i],
  'next.js': [/next\.?js/i, /nextjs/i],
  'nest.js': [/nest/i, /nestjs/i],
  django: [/django/i],
  flask: [/flask/i],
  spring: [/spring/i, /spring\s*boot/i],
  laravel: [/laravel/i],
  rails: [/rails/i, /ruby\s*on\s*rails/i],
  remix: [/remix/i],
};

const BANCO_PATTERNS: Record<string, RegExp[]> = {
  postgres: [/postgres/i, /postgresql/i, /pgsql/i],
  mysql: [/mysql/i, /maria\s*db/i, /mariadb/i],
  mongodb: [/mongo/i, /mongodb/i, /nosql/i],
  redis: [/redis/i],
  sqlite: [/sqlite/i, /sqlite3/i],
  supabase: [/supabase/i],
  firebase: [/firebase/i],
  cockroach: [/cockroach/i],
  cassandra: [/cassandra/i],
  elasticsearch: [/elastic/i, /elasticsearch/i],
};

const FEATURE_PATTERNS: Record<string, RegExp[]> = {
  api: [/api/i, /rest/i, /endpoint/i, /graphql/i],
  bot: [/bot/i, /discord/i, /telegram/i, /slack/i, /chat/i],
  web: [/web/i, /site/i, /frontend/i, /website/i],
  mobile: [/mobile/i, /app/i, /ios/i, /android/i, /react\s*native/i, /flutter/i],
  testes: [/teste/i, /test/i, /tdd/i, /jest/i, /vitest/i, /cypress/i, /playwright/i],
  docker: [/docker/i, /container/i, /compose/i],
  auth: [/auth/i, /login/i, /jwt/i, /oauth/i, /autentica/i],
  deploy: [/deploy/i, /ci\/?cd/i, /pipeline/i, /devops/i, /release/i],
  docs: [/doc/i, /documenta/i, /swagger/i, /openapi/i],
  refactor: [/refator/i, /refactor/i, /clean.?code/i, /melhoria/i, /revis/i],
  performance: [/performan/i, /otimiza/i, /lento/i, /cache/i, /bottleneck/i],
  seguranca: [/seguran/i, /security/i, /vulnerab/i, /token/i, /secret/i],
  database: [/database/i, /banco/i, /db/i, /schema/i, /migration/i, /migra/i, /sql/i],
  cli: [/cli/i, /comando/i, /terminal/i, /shell/i, /bash/i, /powershell/i],
  ia: [/ia/i, /ai/i, /llm/i, /inteligencia/i, /machine.?learning/i, /ml/i, /gpt/i, /openai/i],
  discord: [/discord/i],
  fullstack: [/full.?stack/i, /fullstack/i],
  backend: [/backend/i, /back.?end/i, /server/i, /servidor/i, /api/i],
  frontend: [/frontend/i, /front.?end/i, /ui/i, /interface/i],
};

/**
 * Extrai informação estruturada de uma descrição textual de projeto.
 */
export function parseDescricao(descricao: string): Projeto {
  const frameworks: string[] = [];
  const bancos: string[] = [];
  const features: string[] = [];

  for (const [name, patterns] of Object.entries(FRAMEWORK_PATTERNS)) {
    if (patterns.some((p) => p.test(descricao))) {
      frameworks.push(name);
    }
  }

  for (const [name, patterns] of Object.entries(BANCO_PATTERNS)) {
    if (patterns.some((p) => p.test(descricao))) {
      bancos.push(name);
    }
  }

  for (const [name, patterns] of Object.entries(FEATURE_PATTERNS)) {
    if (patterns.some((p) => p.test(descricao))) {
      features.push(name);
    }
  }

  return {
    descricao,
    frameworks: [...new Set(frameworks)],
    bancos: [...new Set(bancos)],
    features: [...new Set(features)],
    tags: [...new Set([...frameworks, ...bancos, ...features])],
  };
}

/**
 * Extrai palavras-chave simples de um texto (para matching adicional)
 */
export function extractKeywords(texto: string): string[] {
  const palavras = texto
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((p) => p.length > 2);

  const stopwords = new Set([
    'com', 'para', 'que', 'uma', 'estou', 'com', 'dos', 'das', 'nos', 'nas',
    'mas', 'por', 'mais', 'como', 'sao', 'seu', 'sua', 'ele', 'ela', 'foi',
    'tem', 'esta', 'ser', 'era', 'muito', 'vou', 'vai', 'quer', 'posso',
    'fazer', 'feito', 'forma', 'tipo', 'coisa', 'coisas', 'isso', 'esse',
    'essa', 'este', 'esta', 'ainda', 'entre', 'cada', 'depois', 'sobre',
    'apos', 'ate', 'todo', 'toda', 'todos', 'todas', 'aqui', 'la', 'ali',
    'the', 'and', 'for', 'with', 'from', 'this', 'that', 'are', 'was',
    'were', 'have', 'has', 'been', 'will', 'would', 'could', 'should',
    'their', 'them', 'they', 'what', 'when', 'where', 'which', 'into',
  ]);

  return palavras.filter((p) => !stopwords.has(p) && p.length > 2);
}

/**
 * Lista de frameworks conhecidos para matching
 */
export function getKnownFrameworks(): string[] {
  return Object.keys(FRAMEWORK_PATTERNS);
}

/**
 * Lista de bancos conhecidos
 */
export function getKnownDatabases(): string[] {
  return Object.keys(BANCO_PATTERNS);
}

/**
 * Lista de features conhecidas
 */
export function getKnownFeatures(): string[] {
  return Object.keys(FEATURE_PATTERNS);
}
