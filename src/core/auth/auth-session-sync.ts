import { authStorage, type AuthUser } from "./auth-storage";
import { queryClient } from "@/core/query-client";

// The session lives in localStorage (and the refresh cookie), which every tab of this origin
// shares -- but each tab's page, query cache and SignalR connections are its own. When another
// tab signs in as someone else, signs out, or switches company, this tab keeps showing the old
// identity while its storage already holds the new one, and its next navigation then makes
// decisions (e.g. "this user has no company, send them to company setup") from the wrong
// account. This follows the shared session instead of acting on a stale one.

export type SessionChange =
  | "none"
  | "signed-in"
  | "signed-out"
  | "account-switched"
  | "tenant-changed"
  | "refreshed";

/** What happened to the shared session between what this tab knew and what storage holds now. */
export function classifySessionChange(
  prev: AuthUser | null,
  next: AuthUser | null,
): SessionChange {
  if (!prev && !next) return "none";
  if (!prev) return "signed-in";
  if (!next) return "signed-out";
  if (prev.email.toLowerCase() !== next.email.toLowerCase()) {
    return "account-switched";
  }
  if ((prev.tenantId ?? null) !== (next.tenantId ?? null)) {
    return "tenant-changed";
  }
  return JSON.stringify(prev) === JSON.stringify(next) ? "none" : "refreshed";
}

/**
 * Changes that make this tab's page and cached data wrong, not just stale: a different person, no
 * person, or a different company. Same-user changes (silent refresh, new permissions) don't.
 */
const REQUIRES_RESTART: ReadonlySet<SessionChange> = new Set([
  "signed-in",
  "signed-out",
  "account-switched",
  "tenant-changed",
]);

export interface SessionSyncDeps {
  readSession: () => AuthUser | null;
  clearCache: () => void;
  restart: () => void;
  notifyChange: () => void;
}

const SESSION_KEYS = new Set(["auth_token", "auth_user"]);

/**
 * Handles one `storage` event for the session. `known` is the session this tab last saw; the
 * returned value is what it should remember afterwards. Pulled out of the listener so it can be
 * tested without a browser.
 */
export function handleSessionStorageEvent(
  key: string | null,
  known: AuthUser | null,
  deps: SessionSyncDeps,
): AuthUser | null {
  // key === null is localStorage.clear().
  if (key !== null && !SESSION_KEYS.has(key)) return known;

  const next = deps.readSession();
  const change = classifySessionChange(known, next);
  if (change === "none") return next;

  if (REQUIRES_RESTART.has(change)) {
    deps.clearCache();
    // A fresh load of "/" re-runs every route guard for whoever is signed in now (or sends a
    // signed-out tab to /login) and resets SignalR, which a client-side navigation would not.
    deps.restart();
  } else {
    deps.notifyChange();
  }
  return next;
}

function readSessionSafely(): AuthUser | null {
  try {
    return authStorage.getUser();
  } catch {
    return null;
  }
}

/** Starts following the shared session. Call once at app start; returns a stop function. */
export function startAuthSessionSync(): () => void {
  // An impersonation tab keeps its session in sessionStorage, which no other tab can change; the
  // shared session changing under it (the operator's own sign-in) must not reset it.
  if (authStorage.isImpersonating()) return () => {};

  let known = readSessionSafely();
  // This tab's own saves/clears don't raise `storage` events here, but they do change what the
  // tab knows -- keep up with them so the next external change is compared against the truth.
  const stopOwn = authStorage.subscribe(() => {
    known = readSessionSafely();
  });

  const deps: SessionSyncDeps = {
    readSession: readSessionSafely,
    clearCache: () => queryClient.clear(),
    restart: () => window.location.replace("/"),
    notifyChange: () => authStorage.notifyExternalChange(),
  };
  const onStorage = (event: StorageEvent) => {
    known = handleSessionStorageEvent(event.key, known, deps);
  };

  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("storage", onStorage);
    stopOwn();
  };
}
