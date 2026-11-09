import { FolderKanban, ListChecks, Plus, Users } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router';
import { ProjectFormModal } from '@/components/features/projects/project-form-modal';
import { usePermissions } from '@/hooks/use-permissions';
import { useProjectLookup } from '@/hooks/use-projects';
import { getAvatarTone } from '@/lib/avatar';
import { cn } from '@/lib/cn';
import { Logo } from './logo';

function SidebarLink({ to, icon, children }: { to: string; icon: ReactNode; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'relative flex h-9 items-center gap-3 rounded-md px-3 text-base font-medium transition-colors',
          'focus-visible:outline-sidebar-accent',
          isActive
            ? 'bg-sidebar-active text-sidebar-fg before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-sidebar-accent'
            : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg',
        )
      }
    >
      <span aria-hidden className="[&>svg]:size-4">
        {icon}
      </span>
      {children}
    </NavLink>
  );
}

function ProjectLinks() {
  const { data: projects, isPending, isError, refetch } = useProjectLookup();
  const { pathname } = useLocation();

  if (isPending) {
    return (
      <div className="space-y-2 px-3 py-1" aria-hidden>
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-5 animate-pulse rounded bg-sidebar-hover" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="px-3 text-sm text-sidebar-muted">
        Couldn’t load projects.{' '}
        <button type="button" className="underline hover:text-sidebar-fg" onClick={() => void refetch()}>
          Retry
        </button>
      </p>
    );
  }

  if (projects.length === 0) {
    return <p className="px-3 text-sm text-sidebar-muted">No projects yet</p>;
  }

  return (
    <ul className="space-y-0.5">
      {projects.map((project) => {
        const active = pathname.startsWith(`/projects/${project.id}`);
        return (
          <li key={project.id}>
            <NavLink
              to={`/projects/${project.id}/board`}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-8 items-center gap-2.5 rounded-md px-3 text-sm transition-colors focus-visible:outline-sidebar-accent',
                active
                  ? 'bg-sidebar-active text-sidebar-fg'
                  : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded text-xs font-semibold',
                  getAvatarTone(project.name),
                )}
              >
                {project.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{project.name}</span>
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}

/** Dark navigation rail (both themes), shown fixed on desktop and in a drawer on mobile. */
export function Sidebar() {
  const { isAdmin, canCreateProject } = usePermissions();
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-fg">
      <div className="flex h-14 shrink-0 items-center px-5">
        <Logo tone="sidebar" />
      </div>

      <nav aria-label="Main" className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 pt-2 pb-6">
        <ul className="space-y-0.5">
          <li>
            <SidebarLink to="/my-tasks" icon={<ListChecks />}>
              My Tasks
            </SidebarLink>
          </li>
          <li>
            <SidebarLink to="/projects" icon={<FolderKanban />}>
              Projects
            </SidebarLink>
          </li>
        </ul>

        <section aria-labelledby="sidebar-projects" className="space-y-1.5">
          <div className="flex items-center justify-between px-3">
            <h2 id="sidebar-projects" className="text-xs font-semibold tracking-wide text-sidebar-muted uppercase">
              Projects
            </h2>
            {canCreateProject && (
              <button
                type="button"
                onClick={() => setCreating(true)}
                aria-label="New project"
                title="New project"
                className="flex size-6 items-center justify-center rounded text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg focus-visible:outline-sidebar-accent"
              >
                <Plus aria-hidden className="size-4" />
              </button>
            )}
          </div>
          <ProjectLinks />
        </section>

        {isAdmin && (
          <section aria-labelledby="sidebar-admin" className="space-y-1.5">
            <h2 id="sidebar-admin" className="px-3 text-xs font-semibold tracking-wide text-sidebar-muted uppercase">
              Admin
            </h2>
            <ul>
              <li>
                <SidebarLink to="/admin/users" icon={<Users />}>
                  Users
                </SidebarLink>
              </li>
            </ul>
          </section>
        )}
      </nav>

      <ProjectFormModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
