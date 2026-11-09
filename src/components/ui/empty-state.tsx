import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, className, compact = false }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-16',
        className,
      )}
    >
      {icon && (
        <div
          aria-hidden
          className={cn(
            'flex items-center justify-center rounded-full bg-accent-soft text-accent-soft-fg',
            compact ? 'size-10 [&>svg]:size-5' : 'size-14 [&>svg]:size-6',
          )}
        >
          {icon}
        </div>
      )}
      <h3 className={cn('font-semibold text-fg', compact ? 'text-base' : 'text-lg')}>{title}</h3>
      {description && <div className="max-w-md text-base text-fg-muted">{description}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
