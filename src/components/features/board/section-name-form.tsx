import { useState } from 'react';
import { getErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sectionNameSchema } from '@/lib/schemas';

export interface SectionNameFormProps {
  initialName?: string;
  submitLabel: string;
  label: string;
  pending: boolean;
  onSubmit: (name: string, callbacks: { onError: (error: unknown) => void }) => void;
  onCancel: () => void;
}

/** Inline form for adding or renaming a section (409 duplicate names are shown inline). */
export function SectionNameForm({ initialName = '', submitLabel, label, pending, onSubmit, onCancel }: SectionNameFormProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const inputId = `section-name-${submitLabel.toLowerCase()}`;

  return (
    <form
      noValidate
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = sectionNameSchema.safeParse(name);
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? 'Invalid name');
          return;
        }
        if (parsed.data === initialName) {
          onCancel();
          return;
        }
        setError(null);
        onSubmit(parsed.data, { onError: (submitError) => setError(getErrorMessage(submitError)) });
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Input
        id={inputId}
        autoFocus
        value={name}
        maxLength={100}
        placeholder="Section name"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            onCancel();
          }
        }}
        className="h-8"
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-danger-soft-fg">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="primary" loading={pending}>
          {submitLabel}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
