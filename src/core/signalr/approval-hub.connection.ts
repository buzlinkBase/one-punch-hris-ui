import * as signalR from "@microsoft/signalr";
import { API_PREFIX, buildHubUrl } from "@/core/http/api-url.util";
import { authStorage } from "@/core/auth/auth-storage";
import { refreshAccessToken } from "@/core/auth/auth-refresh";

// hrms-api's own NotificationHub, NOT API_PREFIX.notifications (that's the separate,
// unrelated tenantstore NotificationApi service, email-only, no hub) -- see
// Hrms.Core/Hubs/NotificationHub.cs, mapped at "/hubs/notifications" on the HRMS host.
// Absolute via buildHubUrl -- a relative prefix would resolve against the current page path.
const HUB_URL = buildHubUrl(API_PREFIX.hrms, "hubs/notifications");

let connection: signalR.HubConnection | null = null;

// Same token-refresh-aware factory as tenant-hub.connection.ts -- SignalR calls this fresh
// before every negotiate attempt (initial connect AND each automatic reconnect), so an
// already-expired access token self-heals instead of failing negotiate with a 401.
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

export const approvalHub = {
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

  // See tenant-hub.connection.ts's identical method for why the module-level reference is
  // cleared BEFORE awaiting the stop (React 18 StrictMode's dev-only double-invoke).
  async stop(): Promise<void> {
    const current = connection;
    connection = null;
    if (current && current.state !== signalR.HubConnectionState.Disconnected) {
      await current.stop();
    }
  },
};
