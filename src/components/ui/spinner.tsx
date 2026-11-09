import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

const sizes = { sm: 'size-4', md: 'size-5', lg: 'size-8' } as const;

export function Spinner({ size = 'md', className, label }: { size?: keyof typeof sizes; className?: string; label?: string }) {
  return (
    <LoaderCircle
      className={cn('animate-spin', sizes[size], className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'status' : undefined}
    />
  );
}
