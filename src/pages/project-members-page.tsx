import { AddMemberForm } from '@/components/features/members/add-member-form';
import { MemberList } from '@/components/features/members/member-list';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/use-auth';
import { useMembers } from '@/hooks/use-members';
import { useProjectOutlet } from '@/hooks/use-project-outlet';

export function ProjectMembersPage() {
  const { project, canManage } = useProjectOutlet();
  const user = useCurrentUser();
  const membersQuery = useMembers(project.id);

  return (
    <PageContainer className="max-w-3xl space-y-5">
      {canManage && (
        <Card className="p-4">
          <AddMemberForm projectId={project.id} />
        </Card>
      )}

      {membersQuery.isPending ? (
        <LoadingRegion label="Loading members" className="space-y-2">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </LoadingRegion>
      ) : membersQuery.isError ? (
        <ErrorState error={membersQuery.error} onRetry={() => void membersQuery.refetch()} />
      ) : (
        <MemberList project={project} members={membersQuery.data} canManage={canManage} currentUserId={user.id} />
      )}

      {!canManage && (
        <p className="text-sm text-fg-subtle">Only the project owner or an admin can add or remove members.</p>
      )}
    </PageContainer>
  );
}
