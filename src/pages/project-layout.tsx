import { ArrowLeft } from 'lucide-react';
import { Link, Outlet, useParams } from 'react-router';
import { ProjectHeader } from '@/components/features/projects/project-header';
import { PageContainer } from '@/components/layout/page-container';
import { buttonStyles } from '@/components/ui/button-styles';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';
import { useMembers } from '@/hooks/use-members';
import { usePermissions } from '@/hooks/use-permissions';
import type { ProjectOutletContext } from '@/hooks/use-project-outlet';
import { useProject } from '@/hooks/use-projects';

/** Loads the project once and shares it with every tab. 403 → "no access" state. */
export function ProjectLayout() {
  const { projectId = '' } = useParams();
  const projectQuery = useProject(projectId);
  const membersQuery = useMembers(projectId);
  const { canManageProject } = usePermissions(projectQuery.data);

  if (projectQuery.isPending) {
    return (
      <LoadingRegion label="Loading project" className="border-b border-border bg-surface px-4 pt-5 pb-4 md:px-6 lg:px-8">
        <div className="flex gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-64 max-w-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="mt-5 flex gap-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-5 w-16" />
          ))}
        </div>
      </LoadingRegion>
    );
  }

  if (projectQuery.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={projectQuery.error}
          onRetry={() => void projectQuery.refetch()}
          forbiddenTitle="You don’t have access to this project"
          notFoundTitle="Project not found"
          action={
            <Link to="/projects" className={buttonStyles({ size: 'sm' })}>
              <ArrowLeft aria-hidden className="size-4" />
              Back to projects
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const context: ProjectOutletContext = {
    project: projectQuery.data,
    members: membersQuery.data,
    canManage: canManageProject,
  };

  return (
    <div className="flex flex-1 flex-col">
      <ProjectHeader project={projectQuery.data} members={membersQuery.data} canManage={canManageProject} />
      <Outlet context={context} />
    </div>
  );
}
