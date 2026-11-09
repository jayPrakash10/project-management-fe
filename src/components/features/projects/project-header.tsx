import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getErrorMessage } from '@/api/errors';
import { Avatar } from '@/components/ui/avatar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { TabNav } from '@/components/ui/tab-nav';
import { useDeleteProject } from '@/hooks/use-projects';
import { useToast } from '@/hooks/use-toast';
import { getAvatarTone } from '@/lib/avatar';
import { cn } from '@/lib/cn';
import type { Project, ProjectMember } from '@/types/api';
import { ProjectFormModal } from './project-form-modal';

export interface ProjectHeaderProps {
  project: Project;
  members: ProjectMember[] | undefined;
  canManage: boolean;
}

export function ProjectHeader({ project, members, canManage }: ProjectHeaderProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const deleteProject = useDeleteProject();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const owner = members?.find((member) => member.userId === project.ownerId);
  const base = `/projects/${project.id}`;

  return (
    <div className="border-b border-border bg-surface px-4 pt-5 md:px-6 lg:px-8">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg text-md font-semibold', getAvatarTone(project.name))}
        >
          {project.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight break-words text-fg md:text-2xl">{project.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-muted">
            {owner && (
              <span className="inline-flex items-center gap-1.5">
                <Avatar name={owner.name} size="xs" />
                Owner: {owner.name}
              </span>
            )}
            {members && <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>}
          </div>
          {project.description && <p className="mt-2 line-clamp-2 max-w-3xl text-base text-fg-muted">{project.description}</p>}
        </div>
        {canManage && (
          <DropdownMenu
            label="Project actions"
            trigger={<MoreHorizontal className="size-5" />}
            triggerSize="md"
            items={[
              { label: 'Edit project', icon: <Pencil />, onSelect: () => setEditing(true) },
              { label: 'Delete project', icon: <Trash2 />, tone: 'danger', onSelect: () => setConfirmDelete(true) },
            ]}
          />
        )}
      </div>

      <TabNav
        label="Project views"
        className="mt-4"
        items={[
          { label: 'Overview', to: `${base}/overview` },
          { label: 'List', to: `${base}/list` },
          { label: 'Board', to: `${base}/board` },
          { label: 'Members', to: `${base}/members`, count: members?.length },
        ]}
      />

      <ProjectFormModal open={editing} onClose={() => setEditing(false)} project={project} />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this project?"
        description={
          <>
            <strong className="text-fg">{project.name}</strong> and all of its sections, tasks, comments and activity
            will be permanently deleted. This can’t be undone.
          </>
        }
        confirmLabel="Delete project"
        loading={deleteProject.isPending}
        error={deleteProject.isError ? getErrorMessage(deleteProject.error) : null}
        onCancel={() => {
          setConfirmDelete(false);
          deleteProject.reset();
        }}
        onConfirm={() =>
          deleteProject.mutate(project.id, {
            onSuccess: () => {
              setConfirmDelete(false);
              toast.success(`Project “${project.name}” deleted`);
              navigate('/projects', { replace: true });
            },
          })
        }
      />
    </div>
  );
}
