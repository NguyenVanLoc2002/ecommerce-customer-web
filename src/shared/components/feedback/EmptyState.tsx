import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({ action, className, description, title }: EmptyStateProps) => (
  <div className={cn('border border-dashed border-border bg-surface-muted px-6 py-14 text-center', className)}>
    <h2 className="font-display text-[2rem] leading-tight text-text-primary">{title}</h2>
    <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-text-secondary">{description}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);
