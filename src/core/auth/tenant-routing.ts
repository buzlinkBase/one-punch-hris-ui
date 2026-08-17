import { authStorage } from "./auth-storage";
import { authApi } from "@/app/modules/auth/login/services/auth.api";

export type TenantRedirect =
  "/select-tenant" | "/create-tenant" | "/awaiting-invitation" | null;

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
      tenantId: claims.tenantId ?? tenant.tenantId,
      tenantName: claims.tenantName ?? tenant.name,
      tenants: [...result.tenants, ...preserved],
    });
    return null;
  }

  const invitation = await authApi.getPendingInvitation();
  return invitation ? "/awaiting-invitation" : "/create-tenant";
}
