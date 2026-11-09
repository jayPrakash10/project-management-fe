import { Menu } from 'lucide-react';
import { ThemePicker } from '@/components/features/settings/theme-picker';
import { IconButton } from '@/components/ui/icon-button';
import { Logo } from './logo';
import { UserMenu } from './user-menu';

export function Topbar({ onOpenNav, onOpenShortcuts }: { onOpenNav: () => void; onOpenShortcuts: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface/95 px-3 backdrop-blur md:px-5">
      <IconButton label="Open navigation" icon={<Menu className="size-5" />} onClick={onOpenNav} className="lg:hidden" />
      <Logo className="text-fg lg:hidden" />
      <div className="ml-auto flex items-center gap-1">
        <ThemePicker />
        <UserMenu onOpenShortcuts={onOpenShortcuts} />
      </div>
    </header>
  );
}
