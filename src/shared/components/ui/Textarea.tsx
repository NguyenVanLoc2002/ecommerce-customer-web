import type { TextareaHTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'transaction';
};

export const Textarea = ({ className, error, hint, id, label, variant = 'default', ...props }: TextareaProps) => (
  <label className={cn('flex w-full flex-col gap-2 text-text-primary', variant === 'transaction' ? 'text-base' : 'text-sm')} htmlFor={id}>
    <span className={cn(variant === 'transaction' ? 'text-[11px] font-bold uppercase tracking-[0.18em] text-outline' : 'font-medium')}>
      {label}
    </span>
    <textarea
      className={cn(
        variant === 'transaction'
          ? 'min-h-28 border border-border bg-surface px-4 py-3 text-sm text-text-primary transition-colors duration-300 placeholder:uppercase placeholder:tracking-[0.16em] placeholder:text-outline focus:border-text-primary focus:outline-none focus:ring-0'
          : 'min-h-28 rounded-input border border-border bg-surface px-4 py-3 text-text-primary transition-colors duration-200 placeholder:text-text-secondary/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15',
        error && (variant === 'transaction' ? 'border-danger focus:border-danger' : 'border-danger focus:border-danger focus:ring-danger/15'),
        className,
      )}
      id={id}
      {...props}
    />
    {error ? <span className="text-sm text-danger">{error}</span> : null}
    {!error && hint ? <span className="text-sm text-text-secondary">{hint}</span> : null}
  </label>
);
