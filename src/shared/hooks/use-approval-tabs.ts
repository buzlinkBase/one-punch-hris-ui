import { useMemo, useState } from "react";

export type ApprovalTab = "pending" | "in-progress" | "processed";

// Still waiting on an approver. Everything else (Approved, Declined, Cancelled, Withdrawn) is
// processed -- including a missing status, which older HR-entered loans have and which the
// screens show as Approved.
export const isPendingApproval = (status?: string | null) =>
  status === "ForApproval";

interface ApprovalRow {
  id?: string;
  approvalStatus?: string | null;
}

/**
 * Sorts rows into the three lists. Without `myTurnIds` every pending row is "pending" (the
 * screens that have no per-approver split); with it, a pending row is "pending" only when its
 * current step is the viewer's turn, and "inProgress" otherwise.
 */
export function splitApprovalRows<T extends ApprovalRow>(
  rows: T[],
  myTurnIds?: ReadonlySet<string>,
) {
  const pending: T[] = [];
  const inProgress: T[] = [];
  const processed: T[] = [];
  for (const row of rows) {
    if (!isPendingApproval(row.approvalStatus)) processed.push(row);
    else if (!myTurnIds || (row.id && myTurnIds.has(row.id))) pending.push(row);
    else inProgress.push(row);
  }
  return { pending, inProgress, processed };
}

/**
 * Splits an application list into "pending" (ForApproval), "in-progress" and "processed" rows
 * and remembers which tab is showing. Apply it after the page's own filters so the tab counts
 * match them. Pair with the ApprovalTabs component. `initialTab` (default "pending") is where
 * the page opens, e.g. on "processed" when a Dashboard figure about approved leave drills into
 * it. `myTurnIds` (from useMyTurnIds) turns on the In Progress split.
 */
export function useApprovalTabs<T extends ApprovalRow>(
  rows: T[],
  initialTab: ApprovalTab = "pending",
  myTurnIds?: ReadonlySet<string>,
) {
  const [tab, setTab] = useState<ApprovalTab>(initialTab);
  const { pending, inProgress, processed } = useMemo(
    () => splitApprovalRows(rows, myTurnIds),
    [rows, myTurnIds],
  );

  const rowsByTab: Record<ApprovalTab, T[]> = {
    pending,
    "in-progress": inProgress,
    processed,
  };

  return {
    tab,
    setTab,
    rows: rowsByTab[tab],
    pendingCount: pending.length,
    inProgressCount: myTurnIds ? inProgress.length : undefined,
    processedCount: processed.length,
  };
}
