import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUpdateTaskStatus } from '@/hooks/use-task-mutations';
import { cn } from '@/lib/cn';
import type { Task } from '@/types/api';

/** Round check button: marks a task done, or reopens it as "To do". */
export function StatusToggle({ task, className }: { task: Pick<Task, 'id' | 'title' | 'status'>; className?: string }) {
  const updateStatus = useUpdateTaskStatus();
  const toast = useToast();
  const done = task.status === 'done';

  return (
    <button
      type="button"
      aria-pressed={done}
      aria-label={done ? `Mark “${task.title}” incomplete` : `Mark “${task.title}” complete`}
      title={done ? 'Mark incomplete' : 'Mark complete'}
      disabled={updateStatus.isPending}
      onClick={(event) => {
        event.stopPropagation();
        updateStatus.mutate(
          { taskId: task.id, status: done ? 'todo' : 'done' },
          { onError: (error) => toast.error(error) },
        );
      }}
      className={cn(
        'group/toggle relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
        done
          ? 'border-status-done-fg bg-status-done-fg text-surface'
          : 'border-border-strong text-transparent hover:border-status-done-solid hover:text-status-done-solid',
        className,
      )}
    >
      <Check aria-hidden className="size-3" strokeWidth={3} />
    </button>
  );
}
