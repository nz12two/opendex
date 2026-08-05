import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { createSearchIndex, search, type SearchItem } from '@/lib/search';
import { mainNavigation } from '@/data/navigation';
import {
  BookOpen,
  Code,
  FolderKanban,
  Globe,
  GraduationCap,
  House,
  Newspaper,
  Search,
  Users,
  Wrench,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  House: <House className="mr-2 h-4 w-4" />,
  BookOpen: <BookOpen className="mr-2 h-4 w-4" />,
  Code: <Code className="mr-2 h-4 w-4" />,
  FolderKanban: <FolderKanban className="mr-2 h-4 w-4" />,
  Globe: <Globe className="mr-2 h-4 w-4" />,
  GraduationCap: <GraduationCap className="mr-2 h-4 w-4" />,
  Newspaper: <Newspaper className="mr-2 h-4 w-4" />,
  Users: <Users className="mr-2 h-4 w-4" />,
  Wrench: <Wrench className="mr-2 h-4 w-4" />,
};

function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = mainNavigation.map((nav) => ({
    title: nav.label,
    description: `Ir para página ${nav.label}`,
    href: nav.href,
    category: 'Navegação',
  }));

  // Itens adicionais com links reais do site
  items.push(
    { title: 'Documentação', description: 'Guia de introdução e visão geral do OpenDex', href: '/opendex/docs', category: 'Docs' },
    { title: 'Instalação', description: 'Como instalar e configurar', href: '/opendex/docs/instalacao', category: 'Docs' },
    { title: 'API Reference', description: 'Documentação completa da API', href: '/opendex/docs/api', category: 'Docs' },
    { title: 'FAQ', description: 'Perguntas frequentes sobre o OpenDex', href: '/opendex/faq/', category: 'FAQ' },
    { title: 'Scripts', description: 'Crie e gerencie scripts personalizados', href: '/opendex/scripts/', category: 'Scripts' },
    { title: 'Plugins', description: 'Extenda o OpenDex com plugins', href: '/opendex/plugins/', category: 'Plugins' },
    { title: 'MCPs', description: 'Conecte-se a servidores MCP', href: '/opendex/mcps/', category: 'MCPs' },
    { title: 'Modelos', description: 'Modelos de IA disponíveis no ecossistema', href: '/opendex/modelos/', category: 'Modelos' },
    { title: 'Configuração', description: 'Configure ferramentas e preferências', href: '/opendex/configuracao/', category: 'Configuração' },
    { title: 'Comunidade', description: 'Participe das discussões da comunidade', href: '/opendex/community/', category: 'Community' },
    { title: 'Descobrir', description: 'Descubra agentes, scripts e ferramentas', href: '/opendex/descobrir/', category: 'Descobrir' },
    { title: 'Dicionário', description: 'Glossário de termos do OpenCode', href: '/opendex/dicionario/', category: 'Dicionário' },
    { title: 'Blog', description: 'Novidades e atualizações do ecossistema', href: '/opendex/blog/', category: 'Blog' },
    { title: 'Playground', description: 'Teste agentes e scripts online', href: '/opendex/playground/', category: 'Playground' }
  );

  return items;
}

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const indexBuilt = useRef(false);

  // Build search index once
  useEffect(() => {
    if (!indexBuilt.current) {
      const items = buildSearchIndex();
      createSearchIndex(items);
      indexBuilt.current = true;
    }
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Also listen for the search trigger button
  useEffect(() => {
    const btn = document.getElementById('search-trigger');
    if (!btn) return;
    const handler = () => setOpen(true);
    btn.addEventListener('click', handler);
    return () => btn.removeEventListener('click', handler);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setResults(search(value));
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      window.location.href = href;
    },
    []
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Buscar páginas, documentação..."
        value={query}
        onValueChange={handleSearch}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4">
            <Search className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Nenhum resultado encontrado
            </p>
          </div>
        </CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Resultados">
            {results.map((item) => (
              <CommandItem
                key={item.href}
                value={item.title}
                onSelect={() => handleSelect(item.href)}
              >
                {iconMap[mainNavigation.find((n) => n.label === item.category)?.icon || 'Search'] || (
                  <Search className="mr-2 h-4 w-4" />
                )}
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
