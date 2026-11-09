import { createContext } from 'react';
import type { ApiError } from '@/api/errors';
import type { LoginInput, RegisterInput, User } from '@/types/api';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'error';

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  /** Set when restoring the session failed for a reason other than 401 (e.g. network). */
  error: ApiError | null;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
  retry: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
