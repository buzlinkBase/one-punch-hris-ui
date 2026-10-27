import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { type ApprovalTab, useApprovalTabs } from "./use-approval-tabs";
import { useMyTurnIds } from "./use-my-turn-ids";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";

/**
 * useApprovalTabs for an Applications list that runs on the approval workflow: For Approval holds
 * only the requests on the viewer's step, In Progress the ones still on someone else's.
 * - `canAct`: whether the showing tab offers Approve/Decline -- In Progress is view-only, except
 *   for Owner/Admin, who may override any step.
 * - `showProgress`: the status column shows the step and who it's pending with.
 */
export function useApplicationApprovalTabs<
  T extends { id?: string; approvalStatus?: string | null },
>(rows: T[], type: ApprovalApplicationType, initialTab?: ApprovalTab) {
  useAuthUser();
  const myTurnIds = useMyTurnIds(type);
  const approval = useApprovalTabs(rows, initialTab, myTurnIds);
  const canOverride = authStorage.hasAnyRole("Owner", "Admin");

  return {
    ...approval,
    canAct: approval.tab !== "in-progress" || canOverride,
    showProgress: approval.tab !== "processed",
  };
}
