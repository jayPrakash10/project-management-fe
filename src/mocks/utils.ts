import { HttpResponse, delay, type PathParams } from 'msw';
import type { PaginationMeta } from '@/types/api';
import { isValidDateString } from './dates';
import { db, type DbUser } from './db';

/* ---------- Errors ---------- */

export interface FieldIssue {
  field: string;
  message: string;
}

/** Thrown inside handlers; converted to the API error envelope by `route`. */
export class MockHttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: FieldIssue[];

  constructor(status: number, code: string, message: string, details?: FieldIssue[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const unauthorized = (message = 'Authentication required') =>
  new MockHttpError(401, 'UNAUTHORIZED', message);
export const forbidden = (message = 'You do not have permission to perform this action') =>
  new MockHttpError(403, 'FORBIDDEN', message);
export const notFound = (message = 'Not found') => new MockHttpError(404, 'NOT_FOUND', message);
export const conflict = (message: string) => new MockHttpError(409, 'CONFLICT', message);
/** A single-field business-rule violation, e.g. a past due date. */
export const invalid = (field: string, message: string) =>
  new MockHttpError(400, 'VALIDATION_ERROR', message, [{ field, message }]);

/* ---------- Responses ---------- */

export function ok<T>(data: T, status = 200): Response {
  return HttpResponse.json({ data }, { status });
}

export function created<T>(data: T): Response {
  return ok(data, 201);
}

export function noContent(): Response {
  return new HttpResponse(null, { status: 204 });
}

export function paginated<T>(items: T[], page: number, limit: number): Response {
  const total = items.length;
  const meta: PaginationMeta = { page, limit, total, totalPages: Math.ceil(total / limit) };
  const start = (page - 1) * limit;
  return HttpResponse.json({ data: items.slice(start, start + limit), meta }, { status: 200 });
}

function errorResponse(error: MockHttpError): Response {
  const body: { code: string; message: string; details?: FieldIssue[] } = {
    code: error.code,
    message: error.message,
  };
  if (error.details && error.details.length > 0) body.details = error.details;
  return HttpResponse.json({ error: body }, { status: error.status });
}

/* ---------- Route wrapper ---------- */

export interface RouteContext {
  request: Request;
  params: Record<string, string>;
  query: URLSearchParams;
}

/**
 * Wraps a handler: adds a small artificial latency, flattens params, and turns
 * thrown MockHttpErrors into the API's error envelope.
 */
export function route(resolver: (context: RouteContext) => Response | Promise<Response>) {
  return async ({ request, params }: { request: Request; params: PathParams }) => {
    await delay(150 + Math.round(Math.random() * 150));
    const flatParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') flatParams[key] = value;
    }
    try {
      return await resolver({
        request,
        params: flatParams,
        query: new URL(request.url).searchParams,
      });
    } catch (error) {
      if (error instanceof MockHttpError) return errorResponse(error);
      console.error('[mock api] unexpected error', error);
      return HttpResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
        { status: 500 },
      );
    }
  };
}

/* ---------- Auth ---------- */

export const tokenFor = (userId: string) => `mock.${userId}`;

export function requireUser(request: Request): DbUser {
  const header = request.headers.get('Authorization');
  if (!header || !header.startsWith('Bearer ')) throw unauthorized('Authentication required');
  const token = header.slice('Bearer '.length).trim();
  if (!token.startsWith('mock.')) throw unauthorized('Invalid or expired token');
  const user = db.users.find((candidate) => candidate.id === token.slice('mock.'.length));
  if (!user) throw unauthorized('Invalid or expired token');
  return user;
}

export function requireAdmin(user: DbUser): void {
  if (user.role !== 'admin') throw forbidden('Admin access required');
}

/* ---------- Input parsing ---------- */

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  let parsed: unknown;
  try {
    const text = await request.text();
    parsed = text ? JSON.parse(text) : {};
  } catch {
    throw new MockHttpError(400, 'INVALID_JSON', 'Malformed JSON body');
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw invalid('body', 'Expected object, received ' + (Array.isArray(parsed) ? 'array' : typeof parsed));
  }
  return parsed as Record<string, unknown>;
}

