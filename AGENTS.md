# AGENTS.md — OpenDex

Site Astro 7 + React 19 + Tailwind. Base path `/opendex`, publicado em GitHub Pages (opencode-community.github.io/opendex).

## Comandos
- Dev: `npm run dev`
- Build: `npm run build` (= `astro build && node scripts/generate-og.mjs`)
- Depois do build SEMPRE conferir `public/og/` (home.png + {slug}.png): o script de OG tem try/catch, então build passa mesmo se a OG quebrar. Rodar `node scripts/generate-og.mjs` manualmente pra ver o erro.
- Fontes OG: `scripts/fonts/inter-400.woff` e `inter-700.woff`

## Regra do dono
**Tudo real, nada de dados fake.** Se não tem fonte, mostra empty state honesto, não inventa.

## Dados
- Fonte única do catálogo: `src/data/npm/packages.json` (247 pacotes) — plugins/scripts/mcps derivam dele
- GitHub: `src/data/github/ecosystem-repos.json` (122 repos) — `github/index.ts` deriva 100% dele
- Coletores em `scripts/`: `update-ecosystem-data.mjs`, `update-github-data.mjs` (pode dar 403 rate-limit sem token), `update-openrouter-data.mjs`
- Showcase deriva de ecosystem-repos.json (lookup por full_name; se sumir do coletor, pula)
- Community/contributors podem estar vazios de propósito (sem fonte real ainda)

## Gotchas
- Links oficiais: `opencode.ai` e `github.com/anomalyco/opencode` (opencode.dev NÃO existe)
- Feed (`feed` v6): usar `Item.category`, `date=updated??published`, NÃO tem `Item.modified`
- BlogCard: usar `post.id.replace(/^blog\//, '')` — `post.slug` é undefined no glob loader do Astro 7
- Giscus desativado (enabled:false, repoId vazio) — dono preenche em giscus.app
- OG images: MainLayout/BaseLayout recebem prop `image` com `/opendex/og/...`
