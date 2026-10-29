import type { ReactNode } from "react";
import { useHasPermission } from "@/shared/hooks/use-has-permission";

interface PermissionGateProps {
  /** Any-of requirement — renders children if the caller holds at least one of these codes. */
  permission: string | string[];
  children: ReactNode;
}

/**
 * Hides an action (button, icon, form field) the caller isn't allowed to use — mirrors
 * filterNavByPermission's authStorage.hasAnyPermission check (main-layout.tsx) but at the
 * component level, for actions inside a page rather than nav items. Renders nothing rather than
 * a disabled state, matching how the nav already behaves. Follows useHasPermission, so write
 * actions also hide while the company is read-only.
 */
export function PermissionGate({ permission, children }: PermissionGateProps) {
  const codes = Array.isArray(permission) ? permission : [permission];
  if (!useHasPermission(...codes)) return null;
  return <>{children}</>;
}