export function queryObject(query: URLSearchParams): Record<string, unknown> {
  return Object.fromEntries(query.entries());
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function requireUuidParam(params: Record<string, string>, key: string): string {
  const value = params[key] ?? '';
  if (!isUuid(value)) throw invalid(`params.${key}`, 'Invalid uuid');
  return value;
}

interface StringOptions {
  required?: boolean;
  min?: number;
  max?: number;
  trim?: boolean;
}

/**
 * Collects field issues (zod-style messages) and throws one VALIDATION_ERROR
 * with every problem when `assert()` is called.
 */
export class Validator {
  private readonly issues: FieldIssue[] = [];
  private readonly input: Record<string, unknown>;
  private readonly source: 'body' | 'query';

  constructor(input: Record<string, unknown>, source: 'body' | 'query') {
    this.input = input;
    this.source = source;
  }

  has(key: string): boolean {
    return this.input[key] !== undefined;
  }

  add(key: string, message: string): void {
    this.issues.push({ field: `${this.source}.${key}`, message });
  }

  string(key: string, options: StringOptions = {}): string | undefined {
    const raw = this.input[key];
    if (raw === undefined) {
      if (options.required) this.add(key, 'Required');
      return undefined;
    }
    if (typeof raw !== 'string') {
      this.add(key, `Expected string, received ${raw === null ? 'null' : typeof raw}`);
      return undefined;
    }
    const value = options.trim ? raw.trim() : raw;
    if (options.min !== undefined && value.length < options.min) {
      this.add(key, `String must contain at least ${options.min} character(s)`);
      return undefined;
    }
    if (options.max !== undefined && value.length > options.max) {
      this.add(key, `String must contain at most ${options.max} character(s)`);
      return undefined;
    }
    return value;
  }

  nullableString(key: string, options: StringOptions = {}): string | null | undefined {
    if (this.input[key] === null) return null;
    return this.string(key, options);
  }

  email(key: string, options: { required?: boolean; max?: number } = {}): string | undefined {
    const value = this.string(key, { required: options.required, max: options.max, trim: true });
    if (value === undefined) return undefined;
    if (!EMAIL_PATTERN.test(value)) {
      this.add(key, 'Invalid email');
      return undefined;
    }
    return value.toLowerCase();
  }

  oneOf<T extends string>(
    key: string,
    values: readonly T[],
    options: { required?: boolean } = {},
  ): T | undefined {
    const raw = this.input[key];
    if (raw === undefined) {
      if (options.required) this.add(key, 'Required');
      return undefined;
    }
    if (typeof raw !== 'string' || !(values as readonly string[]).includes(raw)) {
      const expected = values.map((value) => `'${value}'`).join(' | ');
      this.add(key, `Invalid enum value. Expected ${expected}, received '${String(raw)}'`);
      return undefined;
    }
    return raw as T;
  }

  uuid(key: string, options: { required?: boolean } = {}): string | undefined {
    const raw = this.input[key];
    if (raw === undefined) {
      if (options.required) this.add(key, 'Required');
      return undefined;
    }
    if (typeof raw !== 'string' || !isUuid(raw)) {
      this.add(key, 'Invalid uuid');
      return undefined;
    }
    return raw;
  }

  nullableUuid(key: string, options: { required?: boolean } = {}): string | null | undefined {
    if (this.input[key] === null) return null;
    return this.uuid(key, options);
  }

  date(key: string): string | undefined {
    const raw = this.input[key];
    if (raw === undefined) return undefined;
    if (typeof raw !== 'string' || !isValidDateString(raw)) {
      this.add(key, 'Invalid date, expected YYYY-MM-DD');
      return undefined;
    }
    return raw;
  }

  nullableDate(key: string): string | null | undefined {
    if (this.input[key] === null) return null;
    return this.date(key);
  }

  int(key: string, options: { required?: boolean; min?: number; max?: number } = {}): number | undefined {
    const raw = this.input[key];
    if (raw === undefined || raw === '') {
      if (options.required) this.add(key, 'Required');
      return undefined;
    }
    const value = typeof raw === 'string' ? Number(raw) : raw;
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      this.add(key, 'Expected integer');
      return undefined;
    }
    if (options.min !== undefined && value < options.min) {
      this.add(key, `Number must be greater than or equal to ${options.min}`);
      return undefined;
    }
    if (options.max !== undefined && value > options.max) {
      this.add(key, `Number must be less than or equal to ${options.max}`);
      return undefined;
    }
    return value;
  }

  /** For PATCH bodies: at least one of `keys` must be present. */
  requireAny(keys: readonly string[]): void {
    if (!keys.some((key) => this.has(key))) {
      this.issues.push({ field: this.source, message: 'At least one field must be provided' });
    }
  }

  assert(): void {
    if (this.issues.length > 0) {
      throw new MockHttpError(400, 'VALIDATION_ERROR', 'Validation failed', [...this.issues]);
    }
  }
}

/**
 * Narrow a value that `Validator.assert()` has already guaranteed for a
 * required field. Reaching the throw means a handler bug, reported as a 500.
 */
export function defined<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Validated value is unexpectedly missing');
  return value;
}

export function readPagination(validator: Validator): { page: number; limit: number } {
  const page = validator.int('page', { min: 1 }) ?? 1;
  const limit = validator.int('limit', { min: 1, max: 100 }) ?? 20;
  return { page, limit };
}

export function compareText(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}
