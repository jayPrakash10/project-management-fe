import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/**
 * The open task lives in the URL (?task=<id>) so it survives refresh and can be shared.
 * Opening pushes a history entry, so the browser's Back button closes the pane.
 */
export function useTaskPane() {
  const [searchParams, setSearchParams] = useSearchParams();
  const openTaskId = searchParams.get('task');

  const openTask = useCallback(
    (taskId: string) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set('task', taskId);
        return next;
      });
    },
    [setSearchParams],
  );

  const closeTask = useCallback(() => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete('task');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  return { openTaskId, openTask, closeTask };
}
