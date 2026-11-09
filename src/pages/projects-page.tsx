import { FolderOpen, Plus, SearchX } from 'lucide-react';
import { useState } from 'react';
import { ProjectCard } from '@/components/features/projects/project-card';
import { ProjectFormModal } from '@/components/features/projects/project-form-modal';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import { useProjects } from '@/hooks/use-projects';
import { parsePage, useUrlParams } from '@/hooks/use-url-params';
import { DEFAULT_PAGE_SIZE, PROJECT_SORT_OPTIONS } from '@/lib/constants';
import type { ProjectListParams } from '@/types/api';

const DEFAULT_SORT = 'createdAt:desc';

function parseProjectSort(value: string | undefined) {
  const match = PROJECT_SORT_OPTIONS.find((option) => option.value === value)?.value ?? DEFAULT_SORT;
  const [sortBy, order] = match.split(':') as [NonNullable<ProjectListParams['sortBy']>, NonNullable<ProjectListParams['order']>];
  return { value: match, sortBy, order };
}

export function ProjectsPage() {
  const user = useCurrentUser();
  const { canCreateProject, isAdmin } = usePermissions();
  const { get, set, setFilters } = useUrlParams();
  const [creating, setCreating] = useState(false);

  const search = get('q') ?? '';
  const sort = parseProjectSort(get('sort'));
  const page = parsePage(get('page'));
  const projectsQuery = useProjects({ page, limit: DEFAULT_PAGE_SIZE, search: search || undefined, sortBy: sort.sortBy, order: sort.order });

  const newProjectButton = canCreateProject && (
    <Button variant="primary" onClick={() => setCreating(true)} leftIcon={<Plus aria-hidden className="size-4" />}>
      New project
    </Button>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Projects"
        description={isAdmin ? 'As an admin you can see every project.' : 'Projects you’re a member of.'}
        actions={newProjectButton}
      />

      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(value) => setFilters({ q: value })}
          label="Search projects by name"
          placeholder="Search projects…"
          className="sm:w-72"
          shortcutTarget
        />
        <Select
          size="sm"
          aria-label="Sort projects"
          options={PROJECT_SORT_OPTIONS}
          value={sort.value}
          onChange={(event) => setFilters({ sort: event.target.value === DEFAULT_SORT ? null : event.target.value })}
          wrapperClassName="sm:w-44"
        />
      </div>

      {projectsQuery.isPending ? (
        <LoadingRegion label="Loading projects" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="space-y-3 rounded-lg border border-border bg-surface p-4">
              <div className="flex gap-3">
                <Skeleton className="size-10 rounded-lg" />
                <Skeleton className="h-5 flex-1" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </LoadingRegion>
      ) : projectsQuery.isError ? (
        <ErrorState error={projectsQuery.error} onRetry={() => void projectsQuery.refetch()} />
      ) : projectsQuery.data.data.length === 0 ? (
        search ? (
          <EmptyState icon={<SearchX />} title="No projects match your search" description={`Nothing found for “${search}”.`} />
        ) : (
          <EmptyState
            icon={<FolderOpen />}
            title="You’re not in any projects yet"
            description={
              canCreateProject ? (
                'Create your first project to start organizing work.'
              ) : (
                <>
                  Ask a project owner to add you using your email: <strong className="text-fg">{user.email}</strong>
                </>
              )
            }
            action={newProjectButton}
          />
        )
      ) : (
        <>
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-busy={projectsQuery.isFetching}>
            {projectsQuery.data.data.map((project) => (
              <ProjectCard key={project.id} project={project} isOwner={project.ownerId === user.id} />
            ))}
          </ul>
          <Pagination
            className="mt-6"
            page={page}
            totalPages={projectsQuery.data.meta.totalPages}
            onPageChange={(next) => set({ page: next }, { replace: false })}
          />
        </>
      )}

      <ProjectFormModal open={creating} onClose={() => setCreating(false)} />
    </PageContainer>
  );
}
