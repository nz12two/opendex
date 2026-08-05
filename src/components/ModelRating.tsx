import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export default function ModelRating({ rating, maxRating = 5, size = 'md', showValue = true }: Props) {
  const sizeMap = { sm: 14, md: 18, lg: 24 };
  const textSizeMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-lg' };
  const starSize = sizeMap[size];

  return (
    <div class="flex items-center gap-1.5">
      <div class="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          return (
            <Star
              key={i}
              size={starSize}
              className={cn(
                'transition-colors',
                filled ? 'fill-amber-500 text-amber-500' : 
                half ? 'fill-amber-500/50 text-amber-500/50' : 
                'fill-muted text-muted'
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span class={cn('font-medium text-muted-foreground', textSizeMap[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
