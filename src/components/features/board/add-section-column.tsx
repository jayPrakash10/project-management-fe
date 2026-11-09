import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useCreateSection } from '@/hooks/use-sections';
import { SectionNameForm } from './section-name-form';

/** Ghost column at the end of the board (owner/admin only). */
export function AddSectionColumn({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const createSection = useCreateSection(projectId);

  return (
    <div className="w-[85vw] max-w-80 shrink-0 snap-start sm:w-72">
      {open ? (
        <div className="rounded-xl bg-surface-2 p-3">
          <SectionNameForm
            label="New section name"
            submitLabel="Add section"
            pending={createSection.isPending}
            onCancel={() => setOpen(false)}
            onSubmit={(name, { onError }) => createSection.mutate(name, { onSuccess: () => setOpen(false), onError })}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-12 w-full items-center gap-2 rounded-xl border border-dashed border-border-strong px-3 text-base font-medium text-fg-muted transition-colors hover:border-accent hover:bg-surface-2 hover:text-fg"
        >
          <Plus aria-hidden className="size-4" />
          Add section
        </button>
      )}
    </div>
  );
}
