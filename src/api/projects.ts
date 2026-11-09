import type { Project, ProjectInput, ProjectListParams } from '@/types/api';
import { apiDelete, apiGet, apiGetAllPages, apiGetPage, apiPatch, apiPost } from './client';

export const projectsApi = {
  list: (params: ProjectListParams) => apiGetPage<Project>('/projects', params),
  /** Every visible project, sorted by name. Used for lookups (sidebar, project names on My Tasks). */
  listAll: () => apiGetAllPages<Project>('/projects', { sortBy: 'name', order: 'asc' }),
  get: (projectId: string) => apiGet<Project>(`/projects/${projectId}`),
  create: (input: ProjectInput) => apiPost<Project>('/projects', input),
  update: (projectId: string, input: Partial<ProjectInput>) =>
    apiPatch<Project>(`/projects/${projectId}`, input),
  remove: (projectId: string) => apiDelete(`/projects/${projectId}`),
};
