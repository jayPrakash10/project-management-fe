import { useContext, useMemo } from 'react';
import { getErrorMessage } from '@/api/errors';
import { ToastContext, type ToastOptions } from '@/context/toast-context';

/** toast.success('Saved'), toast.error(error), toast.info('…', { action }) */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  const { show, dismiss } = context;

  return useMemo(
    () => ({
      success: (message: string, options?: ToastOptions) => show('success', message, options),
      info: (message: string, options?: ToastOptions) => show('info', message, options),
      /** Accepts a message or any thrown error (uses the API's message). */
      error: (messageOrError: unknown, options?: ToastOptions) =>
        show(
          'error',
          typeof messageOrError === 'string' ? messageOrError : getErrorMessage(messageOrError),
          options,
        ),
      dismiss,
    }),
    [show, dismiss],
  );
}
