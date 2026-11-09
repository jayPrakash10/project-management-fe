import { Outlet } from 'react-router';
import { AuthProvider } from '@/context/auth-provider';

/** Router-aware providers (auth needs navigation for the global 401 redirect). */
export function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
