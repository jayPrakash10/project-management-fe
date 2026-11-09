import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

export type UrlParamUpdates = Record<string, string | number | null | undefined>;

/**
 * Read and write URL search params (filters, sort, page, open task).
 * Empty values are removed so URLs stay short.
 */
export function useUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const get = useCallback((key: string) => searchParams.get(key) ?? undefined, [searchParams]);

  const set = useCallback(
    (updates: UrlParamUpdates, options: { replace?: boolean } = {}) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === undefined || value === '') next.delete(key);
            else next.set(key, String(value));
          }
          return next;
        },
        { replace: options.replace ?? true },
      );
    },
    [setSearchParams],
  );

  /** Update filters and reset pagination to page 1. */
  const setFilters = useCallback((updates: UrlParamUpdates) => set({ ...updates, page: null }), [set]);

  return { searchParams, get, set, setFilters };
}

/** Positive integer page number from the URL. */
export function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
