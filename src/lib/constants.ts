import type { DueStatus, TaskPriority, TaskSortBy, TaskStatus, UserRole, SortOrder } from '@/types/api';

export const TASK_STATUSES: readonly TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done'];
export const TASK_PRIORITIES: readonly TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
export const USER_ROLES: readonly UserRole[] = ['admin', 'manager', 'member'];
export const DUE_STATUSES: readonly DueStatus[] = ['overdue', 'due_today', 'due_this_week'];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  in_review: 'In review',
  done: 'Done',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

/** Ranking used by the API for sortBy=priority. */
export const PRIORITY_RANK: Record<TaskPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
  urgent: 3,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  member: 'Member',
};

export const DUE_STATUS_LABELS: Record<DueStatus, string> = {
  overdue: 'Overdue',
  due_today: 'Due today',
  due_this_week: 'Due this week',
};

/** Task sort options, encoded as "sortBy:order" in the URL. */
export interface TaskSortOption {
  value: `${TaskSortBy}:${SortOrder}`;
  label: string;
}

export const TASK_SORT_OPTIONS: readonly TaskSortOption[] = [
  { value: 'priority:desc', label: 'Priority: highest first' },
  { value: 'priority:asc', label: 'Priority: lowest first' },
  { value: 'dueDate:asc', label: 'Due date: soonest first' },
  { value: 'dueDate:desc', label: 'Due date: latest first' },
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
];

export function parseTaskSort(value: string | undefined, fallback: TaskSortOption['value']) {
  const match = TASK_SORT_OPTIONS.find((option) => option.value === value);
  const [sortBy, order] = (match?.value ?? fallback).split(':') as [TaskSortBy, SortOrder];
  return { sortBy, order, value: match?.value ?? fallback };
}

export const PROJECT_SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'name:asc', label: 'Name A–Z' },
  { value: 'name:desc', label: 'Name Z–A' },
] as const;

export const DEFAULT_PAGE_SIZE = 20;

/** Validation limits from the API docs. */
export const LIMITS = {
  userName: 100,
  email: 255,
  passwordMin: 8,
  passwordMax: 72,
  projectName: 150,
  description: 5000,
  sectionName: 100,
  taskTitle: 200,
  comment: 2000,
  search: 100,
} as const;

export function isTaskStatus(value: unknown): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

export function isTaskPriority(value: unknown): value is TaskPriority {
  return TASK_PRIORITIES.includes(value as TaskPriority);
}

export function isDueStatus(value: unknown): value is DueStatus {
  return DUE_STATUSES.includes(value as DueStatus);
}

export function isUserRole(value: unknown): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}
