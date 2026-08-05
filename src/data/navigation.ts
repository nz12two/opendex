export interface NavItem {
  label: string;
  href: string;
  icon: string;
  children?: NavItem[];
}

export const mainNavigation: NavItem[] = [
  { label: 'Home', href: '/opendex/', icon: 'House' },
  { label: 'Ecossistema', href: '/opendex/ecossistema/', icon: 'Globe' },
  { label: 'Docs', href: '/opendex/docs/', icon: 'BookOpen' },
  { label: 'Descobrir', href: '/opendex/descobrir/', icon: 'Compass' },
  { label: 'FAQ', href: '/opendex/faq/', icon: 'HelpCircle' },
  { label: 'Modelos', href: '/opendex/modelos/', icon: 'Brain' },
  { label: 'Configuração', href: '/opendex/configuracao/', icon: 'Wrench' },
  { label: 'Vale a Pena?', href: '/opendex/vale-a-pena/', icon: 'Sparkles' },
  { label: 'Busca', href: '/opendex/busca/', icon: 'Search' },
  { label: 'Ranking', href: '/opendex/ranking/', icon: 'Trophy' },
  { label: 'Favoritos', href: '/opendex/favoritos/', icon: 'Heart' },
  { label: 'Scripts', href: '/opendex/scripts/', icon: 'Code' },
  { label: 'Plugins', href: '/opendex/plugins/', icon: 'Puzzle' },
  { label: 'MCPs', href: '/opendex/mcps/', icon: 'Server' },
  { label: 'Showcase', href: '/opendex/showcase/', icon: 'FolderKanban' },
  { label: 'Comparações', href: '/opendex/comparacoes/', icon: 'GitCompare' },
  { label: 'Playground', href: '/opendex/playground/', icon: 'Workflow' },
  { label: 'Blog', href: '/opendex/blog/', icon: 'Newspaper' },
  { label: 'Ferramentas', href: '/opendex/ferramentas/', icon: 'Hammer' },
];

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export const siteConfig = {
  name: 'OpenDex',
  description: 'Ecossistema OpenCode — descubra scripts, agentes, plugins e ferramentas.',
  url: 'https://opencode-community.github.io/opendex',  footerColumns: [
    {
      title: 'Produto',
      links: [
        { label: 'Documentação', href: '/opendex/docs/' },
        { label: 'API', href: '/opendex/docs/api/' },
        { label: 'Changelog', href: '/opendex/blog/' },
      ],
    },
    {
      title: 'Comunidade',
      links: [
        { label: 'Discord', href: 'https://discord.gg/opencode' },
        { label: 'GitHub', href: 'https://github.com/anomalyco/opencode' },
        { label: 'Twitter', href: 'https://twitter.com/opencode' },
      ],
    },
    {
      title: 'Recursos',
      links: [
        { label: 'Blog', href: '/opendex/blog/' },
        { label: 'FAQ', href: '/opendex/faq/' },
        { label: 'Descobrir', href: '/opendex/descobrir/' },
        { label: 'Busca Global', href: '/opendex/busca/' },
        { label: 'Playground', href: '/opendex/playground/' },
      ],
    },
  ],
};

// Configuração do giscus (comentários do blog via GitHub Discussions).
// repoId e categoryId são gerados em https://giscus.app — preencher lá antes de habilitar.
export const giscusConfig = {
  enabled: false, // mude pra true quando o dono configurar no giscus.app
  repo: 'opencode-community/opendex',
  repoId: '',  // preencher via https://giscus.app
  category: 'General',
  categoryId: '', // preencher via https://giscus.app
};
