/**
 * Coletor de dados do GitHub para o ecossistema OpenCode.
 *
 * Estratégia de busca com múltiplos critérios:
 *   1. topic:opencode (stars desc, per_page=50)
 *   2. topic:opencode-plugin (per_page=30)
 *   3. topic:opencode-mcp (per_page=30)
 *   4. topic:opencode-agent (per_page=30)
 *   5. opencode in:name (per_page=30)
 *   6. opencode in:description (per_page=30)
 *   7. opencode in:readme (per_page=30) — via search code
 *
 * Cada resultado recebe um SCORE (0-100) e info de fonte.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.resolve(ROOT, 'src', 'data', 'github');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'ecosystem-repos.json');
const MAIN_REPO_FILE = path.join(OUTPUT_DIR, 'main-repo.json');

const GITHUB_API = 'https://api.github.com';
const DELAY_MS = 150;

/** Delay helper */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Headers com GITHUB_TOKEN se disponível */
function getHeaders() {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'OpenDex-UpdateBot/1.0',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

/** Lê JSON existente, retorna null se falhar */
function readExistingJson(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch { /* ignore */ }
  return null;
}

/** Salva JSON no disco */
function saveJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`     💾 ${filePath}`);
}

// ── Score Calculation ──────────────────────────────────────────

function calculateScore(repo) {
  let total = 0;

  // Stars: 0-30 (normalizado para 6500 como teto de referência)
  total += Math.min(30, (repo.stargazers_count || 0) / 6500 * 30);

  // Recência: 0-20
  if (repo.pushed_at) {
    const days = (Date.now() - new Date(repo.pushed_at).getTime()) / 86400000;
    total += Math.max(0, 20 - days / 15);
  }

  // Match quality: 0-30
  const name = (repo.name || '').toLowerCase();
  const desc = (repo.description || '').toLowerCase();
  if (name.includes('opencode')) total += 15;
  if (name.startsWith('@opencode') || name.startsWith('opencode-')) total += 5;
  if (desc.includes('opencode')) total += 5;
  if (repo.topics?.includes('opencode')) total += 5;

  // Comunidade: 0-20
  total += Math.min(20, ((repo.forks_count || 0) + (repo.open_issues_count || 0)) / 1000 * 20);

  return Math.round(Math.min(100, total));
}

function toSourceInfo(repo, queryUsed) {
  return {
    source: 'github',
    url: repo.html_url,
    collectedAt: new Date().toISOString(),
    version: repo.pushed_at,
    lastUpdated: repo.pushed_at,
    matchQuery: queryUsed,
    score: calculateScore(repo),
  };
}

// ── GitHub Search ──────────────────────────────────────────────

const SEARCH_QUERIES = [
  { label: 'topic:opencode', url: `${GITHUB_API}/search/repositories?q=topic:opencode&sort=stars&order=desc&per_page=50` },
  { label: 'topic:opencode-plugin', url: `${GITHUB_API}/search/repositories?q=topic:opencode-plugin&sort=stars&order=desc&per_page=30` },
  { label: 'topic:opencode-mcp', url: `${GITHUB_API}/search/repositories?q=topic:opencode-mcp&sort=stars&order=desc&per_page=30` },
  { label: 'topic:opencode-agent', url: `${GITHUB_API}/search/repositories?q=topic:opencode-agent&sort=stars&order=desc&per_page=30` },
  { label: 'opencode in:name', url: `${GITHUB_API}/search/repositories?q=opencode+in:name&sort=stars&order=desc&per_page=30` },
  { label: 'opencode in:description', url: `${GITHUB_API}/search/repositories?q=opencode+in:description&sort=stars&order=desc&per_page=30` },
];

async function searchRepos(query) {
  const response = await fetch(query.url, { headers: getHeaders() });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  const json = await response.json();
  return json.items || [];
}

/** Busca README mentions: usa search code */
async function searchReadmeMentions() {
  const url = `${GITHUB_API}/search/code?q=opencode+in:file+filename:README&per_page=30`;
  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) {
    // Search code pode exigir token; se falhar, apenas loga
    console.warn(`       ⚠️  README search code falhou (HTTP ${response.status}) — pode precisar de GITHUB_TOKEN`);
    return [];
  }
  const json = await response.json();
  const items = json.items || [];

  // Precisamos resolver cada item para um repositório completo
  const repos = [];
  for (const item of items) {
    const repoUrl = item.repository?.url;
    if (!repoUrl) continue;
    try {
      const r = await fetch(repoUrl, { headers: getHeaders() });
      if (r.ok) {
        const repoData = await r.json();
        repos.push(repoData);
      }
      await delay(DELAY_MS);
    } catch { /* skip */ }
  }
  return repos;
}

