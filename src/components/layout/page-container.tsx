import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Standard page gutters: 16px mobile, 24px tablet, 32px desktop. */
export function PageContainer({ children, className, wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
  return (
    <div className={cn('mx-auto w-full px-4 py-6 md:px-6 lg:px-8', wide ? 'max-w-none' : 'max-w-6xl', className)}>
      {children}
    </div>
  );
}
