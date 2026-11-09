import type { ProjectMember } from '@/types/api';
import { apiDelete, apiGet, apiPost } from './client';

export const membersApi = {
  list: (projectId: string) => apiGet<ProjectMember[]>(`/projects/${projectId}/members`),
  add: (projectId: string, email: string) =>
    apiPost<ProjectMember>(`/projects/${projectId}/members`, { email }),
  remove: (projectId: string, userId: string) =>
    apiDelete(`/projects/${projectId}/members/${userId}`),
};
