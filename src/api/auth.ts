import type { AuthResponse, LoginInput, RegisterInput, User } from '@/types/api';
import { apiGet, apiPost } from './client';

export const authApi = {
  register: (input: RegisterInput) => apiPost<AuthResponse>('/auth/register', input),
  login: (input: LoginInput) => apiPost<AuthResponse>('/auth/login', input),
  me: () => apiGet<User>('/auth/me'),
};
