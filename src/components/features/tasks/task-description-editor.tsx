import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateTask } from '@/hooks/use-task-mutations';
import { useToast } from '@/hooks/use-toast';
import { LIMITS } from '@/lib/constants';
import type { Task } from '@/types/api';

/** Description saved on blur. An empty description is sent as null (clears it). */
export function TaskDescriptionEditor({ task }: { task: Task }) {
  const updateTask = useUpdateTask();
  const toast = useToast();
  const current = task.description ?? '';
  const [draft, setDraft] = useState(current);
  const [synced, setSynced] = useState(current);

  if (current !== synced) {
    setSynced(current);
    setDraft(current);
  }

  function save() {
    if (draft === current) return;
    updateTask.mutate(
      { taskId: task.id, input: { description: draft.trim() ? draft : null } },
      {
        onSuccess: () => toast.success('Description saved'),
        onError: (error) => {
          toast.error(error);
          setDraft(current);
        },
      },
    );
  }

  const nearLimit = draft.length > LIMITS.description * 0.9;

  return (
    <div className="space-y-1.5">
      <label htmlFor="task-description" className="text-sm font-medium text-fg">
        Description
      </label>
      <Textarea
        id="task-description"
        value={draft}
        rows={5}
        maxLength={LIMITS.description}
        placeholder="Add more detail to this task…"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={save}
        aria-describedby={nearLimit ? 'task-description-count' : undefined}
      />
      <div className="flex justify-between text-sm text-fg-subtle">
        <span aria-live="polite">{updateTask.isPending ? 'Saving…' : ''}</span>
        {nearLimit && (
          <span id="task-description-count" className="tabular-nums">
            {draft.length} / {LIMITS.description}
          </span>
        )}
      </div>
    </div>
  );
}
