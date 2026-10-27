import type { IRetryPolicy } from "@microsoft/signalr";

const RETRY_DELAYS_MS = [0, 2_000, 5_000, 10_000, 30_000];

function retryDelay(attempt: number): number {
  return RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
}

/**
 * Reconnects forever, backing off to every 30s. The stock withAutomaticReconnect() gives up
 * after four tries (~42s), after which the hub stayed dead -- no role/sign-out/approval pushes --
 * until the page was reloaded.
 */
export const persistentRetryPolicy: IRetryPolicy = {
  nextRetryDelayInMilliseconds: ({ previousRetryCount }) =>
    retryDelay(previousRetryCount),
};

/**
 * Automatic reconnect only covers drops after a successful start; this retries a failed initial
 * start (e.g. the API was down at page load) on the same backoff. Stops once `isActive()` turns
 * false -- the owning hook unmounted, which also aborts an in-flight start.
 */
export async function startWithRetry(
  start: () => Promise<void>,
  isActive: () => boolean,
): Promise<void> {
  for (let attempt = 1; isActive(); attempt++) {
    try {
      await start();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt)));
    }
  }
}
