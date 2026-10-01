import { decodeJwt } from "@/core/auth/jwt.util";
import type { SignedOutNotification } from "./tenant-hub.types";

/** The login page's search param carrying why the user was signed out. */
export const SIGNED_OUT_PARAM = "signedOut";

/**
 * Whether a "SignedOut" push applies to this browser. A password change keeps the session that
 * made it -- the one whose access token is `exceptTokenId` (its `jti`); tabs of the same browser
 * share that token, so they stay too. A reset keeps none.
 */
export function shouldSignOut(
  payload: SignedOutNotification | null | undefined,
  currentToken: string | null | undefined,
): boolean {
  if (!payload?.exceptTokenId) return true;
  const tokenId = currentToken
    ? decodeJwt<{ jti?: string }>(currentToken)?.jti
    : undefined;
  return tokenId !== payload.exceptTokenId;
}

/** What the login page tells someone who was signed out. */
export function signedOutMessage(reason: string | null | undefined): string {
  switch (reason) {
    case "PasswordChanged":
      return "Your password was changed on another device, so you were signed out here. Sign in with your new password.";
    case "PasswordReset":
      return "Your password was reset, so you were signed out on every device. Sign in with your new password.";
    default:
      return "You were signed out. Please sign in again.";
  }
}
