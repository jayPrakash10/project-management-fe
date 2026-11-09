import { useCallback, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { useDismiss } from '@/hooks/use-dismiss';
import { cn } from '@/lib/cn';
import { buttonStyles, type ButtonSize, type ButtonVariant } from './button-styles';

export interface PopoverProps {
  /** Accessible name of the trigger and the panel. */
  label: string;
  trigger: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: 'start' | 'end';
  /** Open upwards (e.g. from the bottom of the sidebar). */
  placement?: 'bottom' | 'top';
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  iconOnly?: boolean;
  triggerClassName?: string;
  panelClassName?: string;
}

/** A non-modal floating panel anchored to a button. */
export function Popover({
  label,
  trigger,
  children,
  align = 'end',
  placement = 'bottom',
  triggerVariant = 'ghost',
  triggerSize = 'md',
  iconOnly = true,
  triggerClassName,
  panelClassName,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const refs = useMemo(() => [triggerRef, panelRef], []);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);
  const onDismiss = useCallback(
    (reason: 'outside' | 'escape') => {
      setOpen(false);
      if (reason === 'escape') triggerRef.current?.focus();
    },
    [],
  );
  useDismiss(refs, open, onDismiss);

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label={iconOnly ? label : undefined}
        title={iconOnly ? label : undefined}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={buttonStyles({ variant: triggerVariant, size: triggerSize, iconOnly, className: triggerClassName })}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label={label}
          className={cn(
            'absolute z-30 w-72 rounded-lg border border-border bg-surface p-3 text-fg shadow-md',
            placement === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1',
            align === 'end' ? 'right-0' : 'left-0',
            panelClassName,
          )}
        >
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  );
}
