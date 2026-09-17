import { decodeJwt } from "./jwt.util";
import type { TenantSummary } from "@/app/modules/auth/login/models/api/response/tenant-summary.model";

const KEYS = {
  token: "auth_token",
  user: "auth_user",
} as const;

const EXPIRY_BUFFER_MS = 60_000;

// TEMP-ALLOW-ALL (2026-09-17): flip to false to restore normal permission checks below. Search
// "TEMP-ALLOW-ALL" for every place this flag gates a check.
const TEMP_ALLOW_ALL = true;

export interface AuthUser {
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  tenantId?: string | null;
  tenantName?: string | null;
  tenants?: TenantSummary[];
}

export interface TenantClaims {
  tenantId: string | null;
  tenantName: string | null;
}

/**
 * Combines a locally-known tenant list with a fresher one from the server (login, refresh, or
 * tenant-switch response) without regressing or dropping anything the fresher one doesn't know
 * about yet:
 * - Never lets a fresher-but-stale snapshot un-confirm a tenant we've already locally verified
 *   ready (via live hub push or REST poll) -- DB provisioning doesn't un-finish. Also promotes
 *   `state` to "Created" alongside hrDbReady: state otherwise only gets set once, by
 *   create-tenant.tsx right after the initial provisioning wait, so a tenant that finished
 *   later (background poll/push) would otherwise show as "Provisioning" in the tenant
 *   switcher's status tag forever.
 * - Keeps any locally-tracked tenant the fresher list omits entirely (e.g. a still-provisioning
 *   workspace the backend excludes until membership becomes Active).
 */
export function mergeTenants(
  local: TenantSummary[],
  fresh: TenantSummary[],
): TenantSummary[] {
  const localById = new Map(local.map((t) => [t.tenantId, t]));
  const freshIds = new Set(fresh.map((t) => t.tenantId));

  const reconciled = fresh.map((t) => {
    const existing = localById.get(t.tenantId);
    return existing?.hrDbReady && !t.hrDbReady
      ? {
          ...t,
          hrDbReady: true,
          hrDbStatus: existing.hrDbStatus ?? t.hrDbStatus,
          state: t.state === "Provisioning" ? "Created" : t.state,
        }
      : t;
  });
  const preserved = local.filter((t) => !freshIds.has(t.tenantId));
  return [...reconciled, ...preserved];
}

export const authStorage = {
  save(token: string, user: AuthUser) {
    localStorage.setItem(KEYS.token, token);
    localStorage.setItem(KEYS.user, JSON.stringify(user));
  },

  getToken(): string | null {
    return localStorage.getItem(KEYS.token);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(KEYS.user);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser & { role?: string };
    // Migrate old sessions that stored role: string instead of roles: string[]
    if (!parsed.roles && parsed.role) {
      parsed.roles = [parsed.role];
    }
    parsed.roles ??= [];
    parsed.permissions ??= [];
    return parsed;
  },

  getTenants(): TenantSummary[] {
    return this.getUser()?.tenants ?? [];
  },

  getPermissions(): string[] {
    return this.getUser()?.permissions ?? [];
  },

  hasPermission(code: string): boolean {
    if (TEMP_ALLOW_ALL) return true;
    if (this.hasRole("Owner")) return true;
    return this.getPermissions().includes(code);
  },

  hasAnyPermission(...codes: string[]): boolean {
    if (TEMP_ALLOW_ALL) return true;
    if (this.hasRole("Owner")) return true;
    const granted = this.getPermissions();
    return codes.some((code) => granted.includes(code));
  },

  hasRole(role: string): boolean {
    return (this.getUser()?.roles ?? []).includes(role);
  },

  hasAnyRole(...roles: string[]): boolean {
    const granted = this.getUser()?.roles ?? [];
    return roles.some((role) => granted.includes(role));
  },

  /** True when the member's only role is Employee (no Admin/Member/Owner/Custom role alongside it). */
  isEmployeeOnly(): boolean {
    const roles = this.getUser()?.roles ?? [];
    return roles.length > 0 && roles.every((role) => role === "Employee");
  },

  getTenantId(): string | null {
    return this.getUser()?.tenantId ?? null;
  },

  getTenantName(): string | null {
    return this.getUser()?.tenantName ?? null;
  },

  setTenant(tenantId: string, tenantName?: string | null) {
    const user = this.getUser();
    if (!user) return;
    localStorage.setItem(
      KEYS.user,
      JSON.stringify({ ...user, tenantId, tenantName: tenantName ?? null }),
    );
  },

  /**
   * Persists a tenant's HR-DB provisioning status into the cached tenant list so the next
   * page load seeds `useTenantHubStore` with the up-to-date value instead of replaying
   * whatever "not ready" snapshot was cached at login — without this, a refresh after
   * provisioning finishes still flashes/sticks on the provisioning screen until a fresh
   * REST round-trip corrects it.
   *
   * Also promotes `state` to "Created" once ready. The main content area was never actually
   * stuck — it already gates on hrDbReady, not state — but this same tenant's `state` field
   * only otherwise gets set once, by create-tenant.tsx's waitAndFinalize, right after the
   * TenantCreated push/timeout. If that page was left, refreshed, or closed before that ran
   * (e.g. HR-DB setup outlasted the wait), `state` stays "Provisioning" forever afterwards —
   * nothing else ever revisits it — even though this poll/push is confirming the workspace is
   * actually ready. That stale value is what the tenant switcher's status tag
   * (getTenantStateTag in main-layout.tsx) and create-tenant.tsx's `usableTenants` filter both
   * read, so without this they'd go on calling a fully working tenant "Provisioning" forever.
   * One-directional (only upgrades to Created, never the reverse) since DB provisioning
   * doesn't un-finish — same reasoning as handleSwitchTenant's reconciliation in main-layout.tsx.
   */
  updateTenantHrDbStatus(
    tenantId: string,
    hrDbStatus: string | null,
    hrDbReady: boolean,
  ) {
    const user = this.getUser();
    if (!user?.tenants) return;
    const idx = user.tenants.findIndex((t) => t.tenantId === tenantId);
    if (idx === -1) return;
    const tenants = [...user.tenants];
    const current = tenants[idx];
    tenants[idx] = {
      ...current,
      hrDbStatus,
      hrDbReady,
      state: hrDbReady ? "Created" : current.state,
    };
    localStorage.setItem(KEYS.user, JSON.stringify({ ...user, tenants }));
  },

  /** Decodes the `tenantId`/`tenantName` claims off any access token (e.g. a fresh one from an API response, not yet saved). */
  getTenantClaims(token: string): TenantClaims {
    const payload = decodeJwt<{ tenantId?: string; tenantName?: string }>(
      token,
    );
    return {
      tenantId: payload?.tenantId ?? null,
      tenantName: payload?.tenantName ?? null,
    };
  },

  isAccessTokenExpired(): boolean {
    const token = localStorage.getItem(KEYS.token);
    if (!token) return true;

    const payload = decodeJwt(token);

    if (!payload?.exp) return false;

    const expiryMs = payload.exp * 1000 - EXPIRY_BUFFER_MS;
    return Date.now() >= expiryMs;
  },

  clear() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  },
};
