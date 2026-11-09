import { ChevronDown } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { controlStyles } from './input';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<ComponentProps<'select'>, 'children' | 'size'> {
  options: readonly SelectOption[];
  /** Adds a first option with an empty value, e.g. "Any status". */
  placeholderOption?: string;
  wrapperClassName?: string;
  size?: 'sm' | 'md';
}

/** Native select (best keyboard and screen-reader support), styled to match inputs. */
export function Select({
  options,
  placeholderOption,
  className,
  wrapperClassName,
  size = 'md',
  ...props
}: SelectProps) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <select
        className={cn(
          controlStyles,
          'appearance-none pr-8 pl-3',
          size === 'sm' ? 'h-8 md:text-sm' : 'h-9',
          className,
        )}
        {...props}
      >
        {placeholderOption !== undefined && <option value="">{placeholderOption}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-fg-subtle"
      />
    </div>
  );
}
