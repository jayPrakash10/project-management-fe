import { ClipboardList, FilterX, Plus } from 'lucide-react';
import { CreateTaskModal } from '@/components/features/tasks/create-task-modal';
import { ProjectTaskToolbar } from '@/components/features/tasks/project-task-toolbar';
import { TaskList } from '@/components/features/tasks/task-list';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';
import { useProjectTasksView } from '@/hooks/use-project-tasks-view';

export function ProjectListPage() {
  const view = useProjectTasksView();
  const { filterState } = view;

  return (
    <div className="flex flex-1 flex-col">
      <ProjectTaskToolbar
        filterState={filterState}
        members={view.members}
        onNewTask={() => view.setCreateOpen(true)}
        refreshing={view.refreshing}
      />

      <div className="px-4 pb-8 md:px-6 lg:px-8">
        {view.isPending ? (
          <LoadingRegion label="Loading tasks" className="space-y-2 rounded-lg border border-border bg-surface p-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </LoadingRegion>
        ) : view.error ? (
          <ErrorState error={view.error} onRetry={view.refetch} />
        ) : view.tasks.length === 0 ? (
          filterState.activeCount > 0 ? (
            <EmptyState
              icon={<FilterX />}
              title="No tasks match these filters"
              action={<Button onClick={filterState.clear}>Clear filters</Button>}
            />
          ) : (
            <EmptyState
              icon={<ClipboardList />}
              title="No tasks yet"
              description="Create the first task for this project."
              action={
                <Button variant="primary" onClick={() => view.setCreateOpen(true)} leftIcon={<Plus aria-hidden className="size-4" />}>
                  New task
                </Button>
              }
            />
          )
        ) : (
          <TaskList
            sections={view.sections}
            tasks={view.tasks}
            sortValue={filterState.sortValue}
            onSortChange={filterState.setSort}
            onOpenTask={view.openTask}
          />
        )}
      </div>

      <CreateTaskModal
        open={view.createOpen}
        onClose={() => view.setCreateOpen(false)}
        projectId={view.project.id}
        sections={view.sections}
        members={view.members}
        canAssign={view.canManage}
      />
    </div>
  );
}
