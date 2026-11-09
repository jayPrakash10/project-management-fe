import { RefreshCw, TriangleAlert } from 'lucide-react';
import { useRouteError } from 'react-router';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

/** Last-resort boundary for unexpected render errors. */
export function RouteErrorPage() {
  const error = useRouteError();
  if (import.meta.env.DEV) console.error(error);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg p-4">
      <EmptyState
        icon={<TriangleAlert />}
        title="Something went wrong"
        description="An unexpected error occurred. Reloading the page usually fixes it."
        action={
          <Button variant="primary" onClick={() => window.location.reload()} leftIcon={<RefreshCw aria-hidden className="size-4" />}>
            Reload
          </Button>
        }
      />
    </div>
  );
}
