/**
 * Orquestrador de coletores de dados do ecossistema OpenCode.
 *
 * Executa todos os coletores em sequência com fallback individual.
 * Se uma fonte falhar, as outras continuam.
 * NUNCA sobrescreve dados se TODAS as fontes falharem.
 *
 * Uso:
 *   node scripts/collectors/index.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

const ECOSYSTEM_DATA_DIR = path.resolve(ROOT, 'src', 'data', 'ecosystem');
const STATS_FILE = path.join(ECOSYSTEM_DATA_DIR, 'stats.json');

const DELAY_BETWEEN_COLLECTORS_MS = 250;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

/** Computa estatísticas agregadas a partir dos dados coletados */
function computeStats(results) {
  console.log('\n📊 Computando estatísticas agregadas...\n');

  const { npmPackages, githubRepos, mainRepo } = results;

  // npm stats
  const totalNpmPackages = Array.isArray(npmPackages) ? npmPackages.length : 0;
  const totalNpmDownloads = Array.isArray(npmPackages)
    ? npmPackages.reduce((s, p) => s + (p.downloads || 0), 0)
    : 0;

  const topDownloads = Array.isArray(npmPackages)
    ? [...npmPackages]
        .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
        .slice(0, 10)
        .map(p => ({ name: p.name, downloads: p.downloads || 0 }))
    : [];

  // GitHub stats
  const totalGithubRepos = Array.isArray(githubRepos) ? githubRepos.length : 0;
  const totalEcosystemStars = Array.isArray(githubRepos)
    ? githubRepos.reduce((s, r) => s + (r.stargazers_count || 0), 0) + (mainRepo?.stargazers_count || 0)
    : mainRepo?.stargazers_count || 0;

  // Community stats from other collectors
  const totalBlogPosts = Array.isArray(results.blogPosts) ? results.blogPosts.length : 0;

  const stats = {
    generatedAt: new Date().toISOString(),
    packages: {
      total: totalNpmPackages,
      totalMonthlyDownloads: totalNpmDownloads,
      topDownloads,
    },
    github: {
      totalEcosystemRepos: totalGithubRepos,
      totalEcosystemStars,
      mainRepoStars: mainRepo?.stargazers_count || 0,
      mainRepoForks: mainRepo?.forks_count || 0,
      mainRepoOpenIssues: mainRepo?.open_issues_count || 0,
    },
    community: {
      totalBlogPosts,
    },
  };

  console.log(`     📦 ${totalNpmPackages} pacotes npm`);
  console.log(`     🐙 ${totalGithubRepos} repositórios GitHub no ecossistema`);
  console.log(`     ⭐ ${totalEcosystemStars} estrelas combinadas`);
  console.log(`     📥 ${totalNpmDownloads.toLocaleString()} downloads npm/mês`);
  console.log(`     📝 ${totalBlogPosts} posts da comunidade`);

  return stats;
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  console.log('🔄 Orquestrador de coletores — iniciando...\n');
  console.log('═══════════════════════════════════════════');

  const existingStats = readExistingJson(STATS_FILE);

  // Resultados parciais — cada coletor popula seu slot
  const results = {
    npmPackages: null,
    githubRepos: null,
    mainRepo: null,
    blogPosts: null,
  };

  let anySuccess = false;

  // ── 1. npm ──
  try {
    const { collect: collectNpm } = await import('./npm.mjs');
    const packages = await collectNpm();
    if (packages && packages.length > 0) {
      results.npmPackages = packages;
      anySuccess = true;
    }
  } catch (err) {
    console.error(`  ❌ npm collector: ${err.message}`);
  }
  await delay(DELAY_BETWEEN_COLLECTORS_MS);

  // ── 2. GitHub ──
  try {
    const { collect: collectGithub } = await import('./github.mjs');
    const { repos, mainRepo } = await collectGithub();
    if (repos && repos.length > 0) {
      results.githubRepos = repos;
      anySuccess = true;
    }
    if (mainRepo) {
      results.mainRepo = mainRepo;
      anySuccess = true;
    }
  } catch (err) {
    console.error(`  ❌ GitHub collector: ${err.message}`);
  }
  await delay(DELAY_BETWEEN_COLLECTORS_MS);

  // ── 3. RSS/Blog ──
  try {
    const { collect: collectRss } = await import('./rss.mjs');
    const posts = await collectRss();
    if (posts && posts.length > 0) {
      results.blogPosts = posts;
      anySuccess = true;
    }
  } catch (err) {
    console.error(`  ❌ RSS collector: ${err.message}`);
  }
  await delay(DELAY_BETWEEN_COLLECTORS_MS);

  // ── 4. OpenRouter ──
  try {
    const { collect: collectOpenRouter } = await import('./openrouter.mjs');
    const models = await collectOpenRouter();
    if (models && models.length > 0) {
      anySuccess = true;
    }
  } catch (err) {
    console.error(`  ❌ OpenRouter collector: ${err.message}`);
  }

  // ── 5. Stats ──
  console.log('\n═══════════════════════════════════════════');

  if (anySuccess) {
    const stats = computeStats(results);
    saveJson(STATS_FILE, stats);
  } else {
    console.log('\n⚠️  Todas as fontes falharam. Mantendo dados existentes intactos.');
    if (existingStats) {
      console.log('   Dados existentes preservados.');
    }
    process.exit(0);
  }

  console.log('\n✅ Coleta de dados do ecossistema concluída!');
  console.log('   📁 Dados salvos em src/data/');
}

main().catch(err => {
  console.error('❌ Erro fatal no orquestrador:', err);
  process.exit(1);
});
