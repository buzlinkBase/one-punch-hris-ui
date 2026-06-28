import { decodeJwt } from "./jwt.util";
import type { TenantSummary } from "@/app/modules/auth/login/models/api/response/tenant-summary.model";

const KEYS = {
  token: "auth_token",
  user: "auth_user",
  name: "name",
  role: "role",
} as const;

const EXPIRY_BUFFER_MS = 60_000;

export interface AuthUser {
  email: string;
  name: string;
  role: string;
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
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  getTenants(): TenantSummary[] {
    return this.getUser()?.tenants ?? [];
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
