import { FilterX } from 'lucide-react';
import { TaskBoard } from '@/components/features/board/task-board';
import { CreateTaskModal } from '@/components/features/tasks/create-task-modal';
import { ProjectTaskToolbar } from '@/components/features/tasks/project-task-toolbar';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { FormAlert } from '@/components/ui/form-alert';
import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';
import { useProjectTasksView } from '@/hooks/use-project-tasks-view';

function BoardSkeleton() {
  return (
    <LoadingRegion label="Loading board" className="flex gap-3 overflow-hidden px-4 md:px-6 lg:px-8">
      {[0, 1, 2].map((column) => (
        <div key={column} className="w-[85vw] max-w-80 shrink-0 space-y-2 rounded-xl bg-surface-2 p-3 sm:w-72">
          <Skeleton className="mb-3 h-5 w-28" />
          {[0, 1, 2].slice(0, 3 - column).map((card) => (
            <Skeleton key={card} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </LoadingRegion>
  );
}

export function ProjectBoardPage() {
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

      {view.isPending ? (
        <BoardSkeleton />
      ) : view.error ? (
        <ErrorState error={view.error} onRetry={view.refetch} />
      ) : (
        <>
          {filterState.activeCount > 0 && view.tasks.length === 0 && (
            <div className="px-4 pb-3 md:px-6 lg:px-8">
              <FormAlert tone="info" className="items-center">
                <span className="flex flex-wrap items-center gap-2">
                  No tasks match these filters.
                  <Button size="sm" variant="ghost" onClick={filterState.clear} leftIcon={<FilterX aria-hidden className="size-4" />}>
                    Clear filters
                  </Button>
                </span>
              </FormAlert>
            </div>
          )}
          <TaskBoard
            projectId={view.project.id}
            sections={view.sections}
            tasks={view.tasks}
            canManage={view.canManage}
            onOpenTask={view.openTask}
          />
        </>
      )}

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
