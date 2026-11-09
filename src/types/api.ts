/**
 * Domain types, copied from FRONTEND_GUIDE.md §3.
 * They describe exactly what the TaskFlow API sends and receives.
 */

export type UserRole = 'admin' | 'manager' | 'member';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
/** Ascending importance. */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type DueStatus = 'overdue' | 'due_today' | 'due_this_week';
export type SortOrder = 'asc' | 'desc';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  /** The user's GLOBAL role, not a project role. */
  role: UserRole;
  joinedAt: string;
}

export interface Section {
  id: string;
  projectId: string;
  name: string;
  /** Lower = further left. */
  position: number;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  /** null when not in a section (e.g. its section was deleted). */
  sectionId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  assigneeName: string | null;
  createdBy: string;
  /** "YYYY-MM-DD" */
  dueDate: string | null;
  /** Set when status becomes "done", cleared when it leaves "done". */
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  projectId: string;
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  overdueTasks: number;
  /** Integer 0–100. */
  completionPercentage: number;
}

export type ActivityAction =
  | 'project.created'
  | 'member.added'
  | 'member.removed'
  | 'task.created'
  | 'task.assigned'
  | 'task.unassigned'
  | 'task.status_changed'
  | 'task.deleted'
  | 'comment.added';

export interface ActivityLog {
  id: string;
  projectId: string;
  taskId: string | null;
  actorId: string;
  actorName: string;
  action: ActivityAction;
  /** Shape depends on action, see FRONTEND_GUIDE.md §5.9. */
  details: Record<string, unknown>;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

export interface HealthStatus {
  status: string;
  database: string;
}

/* ---------- Request shapes ---------- */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserListParams extends PaginationParams {
  search?: string;
  role?: UserRole;
}

export interface ProjectListParams extends PaginationParams {
  search?: string;
  sortBy?: 'createdAt' | 'name';
  order?: SortOrder;
}

export interface ProjectInput {
  name: string;
  description?: string | null;
}

export interface SectionCreateInput {
  name: string;
  position?: number;
}

export interface SectionUpdateInput {
  name?: string;
  position?: number;
}

export type TaskSortBy = 'createdAt' | 'dueDate' | 'priority';

export interface TaskFilterParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  dueStatus?: DueStatus;
  dueBefore?: string;
  dueAfter?: string;
  search?: string;
  sortBy?: TaskSortBy;
  order?: SortOrder;
}

export interface ProjectTaskListParams extends TaskFilterParams, PaginationParams {
  assigneeId?: string;
  sectionId?: string;
}

export interface MyTaskListParams extends TaskFilterParams, PaginationParams {
  projectId?: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  sectionId?: string;
  dueDate?: string;
  assigneeId?: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  sectionId?: string | null;
  dueDate?: string | null;
}
