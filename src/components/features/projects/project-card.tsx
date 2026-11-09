import { CalendarDays } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { getAvatarTone } from '@/lib/avatar';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/dates';
import type { Project } from '@/types/api';

export function ProjectCard({ project, isOwner }: { project: Project; isOwner: boolean }) {
  return (
    <li className="group relative flex flex-col rounded-lg border border-border bg-surface p-4 shadow-xs transition-shadow hover:border-border-strong hover:shadow-sm">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg text-md font-semibold', getAvatarTone(project.name))}
        >
          {project.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-md font-semibold text-fg">
            <Link
              to={`/projects/${project.id}/board`}
              className="break-words after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-accent"
            >
              {project.name}
            </Link>
          </h2>
          {isOwner && (
            <Badge tone="accent" className="mt-1">
              Owner
            </Badge>
          )}
        </div>
      </div>
      <p className={cn('mt-3 line-clamp-2 flex-1 text-base', project.description ? 'text-fg-muted' : 'text-fg-subtle italic')}>
        {project.description ?? 'No description'}
      </p>
      <p className="mt-4 flex items-center gap-1.5 text-sm text-fg-subtle">
        <CalendarDays aria-hidden className="size-3.5" />
        Created {formatDate(project.createdAt)}
      </p>
    </li>
  );
}
