import { useSyncExternalStore } from "react";
import { authStorage } from "./auth-storage";

/**
 * Subscribes to authStorage so components using it re-render whenever the session is
 * saved/cleared/switched — e.g. after a SignalR-triggered silent refresh following a roles
 * change (see use-tenant-hub.ts). Components that only need this for its re-render side effect
 * can ignore the returned value and keep reading authStorage.hasPermission/hasRole directly.
 */
export function useAuthUser() {
  return useSyncExternalStore(authStorage.subscribe, () =>
    authStorage.getUserSnapshot(),
  );
}
