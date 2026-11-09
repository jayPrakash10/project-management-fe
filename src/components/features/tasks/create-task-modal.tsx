import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTaskPane } from '@/hooks/use-task-pane';
import { useCreateTask } from '@/hooks/use-task-mutations';
import { useToast } from '@/hooks/use-toast';
import { PRIORITY_LABELS, TASK_PRIORITIES } from '@/lib/constants';
import { todayUtc } from '@/lib/dates';
import { applyApiErrors } from '@/lib/form-errors';
import { taskCreateSchema, type TaskCreateValues } from '@/lib/schemas';
import type { ProjectMember, Section, TaskCreateInput, TaskPriority } from '@/types/api';

export interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  sections: Section[];
  members: ProjectMember[];
  /** Only owners and admins may set the assignee on create. */
  canAssign: boolean;
  defaultSectionId?: string;
}

const FIELDS = ['title', 'description', 'priority', 'sectionId', 'dueDate', 'assigneeId'] as const;
const priorityOptions = TASK_PRIORITIES.map((value) => ({ value, label: PRIORITY_LABELS[value] }));

/** Turn form values into the POST body: empty optional fields are omitted, never sent as "". */
function toCreateInput(values: TaskCreateValues, canAssign: boolean): TaskCreateInput {
  const input: TaskCreateInput = { title: values.title.trim(), priority: values.priority as TaskPriority };
  if (values.description.trim()) input.description = values.description;
  if (values.sectionId) input.sectionId = values.sectionId;
  if (values.dueDate) input.dueDate = values.dueDate;
  if (canAssign && values.assigneeId) input.assigneeId = values.assigneeId;
  return input;
}

export function CreateTaskModal(props: CreateTaskModalProps) {
  // Remount the form each time the modal opens so defaults are fresh.
  return props.open ? <CreateTaskForm {...props} /> : null;
}

function CreateTaskForm({ open, onClose, projectId, sections, members, canAssign, defaultSectionId }: CreateTaskModalProps) {
  const createTask = useCreateTask(projectId);
  const { openTask } = useTaskPane();
  const toast = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TaskCreateValues>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      sectionId: defaultSectionId ?? sections[0]?.id ?? '',
      dueDate: '',
      assigneeId: '',
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    createTask.mutate(toCreateInput(values, canAssign), {
      onSuccess: (task) => {
        toast.success('Task created', {
          description: task.title,
          action: { label: 'Open task', onClick: () => openTask(task.id) },
        });
        onClose();
      },
      onError: (error) => setFormError(applyApiErrors(error, setError, FIELDS)),
    });
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New task"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="create-task-form" loading={createTask.isPending}>
            Create task
          </Button>
        </>
      }
    >
      <form id="create-task-form" noValidate onSubmit={onSubmit} className="space-y-4">
        {formError && <FormAlert>{formError}</FormAlert>}

        <Field label="Title" required error={errors.title?.message}>
          {(control) => <Input {...control} {...register('title')} autoFocus maxLength={200} placeholder="What needs to be done?" />}
        </Field>

        <Field label="Description" error={errors.description?.message}>
          {(control) => <Textarea {...control} {...register('description')} rows={3} maxLength={5000} />}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Priority" error={errors.priority?.message}>
            {(control) => <Select {...control} {...register('priority')} options={priorityOptions} />}
          </Field>

          <Field label="Due date" error={errors.dueDate?.message} hint="Optional. Today or later (UTC).">
            {(control) => <Input {...control} {...register('dueDate')} type="date" min={todayUtc()} />}
          </Field>

          <Field label="Section" error={errors.sectionId?.message}>
            {(control) => (
              <Select
                {...control}
                {...register('sectionId')}
                options={sections.map((section) => ({ value: section.id, label: section.name }))}
                placeholderOption={sections.length === 0 ? 'No sections' : undefined}
              />
            )}
          </Field>

          {canAssign && (
            <Field label="Assignee" error={errors.assigneeId?.message}>
              {(control) => (
                <Select
                  {...control}
                  {...register('assigneeId')}
                  placeholderOption="Unassigned"
                  options={members.map((member) => ({ value: member.userId, label: member.name }))}
                />
              )}
            </Field>
          )}
        </div>
      </form>
    </Modal>
  );
}
