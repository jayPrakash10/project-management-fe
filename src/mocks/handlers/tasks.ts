import { http, type HttpHandler } from 'msw';
import type { DueStatus, SortOrder, TaskPriority, TaskStatus } from '@/types/api';
import { assertCanManage, canManageProject, loadProject, loadTask } from '../access';
import { db, isMember, logActivity, newId, sectionsOf, toTask, type DbTask } from '../db';
import { addDaysUtc, nowIso, todayUtc } from '../dates';
import {
  Validator,
  created,
  defined,
  forbidden,
  invalid,
  noContent,
  ok,
  paginated,
  queryObject,
  readBody,
  readPagination,
  requireUser,
  route,
} from '../utils';

const STATUSES: readonly TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done'];
const PRIORITIES: readonly TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
const DUE_STATUSES: readonly DueStatus[] = ['overdue', 'due_today', 'due_this_week'];
const SORT_FIELDS = ['createdAt', 'dueDate', 'priority'] as const;
const ORDERS: readonly SortOrder[] = ['asc', 'desc'];

const PRIORITY_RANK: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2, urgent: 3 };

const PAST_DUE_DATE = 'Due date cannot be in the past';
const ASSIGNEE_NOT_MEMBER = 'Assignee must be a member of this project';
const SECTION_NOT_IN_PROJECT = 'Section does not belong to this project';

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  sectionId?: string;
  projectId?: string;
  dueStatus?: DueStatus;
  dueBefore?: string;
  dueAfter?: string;
  search?: string;
  sortBy: (typeof SORT_FIELDS)[number];
  order: SortOrder;
}

/** Shared by the project task list and /me/tasks. */
function readTaskFilters(v: Validator, scope: 'project' | 'mine'): TaskFilters {
  return {
    status: v.oneOf('status', STATUSES),
    priority: v.oneOf('priority', PRIORITIES),
    assigneeId: scope === 'project' ? v.uuid('assigneeId') : undefined,
    sectionId: scope === 'project' ? v.uuid('sectionId') : undefined,
    projectId: scope === 'mine' ? v.uuid('projectId') : undefined,
    dueStatus: v.oneOf('dueStatus', DUE_STATUSES),
    dueBefore: v.date('dueBefore'),
    dueAfter: v.date('dueAfter'),
    search: v.string('search', { min: 1, max: 100, trim: true }),
    sortBy: v.oneOf('sortBy', SORT_FIELDS) ?? 'createdAt',
    order: v.oneOf('order', ORDERS) ?? 'desc',
  };
}

function matchesDueStatus(task: DbTask, dueStatus: DueStatus, today: string): boolean {
  if (task.status === 'done' || task.dueDate === null) return false;
  if (dueStatus === 'overdue') return task.dueDate < today;
  if (dueStatus === 'due_today') return task.dueDate === today;
  return task.dueDate >= today && task.dueDate <= addDaysUtc(today, 6);
}

function applyTaskFilters(tasks: DbTask[], filters: TaskFilters): DbTask[] {
  const today = todayUtc();
  const term = filters.search?.toLowerCase();
  return tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.assigneeId && task.assigneeId !== filters.assigneeId) return false;
    if (filters.sectionId && task.sectionId !== filters.sectionId) return false;
    if (filters.projectId && task.projectId !== filters.projectId) return false;
    if (filters.dueStatus && !matchesDueStatus(task, filters.dueStatus, today)) return false;
    if (filters.dueBefore && (task.dueDate === null || task.dueDate > filters.dueBefore)) return false;
    if (filters.dueAfter && (task.dueDate === null || task.dueDate < filters.dueAfter)) return false;
    if (term && !task.title.toLowerCase().includes(term)) return false;
    return true;
  });
}

