import { useState } from "react";
import { Alert, Button, Space } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { STORAGE_LABEL } from "../../constants/label.const";
import { useStorageStatus } from "../../hooks/use-subscription-queries";
import {
  BILLING_PERMISSION,
  STORAGE_PERMISSION,
} from "../../hooks/use-subscription-state";
import { localDayKey } from "../../utils/trial-schedule";
import { storageBannerKind } from "../../utils/storage";

// A dismissed notice stays gone for the rest of the day, in this browser only -- a per-viewer
// convenience; the storage state itself never depends on it.
function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string) {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // Storage unavailable: the notice simply shows again.
  }
}

/**
 * Warns the people who run the company when its storage is filling up: a subtle notice from 80%
 * (dismissible for the day) and a high-priority one from 95% that stays until space is freed or
 * more is added. Shown to the owner, admins and billing roles -- not to everyone else; the owner
 * and billing admins get a way to the Billing page, an admin is told who can add storage, and
 * anyone who may manage storage gets a way to free up space instead.
 */
export function StorageBanner() {
  const navigate = useNavigate();
  useAuthUser(); // re-evaluate when the session switches company
  const canViewBilling = useHasPermission(BILLING_PERMISSION.VIEW);
  const canManageBilling = useHasPermission(BILLING_PERMISSION.MANAGE);
  const canFreeUp = useHasPermission(
    STORAGE_PERMISSION.VIEW,
    STORAGE_PERMISSION.MANAGE,
  );
  const eligible =
    canViewBilling ||
    canManageBilling ||
    authStorage.hasAnyRole("Owner", "Admin");
  const { data: status } = useStorageStatus(eligible);
  const [, rerender] = useState(0);
  const [now] = useState(() => Date.now());
  const tenantId = authStorage.getTenantId() ?? "none";

  const kind = storageBannerKind(status);
  if (!eligible || !status || !kind) return null;

  const dismissKey = `storage-banner:${tenantId}:${localDayKey(now)}`;
  if (kind === "warning" && readFlag(dismissKey)) return null;

  const percent = status.percentUsed ?? 0;
  const text =
    kind === "critical"
      ? STORAGE_LABEL.BANNER_CRITICAL
      : STORAGE_LABEL.BANNER_WARNING;
  const message = text.replace("{percent}", String(percent));
  const goToBilling = () => navigate({ to: "/billing" });
  const goToStorage = () => navigate({ to: "/billing/storage" });

  return (
    <Alert
      className="mx-2 mt-2 md:mx-6 md:mt-4"
      type={kind === "critical" ? "error" : "warning"}
      showIcon
      message={message}
      description={
        !canViewBilling && !canManageBilling
          ? STORAGE_LABEL.BANNER_ADMIN_HINT
          : undefined
      }
      closable={kind === "warning"}
      onClose={() => {
        writeFlag(dismissKey);
        rerender((n) => n + 1);
      }}
      action={
        <Space size="small" wrap>
          {canFreeUp && (
            <Button size="small" onClick={goToStorage}>
              {STORAGE_LABEL.FREE_UP}
            </Button>
          )}
          {(canViewBilling || canManageBilling) && (
            <Button size="small" type="primary" onClick={goToBilling}>
              {STORAGE_LABEL.UPGRADE}
            </Button>
          )}
        </Space>
      }
    />
  );
}
