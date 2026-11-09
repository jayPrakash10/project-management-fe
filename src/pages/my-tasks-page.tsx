import { CalendarCheck, CircleCheckBig, FolderOpen, PartyPopper } from 'lucide-react';
import { useMemo } from 'react';
import { MyTaskRow } from '@/components/features/my-tasks/my-task-row';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';
import { TabNav } from '@/components/ui/tab-nav';
import { useCurrentUser } from '@/hooks/use-auth';
import { useProjectLookup } from '@/hooks/use-projects';
import { useTaskPane } from '@/hooks/use-task-pane';
import { useMyOpenTasks, useMyOverdueCount, useMyTasksPage } from '@/hooks/use-tasks';
import { parsePage, useUrlParams } from '@/hooks/use-url-params';
import { DEFAULT_PAGE_SIZE, PRIORITY_LABELS, TASK_PRIORITIES, TASK_SORT_OPTIONS, isTaskPriority, parseTaskSort } from '@/lib/constants';
import type { MyTaskListParams, Task } from '@/types/api';

type Tab = 'overdue' | 'today' | 'week' | 'open' | 'completed';

const TABS: { value: Tab; label: string; empty: string }[] = [
  { value: 'overdue', label: 'Overdue', empty: 'Nothing overdue. Nice work!' },
  { value: 'today', label: 'Today', empty: 'Nothing due today.' },
  { value: 'week', label: 'This week', empty: 'Nothing due in the next 7 days.' },
  { value: 'open', label: 'All open', empty: 'You have no open tasks.' },
  { value: 'completed', label: 'Completed', empty: 'No completed tasks yet.' },
];

const TAB_PARAMS: Record<Exclude<Tab, 'open'>, Partial<MyTaskListParams>> = {
  overdue: { dueStatus: 'overdue' },
  today: { dueStatus: 'due_today' },
  week: { dueStatus: 'due_this_week' },
  completed: { status: 'done' },
};

function isTab(value: string | undefined): value is Tab {
  return TABS.some((tab) => tab.value === value);
}

const priorityOptions = TASK_PRIORITIES.map((value) => ({ value, label: PRIORITY_LABELS[value] }));

