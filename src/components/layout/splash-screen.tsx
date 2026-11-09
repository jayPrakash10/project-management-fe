import type { ApiError } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Spinner } from '@/components/ui/spinner';
import { Logo } from './logo';

export interface SplashScreenProps {
  error?: ApiError | null;
  onRetry?: () => void;
  onLogout?: () => void;
}

/** Full-screen state while the session is restored (GET /auth/me). */
export function SplashScreen({ error, onRetry, onLogout }: SplashScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-bg p-4">
      <Logo />
      {error ? (
        <ErrorState
          error={error}
          onRetry={onRetry}
          action={
            onLogout && (
              <Button size="sm" variant="ghost" onClick={onLogout}>
                Log out
              </Button>
            )
          }
        />
      ) : (
        <Spinner size="lg" label="Loading your workspace" className="text-accent" />
      )}
    </div>
  );
}
