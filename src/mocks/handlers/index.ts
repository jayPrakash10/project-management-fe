import type { HttpHandler } from 'msw';
import { authHandlers } from './auth';
import { commentHandlers } from './comments';
import { healthHandlers } from './health';
import { memberHandlers } from './members';
import { projectHandlers } from './projects';
import { reportHandlers } from './reports';
import { sectionHandlers } from './sections';
import { taskHandlers } from './tasks';
import { userHandlers } from './users';

/** Every TaskFlow endpoint, mounted under the given API base URL. */
export function createHandlers(apiUrl: string): HttpHandler[] {
  const base = apiUrl.replace(/\/+$/, '');
  return [
    ...healthHandlers(base),
    ...authHandlers(base),
    ...userHandlers(base),
    ...projectHandlers(base),
    ...memberHandlers(base),
    ...sectionHandlers(base),
    ...taskHandlers(base),
    ...commentHandlers(base),
    ...reportHandlers(base),
  ];
}
