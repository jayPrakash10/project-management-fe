import { useState } from 'react';
import { useUpdateTask } from '@/hooks/use-task-mutations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/cn';
import { taskTitleSchema } from '@/lib/schemas';
import type { Task } from '@/types/api';

/** Inline-editable title. Saves on blur or Enter; Escape reverts. */
export function TaskTitleEditor({ task }: { task: Task }) {
  const updateTask = useUpdateTask();
  const toast = useToast();
  const [draft, setDraft] = useState(task.title);
  const [syncedTitle, setSyncedTitle] = useState(task.title);
  const [error, setError] = useState<string | null>(null);

  // Pick up changes saved elsewhere.
  if (task.title !== syncedTitle) {
    setSyncedTitle(task.title);
    setDraft(task.title);
  }

  function save() {
    const parsed = taskTitleSchema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid title');
      return;
    }
    setError(null);
    if (parsed.data === task.title) {
      setDraft(task.title);
      return;
    }
    updateTask.mutate(
      { taskId: task.id, input: { title: parsed.data } },
      {
        onError: (mutationError) => {
          toast.error(mutationError);
          setDraft(task.title);
        },
      },
    );
  }

  return (
    <div>
      <label htmlFor="task-title" className="sr-only">
        Task title
      </label>
      <textarea
        id="task-title"
        rows={1}
        maxLength={200}
        value={draft}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'task-title-error' : undefined}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            setDraft(task.title);
            setError(null);
            event.currentTarget.blur();
          }
        }}
        className={cn(
          'w-full resize-none rounded-md border border-transparent bg-transparent px-2 py-1 -mx-2 text-xl font-semibold text-fg [field-sizing:content]',
          'hover:border-border focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent',
          task.status === 'done' && 'text-fg-muted',
          error && 'border-danger',
        )}
      />
      {error && (
        <p id="task-title-error" className="mt-1 text-sm text-danger-soft-fg">
          {error}
        </p>
      )}
    </div>
  );
}
