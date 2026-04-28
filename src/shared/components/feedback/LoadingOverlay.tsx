import { LoaderCircle } from 'lucide-react';

import { cn } from '@/shared/utils/cn';

type LoadingOverlayProps = {
  label?: string;
  inline?: boolean;
  className?: string;
};

export const LoadingOverlay = ({ className, inline = false, label = 'Loading...' }: LoadingOverlayProps) => (
  <div
    aria-live="polite"
    className={cn(
      'flex items-center justify-center gap-3 border border-border bg-white/92 text-text-primary backdrop-blur',
      inline ? 'min-h-[240px]' : 'fixed inset-0 z-[80]',
      className,
    )}
    role="status"
  >
    <LoaderCircle className="h-5 w-5 animate-spin text-brand-primary" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);
