import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

export const AuthHeading = ({ title, description, eyebrow, centered = false }: {
  title: string;
  description: ReactNode;
  eyebrow?: string;
  centered?: boolean;
}) => (
  <header className={cn('mb-8', centered && 'text-center')}>
    {eyebrow && <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary">{eyebrow}</p>}
    <h1 className="text-2xl font-semibold leading-tight tracking-tight text-text-primary">{title}</h1>
    <p className="mt-3 break-words text-sm leading-relaxed text-text-secondary">{description}</p>
  </header>
);
