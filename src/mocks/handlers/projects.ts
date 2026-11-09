import { http, type HttpHandler } from 'msw';
import type { Project } from '@/types/api';
import { assertCanManage, loadProject } from '../access';
import { createDefaultSections, db, isMember, logActivity, newId } from '../db';
import { nowIso } from '../dates';
import {
  Validator,
  compareText,
  created,
  defined,
  forbidden,
  noContent,
  ok,
  paginated,
  queryObject,
  readBody,
  readPagination,
  requireUser,
  route,
} from '../utils';

export function projectHandlers(base: string): HttpHandler[] {
  return [
    http.get(
      `${base}/projects`,
      route(({ request, query }) => {
        const user = requireUser(request);
        const v = new Validator(queryObject(query), 'query');
        const { page, limit } = readPagination(v);
        const search = v.string('search', { max: 150, trim: true });
        const sortBy = v.oneOf('sortBy', ['createdAt', 'name'] as const) ?? 'createdAt';
        const order = v.oneOf('order', ['asc', 'desc'] as const) ?? 'desc';
        v.assert();

        const term = search?.toLowerCase();
        const direction = order === 'asc' ? 1 : -1;
        const projects = db.projects
          .filter((project) => user.role === 'admin' || isMember(project.id, user.id))
          .filter((project) => !term || project.name.toLowerCase().includes(term))
          .sort((a, b) =>
            sortBy === 'name'
              ? compareText(a.name, b.name) * direction
              : a.createdAt.localeCompare(b.createdAt) * direction,
          );

        return paginated(projects, page, limit);
      }),
    ),

    http.post(
      `${base}/projects`,
      route(async ({ request }) => {
        const user = requireUser(request);
        if (user.role === 'member') throw forbidden('Only admins and managers can create projects');

        const v = new Validator(await readBody(request), 'body');
        const name = v.string('name', { required: true, min: 1, max: 150, trim: true });
        const description = v.nullableString('description', { max: 5000 });
        v.assert();

        const timestamp = nowIso();
        const project: Project = {
          id: newId(),
          name: defined(name),
          description: description ?? null,
          ownerId: user.id,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        db.projects.push(project);
        db.memberships.push({ projectId: project.id, userId: user.id, joinedAt: timestamp });
        createDefaultSections(project.id, timestamp);
        logActivity({
          projectId: project.id,
          actorId: user.id,
          action: 'project.created',
          details: { name: project.name },
          createdAt: timestamp,
        });
        return created(project);
      }),
    ),

    http.get(
      `${base}/projects/:projectId`,
      route(({ request, params }) => {
        const user = requireUser(request);
        return ok(loadProject(params.projectId ?? '', user));
      }),
    ),

    http.patch(
      `${base}/projects/:projectId`,
      route(async ({ request, params }) => {
        const user = requireUser(request);
        const project = loadProject(params.projectId ?? '', user);
        assertCanManage(project, user);

        const v = new Validator(await readBody(request), 'body');
        v.requireAny(['name', 'description']);
        const name = v.string('name', { min: 1, max: 150, trim: true });
        const description = v.nullableString('description', { max: 5000 });
        v.assert();

        if (name !== undefined) project.name = name;
        if (description !== undefined) project.description = description;
        project.updatedAt = nowIso();
        return ok(project);
      }),
    ),

    http.delete(
      `${base}/projects/:projectId`,
      route(({ request, params }) => {
        const user = requireUser(request);
        const project = loadProject(params.projectId ?? '', user);
        assertCanManage(project, user);

        const taskIds = new Set(
          db.tasks.filter((task) => task.projectId === project.id).map((task) => task.id),
        );
        db.comments = db.comments.filter((comment) => !taskIds.has(comment.taskId));
        db.tasks = db.tasks.filter((task) => task.projectId !== project.id);
        db.sections = db.sections.filter((section) => section.projectId !== project.id);
        db.memberships = db.memberships.filter((m) => m.projectId !== project.id);
        db.activity = db.activity.filter((log) => log.projectId !== project.id);
        db.projects = db.projects.filter((candidate) => candidate.id !== project.id);
        return noContent();
      }),
    ),
  ];
}
