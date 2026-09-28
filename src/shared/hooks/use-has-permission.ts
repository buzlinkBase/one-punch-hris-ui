import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";

/**
 * Hook form of PermissionGate's check -- true when the caller holds any of `codes` (Owner always
 * does). Subscribes to the auth session so a roles-changed token refresh re-renders the caller.
 */
export function useHasPermission(...codes: string[]): boolean {
  useAuthUser();
  return authStorage.hasAnyPermission(...codes);
}
