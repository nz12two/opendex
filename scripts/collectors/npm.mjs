/**
 * Coletor de dados do npm registry para o ecossistema OpenCode.
 *
 * Fonte:
 *   - npm registry search: text=opencode, size=250
 *   - Filtra apenas pacotes relevantes (nome contém "opencode" ou keyword inclui "opencode")
 *
 * Salva em src/data/npm/packages.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.resolve(ROOT, 'src', 'data', 'npm');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'packages.json');

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

function getHeaders() {
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'OpenDex-UpdateBot/1.0',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

// ── Main Export ────────────────────────────────────────────────

export async function collect() {
  console.log('\n📦 npm Collector — buscando pacotes...\n');

  const url = 'https://registry.npmjs.org/-/v1/search?text=opencode&size=250';

  try {
    const response = await fetch(url, { headers: getHeaders() });

    if (!response.ok) {
      throw new Error(`npm registry: HTTP ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const objects = json.objects || [];

    if (!Array.isArray(objects) || objects.length === 0) {
      console.log('     ⚠️  Nenhum pacote encontrado no npm.');
      return [];
    }

    // Filtra apenas pacotes RELEVANTES
    const relevant = objects.filter(({ package: pkg }) => {
      if (!pkg) return false;
      const name = (pkg.name || '').toLowerCase();
      const keywords = pkg.keywords || [];
      return name.includes('opencode') || keywords.includes('opencode');
    });

    if (relevant.length === 0) {
      console.log('     ⚠️  Nenhum pacote relevante encontrado.');
      return [];
    }

    const packages = relevant.map(({ package: pkg, downloads }) => ({
      name: pkg.name || '',
      version: pkg.version || '',
      description: pkg.description || '',
      keywords: pkg.keywords || [],
      publisher: pkg.publisher ? pkg.publisher.username : null,
      downloads: downloads ? downloads.monthly : 0,
      date: pkg.date || null,
      repository: pkg.links ? pkg.links.repository || pkg.links.npm : null,
      npm: pkg.links ? pkg.links.npm : null,
    }));

    const totalDownloads = packages.reduce((s, p) => s + (p.downloads || 0), 0);
    console.log(`     ✅ ${packages.length} pacotes relevantes encontrados`);
    console.log(`     📊 Downloads totais/mês: ${totalDownloads.toLocaleString()}`);

    saveJson(OUTPUT_FILE, packages);
    return packages;
  } catch (err) {
    console.warn(`     ❌ Erro: ${err.message}`);
    const existing = readExistingJson(OUTPUT_FILE);
    if (existing) {
      console.log('     ↳ Usando dados existentes como fallback.');
      return existing;
    }
    return [];
  }
}

// Execução direta: node scripts/collectors/npm.mjs
const __filename = fileURLToPath(import.meta.url);
const isEntryPoint = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isEntryPoint) {
  async function main() {
    const packages = await collect();
    console.log(`\n📊 Total: ${packages.length} pacotes npm`);
  }

  main().catch(err => {
    console.error('❌ Erro fatal no coletor npm:', err.message);
    process.exit(1);
  });
}
