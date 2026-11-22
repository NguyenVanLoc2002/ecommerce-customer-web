import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

type ErrorCardProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export const ErrorCard = ({ action, className, description, title }: ErrorCardProps) => (
  <div aria-live="assertive" className={cn('border border-danger/30 bg-surface px-6 py-8', className)} role="alert">
    <p className="text-sm font-medium text-danger">Đã xảy ra lỗi</p>
    <h2 className="mt-2 text-xl font-semibold leading-tight text-text-primary">{title}</h2>
    <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">{description}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);
