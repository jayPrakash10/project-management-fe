import type { ActivityLog, PaginationParams, ProjectSummary } from '@/types/api';
import { apiGet, apiGetPage } from './client';

export const reportsApi = {
  summary: (projectId: string) => apiGet<ProjectSummary>(`/projects/${projectId}/summary`),
  activity: (projectId: string, params: PaginationParams) =>
    apiGetPage<ActivityLog>(`/projects/${projectId}/activity`, params),
};