/** Home screen: tasks assigned to me across all projects (GET /me/tasks). */
export function MyTasksPage() {
  const user = useCurrentUser();
  const { get, set, setFilters, searchParams } = useUrlParams();
  const { openTask } = useTaskPane();
  const projectsQuery = useProjectLookup();
  const overdueCount = useMyOverdueCount();

  const rawTab = get('tab');
  // Default tab: Overdue when there is something overdue, otherwise This week.
  const tab: Tab | null = isTab(rawTab) ? rawTab : overdueCount.isPending ? null : (overdueCount.data ?? 0) > 0 ? 'overdue' : 'week';

  const defaultSort = tab === 'completed' ? 'createdAt:desc' : 'dueDate:asc';
  const sort = parseTaskSort(get('sort'), defaultSort);
  const projectId = get('project');
  const rawPriority = get('priority');
  const search = get('q') ?? '';
  const page = parsePage(get('page'));

  const baseParams = useMemo(
    () => ({
      projectId: projectId || undefined,
      priority: isTaskPriority(rawPriority) ? rawPriority : undefined,
      search: search || undefined,
      sortBy: sort.sortBy,
      order: sort.order,
    }),
    [projectId, rawPriority, search, sort.sortBy, sort.order],
  );

  const pagedParams: MyTaskListParams = {
    ...baseParams,
    ...(tab && tab !== 'open' ? TAB_PARAMS[tab] : {}),
    page,
    limit: DEFAULT_PAGE_SIZE,
  };

  const pagedQuery = useMyTasksPage(pagedParams, tab !== null && tab !== 'open');
  const openQuery = useMyOpenTasks(baseParams, tab === 'open');
  const activeQuery = tab === 'open' ? openQuery : pagedQuery;

  const projectNames = useMemo(
    () => new Map((projectsQuery.data ?? []).map((project) => [project.id, project.name])),
    [projectsQuery.data],
  );
  const projectOptions = (projectsQuery.data ?? []).map((project) => ({ value: project.id, label: project.name }));

  const tasks: Task[] | undefined = tab === 'open' ? openQuery.data : pagedQuery.data?.data;
  const totalPages = tab === 'open' ? 1 : (pagedQuery.data?.meta.totalPages ?? 1);
  const emptyText = TABS.find((item) => item.value === tab)?.empty ?? '';
  const hasFilters = Boolean(baseParams.projectId || baseParams.priority || baseParams.search);

  function tabLink(value: Tab) {
    const next = new URLSearchParams(searchParams);
    next.set('tab', value);
    next.delete('page');
    next.delete('sort');
    return `?${next.toString()}`;
  }

  const noProjects = projectsQuery.data?.length === 0;

  return (
    <PageContainer>
      <PageHeader title="My Tasks" description="Everything assigned to you, across all your projects." />

      {noProjects ? (
        <EmptyState
          icon={<FolderOpen />}
          title="You’re not in any projects yet"
          description={
            <>
              Ask a project owner to add you using your email: <strong className="text-fg">{user.email}</strong>
            </>
          }
        />
      ) : (
        <>
          <TabNav
            label="Task views"
            className="border-b border-border"
            items={TABS.map((item) => ({
              label: item.label,
              to: tabLink(item.value),
              isActive: tab === item.value,
              count: item.value === 'overdue' ? overdueCount.data : undefined,
              countTone: 'danger' as const,
            }))}
          />

          <div className="my-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <SearchInput
              value={search}
              onChange={(value) => setFilters({ q: value })}
              label="Search my tasks by title"
              placeholder="Search my tasks…"
              className="sm:w-64"
              shortcutTarget
            />
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Select
                size="sm"
                aria-label="Filter by project"
                placeholderOption="All projects"
                options={projectOptions}
                value={projectId ?? ''}
                onChange={(event) => setFilters({ project: event.target.value })}
                wrapperClassName="sm:w-48"
              />
              <Select
                size="sm"
                aria-label="Filter by priority"
                placeholderOption="Any priority"
                options={priorityOptions}
                value={baseParams.priority ?? ''}
                onChange={(event) => setFilters({ priority: event.target.value })}
                wrapperClassName="sm:w-36"
              />
              <Select
                size="sm"
                aria-label="Sort tasks"
                options={TASK_SORT_OPTIONS}
                value={sort.value}
                onChange={(event) => setFilters({ sort: event.target.value === defaultSort ? null : event.target.value })}
                wrapperClassName="col-span-2 sm:w-52"
              />
            </div>
          </div>

          {tab === null || activeQuery.isPending ? (
            <LoadingRegion label="Loading tasks" className="overflow-hidden rounded-lg border border-border bg-surface">
              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0">
                  <Skeleton className="size-5 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="hidden h-4 w-48 md:block" />
                </div>
              ))}
            </LoadingRegion>
          ) : activeQuery.isError ? (
            <ErrorState error={activeQuery.error} onRetry={() => void activeQuery.refetch()} />
          ) : tasks && tasks.length > 0 ? (
            <>
              <ul
                aria-label={`${TABS.find((item) => item.value === tab)?.label} tasks`}
                aria-busy={activeQuery.isFetching}
                className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface shadow-xs"
              >
                {tasks.map((task) => (
                  <MyTaskRow key={task.id} task={task} projectName={projectNames.get(task.projectId)} onOpen={openTask} />
                ))}
              </ul>
              {tab === 'open' && (
                <p className="mt-3 text-sm text-fg-subtle">
                  {tasks.length} open {tasks.length === 1 ? 'task' : 'tasks'}
                </p>
              )}
              <Pagination className="mt-4" page={page} totalPages={totalPages} onPageChange={(next) => set({ page: next }, { replace: false })} />
            </>
          ) : (
            <EmptyState
              icon={tab === 'completed' ? <CircleCheckBig /> : tab === 'overdue' ? <PartyPopper /> : <CalendarCheck />}
              title={hasFilters ? 'No tasks match these filters' : emptyText}
              description={hasFilters ? 'Try a different project, priority or search term.' : undefined}
            />
          )}
        </>
      )}
    </PageContainer>
  );
}
