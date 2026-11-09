import { CircleAlert, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** A form-level message (errors that don't belong to one field, or notices). */
export function FormAlert({
  tone = 'error',
  children,
  className,
}: {
  tone?: 'error' | 'info';
  children: ReactNode;
  className?: string;
}) {
  const Icon = tone === 'error' ? CircleAlert : Info;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2 rounded-md px-3 py-2.5 text-sm',
        tone === 'error' ? 'bg-danger-soft text-danger-soft-fg' : 'border border-border bg-surface-2 text-fg-muted',
        className,
      )}
    >
      <Icon aria-hidden className="mt-px size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
