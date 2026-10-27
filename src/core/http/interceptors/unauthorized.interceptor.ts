import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { authStorage } from "@/core/auth/auth-storage";
import { refreshAccessToken } from "@/core/auth/auth-refresh";

declare module "axios" {
  interface AxiosRequestConfig {
    _authRetried?: boolean;
  }
}

// Anonymous auth endpoints answer 401 for bad credentials or a spent refresh cookie, not for a
// stale access token -- refreshing and replaying them would be wrong (a mistyped password would
// end in a refresh failure that redirects to /login and wipes the form).
const ANONYMOUS_AUTH_ENDPOINT =
  /\/users\/(login|refresh|logout|create-account|forgot-password|reset-password|login-google-callback|signup-google-callback)(\/|\?|$)/i;

function bearerOf(config: InternalAxiosRequestConfig): string | null {
  const header = config.headers?.Authorization;
  return typeof header === "string" && header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : null;
}

/** A 401 on an authenticated request that hasn't been replayed yet. */
export function shouldRecoverFromUnauthorized(error: AxiosError): boolean {
  const config = error.config;
  return (
    error.response?.status === 401 &&
    !!config &&
    !config._authRetried &&
    !!bearerOf(config) &&
    !ANONYMOUS_AUTH_ENDPOINT.test(config.url ?? "")
  );
}

/**
 * Recovers from a 401 on a token the client still believed valid (revoked server-side, signing
 * key rotated, clock skew): refreshes once and replays the request. The request interceptor only
 * refreshes on client-side expiry, so without this the user got "Unauthorized" toasts forever and
 * was never sent to /login. A rejected refresh token signs the user out (see refreshAccessToken).
 */
export function applyUnauthorizedInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(undefined, async (error: AxiosError) => {
    if (!shouldRecoverFromUnauthorized(error) || !error.config) {
      return Promise.reject(error);
    }

    const config = error.config;
    const sent = bearerOf(config);
    const current = authStorage.getToken();

    let token: string;
    try {
      // Another request already refreshed after this one was sent -- replay with that token
      // instead of spending the single-use refresh token again.
      token =
        current && current !== sent ? current : await refreshAccessToken(true);
    } catch {
      return Promise.reject(error);
    }

    config._authRetried = true;
    config.headers.Authorization = `Bearer ${token}`;
    return instance.request(config);
  });
}
