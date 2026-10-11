import { Tabs } from "antd";
import type { ApprovalTab } from "@/shared/hooks/use-approval-tabs";

interface Props {
  value: ApprovalTab;
  onChange: (tab: ApprovalTab) => void;
  pendingCount: number;
  processedCount: number;
  /** "For Approval" on approver screens; e.g. "Pending" on the employee portal. */
  pendingLabel?: string;
}

// Tab bar for an application list: waiting on approval vs. already processed
// (approved / declined / cancelled / withdrawn). State comes from useApprovalTabs.
export function ApprovalTabs({
  value,
  onChange,
  pendingCount,
  processedCount,
  pendingLabel = "For Approval",
}: Props) {
  return (
    <Tabs
      className="mb-2"
      activeKey={value}
      onChange={(key) => onChange(key as ApprovalTab)}
      items={[
        { key: "pending", label: `${pendingLabel} (${pendingCount})` },
        { key: "processed", label: `Processed (${processedCount})` },
      ]}
    />
  );
}
