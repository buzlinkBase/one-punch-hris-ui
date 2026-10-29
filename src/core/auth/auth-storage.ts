import { decodeJwt } from "./jwt.util";
import type { TenantSummary } from "@/app/modules/auth/login/models/api/response/tenant-summary.model";

const KEYS = {
  token: "auth_token",
  user: "auth_user",
} as const;

const EXPIRY_BUFFER_MS = 60_000;

/** Present only in a tab that is a support operator's impersonation session (sessionStorage, so it dies with the tab). */
const IMPERSONATION_KEY = "auth_impersonation";

export interface ImpersonationInfo {
  sessionId: string;
  operatorEmail: string;
  /** ISO time the session hard-ends; it is never refreshed. */
  expiresAt: string;
}

function readImpersonation(): ImpersonationInfo | null {
  try {
    const raw = sessionStorage.getItem(IMPERSONATION_KEY);
    return raw ? (JSON.parse(raw) as ImpersonationInfo) : null;
  } catch {
    return null;
  }
}

/**
 * Where the session lives. A normal session is shared by every tab in localStorage; an impersonation
 * session stays in this tab's sessionStorage only -- never written to localStorage, so it can't leak
 * into (or overwrite) the real session in other tabs, and closing the tab wipes it.
 */
function store(): Storage {
  return readImpersonation() ? sessionStorage : localStorage;
}

/** hrms-api ConfidentialAccessScope.ClearancePermission. */
export const CONFIDENTIAL_CLEARANCE_PERMISSION = "Confidential Records:Access";
/** Partial clearances: day-to-day records / money entries, never pay figures. */
export const CONFIDENTIAL_OPERATIONS_PERMISSION =
  "Confidential Records:Operations";
export const CONFIDENTIAL_ENTRIES_PERMISSION = "Confidential Records:Entries";

export interface ConfidentialGrants {
  operations: boolean;
  entries: boolean;
}

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
 *   company the backend excludes until membership becomes Active).
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

const listeners = new Set<() => void>();
// useSyncExternalStore requires getSnapshot to return a stable reference until something
// actually changes -- getUser() re-parses JSON on every call, so this caches that result and
// only recomputes it the next time it's read after a notify() invalidates it.
let userSnapshot: AuthUser | null | undefined;

function notify() {
  userSnapshot = undefined;
  listeners.forEach((listener) => listener());
}

