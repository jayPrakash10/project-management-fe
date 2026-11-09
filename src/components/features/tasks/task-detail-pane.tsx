import { Check, FolderKanban, Link2, MoreHorizontal, Trash2, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { getErrorMessage } from '@/api/errors';
import { CommentComposer } from '@/components/features/comments/comment-composer';
import { CommentList } from '@/components/features/comments/comment-list';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DropdownMenu, type MenuItem } from '@/components/ui/dropdown-menu';
import { ErrorState } from '@/components/ui/error-state';
import { IconButton } from '@/components/ui/icon-button';
import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';
import { useMemberNames, useMembers } from '@/hooks/use-members';
import { usePermissions } from '@/hooks/use-permissions';
import { useProject } from '@/hooks/use-projects';
import { useSections } from '@/hooks/use-sections';
import { useDeleteTask, useUpdateTaskStatus } from '@/hooks/use-task-mutations';
import { useTask } from '@/hooks/use-tasks';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/dates';
import type { Task } from '@/types/api';
import { TaskDescriptionEditor } from './task-description-editor';
import { TaskProperties } from './task-properties';
import { TaskTitleEditor } from './task-title-editor';

export function TaskDetailPane({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const taskQuery = useTask(taskId);

  return (
    <div className="flex h-full flex-col">
      {taskQuery.isPending && <PaneSkeleton onClose={onClose} />}
      {taskQuery.isError && (
        <>
          <PaneHeaderBar onClose={onClose} />
          <ErrorState
            error={taskQuery.error}
            onRetry={() => void taskQuery.refetch()}
            forbiddenTitle="You don’t have access to this task"
            notFoundTitle="This task doesn’t exist anymore"
          />
        </>
      )}
      {taskQuery.data && <TaskDetailContent task={taskQuery.data} onClose={onClose} />}
    </div>
  );
}

function PaneHeaderBar({ onClose, children }: { onClose: () => void; children?: ReactNode }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 md:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
      <IconButton label="Close task panel" icon={<X className="size-5" />} onClick={onClose} />
    </header>
  );
}

function PaneSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <>
      <PaneHeaderBar onClose={onClose} />
      <LoadingRegion label="Loading task" className="space-y-5 p-5">
        <Skeleton className="h-8 w-3/4" />
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="flex gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-40" />
          </div>
        ))}
        <Skeleton className="h-24 w-full" />
      </LoadingRegion>
    </>
  );
}

function TaskDetailContent({ task, onClose }: { task: Task; onClose: () => void }) {
  const projectQuery = useProject(task.projectId);
  const membersQuery = useMembers(task.projectId);
  const sectionsQuery = useSections(task.projectId);
  const { canManageProject } = usePermissions(projectQuery.data);
  const nameFor = useMemberNames(membersQuery.data);
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const done = task.status === 'done';

  const menuItems: MenuItem[] = [
    {
      label: 'Copy link',
      icon: <Link2 />,
      onSelect: () => {
        const url = new URL(window.location.href);
        url.searchParams.set('task', task.id);
        navigator.clipboard
          .writeText(url.toString())
          .then(() => toast.success('Link copied'))
          .catch(() => toast.error('Couldn’t copy the link'));
      },
    },
  ];
  if (canManageProject) {
    menuItems.push({ label: 'Delete task', icon: <Trash2 />, tone: 'danger', onSelect: () => setConfirmDelete(true) });
  }

  const createdByName = nameFor(task.createdBy);

  return (
    <>
      <PaneHeaderBar onClose={onClose}>
        <Button
          size="sm"
          variant="secondary"
          aria-pressed={done}
          loading={updateStatus.isPending}
          onClick={() =>
            updateStatus.mutate(
              { taskId: task.id, status: done ? 'todo' : 'done' },
              { onError: (error) => toast.error(error) },
            )
          }
          className={cn(done && 'border-status-done-solid bg-status-done-bg text-status-done-fg hover:bg-status-done-bg')}
          leftIcon={<Check aria-hidden className="size-4" />}
        >
          {done ? 'Completed' : 'Mark complete'}
        </Button>
        {projectQuery.data && (
          <Link
            to={`/projects/${task.projectId}/board`}
            className="hidden min-w-0 items-center gap-1.5 truncate rounded px-1.5 py-1 text-sm text-fg-muted hover:bg-surface-2 hover:text-fg sm:inline-flex"
          >
            <FolderKanban aria-hidden className="size-4 shrink-0" />
            <span className="truncate">{projectQuery.data.name}</span>
          </Link>
        )}
        <div className="ml-auto">
          <DropdownMenu label="Task actions" trigger={<MoreHorizontal className="size-5" />} triggerSize="md" items={menuItems} />
        </div>
      </PaneHeaderBar>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6 px-4 py-5 md:px-6">
          <TaskTitleEditor task={task} />
          <TaskProperties
            task={task}
            sections={sectionsQuery.data ?? []}
            members={membersQuery.data ?? []}
            canManage={canManageProject}
          />
          <TaskDescriptionEditor task={task} />

          <p className="text-sm text-fg-subtle">
            Created {formatDateTime(task.createdAt)}
            {createdByName && ` by ${createdByName}`}
            {task.updatedAt !== task.createdAt && ` · Updated ${formatDateTime(task.updatedAt)}`}
          </p>

          <section aria-labelledby="comments-heading" className="border-t border-border pt-5">
            <h3 id="comments-heading" className="mb-3 text-md font-semibold text-fg">
              Comments
            </h3>
            <CommentList taskId={task.id} />
          </section>
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-surface px-4 py-3 md:px-6">
        <CommentComposer taskId={task.id} projectId={task.projectId} />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this task?"
        description={
          <>
            “{task.title}” and all of its comments will be permanently deleted. This can’t be undone.
          </>
        }
        confirmLabel="Delete task"
        loading={deleteTask.isPending}
        error={deleteTask.isError ? getErrorMessage(deleteTask.error) : null}
        onCancel={() => {
          setConfirmDelete(false);
          deleteTask.reset();
        }}
        onConfirm={() =>
          deleteTask.mutate(task, {
            onSuccess: () => {
              setConfirmDelete(false);
              toast.success('Task deleted');
              onClose();
            },
          })
        }
      />
    </>
  );
}
