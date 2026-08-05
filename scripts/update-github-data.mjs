/**
 * Script de atualização automática dos dados de repositórios GitHub.
 * Executado semanalmente pelo GitHub Action update-data.yml.
 *
 * Busca dados reais da API do GitHub para os repositórios do ecossistema
 * OpenCode e atualiza src/data/github/repos.yaml com as informações mais recentes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.resolve(__dirname, '..', 'src', 'data', 'github', 'repos.yaml');

const REPOS = [
  'opencode-dash',
  'ctx',
  'opencode-setup',
  'opencode-bar',
  'opencode-models',
  'opencode-vibeguard',
  'opencode-dcp',
  'opencode-shell-strategy',
];

const GITHUB_API = 'https://api.github.com';
const OWNER = 'OpenCode';

async function fetchRepoData(repoName) {
  const url = `${GITHUB_API}/repos/${OWNER}/${repoName}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'OpenDex-UpdateBot/1.0',
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      console.warn(`⚠️  Rate limited ao buscar ${repoName}, mantendo dados existentes.`);
      return null;
    }
    // Se o repo não existe no org OpenCode, tenta buscar pelo nome direto
    if (response.status === 404) {
      const fallbackUrl = `${GITHUB_API}/repos/${repoName}`;
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'OpenDex-UpdateBot/1.0',
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
      });
      if (!fallbackResponse.ok) {
        console.warn(`⚠️  Repositório ${repoName} não encontrado, mantendo dados existentes.`);
        return null;
      }
      return await fallbackResponse.json();
    }
    throw new Error(`Erro ao buscar ${repoName}: ${response.statusText}`);
  }

  return await response.json();
}

function formatRepoData(data) {
  return {
    name: data.name,
    slug: data.name,
    description: data.description || '',
    language: data.language || 'Unknown',
    stars: data.stargazers_count || 0,
    forks: data.forks_count || 0,
    url: data.html_url,
    owner: data.owner?.login || OWNER,
    topics: data.topics || [],
    updatedAt: data.updated_at
      ? new Date(data.updated_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  };
}

function yamlStringify(repos) {
  const lines = [];
  for (const repo of repos) {
    lines.push(`- name: "${repo.name}"`);
    lines.push(`  slug: "${repo.slug}"`);
    lines.push(`  description: "${repo.description.replace(/"/g, '\\"')}"`);
    lines.push(`  language: "${repo.language}"`);
    lines.push(`  stars: ${repo.stars}`);
    lines.push(`  forks: ${repo.forks}`);
    lines.push(`  url: "${repo.url}"`);
    lines.push(`  owner: "${repo.owner}"`);
    lines.push(`  topics:`);
    for (const topic of repo.topics) {
      lines.push(`    - ${topic}`);
    }
    lines.push(`  updatedAt: "${repo.updatedAt}"`);
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  console.log('🔄 Iniciando atualização de dados do GitHub...\n');

  // Tenta carregar dados existentes como fallback
  let existingRepos = [];
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      // Parse simples de YAML para extrair names
      const nameMatches = content.matchAll(/^\s*name:\s*"([^"]+)"\s*$/gm);
      for (const match of nameMatches) {
        existingRepos.push(match[1]);
      }
    }
  } catch {
    // Ignora erro na leitura dos existentes
  }

  const results = [];
  let updated = 0;
  let skipped = 0;

  for (const repoName of REPOS) {
    console.log(`  📦 Buscando ${repoName}...`);
    try {
      const data = await fetchRepoData(repoName);
      if (data) {
        results.push(formatRepoData(data));
        updated++;
        console.log(`     ✅ ${data.stargazers_count} ⭐ | ${data.language || 'N/A'}`);
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`     ❌ Erro: ${err.message}`);
      skipped++;
    }

    // Pequena pausa para evitar rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  // Se não conseguiu buscar nenhum repo, aborta para não sobrescrever dados
  if (results.length === 0) {
    console.log('\n⚠️  Nenhum dado foi atualizado. Mantendo dados existentes.');
    process.exit(0);
  }

  // Ordena por estrelas (decrescente)
  results.sort((a, b) => b.stars - a.stars);

  // Gera YAML
  const yaml = yamlStringify(results);
  fs.writeFileSync(DATA_FILE, yaml, 'utf-8');

  console.log(`\n✅ Atualização concluída!`);
  console.log(`   📊 ${updated} repositórios atualizados`);
  if (skipped > 0) {
    console.log(`   ⚠️  ${skipped} repositórios mantidos com dados anteriores`);
  }
  console.log(`   📁 ${DATA_FILE}`);
}

main().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
