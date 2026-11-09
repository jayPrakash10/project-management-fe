import { API_URL } from '@/api/client';
import { checkHealth } from '@/api/health';

export type MockReason = 'forced' | 'fallback';

let mockReason: MockReason | null = null;

/** Why the mock API is active, or null when talking to the real API. */
export function getMockReason(): MockReason | null {
  return mockReason;
}

/**
 * Decide whether to run against the in-browser mock API (MSW).
 * - VITE_USE_MOCKS=true      -> always mock.
 * - VITE_MOCK_FALLBACK!=false -> mock only when GET /health fails.
 * The mock code is loaded with a dynamic import so it never ships in the main bundle.
 */
export async function enableMocksIfNeeded(): Promise<void> {
  const forced = import.meta.env.VITE_USE_MOCKS === 'true';
  const fallbackAllowed = import.meta.env.VITE_MOCK_FALLBACK !== 'false';

  if (!forced) {
    if (!fallbackAllowed) return;
    const healthy = await checkHealth();
    if (healthy) return;
  }

  try {
    const { startMockWorker } = await import('@/mocks/browser');
    await startMockWorker(API_URL);
    mockReason = forced ? 'forced' : 'fallback';
  } catch (error) {
    console.error('Could not start the mock API', error);
  }
}
