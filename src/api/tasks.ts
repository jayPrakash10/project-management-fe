import type {
  MyTaskListParams,
  ProjectTaskListParams,
  Task,
  TaskCreateInput,
  TaskStatus,
  TaskUpdateInput,
} from '@/types/api';
import { apiDelete, apiGet, apiGetAllPages, apiGetPage, apiPatch, apiPost } from './client';

export const tasksApi = {
  listForProject: (projectId: string, params: ProjectTaskListParams) =>
    apiGetPage<Task>(`/projects/${projectId}/tasks`, params),
  /** All pages, for the board and list views. */
  listAllForProject: (projectId: string, params: Omit<ProjectTaskListParams, 'page' | 'limit'>) =>
    apiGetAllPages<Task>(`/projects/${projectId}/tasks`, params),
  listMine: (params: MyTaskListParams) => apiGetPage<Task>('/me/tasks', params),
  listAllMine: (params: Omit<MyTaskListParams, 'page' | 'limit'>) =>
    apiGetAllPages<Task>('/me/tasks', params),
  get: (taskId: string) => apiGet<Task>(`/tasks/${taskId}`),
  create: (projectId: string, input: TaskCreateInput) =>
    apiPost<Task>(`/projects/${projectId}/tasks`, input),
  update: (taskId: string, input: TaskUpdateInput) => apiPatch<Task>(`/tasks/${taskId}`, input),
  updateStatus: (taskId: string, status: TaskStatus) =>
    apiPatch<Task>(`/tasks/${taskId}/status`, { status }),
  updateAssignee: (taskId: string, assigneeId: string | null) =>
    apiPatch<Task>(`/tasks/${taskId}/assignee`, { assigneeId }),
  remove: (taskId: string) => apiDelete(`/tasks/${taskId}`),
};
