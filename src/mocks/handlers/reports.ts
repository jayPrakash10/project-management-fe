import { http, type HttpHandler } from 'msw';
import type { ProjectSummary, TaskStatus } from '@/types/api';
import { loadProject } from '../access';
import { db, isTaskOverdue, toActivity } from '../db';
import {
  Validator,
  ok,
  paginated,
  queryObject,
  readPagination,
  requireUser,
  route,
} from '../utils';

export function reportHandlers(base: string): HttpHandler[] {
  return [
    http.get(
      `${base}/projects/:projectId/summary`,
      route(({ request, params }) => {
        const user = requireUser(request);
        const project = loadProject(params.projectId ?? '', user);
        const tasks = db.tasks.filter((task) => task.projectId === project.id);

        const tasksByStatus: Record<TaskStatus, number> = {
          todo: 0,
          in_progress: 0,
          in_review: 0,
          done: 0,
        };
        for (const task of tasks) tasksByStatus[task.status] += 1;

        const summary: ProjectSummary = {
          projectId: project.id,
          totalTasks: tasks.length,
          tasksByStatus,
          overdueTasks: tasks.filter(isTaskOverdue).length,
          completionPercentage:
            tasks.length === 0 ? 0 : Math.round((tasksByStatus.done / tasks.length) * 100),
        };
        return ok(summary);
      }),
    ),

    http.get(
      `${base}/projects/:projectId/activity`,
      route(({ request, params, query }) => {
        const user = requireUser(request);
        const project = loadProject(params.projectId ?? '', user);
        const v = new Validator(queryObject(query), 'query');
        const { page, limit } = readPagination(v);
        v.assert();

        const logs = db.activity
          .filter((log) => log.projectId === project.id)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map(toActivity);
        return paginated(logs, page, limit);
      }),
    ),
  ];
}
