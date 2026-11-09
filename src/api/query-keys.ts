import type {
  MyTaskListParams,
  ProjectListParams,
  ProjectTaskListParams,
  UserListParams,
} from '@/types/api';

/**
 * All TanStack Query keys in one place.
 * - Anything scoped to one project starts with ['project', projectId].
 * - Every task list starts with ['tasks'], so one task update can patch them all.
 */
export const queryKeys = {
  me: ['auth', 'me'] as const,

  projects: {
    all: ['projects'] as const,
    list: (params: ProjectListParams) => ['projects', 'list', params] as const,
    lookup: ['projects', 'lookup'] as const,
  },

  project: {
    all: (projectId: string) => ['project', projectId] as const,
    detail: (projectId: string) => ['project', projectId, 'detail'] as const,
    members: (projectId: string) => ['project', projectId, 'members'] as const,
    sections: (projectId: string) => ['project', projectId, 'sections'] as const,
    summary: (projectId: string) => ['project', projectId, 'summary'] as const,
    activity: (projectId: string) => ['project', projectId, 'activity'] as const,
  },

  tasks: {
    all: ['tasks'] as const,
    project: (projectId: string) => ['tasks', 'project', projectId] as const,
    projectList: (projectId: string, params: Omit<ProjectTaskListParams, 'page' | 'limit'>) =>
      ['tasks', 'project', projectId, params] as const,
    mine: ['tasks', 'mine'] as const,
    minePage: (params: MyTaskListParams) => ['tasks', 'mine', 'page', params] as const,
    mineOpen: (params: Omit<MyTaskListParams, 'page' | 'limit' | 'status'>) =>
      ['tasks', 'mine', 'open', params] as const,
  },

  task: (taskId: string) => ['task', taskId] as const,
  comments: (taskId: string) => ['task', taskId, 'comments'] as const,

  users: (params: UserListParams) => ['users', params] as const,
};
