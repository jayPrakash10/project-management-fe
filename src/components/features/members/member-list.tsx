import { UserMinus } from 'lucide-react';
import { useState } from 'react';
import { getErrorMessage } from '@/api/errors';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useRemoveMember } from '@/hooks/use-members';
import { useToast } from '@/hooks/use-toast';
import { ROLE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/dates';
import type { Project, ProjectMember } from '@/types/api';

export interface MemberListProps {
  project: Project;
  members: ProjectMember[];
  canManage: boolean;
  currentUserId: string;
}

export function MemberList({ project, members, canManage, currentUserId }: MemberListProps) {
  const removeMember = useRemoveMember(project.id);
  const toast = useToast();
  const [pending, setPending] = useState<ProjectMember | null>(null);

  return (
    <>
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
        {members.map((member) => {
          const isOwner = member.userId === project.ownerId;
          return (
            <li key={member.userId} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Avatar name={member.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium text-fg">
                  <span className="truncate">{member.name}</span>
                  {member.userId === currentUserId && <span className="text-sm font-normal text-fg-subtle">(you)</span>}
                  {isOwner && <Badge tone="accent">Owner</Badge>}
                </p>
                <p className="truncate text-sm text-fg-muted">{member.email}</p>
              </div>
              <div className="flex items-center gap-3 sm:ml-auto">
                <Badge tone="outline" title="Global role">
                  {ROLE_LABELS[member.role]}
                </Badge>
                <span className="hidden text-sm text-fg-subtle md:inline">Joined {formatDate(member.joinedAt)}</span>
                {canManage && !isOwner && (
                  <Button
                    size="sm"
                    variant="danger-ghost"
                    onClick={() => setPending(member)}
                    leftIcon={<UserMinus aria-hidden className="size-4" />}
                    aria-label={`Remove ${member.name} from the project`}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={pending !== null}
        title={`Remove ${pending?.name ?? 'member'}?`}
        description="They’ll lose access to this project. Their unfinished tasks here will be unassigned."
        confirmLabel="Remove member"
        loading={removeMember.isPending}
        error={removeMember.isError ? getErrorMessage(removeMember.error) : null}
        onCancel={() => {
          setPending(null);
          removeMember.reset();
        }}
        onConfirm={() => {
          if (!pending) return;
          removeMember.mutate(pending.userId, {
            onSuccess: () => {
              toast.success(`${pending.name} removed`, { description: 'Their open tasks are now unassigned.' });
              setPending(null);
            },
          });
        }}
      />
    </>
  );
}
