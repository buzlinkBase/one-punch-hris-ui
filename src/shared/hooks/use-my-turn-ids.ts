import { useMemo } from "react";
import { usePendingApprovals } from "@/app/modules/portal/approvals/hooks/use-my-approvals-queries";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";

/**
 * Ids of the `type` requests whose current step is the signed-in person's turn (the same list
 * My Approvals shows). Pass to useApprovalTabs so For Approval holds only those and the rest go
 * to In Progress.
 */
export function useMyTurnIds(
  type: ApprovalApplicationType,
): ReadonlySet<string> {
  const { data: items } = usePendingApprovals();
  return useMemo(
    () =>
      new Set(
        (items ?? [])
          .filter((item) => item.applicationType === type)
          .map((item) => item.applicationId),
      ),
    [items, type],
  );
}
