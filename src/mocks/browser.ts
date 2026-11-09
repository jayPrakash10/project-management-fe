import { setupWorker } from 'msw/browser';
import { createHandlers } from './handlers';

/**
 * Start the in-browser mock API. Requests to `apiUrl` are answered from an
 * in-memory database (see db.ts); anything else passes through untouched.
 */
export async function startMockWorker(apiUrl: string): Promise<void> {
  const worker = setupWorker(...createHandlers(apiUrl));
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    serviceWorker: { url: '/mockServiceWorker.js' },
  });
}
