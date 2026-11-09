import { Search, X } from 'lucide-react';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { controlStyles } from './input';

export interface SearchInputProps {
  /** Committed value (usually from the URL). */
  value: string;
  /** Called 300 ms after typing stops, and immediately on clear. */
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  /** Lets the "/" shortcut find this input. */
  shortcutTarget?: boolean;
}

const DEBOUNCE_MS = 300;

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, onChange, label, placeholder = 'Search…', maxLength = 100, className, shortcutTarget = false },
  ref,
) {
  const [text, setText] = useState(value);
  const [committed, setCommitted] = useState(value);
  const timer = useRef<number | undefined>(undefined);

  // Sync when the value changes from outside (e.g. "Clear filters").
  if (value !== committed) {
    setCommitted(value);
    setText(value);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function handleChange(next: string) {
    setText(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange(next.trim()), DEBOUNCE_MS);
  }

  function clear() {
    window.clearTimeout(timer.current);
    setText('');
    onChange('');
  }

  return (
    <div className={cn('relative', className)}>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-fg-subtle" />
      <input
        ref={ref}
        type="search"
        aria-label={label}
        placeholder={placeholder}
        maxLength={maxLength}
        value={text}
        data-shortcut-search={shortcutTarget || undefined}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && text) {
            event.preventDefault();
            event.stopPropagation();
            clear();
          }
        }}
        className={cn(controlStyles, 'h-9 pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden')}
      />
      {text && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded text-fg-subtle hover:bg-surface-2 hover:text-fg"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      )}
    </div>
  );
});
