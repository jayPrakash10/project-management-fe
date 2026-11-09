import type { ReactNode } from 'react';

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-border-strong bg-surface-2 px-1.5 font-mono text-xs font-medium text-fg-muted shadow-xs">
      {children}
    </kbd>
  );
}