function sortTasks(tasks: DbTask[], sortBy: TaskFilters['sortBy'], order: SortOrder): DbTask[] {
  const direction = order === 'asc' ? 1 : -1;
  return [...tasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      // Tasks without a due date always go last, whatever the order.
      if (a.dueDate === null && b.dueDate === null) return b.createdAt.localeCompare(a.createdAt);
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      const byDate = a.dueDate.localeCompare(b.dueDate) * direction;
      return byDate || b.createdAt.localeCompare(a.createdAt);
    }
    if (sortBy === 'priority') {
      const byPriority = (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) * direction;
      return byPriority || b.createdAt.localeCompare(a.createdAt);
    }
    return a.createdAt.localeCompare(b.createdAt) * direction;
  });
}

export function taskHandlers(base: string): HttpHandler[] {
  return [
    http.get(
      `${base}/projects/:projectId/tasks`,
      route(({ request, params, query }) => {
        const user = requireUser(request);
        const project = loadProject(params.projectId ?? '', user);
        const v = new Validator(queryObject(query), 'query');
        const { page, limit } = readPagination(v);
        const filters = readTaskFilters(v, 'project');
        v.assert();

        const tasks = applyTaskFilters(
          db.tasks.filter((task) => task.projectId === project.id),
          filters,
        );
        return paginated(sortTasks(tasks, filters.sortBy, filters.order).map(toTask), page, limit);
      }),
    ),

    http.get(
      `${base}/me/tasks`,
      route(({ request, query }) => {
        const user = requireUser(request);
        const v = new Validator(queryObject(query), 'query');
        const { page, limit } = readPagination(v);
        const filters = readTaskFilters(v, 'mine');
        v.assert();

        const tasks = applyTaskFilters(
          db.tasks.filter(
            (task) =>
              task.assigneeId === user.id &&
              db.projects.some((project) => project.id === task.projectId),
          ),
          filters,
        );
        return paginated(sortTasks(tasks, filters.sortBy, filters.order).map(toTask), page, limit);
      }),
    ),

    http.post(
      `${base}/projects/:projectId/tasks`,
      route(async ({ request, params }) => {
        const user = requireUser(request);
        const project = loadProject(params.projectId ?? '', user);

        const v = new Validator(await readBody(request), 'body');
        const titleInput = v.string('title', { required: true, min: 1, max: 200, trim: true });
        const description = v.nullableString('description', { max: 5000 });
        const priority = v.oneOf('priority', PRIORITIES);
        const sectionId = v.uuid('sectionId');
        const dueDate = v.date('dueDate');
        const assigneeId = v.uuid('assigneeId');
        v.assert();
        const title = defined(titleInput);

        if (assigneeId !== undefined && !canManageProject(project, user)) {
          throw forbidden('Only the project owner or an admin can assign tasks');
        }
        if (dueDate !== undefined && dueDate < todayUtc()) throw invalid('body.dueDate', PAST_DUE_DATE);

        const sections = sectionsOf(project.id);
        if (sectionId !== undefined && !sections.some((section) => section.id === sectionId)) {
          throw invalid('body.sectionId', SECTION_NOT_IN_PROJECT);
        }
        if (assigneeId !== undefined && !isMember(project.id, assigneeId)) {
          throw invalid('body.assigneeId', ASSIGNEE_NOT_MEMBER);
        }

        const timestamp = nowIso();
        const task: DbTask = {
          id: newId(),
          projectId: project.id,
          sectionId: sectionId ?? sections[0]?.id ?? null,
          title,
          description: description ?? null,
          status: 'todo',
          priority: priority ?? 'medium',
          assigneeId: assigneeId ?? null,
          createdBy: user.id,
          dueDate: dueDate ?? null,
          completedAt: null,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        db.tasks.push(task);
        logActivity({
          projectId: project.id,
          taskId: task.id,
          actorId: user.id,
          action: 'task.created',
          details: { title: task.title },
          createdAt: timestamp,
        });
        if (task.assigneeId) {
          logActivity({
            projectId: project.id,
            taskId: task.id,
            actorId: user.id,
            action: 'task.assigned',
            details: { assigneeId: task.assigneeId, previousAssigneeId: null },
            createdAt: timestamp,
          });
        }
        return created(toTask(task));
      }),
    ),

    http.get(
      `${base}/tasks/:taskId`,
      route(({ request, params }) => {
        const user = requireUser(request);
        return ok(toTask(loadTask(params.taskId ?? '', user).task));
      }),
    ),

    http.patch(
      `${base}/tasks/:taskId`,
      route(async ({ request, params }) => {
        const user = requireUser(request);
        const { task, project } = loadTask(params.taskId ?? '', user);

        const v = new Validator(await readBody(request), 'body');
        v.requireAny(['title', 'description', 'priority', 'sectionId', 'dueDate']);
        const title = v.string('title', { min: 1, max: 200, trim: true });
        const description = v.nullableString('description', { max: 5000 });
        const priority = v.oneOf('priority', PRIORITIES);
        const sectionId = v.nullableUuid('sectionId');
        const dueDate = v.nullableDate('dueDate');
        v.assert();

        if (typeof dueDate === 'string' && dueDate < todayUtc()) {
          throw invalid('body.dueDate', PAST_DUE_DATE);
        }
        if (
          typeof sectionId === 'string' &&
          !sectionsOf(project.id).some((section) => section.id === sectionId)
        ) {
          throw invalid('body.sectionId', SECTION_NOT_IN_PROJECT);
        }

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (priority !== undefined) task.priority = priority;
        if (sectionId !== undefined) task.sectionId = sectionId;
        if (dueDate !== undefined) task.dueDate = dueDate;
        task.updatedAt = nowIso();
        return ok(toTask(task));
      }),
    ),

    http.patch(
      `${base}/tasks/:taskId/assignee`,
      route(async ({ request, params }) => {
        const user = requireUser(request);
        const { task, project } = loadTask(params.taskId ?? '', user);
        assertCanManage(project, user);

        const v = new Validator(await readBody(request), 'body');
        const assigneeInput = v.nullableUuid('assigneeId', { required: true });
        v.assert();
        const assigneeId = defined(assigneeInput);

        if (assigneeId !== null && !isMember(project.id, assigneeId)) {
          throw invalid('body.assigneeId', ASSIGNEE_NOT_MEMBER);
        }

        const previousAssigneeId = task.assigneeId;
        const timestamp = nowIso();
        task.assigneeId = assigneeId;
        task.updatedAt = timestamp;
        if (previousAssigneeId !== assigneeId) {
          logActivity({
            projectId: project.id,
            taskId: task.id,
            actorId: user.id,
            action: assigneeId === null ? 'task.unassigned' : 'task.assigned',
            details: { assigneeId, previousAssigneeId },
            createdAt: timestamp,
          });
        }
        return ok(toTask(task));
      }),
    ),

    http.patch(
      `${base}/tasks/:taskId/status`,
      route(async ({ request, params }) => {
        const user = requireUser(request);
        const { task, project } = loadTask(params.taskId ?? '', user);

        const v = new Validator(await readBody(request), 'body');
        const statusInput = v.oneOf('status', STATUSES, { required: true });
        v.assert();
        const status = defined(statusInput);

        const previous = task.status;
        const timestamp = nowIso();
        task.status = status;
        if (status === 'done' && previous !== 'done') task.completedAt = timestamp;
        if (status !== 'done') task.completedAt = null;
        task.updatedAt = timestamp;
        if (previous !== status) {
          logActivity({
            projectId: project.id,
            taskId: task.id,
            actorId: user.id,
            action: 'task.status_changed',
            details: { from: previous, to: status },
            createdAt: timestamp,
          });
        }
        return ok(toTask(task));
      }),
    ),

    http.delete(
      `${base}/tasks/:taskId`,
      route(({ request, params }) => {
        const user = requireUser(request);
        const { task, project } = loadTask(params.taskId ?? '', user);
        assertCanManage(project, user);

        db.comments = db.comments.filter((comment) => comment.taskId !== task.id);
        db.tasks = db.tasks.filter((candidate) => candidate.id !== task.id);
        logActivity({
          projectId: project.id,
          taskId: null,
          actorId: user.id,
          action: 'task.deleted',
          details: { taskId: task.id, title: task.title },
        });
        return noContent();
      }),
    ),
  ];
}
