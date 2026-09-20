/**
 * Contract for the TenantHub SignalR hub (auth service: `MapHub<TenantHub>("/hubs/tenant")`,
 * `Hub<ITenantNotificationClient>` in Onepunch.Auth.Core/Hubs/TenantHub.cs). Pushes are targeted
 * per-connected-user (`Clients.User(userId)`, matched off the `sub` claim) — no group join needed.
 */
export const TENANT_HUB_METHODS = {
  /** Fired once the tenant's creation request settles to TenantCreationStatus.Created
   *  (TenantCreatedWorker) — the authoritative "your company is ready" signal. */
  onTenantCreated: "TenantCreated",
  /** Fired later, once the external HRIS system finishes provisioning the org/database for
   *  that tenant (HrDbCreatedWorker) — informational, does not gate readiness. */
  onHrDbCreated: "HrDbCreated",
  /** Fired whenever this user's tenant roles change (MembershipChangedWorker) — the signal to
   *  silently refresh the auth session and invalidate cached data instead of waiting for the
   *  access token to expire. */
  onRolesChanged: "RolesChanged",
  /** Fired when this user's membership status changes to Revoked (MembershipChangedWorker) —
   *  the existing access token is still valid for its remaining lifetime, so this forces an
   *  immediate logout instead of waiting for it to expire. */
  onSessionRevoked: "SessionRevoked",
} as const;

export interface TenantCreatedNotification {
  tenantId: string;
  tenantName: string;
  roles: string[];
}

export interface HrDbCreatedNotification {
  tenantId: string;
  databaseName: string;
  status: string;
}

export interface RolesChangedNotification {
  tenantId: string;
}

export interface SessionRevokedNotification {
  tenantId: string;
}

/** TenantCreationStatus string values (Onepunch.Auth.Domain/Entities/TenantCreationRequest.cs). */
export const TENANT_FAILED_STATUSES = ["failed", "rejected"];

export interface TenantNotificationPayload {
  id: string;
  title: string;
  message: string;
  tenantId: string;
  createdAt: string;
  severity: "success" | "error" | "info" | "warning";
}
