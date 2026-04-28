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
      'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]',
      toneClasses[tone],
      className,
    )}
  >
    {children}
  </span>
);

