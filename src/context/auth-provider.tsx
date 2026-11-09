import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { authApi } from '@/api/auth';
import { setUnauthorizedHandler } from '@/api/client';
import { isApiError, toApiError } from '@/api/errors';
import { queryKeys } from '@/api/query-keys';
import { tokenStorage } from '@/lib/storage';
import type { LoginInput, RegisterInput, User } from '@/types/api';
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context';

export interface LoginRedirectState {
  from?: string;
  reason?: 'expired';
}

/**
 * Owns the session: the token in localStorage and the current user from GET /auth/me.
 * /auth/me is a regular query, so the role is refreshed whenever it refetches.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [hasToken, setHasToken] = useState(() => Boolean(tokenStorage.get()));

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: authApi.me,
    enabled: hasToken,
    staleTime: 5 * 60_000,
    retry: (failureCount, error) => !isApiError(error, 401) && failureCount < 1,
  });

  // Any 401 from a protected endpoint: drop the session and go to the login screen.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!tokenStorage.get()) return;
      tokenStorage.clear();
      setHasToken(false);
      queryClient.clear();
      const from = `${window.location.pathname}${window.location.search}`;
      const state: LoginRedirectState = { from, reason: 'expired' };
      navigate('/login', { replace: true, state });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate, queryClient]);

  const startSession = useCallback(
    (user: User, token: string) => {
      tokenStorage.set(token);
      queryClient.clear();
      queryClient.setQueryData(queryKeys.me, user);
      setHasToken(true);
    },
    [queryClient],
  );

  const login = useCallback(
    async (input: LoginInput) => {
      const { user, token } = await authApi.login(input);
      startSession(user, token);
      return user;
    },
    [startSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const { user, token } = await authApi.register(input);
      startSession(user, token);
      return user;
    },
    [startSession],
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setHasToken(false);
    queryClient.clear();
    navigate('/login', { replace: true });
  }, [navigate, queryClient]);

  const { refetch } = meQuery;
  const retry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const value = useMemo<AuthContextValue>(() => {
    let status: AuthStatus;
    if (!hasToken) status = 'anonymous';
    else if (meQuery.data) status = 'authenticated';
    else if (meQuery.isError) status = isApiError(meQuery.error, 401) ? 'anonymous' : 'error';
    else status = 'loading';

    return {
      status,
      user: hasToken ? (meQuery.data ?? null) : null,
      error: meQuery.isError ? toApiError(meQuery.error) : null,
      login,
      register,
      logout,
      retry,
    };
  }, [hasToken, meQuery.data, meQuery.isError, meQuery.error, login, register, logout, retry]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
