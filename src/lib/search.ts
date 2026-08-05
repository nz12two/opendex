import Fuse from 'fuse.js';

export interface SearchItem {
  title: string;
  description: string;
  href: string;
  category: string;
}

// Índice de busca global — povoado no build
let fuseInstance: Fuse<SearchItem> | null = null;

const defaultOptions: Fuse.IFuseOptions<SearchItem> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'category', weight: 0.2 },
    { name: 'href', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  ignoreLocation: true,
};

export function createSearchIndex(items: SearchItem[]): Fuse<SearchItem> {
  fuseInstance = new Fuse(items, defaultOptions);
  return fuseInstance;
}

export function search(query: string, limit = 8): SearchItem[] {
  if (!fuseInstance || !query.trim()) return [];
  return fuseInstance.search(query.trim()).slice(0, limit).map((r) => r.item);
}

export function getFuseInstance(): Fuse<SearchItem> | null {
  return fuseInstance;
}
