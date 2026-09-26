import * as signalR from "@microsoft/signalr";
import { API_PREFIX, buildHubUrl } from "@/core/http/api-url.util";
import { authStorage } from "@/core/auth/auth-storage";
import { refreshAccessToken } from "@/core/auth/auth-refresh";
import {
  TENANT_HUB_METHODS,
  type TenantCreatedNotification,
} from "./tenant-hub.types";

// Absolute via buildHubUrl -- a relative prefix would resolve against the current page path.
const HUB_URL = buildHubUrl(API_PREFIX.auth, "hubs/tenant");

let connection: signalR.HubConnection | null = null;

// SignalR calls this fresh before every negotiate attempt (initial connect AND each automatic
// reconnect), so unlike a plain authStorage.getToken() read, this self-heals an access token
// that's already expired by the time the hub tries to connect -- a real gap that surfaced as
// negotiate returning 401 ("Token is missing or invalid.") for any session whose 5-minute
// access token had already lapsed before this ran. The axios interceptor already does the
// equivalent check on every HTTP request; this hub connection had never had it.
async function getHubAccessToken(): Promise<string> {
  if (authStorage.isAccessTokenExpired()) {
    try {
      return await refreshAccessToken();
    } catch {
      return authStorage.getToken() ?? "";
    }
  }
  return authStorage.getToken() ?? "";
}

function createConnection(): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: getHubAccessToken,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

export interface WaitForProvisioningResult {
  /** True once `TenantCreated` was received for this tenant (TenantCreationStatus.Created). */
  ready: boolean;
  timedOut: boolean;
}

export const tenantHub = {
  getConnection(): signalR.HubConnection {
    if (!connection) connection = createConnection();
    return connection;
  },

  async start(): Promise<void> {
    const conn = this.getConnection();
    if (conn.state === signalR.HubConnectionState.Disconnected) {
      await conn.start();
    }
  },

  async stop(): Promise<void> {
    // Detach the module-level reference BEFORE awaiting the stop, not after. React 18
    // StrictMode double-invokes this hook's effect in dev, so a stop() from the first
    // (thrown-away) mount's cleanup can still be mid-await when the second mount's start()
    // calls getConnection() -- if `connection` weren't already cleared here, that call would
    // get back this same half-torn-down instance (stuck in "Connecting"/"Disconnecting",
    // never "Disconnected") and start() would silently no-op instead of ever really
    // connecting. Clearing it first guarantees the next getConnection() always builds a fresh
    // connection instead of reusing one that's mid-teardown.
    const current = connection;
    connection = null;
    if (current && current.state !== signalR.HubConnectionState.Disconnected) {
      await current.stop();
    }
  },

  /**
   * Waits for the `TenantCreated` push for this tenant — the authoritative signal that
   * TenantCreationStatus reached `Created`. Resolves with `timedOut: true` rather than hanging
   * forever if nothing arrives (e.g. the request failed server-side, which fires no event at
   * all) — callers should fall back to a REST status check on timeout.
   */
  async waitForProvisioning(
    tenantId: string,
    timeoutMs = 30_000,
  ): Promise<WaitForProvisioningResult> {
    const conn = this.getConnection();
    await this.start();

    return new Promise((resolve) => {
      let settled = false;

      const settle = (ready: boolean, timedOut = false) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        conn.off(TENANT_HUB_METHODS.onTenantCreated, handleTenantCreated);
        resolve({ ready, timedOut });
      };

      const handleTenantCreated = (payload: TenantCreatedNotification) => {
        if (payload.tenantId !== tenantId) return;
        settle(true);
      };

      const timer = setTimeout(() => settle(false, true), timeoutMs);

      conn.on(TENANT_HUB_METHODS.onTenantCreated, handleTenantCreated);
    });
  },
};
