import axios from "axios";
import { authStorage, mergeTenants } from "./auth-storage";
import { authApi } from "@/app/modules/auth/login/services/auth.api";

// True only when the server actually rejected the refresh token itself (401) -- a network
// blip, timeout, or 5xx must not log the user out; the next request just retries the refresh
// naturally instead.
function isAuthRejection(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 401;
}

async function performRefresh(): Promise<string> {
  const { accessToken, email, name, roles, permissions, tenants } =
    await authApi.refresh();
  const user = authStorage.getUser();
  // The server's refresh response carries this user's full, current cross-tenant membership
  // list -- e.g. a membership an invite activated, or a workspace that finished provisioning,
  // since the last time this session read it. Silent refresh is the only thing that runs
  // automatically and indefinitely once logged in, so if this doesn't apply that fresh list,
  // a session that never explicitly re-logs-in or switches tenants would never see it, no
  // matter how many times it silently refreshes. name/roles/permissions are deliberately NOT
  // overwritten here: they reflect the user's DEFAULT tenant (see ComposeLoginResponse), which
  // may differ from whichever tenant is actually active in this session.
  authStorage.save(
    accessToken,
    user
      ? { ...user, tenants: mergeTenants(user.tenants ?? [], tenants) }
      : { email, name, roles, permissions, tenants },
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

// Shared by every concurrent caller IN THIS TAB, regardless of whether Web Locks is available
// below -- without this, N requests whose interceptors all notice the same expired token at
// once each independently call refreshOnce, and if the network call is failing (a transient
// backend error, not just an auth rejection), that's N real HTTP attempts instead of one being
// shared, hammering the server with retries that were never going to succeed any more than the
// first one did.
let inFlight: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    // Coordinates the actual network refresh across EVERY tab of this origin, not just this
    // one -- only one tab ever holds "auth-refresh" at a time. Without this, two tabs
    // refreshing around the same moment would race: the loser sends the cookie the winner
    // already rotated away, gets a 401, and (since localStorage is shared across tabs)
    // clearing its own storage on that 401 used to log the WINNING tab out too. Falls back to
    // same-tab-only coalescing (still handled by inFlight above) on browsers without Web Locks
    // (Safari < 15.4).
    if (typeof navigator !== "undefined" && navigator.locks) {
      return navigator.locks.request("auth-refresh", refreshOnce);
    }
    return refreshOnce();
  })();

  try {
    return await inFlight;
  } catch (err) {
    if (isAuthRejection(err)) {
      authStorage.clear();
      window.location.href = "/login";
    }
    throw err;
  } finally {
    inFlight = null;
  }
}
