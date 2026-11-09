import { Lock, RefreshCw, SearchX, TriangleAlert, WifiOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { toApiError } from '@/api/errors';
import { cn } from '@/lib/cn';
import { Button } from './button';

export interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  /** Extra content, e.g. a "Back to projects" link. */
  action?: ReactNode;
  className?: string;
  compact?: boolean;
  /** Override the title for 403 responses. */
  forbiddenTitle?: string;
  /** Override the title for 404 responses. */
  notFoundTitle?: string;
}

/** Maps API error codes to a friendly state, as in FRONTEND_GUIDE.md §2.2. */
export function ErrorState({
  error,
  onRetry,
  action,
  className,
  compact = false,
  forbiddenTitle = 'You don’t have access to this',
  notFoundTitle = 'Not found',
}: ErrorStateProps) {
  const apiError = toApiError(error);

  let icon = <TriangleAlert />;
  let title = 'Something went wrong';
  let description = apiError.message;
  let canRetry = true;

  if (apiError.status === 403) {
    icon = <Lock />;
    title = forbiddenTitle;
    canRetry = false;
  } else if (apiError.status === 404 || (apiError.status === 400 && apiError.code === 'VALIDATION_ERROR')) {
    icon = <SearchX />;
    title = notFoundTitle;
    description = apiError.status === 404 ? apiError.message : 'This link doesn’t point to anything that exists.';
    canRetry = false;
  } else if (apiError.isNetworkError) {
    icon = <WifiOff />;
    title = 'Connection problem';
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-4 py-6' : 'gap-3 px-6 py-16',
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          'flex items-center justify-center rounded-full bg-danger-soft text-danger-soft-fg',
          compact ? 'size-10 [&>svg]:size-5' : 'size-14 [&>svg]:size-6',
        )}
      >
        {icon}
      </div>
      <h3 className={cn('font-semibold text-fg', compact ? 'text-base' : 'text-lg')}>{title}</h3>
      <p className="max-w-md text-base text-fg-muted">{description}</p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        {onRetry && canRetry && (
          <Button size="sm" onClick={onRetry} leftIcon={<RefreshCw aria-hidden className="size-4" />}>
            Try again
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}
