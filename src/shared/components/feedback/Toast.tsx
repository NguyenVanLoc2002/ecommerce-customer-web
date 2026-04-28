import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

import type { ToastItem } from '@/shared/stores/uiStore';

const iconMap = {
  success: CheckCircle2,
  info: Info,
  danger: XCircle,
} as const;

const toneMap = {
  success: 'border-success/20 bg-white text-text-primary',
  info: 'border-brand-primary/20 bg-white text-text-primary',
  danger: 'border-danger/20 bg-white text-text-primary',
} as const;

type ToastProps = {
  toast: ToastItem;
  onDismiss: (id: string) => void;
};

export const Toast = ({ onDismiss, toast }: ToastProps) => {
  const Icon = iconMap[toast.tone];

  return (
    <div className={`w-full rounded-card border px-4 py-4 shadow-card ${toneMap[toast.tone]}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 text-brand-primary" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{toast.title}</p>
          {toast.description ? <p className="mt-1 text-sm text-text-secondary">{toast.description}</p> : null}
        </div>
        <button
          aria-label="Dismiss notification"
          className="rounded-full p-1 text-text-secondary transition-colors hover:bg-brand-subtle hover:text-brand-primary"
          onClick={() => onDismiss(toast.id)}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

