import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import { tasksApi } from '@/api/tasks';
import {
  invalidateAfterTaskChange,
  patchTaskInCache,
  removeTaskFromCache,
  upsertTaskInCache,
} from '@/lib/task-cache';
import type { Task, TaskCreateInput, TaskStatus, TaskUpdateInput } from '@/types/api';

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskCreateInput) => tasksApi.create(projectId, input),
    onSuccess: (task) => {
      queryClient.setQueryData(queryKeys.task(task.id), task);
      queryClient.setQueriesData<Task[]>({ queryKey: queryKeys.tasks.project(projectId) }, (tasks) =>
        Array.isArray(tasks) ? [...tasks, task] : tasks,
      );
      invalidateAfterTaskChange(queryClient, projectId);
    },
  });
}

/** Title, description, priority, due date, section. */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: TaskUpdateInput }) => tasksApi.update(taskId, input),
    onSuccess: (task) => {
      upsertTaskInCache(queryClient, task);
      invalidateAfterTaskChange(queryClient, task.projectId);
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      tasksApi.updateStatus(taskId, status),
    onMutate: ({ taskId, status }) => {
      const previous = queryClient.getQueryData<Task>(queryKeys.task(taskId));
      patchTaskInCache(queryClient, taskId, { status });
      return { previousStatus: previous?.status };
    },
    onError: (_error, { taskId }, context) => {
      if (context?.previousStatus) patchTaskInCache(queryClient, taskId, { status: context.previousStatus });
    },
    onSuccess: (task) => {
      upsertTaskInCache(queryClient, task);
      invalidateAfterTaskChange(queryClient, task.projectId);
    },
  });
}

export function useUpdateTaskAssignee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, assigneeId }: { taskId: string; assigneeId: string | null }) =>
      tasksApi.updateAssignee(taskId, assigneeId),
    onSuccess: (task) => {
      upsertTaskInCache(queryClient, task);
      invalidateAfterTaskChange(queryClient, task.projectId);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: Task) => tasksApi.remove(task.id),
    onSuccess: (_result, task) => {
      removeTaskFromCache(queryClient, task.id);
      invalidateAfterTaskChange(queryClient, task.projectId);
    },
  });
}

export interface MoveTaskInput {
  task: Task;
  sectionId: string | null;
  /** Set when the drop also changes status (dropping into / out of "Done"). */
  status?: TaskStatus;
}

/**
 * Drag and drop on the board: PATCH the section, then (optionally) the status.
 * Applied optimistically and rolled back if a request fails.
 */
export function useMoveTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ task, sectionId, status }: MoveTaskInput) => {
      let updated = await tasksApi.update(task.id, { sectionId });
      if (status) updated = await tasksApi.updateStatus(task.id, status);
      return updated;
    },
    onMutate: async ({ task, sectionId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.project(projectId) });
      const snapshot = queryClient.getQueriesData({ queryKey: queryKeys.tasks.project(projectId) });
      patchTaskInCache(queryClient, task.id, status ? { sectionId, status } : { sectionId });
      return { snapshot };
    },
    onError: (_error, _input, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSuccess: (task) => upsertTaskInCache(queryClient, task),
    onSettled: () => invalidateAfterTaskChange(queryClient, projectId),
  });
}
