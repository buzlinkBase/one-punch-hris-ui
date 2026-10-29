import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { useCompanyClosed } from "@/app/modules/billing/hooks/use-company-closed";
import { allowedWhileReadOnly } from "@/app/modules/billing/utils/read-only-permissions";

/**
 * Hook form of PermissionGate's check -- true when the caller holds any of `codes` (Owner always
 * does). Subscribes to the auth session so a roles-changed token refresh re-renders the caller.
 * While the company is closed (read-only, suspended, on hold), write permissions count as not
 * held -- the server would refuse them anyway -- so add/edit/delete actions hide and detail pages
 * open as View.
 */
export function useHasPermission(...codes: string[]): boolean {
  useAuthUser();
  const closed = useCompanyClosed();
  const usable = closed ? codes.filter(allowedWhileReadOnly) : codes;
  // Checked first: the Owner shortcut would grant an empty list.
  if (usable.length === 0) return false;
  return authStorage.hasAnyPermission(...usable);
}
