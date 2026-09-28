import { useMemo, useState } from "react";

export type ApprovalTab = "pending" | "processed";

// Still waiting on an approver. Everything else (Approved, Declined, Cancelled, Withdrawn) is
// processed -- including a missing status, which older HR-entered loans have and which the
// screens show as Approved.
export const isPendingApproval = (status?: string | null) =>
  status === "ForApproval";

/**
 * Splits an application list into "pending" (ForApproval) and "processed" rows and remembers
 * which tab is showing. Apply it after the page's own filters so the tab counts match them.
 * Pair with the ApprovalTabs component.
 */
export function useApprovalTabs<T extends { approvalStatus?: string | null }>(
  rows: T[],
) {
  const [tab, setTab] = useState<ApprovalTab>("pending");
  const { pending, processed } = useMemo(() => {
    const pendingRows: T[] = [];
    const processedRows: T[] = [];
    for (const row of rows) {
      (isPendingApproval(row.approvalStatus)
        ? pendingRows
        : processedRows
      ).push(row);
    }
    return { pending: pendingRows, processed: processedRows };
  }, [rows]);

  return {
    tab,
    setTab,
    rows: tab === "pending" ? pending : processed,
    pendingCount: pending.length,
    processedCount: processed.length,
  };
}
