import { CalendarDays, CircleAlert, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { PRIORITY_LABELS, STATUS_LABELS } from '@/lib/constants';
import { describeDueDate, getDueTone } from '@/lib/dates';
import type { TaskPriority, TaskStatus } from '@/types/api';

const statusClasses: Record<TaskStatus, string> = {
  todo: 'bg-status-todo-bg text-status-todo-fg',
  in_progress: 'bg-status-progress-bg text-status-progress-fg',
  in_review: 'bg-status-review-bg text-status-review-fg',
  done: 'bg-status-done-bg text-status-done-fg',
};

const statusDots: Record<TaskStatus, string> = {
  todo: 'bg-status-todo-solid',
  in_progress: 'bg-status-progress-solid',
  in_review: 'bg-status-review-solid',
  done: 'bg-status-done-solid',
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <Badge className={cn(statusClasses[status], className)}>
      <span aria-hidden className={cn('size-1.5 rounded-full', statusDots[status])} />
      <span className="sr-only">Status: </span>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

const priorityClasses: Record<TaskPriority, string> = {
  low: 'bg-priority-low-bg text-priority-low-fg',
  medium: 'bg-priority-medium-bg text-priority-medium-fg',
  high: 'bg-priority-high-bg text-priority-high-fg',
  urgent: 'bg-priority-urgent-bg text-priority-urgent-fg',
};

export function PriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
  return (
    <Badge className={cn(priorityClasses[priority], className)}>
      <Flag aria-hidden className="size-3" />
      <span className="sr-only">Priority: </span>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

const dueToneClasses = {
  overdue: 'font-medium text-danger-soft-fg',
  today: 'font-medium text-warning-soft-fg',
  soon: 'text-fg-muted',
  normal: 'text-fg-muted',
} as const;

/** Due date with urgency color. Overdue also gets an icon and text, never color alone. */
export function DueDateLabel({
  dueDate,
  isOverdue,
  className,
}: {
  dueDate: string | null;
  isOverdue: boolean;
  className?: string;
}) {
  if (!dueDate) return null;
  const tone = getDueTone(dueDate, isOverdue);
  const Icon = tone === 'overdue' ? CircleAlert : CalendarDays;

  return (
    <span className={cn('inline-flex items-center gap-1 text-sm whitespace-nowrap tabular-nums', dueToneClasses[tone], className)}>
      <Icon aria-hidden className="size-3.5" />
      <span className="sr-only">{tone === 'overdue' ? 'Overdue, due ' : 'Due '}</span>
      {describeDueDate(dueDate)}
    </span>
  );
}
