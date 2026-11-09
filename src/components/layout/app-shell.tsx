import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { ShortcutsDialog } from '@/components/features/settings/shortcuts-dialog';
import { TaskPaneController } from '@/components/features/tasks/task-pane-controller';
import { Sheet } from '@/components/ui/sheet';
import { useHotkey } from '@/hooks/use-hotkey';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

/** Authenticated layout: sidebar, top bar, page content, task pane and global shortcuts. */
export function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { pathname } = useLocation();
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile drawer after navigating.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (navOpen) setNavOpen(false);
  }

  useHotkey('?', () => setShortcutsOpen(true));
  useHotkey('/', () => {
    document.querySelector<HTMLInputElement>('[data-shortcut-search]')?.focus();
  });

  return (
    <div className="min-h-dvh lg:pl-60">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface px-3 py-2 text-fg shadow-md focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:flex">
        <Sidebar />
      </aside>

      {!isDesktop && (
        <Sheet open={navOpen} onClose={() => setNavOpen(false)} label="Navigation" side="left" className="w-72 max-w-[85vw] border-0">
          <Sidebar />
        </Sheet>
      )}

      <div className="flex min-h-dvh min-w-0 flex-col">
        <Topbar onOpenNav={() => setNavOpen(true)} onOpenShortcuts={() => setShortcutsOpen(true)} />
        <main id="main" tabIndex={-1} className="flex min-w-0 flex-1 flex-col focus:outline-none">
          <Outlet />
        </main>
      </div>

      <TaskPaneController />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
