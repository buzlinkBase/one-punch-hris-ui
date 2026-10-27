import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

/**
 * Retries a failed query once, but only when the server never answered (dropped connection,
 * timeout). A 4xx/5xx answer won't change on an immediate retry, and the error interceptor
 * toasts every answered failure -- retrying those just showed the same toast twice.
 */
export function shouldRetryQuery(failureCount: number, error: unknown) {
  return failureCount < 1 && isAxiosError(error) && !error.response;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: shouldRetryQuery,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
