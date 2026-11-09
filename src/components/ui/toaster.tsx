import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import type { ToastItem } from '@/context/toast-context';
import { cn } from '@/lib/cn';

const icons = {
  success: <CircleCheck aria-hidden className="size-5 text-success" />,
  error: <CircleAlert aria-hidden className="size-5 text-danger" />,
  info: <Info aria-hidden className="size-5 text-accent" />,
};

export function Toaster({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <section
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.tone === 'error' ? 'alert' : 'status'}
          className={cn(
            'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border bg-surface p-3 shadow-lg',
          )}
        >
          <span className="mt-px">{icons[toast.tone]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-fg">{toast.message}</p>
            {toast.description && <p className="mt-0.5 text-sm text-fg-muted">{toast.description}</p>}
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
                className="mt-2 text-sm font-semibold text-accent hover:underline"
              >
                {toast.action.label}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="flex size-6 shrink-0 items-center justify-center rounded text-fg-subtle hover:bg-surface-2 hover:text-fg"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
      ))}
    </section>
  );
}
