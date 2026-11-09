import { cn } from '@/lib/cn';

/** TaskFlow wordmark: a rounded mark with a check stroke, colored by the accent token. */
export function Logo({ className, tone = 'default' }: { className?: string; tone?: 'default' | 'sidebar' }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold tracking-tight', className)}>
      <svg viewBox="0 0 32 32" aria-hidden className="size-7 shrink-0">
        <rect width="32" height="32" rx="8" className={tone === 'sidebar' ? 'fill-sidebar-accent' : 'fill-accent'} />
        <path
          d="M9 16.5l4.5 4.5L23 11.5"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={tone === 'sidebar' ? 'stroke-sidebar' : 'stroke-on-accent'}
        />
      </svg>
      <span className="text-lg">TaskFlow</span>
    </span>
  );
}
