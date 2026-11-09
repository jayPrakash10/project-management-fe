import type { Comment, PaginationParams } from '@/types/api';
import { apiDelete, apiGetPage, apiPost } from './client';

export const commentsApi = {
  list: (taskId: string, params: PaginationParams) =>
    apiGetPage<Comment>(`/tasks/${taskId}/comments`, params),
  create: (taskId: string, body: string) => apiPost<Comment>(`/tasks/${taskId}/comments`, { body }),
  remove: (commentId: string) => apiDelete(`/comments/${commentId}`),
};
