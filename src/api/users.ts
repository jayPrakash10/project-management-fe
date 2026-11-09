import type { User, UserListParams, UserRole } from '@/types/api';
import { apiGetPage, apiPatch } from './client';

export const usersApi = {
  list: (params: UserListParams) => apiGetPage<User>('/users', params),
  updateRole: (userId: string, role: UserRole) => apiPatch<User>(`/users/${userId}/role`, { role }),
};
