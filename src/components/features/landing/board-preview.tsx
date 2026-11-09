import { MessageSquare } from 'lucide-react';
import { DueDateLabel, PriorityBadge, StatusBadge } from '@/components/features/tasks/task-badges';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';
import { todayUtc } from '@/lib/dates';
import type { TaskPriority, TaskStatus } from '@/types/api';

/** "YYYY-MM-DD" offset from today (UTC), so the preview's due labels always read naturally. */
function dayOffset(days: number): string {
  const date = new Date(`${todayUtc()}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

interface PreviewCard {
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  due: number | null;
  overdue?: boolean;
  assignee: string | null;
}

const COLUMNS: { name: string; cards: PreviewCard[] }[] = [
  {
    name: 'To Do',
    cards: [
      { title: 'Write launch announcement', priority: 'high', status: 'todo', due: 3, assignee: 'Sara Lindqvist' },
      { title: 'Collect beta feedback', priority: 'medium', status: 'todo', due: null, assignee: null },
    ],
  },
  {
    name: 'In Progress',
    cards: [
      { title: 'Design new homepage hero', priority: 'urgent', status: 'in_progress', due: -1, overdue: true, assignee: 'Priya Sharma' },
      { title: 'Review pricing page copy', priority: 'medium', status: 'in_review', due: 0, assignee: 'Leo Martins' },
    ],
  },
  {
    name: 'Done',
    cards: [{ title: 'Choose typography', priority: 'low', status: 'done', due: -4, assignee: 'Maya Rivera' }],
  },
];

function Card({ card }: { card: PreviewCard }) {
  const done = card.status === 'done';
  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-xs">
      <div className="flex items-start gap-2">
        <span
          className={cn(
            'mt-0.5 size-4 shrink-0 rounded-full border',
            done ? 'border-status-done-fg bg-status-done-fg' : 'border-border-strong',
          )}
        />
        <p className={cn('text-sm font-medium', done ? 'text-fg-muted line-through' : 'text-fg')}>{card.title}</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
        <PriorityBadge priority={card.priority} />
        <StatusBadge status={card.status} />
      </div>
      <div className="mt-2 flex min-h-6 items-center justify-between pl-6">
        <DueDateLabel dueDate={card.due === null ? null : dayOffset(card.due)} isOverdue={Boolean(card.overdue)} />
        <Avatar name={card.assignee} size="sm" className="ml-auto" />
      </div>
    </div>
  );
}

/** Decorative, static recreation of the board view built from the app's real badge components. */
export function BoardPreview() {
  return (
    <figure className="relative">
      <figcaption className="sr-only">
        Preview of a TaskFlow board with To Do, In Progress and Done columns, and a task comment thread.
      </figcaption>
      <div aria-hidden className="overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="flex size-6 items-center justify-center rounded bg-avatar-3-bg text-xs font-semibold text-avatar-3-fg">W</span>
          <span className="text-sm font-semibold text-fg">Website Redesign</span>
          <span className="ml-3 hidden gap-4 text-xs text-fg-muted sm:flex">
            <span>Overview</span>
            <span>List</span>
            <span className="border-b-2 border-accent pb-0.5 font-medium text-fg">Board</span>
            <span>Members</span>
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 bg-bg p-3 sm:grid-cols-3">
          {COLUMNS.map((column, index) => (
            <div key={column.name} className={cn('rounded-lg bg-surface-2 p-2', index > 0 && 'hidden sm:block')}>
              <p className="mb-2 flex items-center gap-1.5 px-1 text-sm font-semibold text-fg">
                {column.name}
                <span className="rounded-full bg-surface-3 px-1.5 text-xs text-fg-muted">{column.cards.length}</span>
              </p>
              <div className="space-y-2">
                {column.cards.map((card) => (
                  <Card key={card.title} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden
        className="absolute -right-4 -bottom-8 hidden w-72 rounded-xl border border-border bg-surface p-3 shadow-lg lg:block xl:-right-10"
      >
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-fg-muted">
          <MessageSquare className="size-3.5" /> Comments
        </p>
        <div className="flex gap-2">
          <Avatar name="Maya Rivera" size="sm" />
          <div>
            <p className="text-xs font-medium text-fg">
              Maya Rivera <span className="font-normal text-fg-subtle">just now</span>
            </p>
            <p className="text-sm text-fg">Hero mockups look great. Moving this to review.</p>
          </div>
        </div>
      </div>
    </figure>
  );
}
