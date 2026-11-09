import { History } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';
import { useMemberNames } from '@/hooks/use-members';
import { useProjectActivity } from '@/hooks/use-reports';
import { useTaskPane } from '@/hooks/use-task-pane';
import { activityHasOpenableTask, describeActivity } from '@/lib/activity-text';
import { formatDateTime, formatRelative } from '@/lib/dates';
import type { ActivityLog, ProjectMember } from '@/types/api';

function ActivityItem({ log, nameFor, onOpenTask }: { log: ActivityLog; nameFor: (id: string) => string | null; onOpenTask: (id: string) => void }) {
  const text = describeActivity(log, nameFor);
  return (
    <li className="flex gap-3 py-3">
      <Avatar name={log.actorName} size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-base break-words text-fg">
          <strong className="font-semibold">{log.actorName}</strong> {text}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-fg-subtle">
          <time dateTime={log.createdAt} title={formatDateTime(log.createdAt)}>
            {formatRelative(log.createdAt)}
          </time>
          {activityHasOpenableTask(log) && log.taskId && (
            <button type="button" onClick={() => onOpenTask(log.taskId as string)} className="font-medium text-accent hover:underline">
              View task
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/** Newest first, 20 at a time with "Load more". Names in details are resolved via the members list. */
export function ActivityFeed({ projectId, members }: { projectId: string; members: ProjectMember[] | undefined }) {
  const activity = useProjectActivity(projectId);
  const nameFor = useMemberNames(members);
  const { openTask } = useTaskPane();

  return (
    <Card className="p-4">
      <h2 className="text-base font-semibold text-fg">Recent activity</h2>

      {activity.isPending && (
        <LoadingRegion label="Loading activity" className="mt-2 space-y-4 py-2">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </LoadingRegion>
      )}

      {activity.isError && <ErrorState compact error={activity.error} onRetry={() => void activity.refetch()} />}

      {activity.data &&
        (activity.data.pages[0].data.length === 0 ? (
          <EmptyState compact icon={<History />} title="No activity yet" />
        ) : (
          <>
            <ol className="mt-1 divide-y divide-border">
              {activity.data.pages.flatMap((page) =>
                page.data.map((log) => <ActivityItem key={log.id} log={log} nameFor={nameFor} onOpenTask={openTask} />),
              )}
            </ol>
            {activity.hasNextPage && (
              <Button
                size="sm"
                className="mt-2 w-full"
                loading={activity.isFetchingNextPage}
                onClick={() => void activity.fetchNextPage()}
              >
                Load more
              </Button>
            )}
          </>
        ))}
    </Card>
  );
}
