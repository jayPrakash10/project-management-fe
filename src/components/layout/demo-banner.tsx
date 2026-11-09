import { FlaskConical } from 'lucide-react';
import { getMockReason } from '@/lib/mock-mode';

/** Always visible while the in-browser mock API is serving requests. */
export function DemoBanner() {
  const reason = getMockReason();
  if (!reason) return null;

  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-warning-soft px-4 py-1.5 text-center text-sm text-warning-soft-fg">
      <FlaskConical aria-hidden className="size-4 shrink-0" />
      <span>
        <strong className="font-semibold">Demo data.</strong>{' '}
        {reason === 'fallback'
          ? 'The API is unreachable, so an in-browser mock is answering instead.'
          : 'Mock mode is on (VITE_USE_MOCKS).'}{' '}
        Changes reset when you reload.
      </span>
    </div>
  );
}
