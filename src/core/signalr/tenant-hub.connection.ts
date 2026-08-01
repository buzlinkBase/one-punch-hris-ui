import * as signalR from "@microsoft/signalr";
import { API_PREFIX } from "@/core/http/api-url.util";
import { authStorage } from "@/core/auth/auth-storage";
import {
  TENANT_HUB_METHODS,
  type TenantCreatedNotification,
} from "./tenant-hub.types";

const HUB_URL = `${API_PREFIX.auth}/hubs/tenant`;

let connection: signalR.HubConnection | null = null;

function createConnection(): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => authStorage.getToken() ?? "",
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
    if (
      connection &&
      connection.state !== signalR.HubConnectionState.Disconnected
    ) {
      await connection.stop();
    }
    connection = null;
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
