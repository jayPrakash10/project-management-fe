import type { ActivityLog } from '@/types/api';
import { STATUS_LABELS, isTaskStatus } from './constants';

function str(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function statusLabel(value: unknown): string {
  return isTaskStatus(value) ? STATUS_LABELS[value] : String(value ?? 'unknown');
}

/**
 * The text that follows the actor's name, using the display table in
 * FRONTEND_GUIDE.md §5.9. `nameForUser` resolves ids through the members list.
 */
export function describeActivity(
  log: ActivityLog,
  nameForUser: (userId: string) => string | null,
): string {
  const d = log.details;
  switch (log.action) {
    case 'project.created':
      return 'created the project';
    case 'member.added':
      return `added ${str(d.name) ?? 'a member'}`;
    case 'member.removed': {
      const count = typeof d.unassignedTaskCount === 'number' ? d.unassignedTaskCount : 0;
      return `removed ${str(d.name) ?? 'a member'} (${count} ${count === 1 ? 'task' : 'tasks'} unassigned)`;
    }
    case 'task.created':
      return `created task “${str(d.title) ?? 'Untitled'}”`;
    case 'task.assigned': {
      const assigneeId = str(d.assigneeId);
      const name = assigneeId ? (nameForUser(assigneeId) ?? 'a former member') : null;
      return name ? `assigned a task to ${name}` : 'assigned a task';
    }
    case 'task.unassigned':
      return 'unassigned a task';
    case 'task.status_changed':
      return `moved a task from ${statusLabel(d.from)} to ${statusLabel(d.to)}`;
    case 'task.deleted':
      return `deleted task “${str(d.title) ?? 'Untitled'}”`;
    case 'comment.added':
      return 'commented on a task';
    default:
      return 'made a change';
  }
}

/** Whether the entry points to a task that can still be opened. */
export function activityHasOpenableTask(log: ActivityLog): boolean {
  return log.taskId !== null && log.action !== 'task.deleted';
}
