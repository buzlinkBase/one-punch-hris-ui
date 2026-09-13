import axios from "axios";
import { authStorage } from "./auth-storage";
import { authApi } from "@/app/modules/auth/login/services/auth.api";

// True only when the server actually rejected the refresh token itself (401) -- a network
// blip, timeout, or 5xx must not log the user out; the next request just retries the refresh
// naturally instead.
function isAuthRejection(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 401;
}

async function performRefresh(): Promise<string> {
  const { accessToken, email, name, roles, permissions } =
    await authApi.refresh();
  const user = authStorage.getUser();
  authStorage.save(
    accessToken,
    user ?? {
      email,
      name,
      roles,
      permissions,
    },
  );
  return accessToken;
}

async function refreshOnce(): Promise<string> {
  // Another caller may have already refreshed while we were waiting our turn (this tab's own
  // concurrent callers, or -- once the Web Locks branch below is available -- another tab
  // entirely). Reuse what's already in storage instead of spending the single-use refresh
  // token again: the backend revokes the old one as soon as it's used (see
  // UserService.RefreshLogin), so whoever sends it second gets a 401 for no real reason.
  const existing = authStorage.getToken();
  if (existing && !authStorage.isAccessTokenExpired()) {
    return existing;
  }
  return performRefresh();
}

// Same-tab-only fallback for browsers without the Web Locks API (Safari < 15.4). Kept as a
// fallback, not the primary mechanism, because it can't coordinate across tabs -- only
// navigator.locks below can, and that's what actually closes the multi-tab race.
let inFlight: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
  try {
    if (typeof navigator !== "undefined" && navigator.locks) {
      // Coordinates the actual network refresh across EVERY tab of this origin, not just this
      // one -- only one tab ever holds "auth-refresh" at a time. Without this, two tabs
      // refreshing around the same moment would race: the loser sends the cookie the winner
      // already rotated away, gets a 401, and (since localStorage is shared across tabs)
      // clearing its own storage on that 401 used to log the WINNING tab out too.
      return await navigator.locks.request("auth-refresh", refreshOnce);
    }

    inFlight ??= refreshOnce().finally(() => {
      inFlight = null;
    });
    return await inFlight;
  } catch (err) {
    if (isAuthRejection(err)) {
      authStorage.clear();
      window.location.href = "/login";
    }
    throw err;
  }
}
