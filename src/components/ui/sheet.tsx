import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name of the panel. */
  label: string;
  side?: 'left' | 'right';
  className?: string;
  children: ReactNode;
}

/**
 * A panel that slides in from the edge (task detail pane, mobile navigation).
 * Native <dialog>: focus trap, Escape to close, focus returns on close.
 */
export function Sheet({ open, onClose, label, side = 'right', className, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        'fixed inset-y-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-border bg-surface p-0 shadow-lg',
        side === 'right' ? 'right-0 left-auto border-l' : 'right-auto left-0 border-r',
        className,
      )}
    >
      {open && children}
    </dialog>
  );
}
