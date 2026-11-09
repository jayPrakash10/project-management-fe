import axios, { type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '@/lib/storage';
import type { Paginated, PaginationMeta } from '@/types/api';
import { toApiError } from './errors';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3005').replace(/\/+$/, '');

/** Endpoints where a 401 means "wrong credentials", not "session expired". */
const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register'];

export const http = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20_000,
});

let unauthorizedHandler: (() => void) | null = null;

/** Registered by the auth provider: clears the session and redirects to login. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    const url: string = error?.config?.url ?? '';
    const isPublicAuthCall = PUBLIC_AUTH_PATHS.some((path) => url.endsWith(path));
    if (apiError.status === 401 && !isPublicAuthCall) {
      unauthorizedHandler?.();
    }
    return Promise.reject(apiError);
  },
);

type QueryValue = string | number | boolean | null | undefined;

/** Drop undefined, null and empty-string params so they are never sent. */
export function cleanParams(params?: object): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params as Record<string, QueryValue>)) {
    if (value === undefined || value === null || value === '') continue;
    result[key] = value;
  }
  return result;
}

interface Envelope<T> {
  data: T;
}

export async function apiGet<T>(url: string, params?: object): Promise<T> {
  const response = await http.get<Envelope<T>>(url, { params: cleanParams(params) });
  return response.data.data;
}

export async function apiGetPage<T>(url: string, params?: object): Promise<Paginated<T>> {
  const response = await http.get<{ data: T[]; meta: PaginationMeta }>(url, {
    params: cleanParams(params),
  });
  return { data: response.data.data, meta: response.data.meta };
}

/**
 * Fetch every page of a paginated endpoint (limit 100, the API maximum).
 * Used where a view needs the complete set, e.g. the board.
 */
export async function apiGetAllPages<T>(url: string, params?: object, maxPages = 50): Promise<T[]> {
  const limit = 100;
  const first = await apiGetPage<T>(url, { ...params, page: 1, limit });
  const totalPages = Math.min(first.meta.totalPages, maxPages);
  if (totalPages <= 1) return first.data;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      apiGetPage<T>(url, { ...params, page: index + 2, limit }),
    ),
  );
  return [first.data, ...rest.map((page) => page.data)].flat();
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const response = await http.post<Envelope<T>>(url, body);
  return response.data.data;
}

export async function apiPatch<T>(url: string, body: unknown): Promise<T> {
  const response = await http.patch<Envelope<T>>(url, body);
  return response.data.data;
}

/** DELETE endpoints return 204 with an empty body; nothing is parsed. */
export async function apiDelete(url: string): Promise<void> {
  await http.delete(url);
}
