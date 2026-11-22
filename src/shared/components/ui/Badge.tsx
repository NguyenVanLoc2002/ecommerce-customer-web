import type { PropsWithChildren } from 'react';

import { cn } from '@/shared/utils/cn';

type BadgeTone = 'brand' | 'sale' | 'neutral';

type BadgeProps = PropsWithChildren<{
  tone?: BadgeTone;
  className?: string;
}>;

const toneClasses: Record<BadgeTone, string> = {
  brand: 'bg-brand-subtle text-brand-primary',
  sale: 'bg-sale-accent text-white',
  neutral: 'bg-surface text-text-secondary ring-1 ring-inset ring-border',
};

export const Badge = ({ children, className, tone = 'brand' }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex min-h-6 items-center rounded-chip border border-border px-2 text-xs font-medium leading-tight',
      toneClasses[tone],
      className,
    )}
  >
    {children}
  </span>
);

