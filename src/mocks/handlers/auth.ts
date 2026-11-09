import { http, type HttpHandler } from 'msw';
import { db, findUserByEmail, newId, toPublicUser } from '../db';
import { nowIso } from '../dates';
import {
  Validator,
  conflict,
  created,
  defined,
  ok,
  readBody,
  requireUser,
  route,
  tokenFor,
  unauthorized,
} from '../utils';

export function authHandlers(base: string): HttpHandler[] {
  return [
    http.post(
      `${base}/auth/register`,
      route(async ({ request }) => {
        const v = new Validator(await readBody(request), 'body');
        const nameInput = v.string('name', { required: true, min: 1, max: 100, trim: true });
        const emailInput = v.email('email', { required: true, max: 255 });
        const passwordInput = v.string('password', { required: true, min: 8, max: 72 });
        v.assert();
        const name = defined(nameInput);
        const email = defined(emailInput);
        const password = defined(passwordInput);

        if (findUserByEmail(email)) throw conflict('An account with this email already exists');

        const timestamp = nowIso();
        const user = {
          id: newId(),
          name,
          email,
          role: 'member' as const,
          password,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        db.users.push(user);
        return created({ user: toPublicUser(user), token: tokenFor(user.id) });
      }),
    ),

    http.post(
      `${base}/auth/login`,
      route(async ({ request }) => {
        const v = new Validator(await readBody(request), 'body');
        const email = v.email('email', { required: true });
        const password = v.string('password', { required: true, min: 1 });
        v.assert();

        const user = email ? findUserByEmail(email) : undefined;
        if (!user || user.password !== password) throw unauthorized('Invalid email or password');
        return ok({ user: toPublicUser(user), token: tokenFor(user.id) });
      }),
    ),

    http.get(
      `${base}/auth/me`,
      route(({ request }) => ok(toPublicUser(requireUser(request)))),
    ),
  ];
}
