import { authStorage } from "./auth-storage";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import {
  flattenNavPaths,
  getPermissionForPath,
} from "@/shared/constants/navigation.const";

export type TenantRedirect =
  "/select-tenant" | "/create-tenant" | "/awaiting-invitation" | null;

const PORTAL_PERMISSION = "Employee Self-Service Portal:View";

/** The user's own account page -- never permission-gated, so always somewhere to land. */
const PERMISSION_FREE_LANDING = "/profile";

function canOpen(path: string): boolean {
  const required = getPermissionForPath(path);
  if (!required) return true;
  return authStorage.hasAnyPermission(
    ...(Array.isArray(required) ? required : [required]),
  );
}

/**
 * Where a user lands when the page they asked for isn't theirs to see. Every guard that bounces
 * a user (the root route's permission/Employee-only checks, MainLayout's permission effect)
 * must send them HERE rather than to a hard-coded "/dashboard" -- Dashboard is permission-gated
 * like every other page, so a hard-coded target could itself be forbidden and the redirects
 * would chase each other forever (a blank page that never loads).
 *
 * - Employee-only members stay in the Employee Portal (or their profile without portal access).
 * - Everyone else gets the first menu page they can open, in menu order -- Dashboard when they
 *   hold Dashboard:View, otherwise e.g. Leave Applications for a role granted only that.
 * - Nothing openable (e.g. a plain Member with no permissions) → their own profile.
 */
export function resolveFallbackLanding(): string {
  if (authStorage.isEmployeeOnly()) {
    return authStorage.hasPermission(PORTAL_PERMISSION)
      ? "/portal/profile"
      : PERMISSION_FREE_LANDING;
  }
  return (
    flattenNavPaths(undefined, { leavesOnly: true }).find(canOpen) ??
    PERMISSION_FREE_LANDING
  );
}

/** Resolves where the user should land based on tenant state. `null` means the current tenant context is already resolved. */
export async function resolveTenantDestination(): Promise<TenantRedirect> {
  if (authStorage.getTenantId()) return null;

  const token = authStorage.getToken();
  const tokenClaims = token ? authStorage.getTenantClaims(token) : null;
  if (tokenClaims?.tenantId) {
    authStorage.setTenant(tokenClaims.tenantId, tokenClaims.tenantName);
    return null;
  }

  const tenants = authStorage.getTenants();
  if (tenants.length > 1) return "/select-tenant";

  if (tenants.length === 1) {
    const [tenant] = tenants;
    const result = await authApi.selectTenant(tenant.tenantId);
    const claims = authStorage.getTenantClaims(result.accessToken);
    const user = authStorage.getUser();
    const resultIds = new Set(result.tenants.map((t) => t.tenantId));
    const preserved = (user?.tenants ?? []).filter(
      (t) => !resultIds.has(t.tenantId),
    );
    authStorage.save(result.accessToken, {
      ...user!,
      roles: result.roles,
      permissions: result.permissions,
      tenantId: claims.tenantId ?? tenant.tenantId,
      tenantName: claims.tenantName ?? tenant.name,
      tenants: [...result.tenants, ...preserved],
    });
    return null;
  }

  const invitation = await authApi.getPendingInvitation();
  return invitation ? "/awaiting-invitation" : "/create-tenant";
}
