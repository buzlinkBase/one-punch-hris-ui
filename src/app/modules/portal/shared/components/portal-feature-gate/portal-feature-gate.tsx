import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { Spin } from "antd";
import { usePortalVisibility } from "../../hooks/use-my-employee-queries";
import type { PortalVisibilityKey } from "../../models/api/response/portal-visibility-response.model";

interface PortalFeatureGateProps {
  feature: PortalVisibilityKey;
  children: ReactNode;
}

/**
 * Keeps a direct URL from opening a My Portal page the company switched off in Company Settings
 * (the menu item is hidden separately, see filterNavByPortalVisibility).
 */
export function PortalFeatureGate({
  feature,
  children,
}: PortalFeatureGateProps) {
  const { data, isLoading } = usePortalVisibility();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spin />
      </div>
    );
  }

  if (data && !data[feature]) {
    return <Navigate to="/portal/dashboard" replace />;
  }

  return <>{children}</>;
}
