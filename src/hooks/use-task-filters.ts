import { useCallback, useMemo } from 'react';
import { isDueStatus, isTaskPriority, isTaskStatus, parseTaskSort, type TaskSortOption } from '@/lib/constants';
import type { ProjectTaskFilters } from './use-tasks';
import { useUrlParams } from './use-url-params';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** URL keys used by the task filter bar. */
export const FILTER_KEYS = ['status', 'priority', 'assignee', 'due', 'q'] as const;

/**
 * Task list filters stored in the URL and converted to API query params.
 * Invalid values in the URL are ignored rather than sent to the API.
 */
export function useTaskFilters(defaultSort: TaskSortOption['value'] = 'priority:desc') {
  const { get, set, setFilters } = useUrlParams();

  const rawStatus = get('status');
  const rawPriority = get('priority');
  const rawAssignee = get('assignee');
  const rawDue = get('due');
  const search = get('q') ?? '';
  const sort = parseTaskSort(get('sort'), defaultSort);

  const filters = useMemo<ProjectTaskFilters>(
    () => ({
      status: isTaskStatus(rawStatus) ? rawStatus : undefined,
      priority: isTaskPriority(rawPriority) ? rawPriority : undefined,
      assigneeId: rawAssignee && UUID.test(rawAssignee) ? rawAssignee : undefined,
      dueStatus: isDueStatus(rawDue) ? rawDue : undefined,
      search: search || undefined,
      sortBy: sort.sortBy,
      order: sort.order,
    }),
    [rawStatus, rawPriority, rawAssignee, rawDue, search, sort.sortBy, sort.order],
  );

  const activeCount = [filters.status, filters.priority, filters.assigneeId, filters.dueStatus, filters.search].filter(
    Boolean,
  ).length;

  const clear = useCallback(
    () => setFilters(Object.fromEntries(FILTER_KEYS.map((key) => [key, null]))),
    [setFilters],
  );

  const setSort = useCallback(
    (value: string) => set({ sort: value === defaultSort ? null : value }),
    [set, defaultSort],
  );

  return { filters, search, sortValue: sort.value, activeCount, setFilters, setSort, clear };
}