export const authStorage = {
  /** Notifies on every save/clear/setTenant/updateTenantHrDbStatus — see useAuthUser. */
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Another tab changed the shared session in localStorage (see auth-session-sync.ts): drops the
   * cached snapshot and tells subscribers, same as a local save. notify() itself is module-private.
   */
  notifyExternalChange() {
    notify();
  },

  /** Stable-reference snapshot of getUser(), for useSyncExternalStore (see useAuthUser). */
  getUserSnapshot(): AuthUser | null {
    if (userSnapshot === undefined) {
      userSnapshot = this.getUser();
    }
    return userSnapshot;
  },

  isImpersonating(): boolean {
    return readImpersonation() !== null;
  },

  getImpersonation(): ImpersonationInfo | null {
    return readImpersonation();
  },

  /** Makes this tab the impersonated user's session. Call before save(), which then goes to sessionStorage. */
  startImpersonation(info: ImpersonationInfo) {
    sessionStorage.setItem(IMPERSONATION_KEY, JSON.stringify(info));
  },

  save(token: string, user: AuthUser) {
    store().setItem(KEYS.token, token);
    store().setItem(KEYS.user, JSON.stringify(user));
    notify();
  },

  getToken(): string | null {
    return store().getItem(KEYS.token);
  },

  getUser(): AuthUser | null {
    const raw = store().getItem(KEYS.user);
    if (!raw) return null;
    let parsed: AuthUser & { role?: string };
    try {
      parsed = JSON.parse(raw) as AuthUser & { role?: string };
    } catch {
      // Corrupt session data would otherwise throw inside the root route guard on every
      // navigation; treat it as signed out.
      return null;
    }
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

  // Owner always holds every permission in the catalog by design (see tenantstore's
  // PermissionCatalogSeederService), but the `permissions` array a session is holding can lag
  // that truth -- most notably right after creating a company, where the login response has
  // to return before the new Owner's real membership/permission rows exist yet (see
  // WorkspaceService.Create). Short-circuiting here makes Owner unconditionally unrestricted
  // everywhere this is checked (nav filtering, PermissionGate), immune to that timing gap and
  // any future one like it, rather than patching each stale-permissions window individually.
  hasPermission(code: string): boolean {
    if (this.hasRole("Owner")) return true;
    return this.getPermissions().includes(code);
  },

  hasAnyPermission(...codes: string[]): boolean {
    if (this.hasRole("Owner")) return true;
    const granted = this.getPermissions();
    return codes.some((code) => granted.includes(code));
  },

  // Clearance to see and tag confidential employees -- the Owner, or a role the Owner granted
  // the permission to. Admin gets no shortcut (mirrors hrms-api's HasConfidentialClearance); the
  // API enforces it, this only decides what to show.
  hasConfidentialClearance(): boolean {
    return this.hasPermission(CONFIDENTIAL_CLEARANCE_PERMISSION);
  },

  // Explicit grants only (no Owner shortcut needed -- the Owner has full clearance anyway).
  getConfidentialGrants(): ConfidentialGrants {
    const granted = this.getPermissions();
    return {
      operations: granted.includes(CONFIDENTIAL_OPERATIONS_PERMISSION),
      entries: granted.includes(CONFIDENTIAL_ENTRIES_PERMISSION),
    };
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
    store().setItem(
      KEYS.user,
      JSON.stringify({ ...user, tenantId, tenantName: tenantName ?? null }),
    );
    notify();
  },

  /**
   * A company this session belongs to was renamed (SignalR "TenantRenamed" push) -- updates the
   * cached company list entry and, if it's the active company, the active name, so the header and
   * company switcher show it immediately instead of after the next token refresh.
   */
  renameTenant(tenantId: string, name: string) {
    const user = this.getUser();
    if (!user) return;
    const nextUser = {
      ...user,
      tenants: (user.tenants ?? []).map((t) =>
        t.tenantId === tenantId ? { ...t, name } : t,
      ),
      tenantName: user.tenantId === tenantId ? name : user.tenantName,
    };
    store().setItem(KEYS.user, JSON.stringify(nextUser));
    notify();
  },

  /**
   * Drops a tenant the session has lost access to (e.g. a SignalR "session revoked" push) out
   * of the cached membership list, so it stops showing in the tenant switcher. Only clears the
   * active tenantId/tenantName if that tenant WAS the active one -- losing access to a tenant
   * the session isn't currently using shouldn't disturb what it's actively working in.
   */
  removeTenant(tenantId: string) {
    const user = this.getUser();
    if (!user) return;
    const tenants = (user.tenants ?? []).filter((t) => t.tenantId !== tenantId);
    const wasActiveTenant = user.tenantId === tenantId;
    const nextUser = {
      ...user,
      tenants,
      tenantId: wasActiveTenant ? null : user.tenantId,
      tenantName: wasActiveTenant ? null : user.tenantName,
      roles: wasActiveTenant ? [] : user.roles,
      permissions: wasActiveTenant ? [] : user.permissions,
    };
    store().setItem(KEYS.user, JSON.stringify(nextUser));
    notify();
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
   * nothing else ever revisits it — even though this poll/push is confirming the company is
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
    store().setItem(KEYS.user, JSON.stringify({ ...user, tenants }));
    notify();
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
    const token = store().getItem(KEYS.token);
    if (!token) return true;

    const payload = decodeJwt(token);

    if (!payload?.exp) return false;

    const expiryMs = payload.exp * 1000 - EXPIRY_BUFFER_MS;
    return Date.now() >= expiryMs;
  },

  clear() {
    Object.values(KEYS).forEach((key) => store().removeItem(key));
    try {
      sessionStorage.removeItem(IMPERSONATION_KEY);
    } catch {
      // Storage blocked: nothing to remove.
    }
    notify();
  },
};
