import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

type ErrorCardProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export const ErrorCard = ({ action, className, description, title }: ErrorCardProps) => (
  <div className={cn('border border-danger/20 bg-white px-6 py-10', className)}>
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-danger">Something needs attention</p>
    <h2 className="mt-3 font-display text-[2rem] leading-tight text-text-primary">{title}</h2>
    <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">{description}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);
