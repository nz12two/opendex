import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg' | number;
}

const sizeMap: Record<string, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

function getSizeClass(size: 'sm' | 'md' | 'lg' | number): string {
  if (typeof size === 'number') {
    return '';
  }
  return sizeMap[size] || sizeMap.md;
}

export default function StarRating({
  rating,
  maxStars = 5,
  interactive = false,
  onChange,
  size = 'md',
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const displayRating = hovered || rating;
  const sizeClass = getSizeClass(size);
  const numericSize = typeof size === 'number' ? size : 16;

  return (
    <div className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} de ${maxStars} estrelas`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= displayRating;
        const half = !filled && starValue - 0.5 <= displayRating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            onMouseEnter={() => interactive && setHovered(starValue)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={cn(
              'transition-all duration-150',
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
              filled ? 'text-yellow-500' : half ? 'text-yellow-500/50' : 'text-muted-foreground/30'
            )}
            aria-label={`${starValue} estrela${starValue > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizeClass,
                filled ? 'fill-yellow-500' : half ? 'fill-yellow-500/50' : 'fill-none'
              )}
              size={numericSize}
            />
          </button>
        );
      })}
    </div>
  );
}
