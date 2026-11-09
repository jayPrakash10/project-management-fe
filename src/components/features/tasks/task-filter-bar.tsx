import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import type { useTaskFilters } from '@/hooks/use-task-filters';
import { cn } from '@/lib/cn';
import {
  DUE_STATUSES,
  DUE_STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_SORT_OPTIONS,
  TASK_STATUSES,
} from '@/lib/constants';
import type { ProjectMember } from '@/types/api';

export interface TaskFilterBarProps {
  state: ReturnType<typeof useTaskFilters>;
  members: ProjectMember[];
  className?: string;
}

const statusOptions = TASK_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }));
const priorityOptions = TASK_PRIORITIES.map((value) => ({ value, label: PRIORITY_LABELS[value] }));
const dueOptions = DUE_STATUSES.map((value) => ({ value, label: DUE_STATUS_LABELS[value] }));

/** Toolbar filters mapped 1:1 to the task list query params. Collapses behind a button on mobile. */
export function TaskFilterBar({ state, members, className }: TaskFilterBarProps) {
  const { filters, search, sortValue, activeCount, setFilters, setSort, clear } = state;
  const [expanded, setExpanded] = useState(false);
  const assigneeOptions = members.map((member) => ({ value: member.userId, label: member.name }));
  const selectActiveCount = activeCount - (filters.search ? 1 : 0);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <SearchInput
          value={search}
          onChange={(value) => setFilters({ q: value })}
          label="Search tasks by title"
          placeholder="Search tasks…"
          className="min-w-0 flex-1 md:max-w-64"
          shortcutTarget
        />
        <Button
          className="md:hidden"
          aria-expanded={expanded}
          aria-controls="task-filters-mobile"
          onClick={() => setExpanded((value) => !value)}
          leftIcon={<SlidersHorizontal aria-hidden className="size-4" />}
        >
          Filters{selectActiveCount > 0 ? ` (${selectActiveCount})` : ''}
        </Button>

        <div className="hidden flex-1 flex-wrap items-center gap-2 md:flex">
          {renderControls()}
        </div>
      </div>

      {expanded && (
        <div id="task-filters-mobile" className="grid grid-cols-2 gap-2 md:hidden">
          {renderControls()}
        </div>
      )}
    </div>
  );

  function renderControls() {
    return (
      <>
        <Select
          size="sm"
          aria-label="Filter by status"
          placeholderOption="Any status"
          options={statusOptions}
          value={filters.status ?? ''}
          onChange={(event) => setFilters({ status: event.target.value })}
          wrapperClassName="md:w-36"
        />
        <Select
          size="sm"
          aria-label="Filter by priority"
          placeholderOption="Any priority"
          options={priorityOptions}
          value={filters.priority ?? ''}
          onChange={(event) => setFilters({ priority: event.target.value })}
          wrapperClassName="md:w-36"
        />
        <Select
          size="sm"
          aria-label="Filter by assignee"
          placeholderOption="Any assignee"
          options={assigneeOptions}
          value={filters.assigneeId ?? ''}
          onChange={(event) => setFilters({ assignee: event.target.value })}
          wrapperClassName="md:w-40"
        />
        <Select
          size="sm"
          aria-label="Filter by due date"
          placeholderOption="Any due date"
          options={dueOptions}
          value={filters.dueStatus ?? ''}
          onChange={(event) => setFilters({ due: event.target.value })}
          wrapperClassName="md:w-36"
        />
        <Select
          size="sm"
          aria-label="Sort tasks"
          options={TASK_SORT_OPTIONS}
          value={sortValue}
          onChange={(event) => setSort(event.target.value)}
          wrapperClassName="md:w-48"
        />
        {activeCount > 0 && (
          <Button size="sm" variant="ghost" onClick={clear} leftIcon={<X aria-hidden className="size-4" />}>
            Clear filters
          </Button>
        )}
      </>
    );
  }
}
