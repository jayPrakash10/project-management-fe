import { useState } from 'react';
import { useHotkey } from './use-hotkey';
import { useProjectOutlet } from './use-project-outlet';
import { useSections } from './use-sections';
import { useTaskFilters } from './use-task-filters';
import { useTaskPane } from './use-task-pane';
import { useProjectTasks } from './use-tasks';

/**
 * Data and UI state shared by the Board and List views:
 * project context, URL filters, sections, filtered tasks, the "New task" modal and the N shortcut.
 */
export function useProjectTasksView() {
  const { project, members, canManage } = useProjectOutlet();
  const filterState = useTaskFilters('priority:desc');
  const sectionsQuery = useSections(project.id);
  const tasksQuery = useProjectTasks(project.id, filterState.filters);
  const { openTask } = useTaskPane();
  const [createOpen, setCreateOpen] = useState(false);

  useHotkey('n', () => setCreateOpen(true));

  const isPending = sectionsQuery.isPending || tasksQuery.isPending;
  const error = sectionsQuery.error ?? tasksQuery.error;
  const refetch = () => {
    void sectionsQuery.refetch();
    void tasksQuery.refetch();
  };

  return {
    project,
    members: members ?? [],
    canManage,
    filterState,
    sections: sectionsQuery.data ?? [],
    tasks: tasksQuery.data ?? [],
    isPending,
    error,
    refetch,
    refreshing: tasksQuery.isFetching && !tasksQuery.isPending,
    openTask,
    createOpen,
    setCreateOpen,
  };
}
