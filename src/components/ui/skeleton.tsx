import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Placeholder block shown while data loads. Decorative: wrap groups in an aria-busy region. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-surface-3', className)} />;
}

/** A labelled loading region containing skeletons. */
export function LoadingRegion({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
