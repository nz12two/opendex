# OpenDex

Catálogo e documentação do ecossistema **OpenCode** — plugins, scripts, MCPs, agentes, modelos de IA e recursos da comunidade, tudo em um só lugar.

## ✨ Destaques

- **Catálogo real, nada de fake**: plugins, scripts e MCPs derivam de dados reais do npm (247 pacotes); repos do GitHub (122) vêm de um coletor real. Sem dados inventados — se não há fonte, mostra um empty state honesto.
- **Ranking** de projetos por score (estrelas, atividade, comunidade).
- **Documentação** completa (Starlight): quickstart, instalação, configuração, modelos, plugins, MCP, agentes, workflows e API.
- **Blog** com posts reais + releases do GitHub e artigos da comunidade (Dev.to).
- **OG images** geradas automaticamente no build (satori + resvg).
- **Busca** full-text com Pagefind.

## 🚀 Rodando localmente

```bash
npm install
npm run dev        # dev server em http://localhost:4321
npm run build      # build estático + gera OG images
npm run preview    # preview do build
```

## 🛠️ Stack

- [Astro](https://astro.build) 7 (static output)
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) 3
- [Starlight](https://starlight.astro.build) (docs)
- [Pagefind](https://pagefind.app) (busca)
- [satori](https://github.com/vercel/satori) + [resvg](https://github.com/yisibl/resvg-js) (OG images)

## 📁 Estrutura

```
src/
  components/   # UI components (cards, badges, ranking, etc.)
  data/         # dados do catálogo (npm, github, news, curiosities...)
  layouts/      # MainLayout, BaseLayout
  pages/        # rotas (plugins, scripts, mcps, agents, blog, docs, ranking)
  styles/       # CSS / tema
scripts/        # coletores de dados + gerador de OG
public/         # estáticos + og images
```

## 🔄 Atualizar dados

Os dados do catálogo vêm de coletores em `scripts/`:

```bash
node scripts/update-ecosystem-data.mjs   # repos do ecossistema
node scripts/update-github-data.mjs      # dados do GitHub (pode dar 403 sem token)
node scripts/update-openrouter-data.mjs  # modelos OpenRouter
```

> **Nota**: `update-github-data.mjs` pode retornar 403 (rate-limit) sem um token do GitHub. Defina `GITHUB_TOKEN` no ambiente para coletas completas.

## 📄 Licença

MIT — veja [LICENSE](LICENSE).

---

Feito com ❤️ para a comunidade OpenCode.