import { authStorage } from "./auth-storage";
import { impersonationApi } from "@/app/modules/auth/impersonation/services/impersonation.api";
import type { ImpersonationSessionResponse } from "@/app/modules/auth/impersonation/models/api/response/impersonation-session.model";

/** Where an impersonation tab lands once its session is over (stopped, expired or revoked). */
export const IMPERSONATION_ENDED_PATH = "/impersonation-ended";

/** Thrown instead of refreshing: an impersonation session has no refresh, it simply ends. */
export class ImpersonationEndedError extends Error {
  constructor() {
    super("The impersonation session has ended.");
    this.name = "ImpersonationEndedError";
  }
}

/**
 * Turns this tab into the impersonated user's session. The session goes to this tab's
 * sessionStorage only (see auth-storage.ts), so it never touches a real session open in another tab.
 */
export function startImpersonatedSession(
  response: ImpersonationSessionResponse,
): void {
  authStorage.startImpersonation({
    sessionId: response.sessionId,
    operatorEmail: response.operatorEmail,
    expiresAt: response.expiry,
  });
  const claims = authStorage.getTenantClaims(response.accessToken);
  authStorage.save(response.accessToken, {
    email: response.email,
    name: response.name,
    roles: response.roles,
    permissions: response.permissions,
    tenants: response.tenants,
    tenantId: claims.tenantId,
    tenantName: claims.tenantName,
  });
}

/** Flushes everything this tab holds and shows the "session ended" page. */
export function leaveImpersonation(): void {
  authStorage.clear();
  window.location.assign(IMPERSONATION_ENDED_PATH);
}

/** The banner's Stop button: ends the session server-side (best effort), then flushes this tab. */
export async function stopImpersonation(): Promise<void> {
  try {
    await impersonationApi.stop();
  } catch {
    // The token still dies on its own at the session's hard end; never block leaving.
  }
  leaveImpersonation();
}
