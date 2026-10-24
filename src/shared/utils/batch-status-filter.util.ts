export type BatchStatusFilter =
  | "all"
  | "ForApproval"
  | "Approved"
  | "Declined"
  | "Cancelled"
  | "PendingDeletion";

export const BATCH_STATUS_FILTER_OPTIONS: {
  value: BatchStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  { value: "ForApproval", label: "For Approval" },
  { value: "Approved", label: "Approved" },
  { value: "Declined", label: "Declined" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "PendingDeletion", label: "Pending Deletion" },
];

// A batch awaiting deletion approval keeps approvalStatus "Approved", but the list shows it as
// "Pending Deletion" -- so the filter has to treat it as its own status to match what users see.
export function matchesBatchStatus(
  filter: BatchStatusFilter,
  approvalStatus: string | null | undefined,
  pendingDeletion: boolean | null | undefined,
): boolean {
  if (filter === "all") return true;
  if (filter === "PendingDeletion") return !!pendingDeletion;
  if (pendingDeletion) return false;
  return (approvalStatus ?? "Approved") === filter;
}
