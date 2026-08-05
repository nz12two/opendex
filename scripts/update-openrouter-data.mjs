/**
 * Script de atualização automática dos dados de modelos OpenRouter.
 * Executado pelo GitHub Action update-data.yml.
 *
 * Busca dados atualizados da OpenRouter API (funciona SEM key de API!)
 * e salva como JSON em src/data/openrouter/models.json com apenas
 * os campos úteis para o OpenDex.
 *
 * Segue o mesmo padrão de scripts/update-github-data.mjs:
 * - Se a requisição falhar, aborta sem sobrescrever dados existentes
 * - Usa process.env.GITHUB_TOKEN se disponível (para User-Agent)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'src', 'data', 'openrouter');
const DATA_FILE = path.join(DATA_DIR, 'models.json');

const API_URL = 'https://openrouter.ai/api/v1/models';

/** Campos que queremos manter de cada modelo */
const KEEP_FIELDS = new Set([
  'id',
  'name',
  'description',
  'context_length',
  'pricing',
  'architecture',
  'top_provider',
  'reasoning',
]);

/**
 * Filtra um objeto mantendo apenas as chaves em KEEP_FIELDS.
 * Isso reduz significativamente o tamanho do arquivo salvo.
 */
function filterModel(model) {
  const result = {};
  for (const key of KEEP_FIELDS) {
    if (key in model && model[key] !== undefined && model[key] !== null) {
      result[key] = model[key];
    }
  }
  return result;
}

async function main() {
  console.log('🔄 Iniciando atualização de dados do OpenRouter...\n');

  // Monta headers — GITHUB_TOKEN não é exigido pela OpenRouter,
  // mas usamos se disponível para maior limite de requisições
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'OpenDex-UpdateBot/1.0',
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  };

  console.log('  📡 Buscando modelos de ', API_URL);
  const response = await fetch(API_URL, { headers });

  if (!response.ok) {
    throw new Error(
      `Erro HTTP ${response.status}: ${response.statusText}`,
    );
  }

  const json = await response.json();
  const rawModels = json.data || [];

  if (!Array.isArray(rawModels) || rawModels.length === 0) {
    console.log(
      '\n⚠️  Nenhum modelo encontrado na resposta. Mantendo dados existentes.',
    );
    process.exit(0);
  }

  console.log(`  📦 ${rawModels.length} modelos recebidos da API`);

  // Filtra apenas campos úteis
  const filtered = rawModels.map(filterModel);

  // Remove duplicatas por ID (caso a API retorne)
  const seen = new Set();
  const unique = [];
  for (const m of filtered) {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      unique.push(m);
    }
  }

  // Ordena por ID alfabeticamente
  unique.sort((a, b) => a.id.localeCompare(b.id));

  // Garante que o diretório existe
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Salva como JSON formatado
  fs.writeFileSync(DATA_FILE, JSON.stringify(unique, null, 2), 'utf-8');

  console.log(`\n✅ Atualização concluída!`);
  console.log(`   📊 ${unique.length} modelos salvos (${rawModels.length - unique.length} duplicatas removidas)`);
  console.log(`   📁 ${DATA_FILE}`);
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err.message);
  process.exit(1);
});
