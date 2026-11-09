import { NavLink } from 'react-router';
import { cn } from '@/lib/cn';

export interface TabNavItem {
  label: string;
  to: string;
  /** Overrides route matching (e.g. tabs encoded in the query string). */
  isActive?: boolean;
  count?: number;
  /** Highlight the count (e.g. overdue tasks). */
  countTone?: 'neutral' | 'danger';
  end?: boolean;
}

/** Underlined tab navigation. Each tab is a link, so tabs are bookmarkable. */
export function TabNav({ items, label, className }: { items: TabNavItem[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn('scrollbar-thin -mb-px overflow-x-auto', className)}>
      <ul className="flex min-w-max gap-1">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive: routeActive }) => {
                const active = item.isActive ?? routeActive;
                return cn(
                  'flex h-10 items-center gap-2 border-b-2 px-3 text-base font-medium transition-colors',
                  active
                    ? 'border-accent text-fg'
                    : 'border-transparent text-fg-muted hover:border-border-strong hover:text-fg',
                );
              }}
              aria-current={item.isActive === undefined ? undefined : item.isActive ? 'page' : undefined}
            >
              {item.label}
              {item.count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 text-xs leading-5 font-semibold tabular-nums',
                    item.countTone === 'danger' && item.count > 0
                      ? 'bg-danger-soft text-danger-soft-fg'
                      : 'bg-surface-3 text-fg-muted',
                  )}
                >
                  {item.count}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
