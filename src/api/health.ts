import type { HealthStatus } from '@/types/api';
import { API_URL } from './client';

/**
 * GET /health. Uses fetch with a short timeout instead of the axios client so it
 * can run before the app renders (it decides whether the mock API is needed).
 */
export async function checkHealth(timeoutMs = 3000): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_URL}/health`, { signal: controller.signal });
    if (!response.ok) return false;
    const body = (await response.json()) as { data?: HealthStatus };
    return body.data?.status === 'ok';
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}
