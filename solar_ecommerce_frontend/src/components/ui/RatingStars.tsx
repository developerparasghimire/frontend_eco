import { Star } from 'lucide-react';

import { cn } from '@/lib/cn';

interface RatingStarsProps {
  value: number;
  outOf?: number;
  size?: number;
  className?: string;
}

export function RatingStars({ value, outOf = 5, size = 16, className }: RatingStarsProps) {
  const rounded = Math.round(value * 2) / 2; // half-star rounding
  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      aria-label={`Rated ${value.toFixed(1)} out of ${outOf}`}
    >
      {Array.from({ length: outOf }).map((_, i) => {
        const filled = i + 1 <= rounded;
        const half = !filled && i + 0.5 <= rounded;
        return (
          <Star
            key={i}
            size={size}
            strokeWidth={1.5}
            className={cn(
              'shrink-0',
              filled
                ? 'fill-amber-400 text-amber-400'
                : half
                  ? 'fill-amber-200 text-amber-400'
                  : 'fill-transparent text-slate-300',
            )}
          />
        );
      })}
    </div>
  );
}
