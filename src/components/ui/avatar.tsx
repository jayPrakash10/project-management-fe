import { User } from 'lucide-react';
import { getAvatarTone, getInitials } from '@/lib/avatar';
import { cn } from '@/lib/cn';

const sizes = {
  xs: 'size-5 text-xs tracking-tighter',
  sm: 'size-6 text-xs tracking-tight',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
} as const;

export interface AvatarProps {
  /** null renders the "unassigned" placeholder. */
  name: string | null;
  size?: keyof typeof sizes;
  className?: string;
  /** Set when the avatar is the only content; otherwise it is decorative. */
  labelled?: boolean;
}

export function Avatar({ name, size = 'md', className, labelled = false }: AvatarProps) {
  if (!name) {
    return (
      <span
        role={labelled ? 'img' : undefined}
        aria-label={labelled ? 'Unassigned' : undefined}
        aria-hidden={labelled ? undefined : true}
        title="Unassigned"
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-border-strong text-fg-subtle',
          sizes[size],
          className,
        )}
      >
        <User className="size-[60%]" aria-hidden />
      </span>
    );
  }

  return (
    <span
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? name : undefined}
      aria-hidden={labelled ? undefined : true}
      title={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none',
        getAvatarTone(name),
        sizes[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
