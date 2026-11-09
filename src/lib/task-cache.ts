import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import type { Paginated, Task } from '@/types/api';

/** Task lists are cached either as a plain array (all pages) or as one paginated page. */
type TaskListData = Task[] | Paginated<Task> | undefined;

function mapTaskList(data: TaskListData, update: (tasks: Task[]) => Task[]): TaskListData {
  if (!data) return data;
  if (Array.isArray(data)) return update(data);
  return { ...data, data: update(data.data) };
}

/** Put a task returned by a mutation into the detail cache and every cached list. */
export function upsertTaskInCache(queryClient: QueryClient, task: Task) {
  queryClient.setQueryData(queryKeys.task(task.id), task);
  queryClient.setQueriesData<TaskListData>({ queryKey: queryKeys.tasks.all }, (data) =>
    mapTaskList(data, (tasks) => tasks.map((item) => (item.id === task.id ? task : item))),
  );
}

/** Apply a local change to a task everywhere it is cached (used for optimistic updates). */
export function patchTaskInCache(queryClient: QueryClient, taskId: string, patch: Partial<Task>) {
  queryClient.setQueryData<Task>(queryKeys.task(taskId), (task) => (task ? { ...task, ...patch } : task));
  queryClient.setQueriesData<TaskListData>({ queryKey: queryKeys.tasks.all }, (data) =>
    mapTaskList(data, (tasks) => tasks.map((item) => (item.id === taskId ? { ...item, ...patch } : item))),
  );
}

export function removeTaskFromCache(queryClient: QueryClient, taskId: string) {
  queryClient.removeQueries({ queryKey: queryKeys.task(taskId) });
  queryClient.setQueriesData<TaskListData>({ queryKey: queryKeys.tasks.all }, (data) =>
    mapTaskList(data, (tasks) => tasks.filter((item) => item.id !== taskId)),
  );
}

/**
 * After any task change: refetch task lists (filters may no longer match),
 * and the project's summary and activity log.
 */
export function invalidateAfterTaskChange(queryClient: QueryClient, projectId: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.project.summary(projectId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.project.activity(projectId) });
}
