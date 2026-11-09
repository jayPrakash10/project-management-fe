import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import type { KeyboardEventHandler, ReactNode } from 'react';
import { StatusToggle } from '@/components/features/tasks/status-toggle';
import { DueDateLabel, PriorityBadge, StatusBadge } from '@/components/features/tasks/task-badges';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';
import type { Task } from '@/types/api';

export interface TaskCardProps {
  task: Task;
  onOpen: (taskId: string) => void;
}

/** Presentational card; also used inside the drag overlay. */
export function TaskCardContent({ task, onOpen, dragHandle, overlay = false }: TaskCardProps & { dragHandle?: ReactNode; overlay?: boolean }) {
  const done = task.status === 'done';
  return (
    <div
      className={cn(
        'group relative rounded-lg border border-border bg-surface p-3 shadow-xs transition-shadow hover:border-border-strong hover:shadow-sm',
        overlay && 'rotate-1 shadow-lg',
      )}
    >
      <div className="flex items-start gap-2">
        <StatusToggle task={task} className="mt-0.5" />
        <h3 className="min-w-0 flex-1 text-base leading-snug font-medium">
          <button
            type="button"
            onClick={() => onOpen(task.id)}
            className={cn(
              'text-left break-words after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-accent',
              done ? 'text-fg-muted line-through' : 'text-fg',
            )}
          >
            {task.title}
          </button>
        </h3>
        {dragHandle}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-7">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </div>

      <div className="mt-2.5 flex min-h-6 items-center justify-between gap-2 pl-7">
        <DueDateLabel dueDate={task.dueDate} isOverdue={task.isOverdue} />
        <span className="ml-auto flex items-center gap-1.5">
          <span className="sr-only">{task.assigneeName ? `Assigned to ${task.assigneeName}` : 'Unassigned'}</span>
          <Avatar name={task.assigneeName} size="sm" />
        </span>
      </div>
    </div>
  );
}

/**
 * Board card. Mouse/touch drag works anywhere on the card; keyboard users drag
 * with the grip button (Space to pick up, arrows to move, Space to drop).
 */
export function DraggableTaskCard({ task, onOpen }: TaskCardProps) {
  const { setNodeRef, setActivatorNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'task', task },
  });
  const { onKeyDown, ...pointerListeners } = listeners ?? {};
  const handleKeyDown = onKeyDown as KeyboardEventHandler<HTMLButtonElement> | undefined;

  return (
    <li ref={setNodeRef} {...pointerListeners} className={cn('touch-manipulation', isDragging && 'opacity-40')}>
      <TaskCardContent
        task={task}
        onOpen={onOpen}
        dragHandle={
          <button
            ref={setActivatorNodeRef}
            type="button"
            {...attributes}
            onKeyDown={handleKeyDown}
            aria-label={`Move task “${task.title}”`}
            title="Drag to move"
            className="relative z-10 -mt-0.5 -mr-1.5 flex size-6 shrink-0 cursor-grab items-center justify-center rounded text-fg-subtle opacity-100 hover:bg-surface-2 hover:text-fg focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <GripVertical aria-hidden className="size-4" />
          </button>
        }
      />
    </li>
  );
}
