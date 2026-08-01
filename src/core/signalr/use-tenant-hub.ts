import { useEffect, useRef } from "react";
import { authStorage } from "@/core/auth/auth-storage";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import { useTenantHubStore } from "@/core/stores/tenant-hub.store";
import { tenantHub } from "./tenant-hub.connection";
import {
  TENANT_HUB_METHODS,
  type HrDbCreatedNotification,
  type TenantCreatedNotification,
} from "./tenant-hub.types";

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
        title: "Workspace ready",
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
        title: failed ? "Workspace setup failed" : "Workspace ready",
        message: failed
          ? "We couldn't finish setting up your workspace resources."
          : "Your workspace resources are ready.",
        tenantId: payload.tenantId,
        createdAt: new Date().toISOString(),
        severity: failed ? "error" : "success",
      });
    };

    connection.on(TENANT_HUB_METHODS.onTenantCreated, handleTenantCreated);
    connection.on(TENANT_HUB_METHODS.onHrDbCreated, handleHrDbCreated);

    void tenantHub.start();

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
      if (pollTimer.current) clearInterval(pollTimer.current);
      void tenantHub.stop();
      started.current = false;
    };
  }, [setTenantState, setHrDbStatus, addNotification]);
}
