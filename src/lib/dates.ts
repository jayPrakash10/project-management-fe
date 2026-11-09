/**
 * Date helpers.
 * - Due dates are plain "YYYY-MM-DD" strings and are interpreted in UTC (like the API).
 * - Timestamps are ISO strings and are displayed in the user's local timezone.
 */

/** Today's date in UTC as "YYYY-MM-DD". This is the minimum allowed due date. */
export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseDueDate(dueDate: string): Date {
  return new Date(`${dueDate}T00:00:00Z`);
}

const shortDate = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});
const shortDateWithYear = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "Nov 3", or "Nov 3, 2027" when the year differs from the current one. */
export function formatDueDate(dueDate: string): string {
  const date = parseDueDate(dueDate);
  const sameYear = date.getUTCFullYear() === new Date().getUTCFullYear();
  return (sameYear ? shortDate : shortDateWithYear).format(date);
}

export type DueTone = 'overdue' | 'today' | 'soon' | 'normal';

/** Visual urgency of a due date. `isOverdue` comes from the API and wins. */
export function getDueTone(dueDate: string, isOverdue: boolean): DueTone {
  if (isOverdue) return 'overdue';
  const today = todayUtc();
  if (dueDate === today) return 'today';
  const days = Math.round((parseDueDate(dueDate).getTime() - parseDueDate(today).getTime()) / 86_400_000);
  return days > 0 && days <= 6 ? 'soon' : 'normal';
}

/** Readable due label: "Today", "Tomorrow", or the short date. */
export function describeDueDate(dueDate: string): string {
  const today = todayUtc();
  if (dueDate === today) return 'Today';
  const days = Math.round((parseDueDate(dueDate).getTime() - parseDueDate(today).getTime()) / 86_400_000);
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  return formatDueDate(dueDate);
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** Local date, e.g. "Nov 8, 2026". */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** Local date and time, e.g. "Nov 8, 2026, 6:20 PM". */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

/** "3 hours ago", "yesterday", "just now". */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const absolute = Math.abs(seconds);
  if (absolute < 45) return 'just now';
  for (const [unit, unitSeconds] of UNITS) {
    if (absolute >= unitSeconds) {
      return relativeFormatter.format(Math.round(seconds / unitSeconds), unit);
    }
  }
  return relativeFormatter.format(Math.round(seconds / 60), 'minute');
}
