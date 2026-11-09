import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import { tasksApi } from '@/api/tasks';
import { compareTasks } from '@/lib/tasks';
import type { MyTaskListParams, ProjectTaskListParams, TaskStatus } from '@/types/api';

export type ProjectTaskFilters = Omit<ProjectTaskListParams, 'page' | 'limit'>;

/** Every task of a project matching the filters (all pages), for the board and list views. */
export function useProjectTasks(projectId: string, filters: ProjectTaskFilters) {
  return useQuery({
    queryKey: queryKeys.tasks.projectList(projectId, filters),
    queryFn: () => tasksApi.listAllForProject(projectId, filters),
    // Keep the previous result while filters change, but never show another project's tasks.
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[2] === projectId ? previous : undefined,
  });
}

export function useTask(taskId: string | null) {
  return useQuery({
    queryKey: queryKeys.task(taskId ?? ''),
    queryFn: () => tasksApi.get(taskId ?? ''),
    enabled: Boolean(taskId),
  });
}

/** One page of GET /me/tasks. */
export function useMyTasksPage(params: MyTaskListParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tasks.minePage(params),
    queryFn: () => tasksApi.listMine(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

const OPEN_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'in_review'];

/**
 * "All open" tab. The API has no "not done" filter, so this requests each open
 * status separately (all pages), merges them and sorts like the API would.
 */
export function useMyOpenTasks(params: Omit<MyTaskListParams, 'page' | 'limit' | 'status'>, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tasks.mineOpen(params),
    queryFn: async () => {
      const lists = await Promise.all(
        OPEN_STATUSES.map((status) => tasksApi.listAllMine({ ...params, status })),
      );
      return lists.flat().sort(compareTasks(params.sortBy ?? 'dueDate', params.order ?? 'asc'));
    },
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Number of my overdue tasks (for the tab badge), using a 1-item page and meta.total. */
export function useMyOverdueCount() {
  return useQuery({
    queryKey: queryKeys.tasks.minePage({ dueStatus: 'overdue', page: 1, limit: 1 }),
    queryFn: () => tasksApi.listMine({ dueStatus: 'overdue', page: 1, limit: 1 }),
    select: (page) => page.meta.total,
  });
}
