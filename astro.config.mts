import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://na12two.github.io/opendex',
  base: '/opendex',
  trailingSlash: 'ignore',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    starlight({
      title: 'OpenDex',
      description: 'Documentação do ecossistema OpenCode',
      favicon: '/favicon.ico',
      social: [
        { label: 'GitHub', href: 'https://github.com/na12two/opendex', icon: 'github' },
      ],
      sidebar: [
        { label: 'Guia de Início Rápido', slug: 'docs/quickstart' },
        { label: 'Instalação', slug: 'docs/instalacao' },
        { label: 'Configuração', slug: 'docs/configuracao' },
        {
          label: 'Recursos',
          items: [
            { label: 'Modelos de IA', slug: 'docs/modelos' },
            { label: 'Plugins', slug: 'docs/plugins' },
            { label: 'MCP (Model Context Protocol)', slug: 'docs/mcp' },
            { label: 'Agentes', slug: 'docs/agentes' },
            { label: 'Workflows', slug: 'docs/workflows' },
            { label: 'API Reference', slug: 'docs/api' },
          ],
        },
        { label: 'FAQ', slug: 'docs/faq' },
      ],
      components: {
        // Herdará componentes padrão do Starlight
      },
      customCss: [
        './src/styles/starlight-theme.css',
      ],
    }),
    mdx(),
  ],
});
