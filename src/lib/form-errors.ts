import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { toApiError } from '@/api/errors';

/**
 * Map an API error onto react-hook-form fields.
 * Field errors whose names match `fields` are shown inline; anything else is
 * returned as a form-level message (or null when every error was placed).
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): string | null {
  const apiError = toApiError(error);
  let unplaced = false;

  for (const fieldError of apiError.fieldErrors) {
    const field = fields.find((name) => name === fieldError.field);
    if (field) {
      setError(field, { type: 'server', message: fieldError.message });
    } else {
      unplaced = true;
    }
  }

  if (apiError.fieldErrors.length > 0 && !unplaced) return null;
  return apiError.message;
}
