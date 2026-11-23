import { Star } from 'lucide-react';

import { cn } from '@/shared/utils/cn';

type StarRatingInputProps = {
  value: number;
  onChange: (nextValue: number) => void;
  error?: string;
};

export const StarRatingInput = ({ error, onChange, value }: StarRatingInputProps) => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-1 sm:gap-3">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = value >= starValue;

        return (
          <button
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
            aria-pressed={value === starValue}
            className="grid min-h-11 min-w-11 place-items-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary motion-safe:transition-transform motion-safe:hover:scale-105"
            key={starValue}
            onClick={() => onChange(starValue)}
            type="button"
          >
            <Star
              className={cn('h-8 w-8 md:h-10 md:w-10', isFilled ? 'fill-current text-text-primary' : 'text-border')}
              strokeWidth={1.4}
            />
          </button>
        );
      })}
    </div>
    {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
  </div>
);
