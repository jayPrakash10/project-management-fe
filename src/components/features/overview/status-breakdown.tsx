import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { STATUS_LABELS, TASK_STATUSES } from '@/lib/constants';
import type { ProjectSummary, TaskStatus } from '@/types/api';

/** Validated categorical slots (dataviz palette check passed in light and dark). */
const fills: Record<TaskStatus, string> = {
  todo: 'bg-status-todo-solid',
  in_progress: 'bg-status-progress-solid',
  in_review: 'bg-status-review-solid',
  done: 'bg-status-done-solid',
};

function percentOf(count: number, total: number) {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

/**
 * Part-to-whole of tasks by status: one stacked bar with 2px surface gaps,
 * a hover tooltip per segment, and a legend that doubles as the data table.
 */
export function StatusBreakdown({ summary }: { summary: ProjectSummary }) {
  const total = summary.totalTasks;
  const segments = TASK_STATUSES.map((status) => ({
    status,
    count: summary.tasksByStatus[status] ?? 0,
  }));
  const description = segments
    .map((segment) => `${STATUS_LABELS[segment.status]} ${segment.count}`)
    .join(', ');

  return (
    <Card className="p-4">
      <h2 className="text-base font-semibold text-fg">Tasks by status</h2>

      {total === 0 ? (
        <p className="mt-3 text-base text-fg-muted">No tasks yet. Add one from the Board or List view.</p>
      ) : (
        <div
          role="img"
          aria-label={`Tasks by status: ${description}.`}
          className="mt-4 flex h-3 w-full gap-0.5 overflow-visible"
        >
          {segments
            .filter((segment) => segment.count > 0)
            .map((segment) => (
              <div
                key={segment.status}
                className={cn('group relative h-full rounded-sm first:rounded-l-full last:rounded-r-full', fills[segment.status])}
                style={{ flexGrow: segment.count, flexBasis: 0 }}
              >
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-md border border-border bg-surface px-2 py-1 text-xs whitespace-nowrap text-fg shadow-md group-hover:block">
                  {STATUS_LABELS[segment.status]}: <strong className="tabular-nums">{segment.count}</strong> (
                  {percentOf(segment.count, total)}%)
                </span>
              </div>
            ))}
        </div>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {segments.map((segment) => (
          <div key={segment.status} className="flex items-center gap-2">
            <span aria-hidden className={cn('size-2.5 shrink-0 rounded-sm', fills[segment.status])} />
            <dt className="text-sm text-fg-muted">{STATUS_LABELS[segment.status]}</dt>
            <dd className="ml-auto text-sm font-semibold text-fg tabular-nums sm:ml-1">
              {segment.count}
              <span className="ml-1 font-normal text-fg-subtle">({percentOf(segment.count, total)}%)</span>
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
