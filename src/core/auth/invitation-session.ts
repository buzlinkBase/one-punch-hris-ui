import { authStorage } from "./auth-storage";
import type { AcceptInvitationResponse } from "@/app/modules/auth/login/models/api/response/accept-invitation-response.model";

/** sessionStorage key accept-invitation.tsx parks an invite token under when the invitee must
 * sign in first; login.tsx accepts it right after a successful sign-in. */
export const PENDING_INVITE_KEY = "pending_invite_token";

// LoginResponse is a structural superset of this, so every invitation/sign-up response fits.
type SessionResult = Pick<
  AcceptInvitationResponse,
  "accessToken" | "tenants" | "email" | "name" | "roles" | "permissions"
>;

/**
 * Persists the session returned by an invitation acceptance (or the sign-up that precedes one)
 * -- the single place that used to be copy-pasted across accept-invitation.tsx and login.tsx.
 *
 * - Saves the RESPONSE's access token: it's already scoped to the newly-joined tenant, unlike
 *   whatever token was stored before.
 * - Keeps tenants the stored session knew about that the response omits, but only when that
 *   stored session is the SAME account -- a new invitee accepting in a browser where someone
 *   else was signed in must not inherit that person's companies.
 * - Active tenant comes from the token's own claims, falling back to the first listed tenant.
 */
export function saveInvitationSession(result: SessionResult): void {
  const claims = authStorage.getTenantClaims(result.accessToken);
  const current = authStorage.getUser();
  const sameAccount =
    !!current?.email &&
    current.email.toLowerCase() === result.email.toLowerCase();

  const resultIds = new Set(result.tenants.map((t) => t.tenantId));
  const preserved = sameAccount
    ? (current?.tenants ?? []).filter((t) => !resultIds.has(t.tenantId))
    : [];
  const activeTenant =
    result.tenants.find((t) => t.tenantId === claims.tenantId) ??
    result.tenants[0];

  authStorage.save(result.accessToken, {
    email: result.email,
    name: result.name,
    roles: result.roles,
    permissions: result.permissions,
    tenants: [...result.tenants, ...preserved],
    tenantId: claims.tenantId ?? activeTenant?.tenantId ?? null,
    tenantName: claims.tenantName ?? activeTenant?.name ?? null,
  });
}