/** Busca o repositório principal anomalyco/opencode */
async function fetchMainRepo() {
  console.log('  ⭐ Buscando repositório principal anomalyco/opencode...');
  const url = `${GITHUB_API}/repos/anomalyco/opencode`;
  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) {
    throw new Error(`Main repo: HTTP ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

/** Extrai campos desejados de um raw repo do GitHub */
function extractRepo(item) {
  return {
    full_name: item.full_name,
    description: item.description || '',
    stargazers_count: item.stargazers_count || 0,
    forks_count: item.forks_count || 0,
    language: item.language || null,
    topics: item.topics || [],
    html_url: item.html_url,
    open_issues_count: item.open_issues_count || 0,
    pushed_at: item.pushed_at || null,
    owner: {
      login: item.owner?.login || '',
      avatar_url: item.owner?.avatar_url || '',
    },
  };
}

// ── Main Export ────────────────────────────────────────────────

export async function collect() {
  console.log('\n🔍 GitHub Collector — buscando repositórios do ecossistema...\n');

  const seen = new Set();
  const repos = [];
  let anySuccess = false;

  // ── 1-6: Search repositories ──
  for (const query of SEARCH_QUERIES) {
    console.log(`  🔎 ${query.label}...`);
    try {
      const items = await searchRepos(query);
      for (const item of items) {
        if (seen.has(item.full_name)) continue;
        seen.add(item.full_name);
        const repo = extractRepo(item);
        repos.push({ ...repo, ...toSourceInfo(repo, query.label) });
      }
      console.log(`     ✅ ${items.length} encontrados (${repos.length} únicos)`);
      anySuccess = true;
    } catch (err) {
      console.warn(`     ⚠️  Erro: ${err.message}`);
    }
    await delay(DELAY_MS);
  }

  // ── 7: README mentions ──
  console.log('  🔎 README mentions "opencode"...');
  try {
    const readmeItems = await searchReadmeMentions();
    for (const item of readmeItems) {
      if (seen.has(item.full_name)) continue;
      seen.add(item.full_name);
      const repo = extractRepo(item);
      repos.push({ ...repo, ...toSourceInfo(repo, 'README mentions "opencode"') });
    }
    if (readmeItems.length > 0) {
      console.log(`     ✅ ${readmeItems.length} novos via README`);
      anySuccess = true;
    } else {
      console.log('     ℹ️  Nenhum novo via README');
    }
  } catch (err) {
    console.warn(`     ⚠️  Erro README search: ${err.message}`);
  }

  // Ordena por score decrescente
  repos.sort((a, b) => (b.score || 0) - (a.score || 0));

  // ── Main repo ──
  let mainRepo = null;
  try {
    mainRepo = await fetchMainRepo();
    saveJson(MAIN_REPO_FILE, mainRepo);
    console.log(`     ✅ Repositório principal: ${mainRepo.stargazers_count} ⭐`);
    anySuccess = true;
  } catch (err) {
    console.warn(`     ⚠️  Main repo: ${err.message}`);
    mainRepo = readExistingJson(MAIN_REPO_FILE);
    if (mainRepo) console.log('     ↳ Usando dados existentes do repositório principal.');
  }

  // Salva apenas se tivermos dados
  if (repos.length > 0 || anySuccess) {
    // Preserva o campo score e sourceInfo
    saveJson(OUTPUT_FILE, repos);
    console.log(`\n  ✅ GitHub: ${repos.length} repositórios únicos no ecossistema`);
  } else {
    console.log('\n  ⚠️  Nenhum dado do GitHub coletado. Mantendo dados existentes.');
  }

  return { repos, mainRepo };
}

// Execução direta: node scripts/collectors/github.mjs
const isEntryPoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntryPoint) {
  async function main() {
    const result = await collect();
    console.log(`\n📊 Total: ${result.repos.length} repos | Main: ${result.mainRepo?.stargazers_count || '?'} ⭐`);
  }

  main().catch(err => {
    console.error('❌ Erro fatal no coletor GitHub:', err.message);
    process.exit(1);
  });
}
