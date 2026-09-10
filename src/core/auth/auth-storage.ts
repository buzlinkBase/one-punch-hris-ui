import { decodeJwt } from "./jwt.util";
import type { TenantSummary } from "@/app/modules/auth/login/models/api/response/tenant-summary.model";

const KEYS = {
  token: "auth_token",
  user: "auth_user",
} as const;

const EXPIRY_BUFFER_MS = 60_000;

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
    return this.getPermissions().includes(code);
  },

  hasAnyPermission(...codes: string[]): boolean {
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
    tenants[idx] = { ...tenants[idx], hrDbStatus, hrDbReady };
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
