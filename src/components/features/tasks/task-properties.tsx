import { useId, useState, type ReactNode } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUpdateTask, useUpdateTaskAssignee, useUpdateTaskStatus } from '@/hooks/use-task-mutations';
import { PRIORITY_LABELS, STATUS_LABELS, TASK_PRIORITIES, TASK_STATUSES, isTaskPriority, isTaskStatus } from '@/lib/constants';
import { formatDateTime, todayUtc } from '@/lib/dates';
import type { ProjectMember, Section, Task } from '@/types/api';
import { DueDateLabel } from './task-badges';

const statusOptions = TASK_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }));
const priorityOptions = TASK_PRIORITIES.map((value) => ({ value, label: PRIORITY_LABELS[value] }));

function PropertyRow({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
      <dt className="text-sm text-fg-muted">{htmlFor ? <label htmlFor={htmlFor}>{label}</label> : label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

export interface TaskPropertiesProps {
  task: Task;
  sections: Section[];
  members: ProjectMember[];
  /** Owner/admin: can change the assignee. */
  canManage: boolean;
}

/** Status, assignee, due date, priority and section. Each change is its own PATCH. */
export function TaskProperties({ task, sections, members, canManage }: TaskPropertiesProps) {
  const id = useId();
  const toast = useToast();
  const updateTask = useUpdateTask();
  const updateStatus = useUpdateTaskStatus();
  const updateAssignee = useUpdateTaskAssignee();
  const [dueError, setDueError] = useState<string | null>(null);

  const onError = (error: unknown) => toast.error(error);

  // Keep the current assignee selectable even if they were removed from the project.
  const assigneeOptions = members.map((member) => ({ value: member.userId, label: member.name }));
  if (task.assigneeId && !members.some((member) => member.userId === task.assigneeId)) {
    assigneeOptions.push({ value: task.assigneeId, label: task.assigneeName ?? 'Former member' });
  }

  function changeDueDate(value: string) {
    if (value && value < todayUtc()) {
      setDueError('Due date cannot be in the past');
      return;
    }
    setDueError(null);
    updateTask.mutate(
      { taskId: task.id, input: { dueDate: value || null } },
      {
        onError: (error) => {
          setDueError(null);
          onError(error);
        },
      },
    );
  }

  return (
    <dl className="space-y-3">
      <PropertyRow label="Status" htmlFor={`${id}-status`}>
        <Select
          id={`${id}-status`}
          size="sm"
          options={statusOptions}
          value={task.status}
          disabled={updateStatus.isPending}
          onChange={(event) => {
            const status = event.target.value;
            if (isTaskStatus(status)) updateStatus.mutate({ taskId: task.id, status }, { onError });
          }}
          wrapperClassName="max-w-56"
        />
      </PropertyRow>

      {task.status === 'done' && task.completedAt && (
        <PropertyRow label="Completed">
          <span className="text-base text-fg">{formatDateTime(task.completedAt)}</span>
        </PropertyRow>
      )}

      <PropertyRow label="Assignee" htmlFor={canManage ? `${id}-assignee` : undefined}>
        {canManage ? (
          <Select
            id={`${id}-assignee`}
            size="sm"
            placeholderOption="Unassigned"
            options={assigneeOptions}
            value={task.assigneeId ?? ''}
            disabled={updateAssignee.isPending}
            onChange={(event) =>
              updateAssignee.mutate({ taskId: task.id, assigneeId: event.target.value || null }, { onError })
            }
            wrapperClassName="max-w-56"
          />
        ) : (
          <span className="inline-flex items-center gap-2 text-base text-fg">
            <Avatar name={task.assigneeName} size="sm" />
            {task.assigneeName ?? <span className="text-fg-muted">Unassigned</span>}
          </span>
        )}
      </PropertyRow>

      <PropertyRow label="Due date" htmlFor={`${id}-due`}>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id={`${id}-due`}
            type="date"
            min={todayUtc()}
            value={task.dueDate ?? ''}
            disabled={updateTask.isPending}
            aria-invalid={dueError ? true : undefined}
            aria-describedby={dueError ? `${id}-due-error` : undefined}
            onChange={(event) => changeDueDate(event.target.value)}
            className="h-8 w-40 md:text-sm"
          />
          {task.dueDate && (
            <>
              <DueDateLabel dueDate={task.dueDate} isOverdue={task.isOverdue} />
              <Button size="sm" variant="ghost" onClick={() => changeDueDate('')} disabled={updateTask.isPending}>
                Clear
              </Button>
            </>
          )}
        </div>
        {dueError && (
          <p id={`${id}-due-error`} className="mt-1 text-sm text-danger-soft-fg">
            {dueError}
          </p>
        )}
      </PropertyRow>

      <PropertyRow label="Priority" htmlFor={`${id}-priority`}>
        <Select
          id={`${id}-priority`}
          size="sm"
          options={priorityOptions}
          value={task.priority}
          disabled={updateTask.isPending}
          onChange={(event) => {
            const priority = event.target.value;
            if (isTaskPriority(priority)) updateTask.mutate({ taskId: task.id, input: { priority } }, { onError });
          }}
          wrapperClassName="max-w-56"
        />
      </PropertyRow>

      <PropertyRow label="Section" htmlFor={`${id}-section`}>
        <Select
          id={`${id}-section`}
          size="sm"
          placeholderOption="No section"
          options={sections.map((section) => ({ value: section.id, label: section.name }))}
          value={task.sectionId ?? ''}
          disabled={updateTask.isPending}
          onChange={(event) =>
            updateTask.mutate({ taskId: task.id, input: { sectionId: event.target.value || null } }, { onError })
          }
          wrapperClassName="max-w-56"
        />
      </PropertyRow>
    </dl>
  );
}
