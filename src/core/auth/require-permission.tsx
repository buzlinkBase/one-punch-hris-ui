import type { ReactNode } from "react";
import { authStorage } from "./auth-storage";

interface RequirePermissionProps {
  /** Renders children if the user holds at least one of these permission codes. */
  permission?: string | string[];
  /** Renders children if the user holds at least one of these roles. */
  role?: string | string[];
  /** Rendered instead of children when the check fails. Defaults to nothing. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Shows/hides UI based on the current session's permissions/roles for its tenant.
 * When both `permission` and `role` are given, both must pass. Omit a prop to skip that check.
 */
export function RequirePermission({
  permission,
  role,
  fallback = null,
  children,
}: RequirePermissionProps) {
  const permissions = permission
    ? Array.isArray(permission)
      ? permission
      : [permission]
    : [];
  const roles = role ? (Array.isArray(role) ? role : [role]) : [];

  const permissionOk =
    permissions.length === 0 || authStorage.hasAnyPermission(...permissions);
  const roleOk = roles.length === 0 || authStorage.hasAnyRole(...roles);

  return permissionOk && roleOk ? <>{children}</> : <>{fallback}</>;
}
