import { Tabs } from "antd";
import type { ApprovalTab } from "@/shared/hooks/use-approval-tabs";

interface Props {
  value: ApprovalTab;
  onChange: (tab: ApprovalTab) => void;
  pendingCount: number;
  processedCount: number;
  /** Set to show the In Progress tab (pending, but on someone else's step). */
  inProgressCount?: number;
  /** Defaults to "Pending"; screens may override, e.g. "For Approval". */
  pendingLabel?: string;
}

// Tab bar for an application list: waiting on approval (optionally split into "your turn" and
// "in progress") vs. already decided (approved / declined / cancelled / withdrawn). State comes
// from useApprovalTabs.
export function ApprovalTabs({
  value,
  onChange,
  pendingCount,
  processedCount,
  inProgressCount,
  pendingLabel = "Pending",
}: Props) {
  return (
    <Tabs
      className="mb-2"
      activeKey={value}
      onChange={(key) => onChange(key as ApprovalTab)}
      items={[
        { key: "pending", label: `${pendingLabel} (${pendingCount})` },
        ...(inProgressCount === undefined
          ? []
          : [
              {
                key: "in-progress",
                label: `In Progress (${inProgressCount})`,
              },
            ]),
        { key: "processed", label: `History (${processedCount})` },
      ]}
    />
  );
}
