/** Date helpers for the mock API. All calendar dates are UTC "YYYY-MM-DD" strings. */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysUtc(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

/** A due date `days` from today (negative = in the past). */
export function dueInDays(days: number): string {
  return addDaysUtc(todayUtc(), days);
}

/** An ISO timestamp `days` (plus optional `hours`) before now. */
export function isoDaysAgo(days: number, hours = 0): string {
  return new Date(Date.now() - days * DAY_MS - hours * 3_600_000).toISOString();
}

export function isValidDateString(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
