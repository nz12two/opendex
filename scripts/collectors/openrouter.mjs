/**
 * Coletor de dados da OpenRouter API para o ecossistema OpenCode.
 *
 * Fonte:
 *   - OpenRouter API: GET https://openrouter.ai/api/v1/models
 *   - Funciona SEM key de API!
 *
 * Salva em src/data/openrouter/models.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.resolve(ROOT, 'src', 'data', 'openrouter');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'models.json');

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

function readExistingJson(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch { /* ignore */ }
  return null;
}

function saveJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`     💾 ${filePath}`);
}

/** Filtra um modelo mantendo apenas as chaves em KEEP_FIELDS */
function filterModel(model) {
  const result = {};
  for (const key of KEEP_FIELDS) {
    if (key in model && model[key] !== undefined && model[key] !== null) {
      result[key] = model[key];
    }
  }
  return result;
}

// ── Main Export ────────────────────────────────────────────────

export async function collect() {
  console.log('\n🤖 OpenRouter Collector — buscando modelos...\n');

  const headers = {
    Accept: 'application/json',
    'User-Agent': 'OpenDex-UpdateBot/1.0',
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  };

  try {
    console.log(`  📡 Buscando modelos de ${API_URL}`);
    const response = await fetch(API_URL, { headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    const rawModels = json.data || [];

    if (!Array.isArray(rawModels) || rawModels.length === 0) {
      console.log('     ⚠️  Nenhum modelo encontrado na resposta.');
      const existing = readExistingJson(OUTPUT_FILE);
      if (existing) {
        console.log('     ↳ Mantendo dados existentes.');
        return existing;
      }
      return [];
    }

    console.log(`     📦 ${rawModels.length} modelos recebidos da API`);

    // Filtra apenas campos úteis
    const filtered = rawModels.map(filterModel);

    // Remove duplicatas por ID
    const seen = new Set();
    const unique = [];
    for (const m of filtered) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        unique.push(m);
      }
    }

    // Ordena por ID
    unique.sort((a, b) => a.id.localeCompare(b.id));

    saveJson(OUTPUT_FILE, unique);
    console.log(`     ✅ ${unique.length} modelos únicos (${rawModels.length - unique.length} duplicatas removidas)`);
    return unique;
  } catch (err) {
    console.warn(`     ❌ Erro: ${err.message}`);
    const existing = readExistingJson(OUTPUT_FILE);
    if (existing) {
      console.log('     ↳ Usando dados existentes como fallback.');
      return existing;
    }
    console.log('     ⚠️  Nenhum dado existente disponível.');
    return [];
  }
}

// ── Entry Point Guard ──────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const isEntryPoint = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isEntryPoint) {
  async function main() {
    const models = await collect();
    console.log(`\n📊 Total: ${models.length} modelos`);
  }

  main().catch(err => {
    console.error('❌ Erro fatal no coletor OpenRouter:', err.message);
    process.exit(1);
  });
}
