import { http, type HttpHandler } from 'msw';
import { ok, route } from '../utils';

export function healthHandlers(base: string): HttpHandler[] {
  return [
    http.get(
      `${base}/health`,
      route(() => ok({ status: 'ok', database: 'connected' })),
    ),
  ];
}
