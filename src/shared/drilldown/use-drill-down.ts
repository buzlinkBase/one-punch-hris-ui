import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { useSubscriptionState } from "@/app/modules/billing/hooks/use-subscription-state";
import {
  getFeaturesForPath,
  getPermissionForPath,
  getRequiredFeatures,
  withHrmsProduct,
} from "@/shared/constants/navigation.const";
import type { DrillTarget } from "./drill-target";

/** A figure's click handler, or undefined when it has nothing to open. */
export type DrillAction = (() => void) | undefined;

/**
 * Turns drill targets into click handlers -- only for screens this person may open: they hold
 * the screen's permission (the same one the menu and route guard use) and the plan includes it.
 * A screen with no permission to look up never opens, so a new hidden page isn't exposed by
 * accident. Re-renders when the session's permissions change.
 */
export function useDrillDown() {
  useAuthUser();
  const navigate = useNavigate();
  const { lockFor } = useSubscriptionState();

  const canOpen = useCallback(
    (target: DrillTarget) => {
      const permission = target.permission ?? getPermissionForPath(target.to);
      if (!permission) return false;
      const permitted = authStorage.hasAnyPermission(
        ...(Array.isArray(permission) ? permission : [permission]),
      );
      const features = getRequiredFeatures(getFeaturesForPath(target.to));
      return permitted && !lockFor(withHrmsProduct(target.to, features));
    },
    [lockFor],
  );

  const action = useCallback(
    (target: DrillTarget | null | undefined): DrillAction =>
      target && canOpen(target)
        ? () => navigate({ to: target.to, search: target.search ?? {} })
        : undefined,
    [canOpen, navigate],
  );

  return { action };
}
