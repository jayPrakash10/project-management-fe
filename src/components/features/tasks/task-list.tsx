import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';
import { groupTasksBySection } from '@/lib/tasks';
import type { Section, Task, TaskSortBy } from '@/types/api';
import { StatusToggle } from './status-toggle';
import { DueDateLabel, PriorityBadge, StatusBadge } from './task-badges';

const rowGrid = 'md:grid md:grid-cols-[1.5rem_minmax(0,1fr)_10rem_7rem_6.5rem_7rem] md:items-center md:gap-3';

export interface TaskListProps {
  sections: Section[];
  tasks: Task[];
  sortValue: string;
  onSortChange: (value: string) => void;
  onOpenTask: (taskId: string) => void;
}

function SortButton({ label, sortBy, sortValue, onSortChange }: { label: string; sortBy: TaskSortBy; sortValue: string; onSortChange: (value: string) => void }) {
  const [currentBy, currentOrder] = sortValue.split(':');
  const active = currentBy === sortBy;
  const nextOrder = active && currentOrder === 'asc' ? 'desc' : 'asc';
  const Icon = !active ? ArrowUpDown : currentOrder === 'asc' ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onSortChange(`${sortBy}:${nextOrder}`)}
      aria-label={`Sort by ${label.toLowerCase()}, ${nextOrder === 'asc' ? 'ascending' : 'descending'}`}
      className={cn('inline-flex items-center gap-1 rounded px-1 hover:text-fg', active && 'text-fg')}
    >
      {label}
      <Icon aria-hidden className="size-3.5" />
    </button>
  );
}

function TaskRow({ task, onOpen }: { task: Task; onOpen: (taskId: string) => void }) {
  return (
    <li className={cn('group relative flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-surface-2/60', rowGrid)}>
      <div className="flex items-start gap-3 md:contents">
        <StatusToggle task={task} className="mt-0.5 md:mt-0" />
        <button
          type="button"
          onClick={() => onOpen(task.id)}
          className={cn(
            'min-w-0 text-left text-base font-medium break-words after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent',
            task.status === 'done' ? 'text-fg-muted line-through' : 'text-fg',
          )}
        >
          {task.title}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-8 md:contents">
        <span className="flex min-w-0 items-center gap-2 text-sm text-fg-muted">
          <Avatar name={task.assigneeName} size="sm" />
          <span className="truncate">{task.assigneeName ?? 'Unassigned'}</span>
        </span>
        <span>{task.dueDate ? <DueDateLabel dueDate={task.dueDate} isOverdue={task.isOverdue} /> : <span className="hidden text-sm text-fg-subtle md:inline">—</span>}</span>
        <span>
          <PriorityBadge priority={task.priority} />
        </span>
        <span>
          <StatusBadge status={task.status} />
        </span>
      </div>
    </li>
  );
}

/** Rows grouped by section (collapsible), with sortable column headers on desktop. */
export function TaskList({ sections, tasks, sortValue, onSortChange, onOpenTask }: TaskListProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const groups = groupTasksBySection(sections, tasks);

  function toggle(key: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
      <div className={cn('hidden border-b border-border bg-surface-2 px-4 py-2 text-sm font-medium text-fg-muted', rowGrid)} aria-hidden={false}>
        <span />
        <span>Task</span>
        <span>Assignee</span>
        <SortButton label="Due date" sortBy="dueDate" sortValue={sortValue} onSortChange={onSortChange} />
        <SortButton label="Priority" sortBy="priority" sortValue={sortValue} onSortChange={onSortChange} />
        <span>Status</span>
      </div>

      {groups.map((group) => {
        const key = group.section?.id ?? 'none';
        const isCollapsed = collapsed.has(key);
        const regionId = `list-group-${key}`;
        return (
          <section key={key} aria-labelledby={`${regionId}-heading`} className="border-b border-border last:border-b-0">
            <h2 id={`${regionId}-heading`}>
              <button
                type="button"
                aria-expanded={!isCollapsed}
                aria-controls={regionId}
                onClick={() => toggle(key)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-base font-semibold text-fg hover:bg-surface-2"
              >
                <ChevronDown aria-hidden className={cn('size-4 text-fg-muted transition-transform', isCollapsed && '-rotate-90')} />
                <span className={cn(!group.section && 'text-fg-muted italic')}>{group.section?.name ?? 'No section'}</span>
                <span className="rounded-full bg-surface-3 px-2 text-xs leading-5 font-medium text-fg-muted tabular-nums">
                  {group.tasks.length}
                </span>
              </button>
            </h2>
            {!isCollapsed && (
              <div id={regionId}>
                {group.tasks.length === 0 ? (
                  <p className="px-4 pb-3 pl-10 text-sm text-fg-subtle">No tasks in this section.</p>
                ) : (
                  <ul className="divide-y divide-border border-t border-border">
                    {group.tasks.map((task) => (
                      <TaskRow key={task.id} task={task} onOpen={onOpenTask} />
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
