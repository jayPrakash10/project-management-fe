import { Link } from 'react-router';
import { StatusToggle } from '@/components/features/tasks/status-toggle';
import { DueDateLabel, PriorityBadge, StatusBadge } from '@/components/features/tasks/task-badges';
import { cn } from '@/lib/cn';
import type { Task } from '@/types/api';

export function MyTaskRow({ task, projectName, onOpen }: { task: Task; projectName: string | undefined; onOpen: (taskId: string) => void }) {
  return (
    <li className="group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-2/60">
      <StatusToggle task={task} className="mt-0.5" />
      <div className="min-w-0 flex-1 md:flex md:items-center md:gap-4">
        <button
          type="button"
          onClick={() => onOpen(task.id)}
          className={cn(
            'min-w-0 text-left text-base font-medium break-words after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent md:flex-1',
            task.status === 'done' ? 'text-fg-muted line-through' : 'text-fg',
          )}
        >
          {task.title}
        </button>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 md:mt-0 md:shrink-0">
          <Link
            to={`/projects/${task.projectId}/board`}
            className="relative z-10 max-w-48 truncate text-sm text-fg-muted hover:text-fg hover:underline"
          >
            {projectName ?? 'Project'}
          </Link>
          <DueDateLabel dueDate={task.dueDate} isOverdue={task.isOverdue} />
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
      </div>
    </li>
  );
}
