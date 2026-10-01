import { useEffect, useRef } from "react";
import { message, notification } from "antd";
import { authStorage } from "@/core/auth/auth-storage";
import { refreshAccessToken } from "@/core/auth/auth-refresh";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import { queryClient } from "@/core/query-client";
import { useTenantHubStore } from "@/core/stores/tenant-hub.store";
import { tenantHub } from "./tenant-hub.connection";
import { approvalHub } from "./approval-hub.connection";
import {
  TENANT_HUB_METHODS,
  type HrDbCreatedNotification,
  type RolesChangedNotification,
  type SessionRevokedNotification,
  type SignedOutNotification,
  type TenantCreatedNotification,
  type TenantRenamedNotification,
} from "./tenant-hub.types";
import { rolesChangedAction } from "./roles-changed-action";
import { describeAccessChange } from "./describe-access-change";
import { SIGNED_OUT_PARAM, shouldSignOut } from "./signed-out-action";

const POLL_INTERVAL_MS = 10_000;
const POLL_MAX_MS = 10 * 60_000; // stop after 10 minutes

function isFailedStatus(status: string): boolean {
  return /fail|error/i.test(status);
}

/**
 * Starts the TenantHub connection for the authenticated session and keeps
 * `useTenantHubStore` in sync with live tenant-state, HR-database-readiness, and
 * notification pushes. Mount once at the app-shell level (MainLayout) — it stays
 * alive for as long as that layout is mounted.
 */
