import { http, type HttpHandler } from 'msw';
import { loadComment, loadTask } from '../access';
import { db, logActivity, newId, toComment, type DbComment } from '../db';
import { nowIso } from '../dates';
import {
  Validator,
  created,
  defined,
  forbidden,
  noContent,
  paginated,
  queryObject,
  readBody,
  readPagination,
  requireUser,
  route,
} from '../utils';

export function commentHandlers(base: string): HttpHandler[] {
  return [
    http.get(
      `${base}/tasks/:taskId/comments`,
      route(({ request, params, query }) => {
        const user = requireUser(request);
        const { task } = loadTask(params.taskId ?? '', user);
        const v = new Validator(queryObject(query), 'query');
        const { page, limit } = readPagination(v);
        v.assert();

        const comments = db.comments
          .filter((comment) => comment.taskId === task.id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .map(toComment);
        return paginated(comments, page, limit);
      }),
    ),

    http.post(
      `${base}/tasks/:taskId/comments`,
      route(async ({ request, params }) => {
        const user = requireUser(request);
        const { task, project } = loadTask(params.taskId ?? '', user);

        const v = new Validator(await readBody(request), 'body');
        const bodyInput = v.string('body', { required: true, min: 1, max: 2000, trim: true });
        v.assert();

        const timestamp = nowIso();
        const comment: DbComment = {
          id: newId(),
          taskId: task.id,
          authorId: user.id,
          body: defined(bodyInput),
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        db.comments.push(comment);
        logActivity({
          projectId: project.id,
          taskId: task.id,
          actorId: user.id,
          action: 'comment.added',
          details: {},
          createdAt: timestamp,
        });
        return created(toComment(comment));
      }),
    ),

    http.delete(
      `${base}/comments/:commentId`,
      route(({ request, params }) => {
        const user = requireUser(request);
        const { comment } = loadComment(params.commentId ?? '', user);
        if (user.role !== 'admin' && comment.authorId !== user.id) {
          throw forbidden('You can only delete your own comments');
        }
        db.comments = db.comments.filter((candidate) => candidate.id !== comment.id);
        return noContent();
      }),
    ),
  ];
}
