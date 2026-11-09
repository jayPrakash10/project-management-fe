import { ActivityFeed } from '@/components/features/overview/activity-feed';
import { StatusBreakdown } from '@/components/features/overview/status-breakdown';
import { SummaryStats } from '@/components/features/overview/summary-stats';
import { PageContainer } from '@/components/layout/page-container';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';
import { useProjectOutlet } from '@/hooks/use-project-outlet';
import { useProjectSummary } from '@/hooks/use-reports';

/** Project dashboard: summary report and the activity timeline. */
export function ProjectOverviewPage() {
  const { project, members } = useProjectOutlet();
  const summary = useProjectSummary(project.id);

  return (
    <PageContainer wide className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem] xl:items-start">
      <div className="space-y-4">
        {summary.isPending ? (
          <LoadingRegion label="Loading summary" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-28 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-32 rounded-lg" />
          </LoadingRegion>
        ) : summary.isError ? (
          <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />
        ) : (
          <>
            <SummaryStats summary={summary.data} />
            <StatusBreakdown summary={summary.data} />
          </>
        )}
      </div>
      <ActivityFeed projectId={project.id} members={members} />
    </PageContainer>
  );
}