export function useTenantHub() {
  const setTenantState = useTenantHubStore((s) => s.setTenantState);
  const setHrDbStatus = useTenantHubStore((s) => s.setHrDbStatus);
  const addNotification = useTenantHubStore((s) => s.addNotification);
  const started = useRef(false);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tenantId = authStorage.getTenantId();
    if (started.current || !authStorage.getToken()) return;
    started.current = true;

    const connection = tenantHub.getConnection();

    const handleTenantCreated = (payload: TenantCreatedNotification) => {
      setTenantState(payload.tenantId, "Created");
      addNotification({
        id: `tenant-created-${payload.tenantId}`,
        title: "Company ready",
        message: `"${payload.tenantName}" has been created.`,
        tenantId: payload.tenantId,
        createdAt: new Date().toISOString(),
        severity: "success",
      });
    };

    const stopPolling = () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    };

    const handleHrDbCreated = (payload: HrDbCreatedNotification) => {
      const failed = isFailedStatus(payload.status);
      setHrDbStatus(payload.tenantId, payload.status, !failed);
      if (!failed) stopPolling();
      addNotification({
        id: `hrdb-created-${payload.tenantId}-${payload.status}`,
        title: failed ? "Company setup failed" : "Company ready",
        message: failed
          ? "We couldn't finish setting up your company resources."
          : "Your company resources are ready.",
        tenantId: payload.tenantId,
        createdAt: new Date().toISOString(),
        severity: failed ? "error" : "success",
      });
    };

    const handleRolesChanged = async (payload?: RolesChangedNotification) => {
      // Only the company this session is working in matters -- see rolesChangedAction.
      const action = rolesChangedAction(
        payload?.tenantId,
        authStorage.getTenantId(),
        authStorage.getTenants().map((t) => t.tenantId),
      );
      if (action === "ignore") return;

      const before = authStorage.getUser();
      try {
        // force=true -- this fires because roles changed, not because the token expired, so
        // the existing-token-is-still-valid shortcut inside refreshAccessToken must be
        // bypassed or this would just hand back the same stale roles it already had.
        await refreshAccessToken(true);
      } catch {
        // A real 401 already hard-redirects to /login inside refreshAccessToken.
        return;
      }
      if (action === "refresh-silently") return;

      queryClient.invalidateQueries();
      // Approver-group membership is derived from the token on connect -- see restart().
      void approvalHub.restart().catch(() => {});

      const after = authStorage.getUser();
      if (!before || !after) return;
      const notice = describeAccessChange(before, after);
      notification.info({
        message: notice.title,
        description: notice.description,
        placement: "topRight",
      });
    };

    const handleTenantRenamed = async (
      notification: TenantRenamedNotification,
    ) => {
      // Show the new name right away, then re-mint the token so its tenantName claim (and the
      // server's fresh company list) catch up too.
      authStorage.renameTenant(notification.tenantId, notification.tenantName);
      try {
        await refreshAccessToken(true);
      } catch {
        // A real 401 already hard-redirects to /login inside refreshAccessToken.
        return;
      }
      // The refresh can only re-mint for the default company; keep a renamed active company's
      // new name even if the session is working in a non-default one.
      authStorage.renameTenant(notification.tenantId, notification.tenantName);
      if (authStorage.getTenantId() === notification.tenantId) {
        message.info(`Company name updated to "${notification.tenantName}".`);
      }
    };

    const handleSessionRevoked = (notification: SessionRevokedNotification) => {
      // A user can belong to multiple companies -- losing access to one shouldn't nuke the whole
      // session. Only force this session out if the revoked company is the one it's actively
      // using; otherwise just drop it from the cached company list so it stops showing up in the
      // company switcher, and leave everything else alone.
      const wasActiveTenant =
        authStorage.getTenantId() === notification.tenantId;
      authStorage.removeTenant(notification.tenantId);
      if (!wasActiveTenant) return;

      message.error("Your access to this company has been revoked.");
      queryClient.clear();
      if (authStorage.getTenants().length > 0) {
        window.location.href = "/select-tenant";
      } else {
        authStorage.clear();
        window.location.href = "/login";
      }
    };

    // The password was changed elsewhere (or reset): this session's refresh token is already
    // revoked, so leave now rather than fail at the next refresh. The login page says why.
    const handleSignedOut = (payload: SignedOutNotification) => {
      if (!shouldSignOut(payload, authStorage.getToken())) return;
      queryClient.clear();
      authStorage.clear();
      window.location.href = `/login?${SIGNED_OUT_PARAM}=${encodeURIComponent(payload.reason ?? "")}`;
    };

    connection.on(TENANT_HUB_METHODS.onTenantCreated, handleTenantCreated);
    connection.on(TENANT_HUB_METHODS.onHrDbCreated, handleHrDbCreated);
    connection.on(TENANT_HUB_METHODS.onRolesChanged, handleRolesChanged);
    connection.on(TENANT_HUB_METHODS.onSessionRevoked, handleSessionRevoked);
    connection.on(TENANT_HUB_METHODS.onTenantRenamed, handleTenantRenamed);
    connection.on(TENANT_HUB_METHODS.onSignedOut, handleSignedOut);

    // Swallows the expected AbortError from React 18 StrictMode's dev-only double-invoke (the
    // first mount's connection gets stopped mid-negotiate by its own cleanup before this ever
    // settles) -- see the comment on tenantHub.stop(). A genuine connection failure just means
    // no live push for this session, already tolerated by falling back to the existing
    // expiry-based refresh, so silently dropping it here isn't hiding anything actionable.
    void tenantHub.start().catch(() => {});

    // Seed HR-DB status on load/refresh from stored tenant list first (no network needed).
    authStorage.getTenants().forEach((tenant) => {
      setHrDbStatus(tenant.tenantId, tenant.hrDbStatus, tenant.hrDbReady);
    });

    if (tenantId) {
      const startedAt = Date.now();

      const startPolling = () => {
        if (pollTimer.current) return;
        pollTimer.current = setInterval(async () => {
          // Stop if already ready (hub push may have fired while we were waiting)
          if (useTenantHubStore.getState().hrDbStatuses[tenantId]?.ready) {
            stopPolling();
            return;
          }
          // Stop after POLL_MAX_MS to avoid polling forever on permanent failures
          if (Date.now() - startedAt > POLL_MAX_MS) {
            stopPolling();
            return;
          }
          try {
            const status = await authApi.getTenantCreationStatus(tenantId);
            setHrDbStatus(tenantId, status.hrDbStatus, status.hrDbReady);
            if (status.hrDbReady) stopPolling();
          } catch {
            // ignore — keep polling
          }
        }, POLL_INTERVAL_MS);
      };

      // Initial REST check — more reliable than stored data for detecting a push
      // that fired while the tab was closed or during the page-reload after create-tenant.
      authApi
        .getTenantCreationStatus(tenantId)
        .then((status) => {
          setHrDbStatus(tenantId, status.hrDbStatus, status.hrDbReady);
          // If not ready yet, poll until the hub push arrives or the REST endpoint confirms ready.
          if (!status.hrDbReady) startPolling();
        })
        .catch(() => {
          // Status endpoint unreachable — poll so we recover when it comes back.
          startPolling();
        });
    }

    return () => {
      connection.off(TENANT_HUB_METHODS.onTenantCreated, handleTenantCreated);
      connection.off(TENANT_HUB_METHODS.onHrDbCreated, handleHrDbCreated);
      connection.off(TENANT_HUB_METHODS.onRolesChanged, handleRolesChanged);
      connection.off(TENANT_HUB_METHODS.onSessionRevoked, handleSessionRevoked);
      connection.off(TENANT_HUB_METHODS.onTenantRenamed, handleTenantRenamed);
      connection.off(TENANT_HUB_METHODS.onSignedOut, handleSignedOut);
      if (pollTimer.current) clearInterval(pollTimer.current);
      void tenantHub.stop();
      started.current = false;
    };
  }, [setTenantState, setHrDbStatus, addNotification]);
}
