import { Plus } from 'lucide-react';
import { useState } from 'react';
import { getErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateTask } from '@/hooks/use-task-mutations';
import { taskTitleSchema } from '@/lib/schemas';

/** "+ Add task" at the bottom of a column: type a title, press Enter. */
export function QuickAddTask({ projectId, sectionId, sectionName }: { projectId: string; sectionId: string; sectionName: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createTask = useCreateTask(projectId);
  const inputId = `quick-add-${sectionId}`;

  function close() {
    setOpen(false);
    setTitle('');
    setError(null);
  }

  function submit() {
    const parsed = taskTitleSchema.safeParse(title);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid title');
      return;
    }
    setError(null);
    createTask.mutate(
      { title: parsed.data, sectionId },
      {
        onSuccess: () => setTitle(''),
        onError: (mutationError) => setError(getErrorMessage(mutationError)),
      },
    );
  }

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => setOpen(true)}
        leftIcon={<Plus aria-hidden className="size-4" />}
      >
        Add task
      </Button>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="space-y-2 rounded-lg border border-border bg-surface p-2 shadow-xs"
    >
      <label htmlFor={inputId} className="sr-only">
        New task title in {sectionName}
      </label>
      <Input
        id={inputId}
        autoFocus
        value={title}
        maxLength={200}
        placeholder="Task title"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            close();
          }
        }}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-danger-soft-fg">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" loading={createTask.isPending}>
          Add
        </Button>
        <Button size="sm" variant="ghost" onClick={close}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
