/**
 * Coletor de blogs RSS (Dev.to + Hashnode) para o ecossistema OpenCode.
 *
 * Fontes:
 *   - Dev.to: GET https://dev.to/api/articles?tag=opencode&per_page=30
 *   - Hashnode: GraphQL query via https://gql.hashnode.com
 *
 * Normaliza e salva em src/data/blog/community-posts.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const __filename = fileURLToPath(import.meta.url);
const OUTPUT_DIR = path.resolve(ROOT, 'src', 'data', 'blog');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'community-posts.json');

const DELAY_MS = 200;

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

/** Calcula score baseado em recência + engajamento */
function calculateScore(post) {
  let total = 0;

  // Recência: 0-50
  if (post.publishedAt) {
    const days = (Date.now() - new Date(post.publishedAt).getTime()) / 86400000;
    total += Math.max(0, 50 - days);
  }

  // Engajamento: 0-50
  const reactions = post.public_reactions_count || post.positive_reactions_count || 0;
  const comments = post.comments_count || 0;
  total += Math.min(30, reactions / 10 * 30);
  total += Math.min(20, comments / 5 * 20);

  return Math.round(Math.min(100, total));
}

// ── Dev.to ────────────────────────────────────────────────────

async function collectDevTo() {
  console.log('  📝 Dev.to — buscando artigos...');

  const url = 'https://dev.to/api/articles?tag=opencode&per_page=30';
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'OpenDex-UpdateBot/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Dev.to API: HTTP ${response.status} ${response.statusText}`);
  }

  const articles = await response.json();
  if (!Array.isArray(articles)) return [];

  const posts = articles.map(article => {
    const post = {
      source: 'devto',
      id: article.id,
      url: article.url || article.canonical_url,
      title: article.title || '',
      description: article.description || '',
      tags: article.tags || [],
      publishedAt: article.published_at || null,
      author: article.user?.name || article.user?.username || null,
      authorAvatar: article.user?.profile_image || null,
      readingTimeMinutes: article.reading_time_minutes || 0,
      public_reactions_count: article.public_reactions_count || 0,
      comments_count: article.comments_count || 0,
      coverImage: article.cover_image || null,
      score: calculateScore(article),
      collectedAt: new Date().toISOString(),
    };
    return post;
  });

  console.log(`     ✅ ${posts.length} artigos encontrados no Dev.to`);
  return posts;
}

// ── Hashnode ──────────────────────────────────────────────────

async function collectHashnode() {
  console.log('  📝 Hashnode — buscando publicações...');

  const query = `
    query {
      publications(
        first: 20,
        filter: { tags: ["opencode"] }
      ) {
        edges {
          node {
            id
            title
            brief
            url
            publishedAt
            author {
              name
              profilePicture
            }
            coverImage {
              url
            }
            readTimeInMinutes
            totalReactions
            responseCount
          }
        }
      }
    }
  `;

  const response = await fetch('https://gql.hashnode.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'OpenDex-UpdateBot/1.0',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Hashnode API: HTTP ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const edges = json?.data?.publications?.edges || [];
  const posts = [];

  for (const edge of edges) {
    const post = edge.node;
    if (!post) continue;

    // Hashnode retorna publicações (blogs), não artigos individuais com tag
    // Vamos tentar buscar posts das publicações encontradas
    try {
      const postsQuery = `
        query {
          publication(host: "${post.url?.replace('https://', '')?.split('/')[0] || ''}") {
            posts(first: 10) {
              edges {
                node {
                  id
                  title
                  brief
                  url
                  publishedAt
                  author {
                    name
                    profilePicture
                  }
                  coverImage { url }
                  readTimeInMinutes
                  totalReactions
                  responseCount
                }
              }
            }
          }
        }
      `;

      // Se não tem host válido, tenta buscar por slug
      if (!post.url) continue;

      const postsResp = await fetch('https://gql.hashnode.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'OpenDex-UpdateBot/1.0',
        },
        body: JSON.stringify({ query: postsQuery }),
      });

      if (postsResp.ok) {
        const postsJson = await postsResp.json();
        const postEdges = postsJson?.data?.publication?.posts?.edges || [];
        for (const pe of postEdges) {
          const p = pe.node;
          if (!p) continue;
          // Filtra apenas posts que mencionam opencode no título ou brief
          const title = (p.title || '').toLowerCase();
          const brief = (p.brief || '').toLowerCase();
          if (!title.includes('opencode') && !brief.includes('opencode')) continue;

          posts.push({
            source: 'hashnode',
            id: p.id,
            url: p.url,
            title: p.title || '',
            description: p.brief || '',
            tags: [],
            publishedAt: p.publishedAt || null,
            author: p.author?.name || null,
            authorAvatar: p.author?.profilePicture || null,
            readingTimeMinutes: p.readTimeInMinutes || 0,
            public_reactions_count: p.totalReactions || 0,
            comments_count: p.responseCount || 0,
            coverImage: p.coverImage?.url || null,
            score: calculateScore({
              publishedAt: p.publishedAt,
              public_reactions_count: p.totalReactions || 0,
              comments_count: p.responseCount || 0,
            }),
            collectedAt: new Date().toISOString(),
          });
        }
      }
    } catch {
      // Se falhar para uma publicação, continua com as outras
    }
    await delay(DELAY_MS);
  }

  console.log(`     ✅ ${posts.length} artigos encontrados no Hashnode`);
  return posts;
}

// ── Main Export ────────────────────────────────────────────────

export async function collect() {
  console.log('\n📰 RSS/Blog Collector — buscando posts da comunidade...\n');

  const allPosts = [];
  let anySuccess = false;

  // Dev.to
  try {
    const devto = await collectDevTo();
    allPosts.push(...devto);
    anySuccess = true;
  } catch (err) {
    console.warn(`     ⚠️  Dev.to: ${err.message}`);
  }
  await delay(DELAY_MS);

  // Hashnode
  try {
    const hashnode = await collectHashnode();
    allPosts.push(...hashnode);
    anySuccess = true;
  } catch (err) {
    console.warn(`     ⚠️  Hashnode: ${err.message}`);
  }

  // Ordena por score
  allPosts.sort((a, b) => (b.score || 0) - (a.score || 0));

  if (anySuccess && allPosts.length > 0) {
    saveJson(OUTPUT_FILE, allPosts);
    console.log(`\n  ✅ RSS/Blog: ${allPosts.length} posts coletados`);
  } else {
    const existing = readExistingJson(OUTPUT_FILE);
    if (existing) {
      console.log('\n  ⚠️  Nenhum post coletado. Mantendo dados existentes.');
    } else {
      console.log('\n  ⚠️  Nenhum post coletado e sem dados existentes.');
    }
  }

  return allPosts;
}

// Execução direta: node scripts/collectors/rss.mjs
const isEntryPoint = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isEntryPoint) {
  async function main() {
    const posts = await collect();
    console.log(`\n📊 Total: ${posts.length} posts da comunidade`);
  }

  main().catch(err => {
    console.error('❌ Erro fatal no coletor RSS:', err.message);
    process.exit(1);
  });
}
