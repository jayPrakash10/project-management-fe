import { http, type HttpHandler } from 'msw';
import type { UserRole } from '@/types/api';
import { db, toPublicUser } from '../db';
import { nowIso } from '../dates';
import {
  Validator,
  compareText,
  conflict,
  notFound,
  ok,
  paginated,
  queryObject,
  readBody,
  readPagination,
  requireAdmin,
  requireUser,
  requireUuidParam,
  route,
} from '../utils';

const ROLES: readonly UserRole[] = ['admin', 'manager', 'member'];

export function userHandlers(base: string): HttpHandler[] {
  return [
    http.get(
      `${base}/users`,
      route(({ request, query }) => {
        const user = requireUser(request);
        requireAdmin(user);

        const v = new Validator(queryObject(query), 'query');
        const { page, limit } = readPagination(v);
        const search = v.string('search', { max: 100, trim: true });
        const role = v.oneOf('role', ROLES);
        v.assert();

        const term = search?.toLowerCase();
        const users = db.users
          .filter((candidate) => !role || candidate.role === role)
          .filter(
            (candidate) =>
              !term ||
              candidate.name.toLowerCase().includes(term) ||
              candidate.email.toLowerCase().includes(term),
          )
          .sort((a, b) => compareText(a.name, b.name))
          .map(toPublicUser);

        return paginated(users, page, limit);
      }),
    ),

    http.patch(
      `${base}/users/:userId/role`,
      route(async ({ request, params }) => {
        const actor = requireUser(request);
        requireAdmin(actor);
        const userId = requireUuidParam(params, 'userId');

        const v = new Validator(await readBody(request), 'body');
        const role = v.oneOf('role', ROLES, { required: true });
        v.assert();

        const target = db.users.find((candidate) => candidate.id === userId);
        if (!target) throw notFound('User not found');
        if (target.id === actor.id) throw conflict('You cannot change your own role');

        if (role) {
          target.role = role;
          target.updatedAt = nowIso();
        }
        return ok(toPublicUser(target));
      }),
    ),
  ];
}
