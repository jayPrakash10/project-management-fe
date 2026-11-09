import { useEffect, type RefObject } from 'react';

/** Close a floating element on outside pointer-down or Escape. */
export function useDismiss(
  refs: RefObject<HTMLElement | null>[],
  open: boolean,
  onDismiss: (reason: 'outside' | 'escape') => void,
) {
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      onDismiss('outside');
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        // Keep Escape from also closing a surrounding <dialog>.
        event.preventDefault();
        event.stopPropagation();
        onDismiss('escape');
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [refs, open, onDismiss]);
}
