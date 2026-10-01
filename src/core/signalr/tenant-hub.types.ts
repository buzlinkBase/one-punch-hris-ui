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
  /** Fired to every member when a company they belong to is renamed (TenantRenamedWorker, after
   *  HRIS Company Info's "Company Name" is saved) — refresh the session so the token's
   *  tenantName and the company switcher pick up the new name. */
  onTenantRenamed: "TenantRenamed",
  /** Fired when the account's password was changed or reset (UsersController) -- every other
   *  session was revoked, so sign out now instead of when the access token expires. */
  onSignedOut: "SignedOut",
  /** Fired to every member of an account's companies when its subscription changes (plan,
   *  status, payment, override -- SubscriptionChangedWorker) -- refetch the entitlements so
   *  locked and unlocked features update without re-logging in. */
  onSubscriptionChanged: "SubscriptionChanged",
} as const;

export interface SignedOutNotification {
  /** The `jti` of the session that changed the password, which stays signed in; null after a reset. */
  exceptTokenId?: string | null;
  reason: "PasswordChanged" | "PasswordReset" | string;
}

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

export interface SubscriptionChangedNotification {
  tenantIds: string[];
  reason: string;
}

export interface TenantRenamedNotification {
  tenantId: string;
  tenantName: string;
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
