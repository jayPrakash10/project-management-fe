import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useDismiss } from '@/hooks/use-dismiss';
import { cn } from '@/lib/cn';
import { buttonStyles, type ButtonSize, type ButtonVariant } from './button-styles';

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
}

export interface DropdownMenuProps {
  /** Accessible name of the trigger button. */
  label: string;
  trigger: ReactNode;
  items: MenuItem[];
  align?: 'start' | 'end';
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  /** Square trigger (icon only). */
  iconOnly?: boolean;
  triggerClassName?: string;
}

/** Menu button pattern: arrow keys move, Enter selects, Escape closes and refocuses the trigger. */
export function DropdownMenu({
  label,
  trigger,
  items,
  align = 'end',
  triggerVariant = 'ghost',
  triggerSize = 'sm',
  iconOnly = true,
  triggerClassName,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const refs = useMemo(() => [triggerRef, menuRef], []);

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  const onDismiss = useCallback((reason: 'outside' | 'escape') => close(reason === 'escape'), [close]);
  useDismiss(refs, open, onDismiss);

  function focusItem(index: number) {
    const elements = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)');
    if (!elements || elements.length === 0) return;
    const wrapped = (index + elements.length) % elements.length;
    elements[wrapped].focus();
  }

  function currentIndex() {
    const elements = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [],
    );
    return elements.findIndex((element) => element === document.activeElement);
  }

  function openMenu(focusLast = false) {
    setOpen(true);
    requestAnimationFrame(() => focusItem(focusLast ? -1 : 0));
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusItem(currentIndex() + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusItem(currentIndex() - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusItem(0);
        break;
      case 'End':
        event.preventDefault();
        focusItem(-1);
        break;
      case 'Tab':
        close(false);
        break;
      default:
        break;
    }
  }

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        title={iconOnly ? label : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={buttonStyles({ variant: triggerVariant, size: triggerSize, iconOnly, className: triggerClassName })}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            openMenu();
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            openMenu(true);
          }
        }}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
          className={cn(
            'absolute top-full z-30 mt-1 min-w-48 rounded-lg border border-border bg-surface p-1 shadow-md',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={item.disabled}
              onClick={() => {
                close(true);
                item.onSelect();
              }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-base outline-none disabled:opacity-50',
                'focus-visible:bg-surface-2 hover:bg-surface-2',
                item.tone === 'danger' ? 'text-danger-soft-fg' : 'text-fg',
              )}
            >
              {item.icon && (
                <span aria-hidden className="flex size-4 items-center justify-center [&>svg]:size-4">
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
