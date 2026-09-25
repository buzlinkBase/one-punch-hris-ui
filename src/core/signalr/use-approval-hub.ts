import { useEffect, useRef } from "react";
import { authStorage } from "@/core/auth/auth-storage";
import { queryClient } from "@/core/query-client";
import { useApprovalNotificationStore } from "@/core/stores/approval-notification.store";
import { approvalHub } from "./approval-hub.connection";
import { APPROVAL_LIST_QUERY_KEYS } from "./approval-query-keys";
import {
  APPROVAL_HUB_METHODS,
  type ApprovalPushNotification,
} from "./approval-hub.types";

function buildMessage(payload: ApprovalPushNotification): string {
  const step =
    payload.stepNumber && payload.totalSteps
      ? `step ${payload.stepNumber} of ${payload.totalSteps}`
      : null;
  if (payload.statusLabel === "Pending Your Approval") {
    return `${payload.applicantName}'s ${payload.applicationTypeLabel} application is waiting on you${
      step ? ` (${step})` : ""
    }.`;
  }
  // Intermediate step cleared on a multi-step chain -- the applicant's "it moved forward" notice.
  if (payload.statusLabel === "Step Approved") {
    return `Your ${payload.applicationTypeLabel} application passed ${step ?? "a step"} and moved to the next approver.`;
  }
  return `Your ${payload.applicationTypeLabel} application was ${payload.statusLabel.toLowerCase()}.`;
}

/**
 * Starts hrms-api's NotificationHub connection for the authenticated session and keeps
 * useApprovalNotificationStore in sync with pushed approval events. Mount once at the
 * app-shell level (MainLayout), alongside useTenantHub — it stays alive for as long as that
 * layout is mounted.
 *
 * On every push, also invalidates the two query keys ApprovalStatusCell/ApprovalTimeline read
 * (src/shared/hooks/use-approval-queries.ts) plus every list showing that application type
 * (APPROVAL_LIST_QUERY_KEYS), so any currently-open page refreshes live instead of waiting on
 * the 5-minute staleTime.
 */
export function useApprovalHub() {
  const addNotification = useApprovalNotificationStore(
    (s) => s.addNotification,
  );
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !authStorage.getToken()) return;
    started.current = true;

    const connection = approvalHub.getConnection();

    const handleApprovalNotification = (payload: ApprovalPushNotification) => {
      addNotification({
        id: `approval-${payload.approvalInstanceId}-${payload.statusLabel}-${payload.timestampUtc}`,
        title: `${payload.applicationTypeLabel} — ${payload.statusLabel}`,
        message: buildMessage(payload),
        applicationType: payload.applicationType,
        applicationId: payload.applicationId,
        approvalInstanceId: payload.approvalInstanceId,
        createdAt: payload.timestampUtc,
        severity: payload.statusLabel === "Declined" ? "warning" : "info",
      });

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

    // Swallows the expected AbortError from React 18 StrictMode's dev-only double-invoke --
    // see tenant-hub.connection.ts's stop() for the full rationale. A genuine connection
    // failure just means no live push for this session; the existing 5-minute staleTime/
    // window-focus refetch is the fallback.
    void approvalHub.start().catch(() => {});

    return () => {
      connection.off(
        APPROVAL_HUB_METHODS.onApprovalNotification,
        handleApprovalNotification,
      );
      void approvalHub.stop();
      started.current = false;
    };
  }, [addNotification]);
}
