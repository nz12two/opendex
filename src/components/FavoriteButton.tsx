import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isFavorite, toggleFavorite } from '@/lib/favorites';

interface FavoriteButtonProps {
  type: string;
  slug: string;
  title: string;
  url: string;
}

export default function FavoriteButton({ type, slug, title, url }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(type, slug));
  }, [type, slug]);

  const handleClick = useCallback(() => {
    const newState = toggleFavorite({ type, slug, title, url, addedAt: new Date().toISOString() });
    setFavorited(newState);
  }, [type, slug, title, url]);

  return (
    <button
      type="button"
      onClick={handleClick}
      title={favorited ? 'Remover dos favoritos' : 'Salvar'}
      className={cn(
        'inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200 hover:scale-110',
        favorited
          ? 'text-red-500 hover:text-red-600'
          : 'text-muted-foreground hover:text-foreground'
      )}
      aria-label={favorited ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
    >
      <Heart
        className={cn('h-5 w-5', favorited && 'fill-red-500')}
      />
    </button>
  );
}
