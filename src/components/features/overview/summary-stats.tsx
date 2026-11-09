import { CircleAlert, CircleCheck, ListTodo } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import type { ProjectSummary } from '@/types/api';

function StatTile({ label, value, icon, children, tone = 'neutral' }: { label: string; value: ReactNode; icon: ReactNode; children?: ReactNode; tone?: 'neutral' | 'danger' }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-fg-muted">
        <span aria-hidden className={cn('[&>svg]:size-4', tone === 'danger' ? 'text-danger-soft-fg' : 'text-fg-subtle')}>
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-fg tabular-nums">{value}</p>
      {children}
    </Card>
  );
}

/** Three headline numbers: total, % complete (with a progress bar) and overdue. */
export function SummaryStats({ summary }: { summary: ProjectSummary }) {
  const percent = Math.min(100, Math.max(0, summary.completionPercentage));
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatTile label="Total tasks" value={summary.totalTasks} icon={<ListTodo />}>
        <p className="mt-1 text-sm text-fg-subtle">{summary.tasksByStatus.done} completed</p>
      </StatTile>

      <StatTile label="Complete" value={`${percent}%`} icon={<CircleCheck />}>
        <div
          role="progressbar"
          aria-label="Project completion"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3"
        >
          <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${percent}%` }} />
        </div>
      </StatTile>

      <StatTile
        label="Overdue"
        value={summary.overdueTasks}
        icon={<CircleAlert />}
        tone={summary.overdueTasks > 0 ? 'danger' : 'neutral'}
      >
        <p className={cn('mt-1 text-sm', summary.overdueTasks > 0 ? 'text-danger-soft-fg' : 'text-fg-subtle')}>
          {summary.overdueTasks > 0 ? 'Past due and not done' : 'Nothing overdue'}
        </p>
      </StatTile>
    </div>
  );
}
