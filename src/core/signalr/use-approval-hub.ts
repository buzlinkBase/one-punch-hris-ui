import { useEffect, useRef } from "react";
import { authStorage } from "@/core/auth/auth-storage";
import { queryClient } from "@/core/query-client";
import { MY_NOTIFICATIONS_QUERY_KEY } from "@/core/notifications/hooks/use-user-notifications";
import { approvalMessage } from "@/core/notifications/approval-bell-entry";
import { approvalLink } from "@/core/notifications/approval-link";
import { useApprovalNotificationStore } from "@/core/stores/approval-notification.store";
import { approvalHub } from "./approval-hub.connection";
import { APPROVAL_LIST_QUERY_KEYS } from "./approval-query-keys";
import { startWithRetry } from "./hub-retry";
import {
  APPROVAL_HUB_METHODS,
  type ApprovalPushNotification,
} from "./approval-hub.types";

/**
 * Starts hrms-api's NotificationHub connection for the authenticated session. Mount once at the
 * app-shell level (MainLayout), alongside useTenantHub — it stays alive for as long as that
 * layout is mounted.
 *
 * A push for one person is already saved server-side (the bell's entries, see
 * use-user-notifications.ts), so it only refreshes the bell; a push to every eligible approver
 * isn't saved and goes to useApprovalNotificationStore for this session. It also invalidates the two
 * query keys ApprovalStatusCell/ApprovalTimeline read (src/shared/hooks/use-approval-queries.ts)
 * plus every list showing that application type (APPROVAL_LIST_QUERY_KEYS), so any open page
 * refreshes live instead of waiting on the 5-minute staleTime.
 */
export function useApprovalHub() {
  const addUnsaved = useApprovalNotificationStore((s) => s.addNotification);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !authStorage.getToken()) return;
    started.current = true;

    const connection = approvalHub.getConnection();

    const handleApprovalNotification = (payload: ApprovalPushNotification) => {
      if (payload.id) {
        // Saved server-side: the bell reloads its entries.
        queryClient.invalidateQueries({ queryKey: MY_NOTIFICATIONS_QUERY_KEY });
      } else {
        // A push to every eligible approver isn't saved (the request is in the approval
        // queue), so it's shown for this session only, as before.
        addUnsaved({
          id: `approval-${payload.approvalInstanceId}-${payload.statusLabel}-${payload.timestampUtc}`,
          title: `${payload.applicationTypeLabel} — ${payload.statusLabel}`,
          message: approvalMessage(payload),
          createdAt: payload.timestampUtc,
          link: approvalLink(payload),
          severity: "info",
        });
      }

      queryClient.invalidateQueries({
        queryKey: [
          "approval-instance",
          payload.applicationType,
          payload.applicationId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "approval-eligibility",
          payload.applicationType,
          payload.applicationId,
        ],
      });
      // The lists showing this application's status (portal "My …" and admin lists) too --
      // without this the status column stayed stale until a reload.
      for (const queryKey of APPROVAL_LIST_QUERY_KEYS[
        payload.applicationType
      ] ?? []) {
        queryClient.invalidateQueries({ queryKey });
      }
    };

    connection.on(
      APPROVAL_HUB_METHODS.onApprovalNotification,
      handleApprovalNotification,
    );

    // Retries until connected or unmounted; the expected AbortError from StrictMode's dev-only
    // double-invoke (see tenant-hub.connection.ts's stop()) just ends the loop. Until it
    // connects the bell still loads its saved entries.
    let active = true;
    void startWithRetry(
      () => approvalHub.start(),
      () => active,
    );

    return () => {
      active = false;
      connection.off(
        APPROVAL_HUB_METHODS.onApprovalNotification,
        handleApprovalNotification,
      );
      void approvalHub.stop();
      started.current = false;
    };
  }, [addUnsaved]);
}
