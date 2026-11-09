import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap select-none transition-colors disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent shadow-xs hover:bg-accent-hover',
  secondary: 'border border-border-strong bg-surface text-fg shadow-xs hover:bg-surface-2',
  ghost: 'text-fg-muted hover:bg-surface-2 hover:text-fg',
  danger: 'bg-danger text-on-danger shadow-xs hover:bg-danger-hover',
  'danger-ghost': 'text-danger-soft-fg hover:bg-danger-soft',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-sm',
  md: 'h-9 px-3.5 text-base',
  lg: 'h-11 px-5 text-md',
};

const iconSizes: Record<ButtonSize, string> = {
  sm: 'size-8',
  md: 'size-9',
  lg: 'size-11',
};

/** Class names for a button-looking element (also used to style links). */
export function buttonStyles({
  variant = 'secondary',
  size = 'md',
  iconOnly = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  className?: string;
} = {}) {
  return cn(base, variants[variant], iconOnly ? iconSizes[size] : sizes[size], className);
}
