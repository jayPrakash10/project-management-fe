import { http, type HttpHandler } from 'msw';
import { assertCanManage, loadProject } from '../access';
import { db, findUserByEmail, isMember, logActivity, toMember } from '../db';
import { nowIso } from '../dates';
import {
  Validator,
  compareText,
  conflict,
  created,
  noContent,
  notFound,
  ok,
  readBody,
  requireUser,
  requireUuidParam,
  route,
} from '../utils';

export function memberHandlers(base: string): HttpHandler[] {
  return [
    http.get(
      `${base}/projects/:projectId/members`,
      route(({ request, params }) => {
        const user = requireUser(request);
        const project = loadProject(params.projectId ?? '', user);
        const members = db.memberships
          .filter((m) => m.projectId === project.id)
          .map(toMember)
          .sort((a, b) => compareText(a.name, b.name));
        return ok(members);
      }),
    ),

    http.post(
      `${base}/projects/:projectId/members`,
      route(async ({ request, params }) => {
        const actor = requireUser(request);
        const project = loadProject(params.projectId ?? '', actor);
        assertCanManage(project, actor);

        const v = new Validator(await readBody(request), 'body');
        const email = v.email('email', { required: true, max: 255 });
        v.assert();

        const target = email ? findUserByEmail(email) : undefined;
        if (!target) throw notFound('No user found with this email');
        if (isMember(project.id, target.id)) throw conflict('User is already a member of this project');

        const membership = { projectId: project.id, userId: target.id, joinedAt: nowIso() };
        db.memberships.push(membership);
        logActivity({
          projectId: project.id,
          actorId: actor.id,
          action: 'member.added',
          details: { userId: target.id, name: target.name },
        });
        return created(toMember(membership));
      }),
    ),

    http.delete(
      `${base}/projects/:projectId/members/:userId`,
      route(({ request, params }) => {
        const actor = requireUser(request);
        const project = loadProject(params.projectId ?? '', actor);
        assertCanManage(project, actor);
        const userId = requireUuidParam(params, 'userId');

        const membership = db.memberships.find(
          (m) => m.projectId === project.id && m.userId === userId,
        );
        if (!membership) throw notFound('Member not found');
        if (userId === project.ownerId) {
          throw conflict('The project owner cannot be removed from the project');
        }

        const timestamp = nowIso();
        let unassignedTaskCount = 0;
        for (const task of db.tasks) {
          if (task.projectId === project.id && task.assigneeId === userId && task.status !== 'done') {
            task.assigneeId = null;
            task.updatedAt = timestamp;
            unassignedTaskCount += 1;
          }
        }
        db.memberships = db.memberships.filter((m) => m !== membership);

        const member = toMember(membership);
        logActivity({
          projectId: project.id,
          actorId: actor.id,
          action: 'member.removed',
          details: { userId, name: member.name, unassignedTaskCount },
          createdAt: timestamp,
        });
        return noContent();
      }),
    ),
  ];
}
