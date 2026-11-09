import { isAxiosError } from 'axios';
import type { ApiErrorBody } from '@/types/api';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_JSON'
  | 'INVALID_REFERENCE'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | (string & {});

export interface FieldError {
  /** Field name with the `body.` / `query.` / `params.` prefix removed. */
  field: string;
  message: string;
}

/** The single error type every API call rejects with. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fieldErrors: FieldError[];

  constructor(status: number, code: ApiErrorCode, message: string, fieldErrors: FieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  get isNetworkError() {
    return this.code === 'NETWORK_ERROR';
  }
}

const FIELD_PREFIX = /^(body|query|params)\./;

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiErrorBody).error?.message === 'string'
  );
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    const response = error.response;
    if (!response) {
      return new ApiError(
        0,
        'NETWORK_ERROR',
        'Can’t reach the server. Check your connection and try again.',
      );
    }
    if (isApiErrorBody(response.data)) {
      const { code, message, details } = response.data.error;
      const fieldErrors = (details ?? []).map((d) => ({
        field: d.field.replace(FIELD_PREFIX, ''),
        message: d.message,
      }));
      return new ApiError(response.status, code, message, fieldErrors);
    }
    return new ApiError(response.status, 'INTERNAL_ERROR', 'Something went wrong, try again.');
  }

  return new ApiError(0, 'INTERNAL_ERROR', 'Something went wrong, try again.');
}

/** A human-readable message for any thrown value. */
export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}

export function isApiError(error: unknown, status?: number): error is ApiError {
  return error instanceof ApiError && (status === undefined || error.status === status);
}
