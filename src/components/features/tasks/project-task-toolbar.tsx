import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { useTaskFilters } from '@/hooks/use-task-filters';
import type { ProjectMember } from '@/types/api';
import { TaskFilterBar } from './task-filter-bar';

/** Filter bar + "New task" button shared by the Board and List views. */
export function ProjectTaskToolbar({
  filterState,
  members,
  onNewTask,
  refreshing,
}: {
  filterState: ReturnType<typeof useTaskFilters>;
  members: ProjectMember[];
  onNewTask: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 px-4 py-4 md:px-6 lg:flex-row lg:items-start lg:px-8">
      <TaskFilterBar state={filterState} members={members} className="min-w-0 flex-1" />
      <div className="flex items-center gap-3">
        {refreshing && <Spinner size="sm" label="Updating tasks" className="text-fg-subtle" />}
        <Button variant="primary" onClick={onNewTask} leftIcon={<Plus aria-hidden className="size-4" />} title="New task (N)">
          New task
        </Button>
      </div>
    </div>
  );
}
