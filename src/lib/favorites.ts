export interface FavoriteItem {
  type: string; // 'plugin' | 'mcp' | 'script' | 'agente' | 'ferramenta' | 'modelo'
  slug: string;
  title: string;
  url: string;
  addedAt: string; // ISO date
}

const STORAGE_KEY = 'opendex_favorites';
const MAX_FAVORITES = 100;

export function getFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as FavoriteItem[];
  } catch {
    // Corrupted JSON — return empty
    return [];
  }
}

function saveFavorites(items: FavoriteItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function addFavorite(item: FavoriteItem): void {
  const favorites = getFavorites();
  // Avoid duplicates
  if (favorites.some((f) => f.type === item.type && f.slug === item.slug)) return;
  // Enforce limit
  if (favorites.length >= MAX_FAVORITES) return;
  favorites.push({
    ...item,
    addedAt: item.addedAt || new Date().toISOString(),
  });
  saveFavorites(favorites);
}

export function removeFavorite(type: string, slug: string): void {
  const favorites = getFavorites().filter(
    (f) => !(f.type === type && f.slug === slug)
  );
  saveFavorites(favorites);
}

export function isFavorite(type: string, slug: string): boolean {
  return getFavorites().some((f) => f.type === type && f.slug === slug);
}

export function toggleFavorite(item: FavoriteItem): boolean {
  const isFav = isFavorite(item.type, item.slug);
  if (isFav) {
    removeFavorite(item.type, item.slug);
    return false;
  } else {
    addFavorite(item);
    return true;
  }
}
