import { ChevronDown, Keyboard, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover } from '@/components/ui/popover';
import { useCurrentUser, useAuth } from '@/hooks/use-auth';
import { ROLE_LABELS } from '@/lib/constants';

const itemClass =
  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-base text-fg hover:bg-surface-2';

export function UserMenu({ onOpenShortcuts }: { onOpenShortcuts: () => void }) {
  const user = useCurrentUser();
  const { logout } = useAuth();

  return (
    <Popover
      label="Account"
      iconOnly={false}
      triggerVariant="ghost"
      triggerClassName="h-9 gap-2 px-1.5 md:px-2"
      panelClassName="w-64 p-1.5"
      trigger={
        <>
          <Avatar name={user.name} size="sm" />
          <span className="hidden max-w-36 truncate text-base text-fg md:inline">{user.name}</span>
          <ChevronDown aria-hidden className="hidden size-4 md:inline" />
          <span className="sr-only md:hidden">Account menu</span>
        </>
      }
    >
      {(close) => (
        <div>
          <div className="flex items-start gap-3 px-2.5 py-2">
            <Avatar name={user.name} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-medium text-fg">{user.name}</p>
              <p className="truncate text-sm text-fg-muted">{user.email}</p>
              <Badge tone="accent" className="mt-1.5">
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>
          </div>
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              close();
              onOpenShortcuts();
            }}
          >
            <Keyboard aria-hidden className="size-4 text-fg-muted" />
            Keyboard shortcuts
          </button>
          <button type="button" className={itemClass} onClick={logout}>
            <LogOut aria-hidden className="size-4 text-fg-muted" />
            Log out
          </button>
        </div>
      )}
    </Popover>
  );
}
