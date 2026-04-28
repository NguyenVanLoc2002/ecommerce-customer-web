import { cn } from '@/shared/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-brand-primary bg-brand-primary text-white hover:bg-brand-hover active:bg-brand-active focus-visible:outline-brand-primary',
  secondary:
    'border border-brand-primary bg-transparent text-brand-primary hover:bg-brand-primary hover:text-white',
  ghost: 'border border-transparent bg-transparent text-text-primary hover:border-border hover:bg-surface-muted',
  danger: 'border border-danger bg-danger text-white hover:opacity-95',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-[10px] tracking-[0.18em]',
  md: 'h-12 px-6 text-[11px] tracking-[0.18em]',
  lg: 'h-14 px-8 text-[11px] tracking-[0.2em]',
};

export const buttonStyles = ({
  className,
  fullWidth = false,
  size = 'md',
  variant = 'primary',
}: {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}) =>
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button font-medium uppercase leading-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className,
  );
