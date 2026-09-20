import type { ReactNode } from "react";
import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";

interface PermissionGateProps {
  /** Any-of requirement — renders children if the caller holds at least one of these codes. */
  permission: string | string[];
  children: ReactNode;
}

/**
 * Hides an action (button, icon, form field) the caller isn't allowed to use — mirrors
 * filterNavByPermission's authStorage.hasAnyPermission check (main-layout.tsx) but at the
 * component level, for actions inside a page rather than nav items. Renders nothing rather than
 * a disabled state, matching how the nav already behaves.
 */
export function PermissionGate({ permission, children }: PermissionGateProps) {
  useAuthUser(); // re-renders this on any auth-session change (e.g. a roles-changed refresh)

  const codes = Array.isArray(permission) ? permission : [permission];
  if (!authStorage.hasAnyPermission(...codes)) return null;
  return <>{children}</>;
}
