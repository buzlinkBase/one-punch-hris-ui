import type { ReactNode } from "react";
import { useCompanyClosed } from "@/app/modules/billing/hooks/use-company-closed";

interface WriteGateProps {
  children: ReactNode;
}

/**
 * Hides a change action (save, file, cancel, upload ...) while the company is closed -- read-only,
 * suspended or on hold. The companion of PermissionGate for actions that have no permission code
 * of their own, such as Employee Portal self-service; PermissionGate already hides permissioned
 * write actions on its own.
 */
export function WriteGate({ children }: WriteGateProps) {
  if (useCompanyClosed()) return null;
  return <>{children}</>;
}
