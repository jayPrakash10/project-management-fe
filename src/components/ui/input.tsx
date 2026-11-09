import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Shared look for text inputs, selects and textareas. */
export const controlStyles =
  'w-full rounded-md border border-border-strong bg-surface text-md text-fg shadow-xs transition-colors placeholder:text-fg-subtle hover:border-fg-subtle focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger md:text-base';

export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return <input type={type} className={cn(controlStyles, 'h-9 px-3', className)} {...props} />;
}
