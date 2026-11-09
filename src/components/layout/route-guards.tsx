import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import type { LoginRedirectState } from '@/context/auth-provider';
import { useAuth } from '@/hooks/use-auth';
import { NotFoundPage } from '@/pages/not-found-page';
import { SplashScreen } from './splash-screen';

/** Only for logged-in users; restores the session first. */
export function ProtectedRoute() {
  const { status, error, retry, logout } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <SplashScreen />;
  if (status === 'error') return <SplashScreen error={error} onRetry={retry} onLogout={logout} />;
  if (status === 'anonymous') {
    const state: LoginRedirectState = { from: `${location.pathname}${location.search}` };
    return <Navigate to="/login" replace state={state} />;
  }
  return <Outlet />;
}

/** Login and register: logged-in users go to where they came from, or My Tasks. */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();
  const from = (location.state as LoginRedirectState | null)?.from;

  if (status === 'loading') return <SplashScreen />;
  if (status === 'authenticated') {
    const target = from && from.startsWith('/') && !from.startsWith('/login') ? from : '/my-tasks';
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}

/** "/" shows the landing page to visitors and sends signed-in users to My Tasks. */
export function HomeRoute({ landing }: { landing: ReactNode }) {
  const { status } = useAuth();
  if (status === 'loading') return <SplashScreen />;
  if (status === 'authenticated') return <Navigate to="/my-tasks" replace />;
  return <>{landing}</>;
}

/** Admin-only screens. Others see a 404, as if the page doesn't exist. */
export function RequireAdmin() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <NotFoundPage />;
  return <Outlet />;
}
