import { useState, type ReactNode } from "react";
import { Button, Drawer, Tag, Space } from "antd";
import { useApprovalInstance } from "@/shared/hooks/use-approval-queries";
import { ApprovalTimeline } from "@/shared/components/approval-timeline/approval-timeline";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";

const STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Cancelled: "default",
  Declined: "error",
  Withdrawn: "default",
};

const STATUS_LABEL: Record<string, string> = {
  ForApproval: "For Approval",
  Approved: "Approved",
  Cancelled: "Cancelled",
  Declined: "Declined",
  Withdrawn: "Withdrawn",
};

interface ApprovalStatusCellProps {
  applicationType: ApprovalApplicationType;
  applicationId: string;
  /** The record's own plain status field (e.g. "ForApproval"/"Approved") — shown immediately,
   * before/regardless of whether the richer ApprovalInstance has loaded. */
  approvalStatus: string;
  /** A table's own status display, shown instead of the plain tag (the approvers still list under it). */
  statusTag?: ReactNode;
}

/**
 * Portal (self-service) "pending with X" status display — the admin side already gets this via
 * the full ApprovalTimeline on each module's detail page; the portal has no detail page, so this
 * is a compact per-row cell instead: the plain status tag, plus who it's currently pending with
 * (when known) as a link that opens the full timeline in a Drawer.
 */
export function ApprovalStatusCell({
  applicationType,
  applicationId,
  approvalStatus,
  statusTag,
}: ApprovalStatusCellProps) {
  const [open, setOpen] = useState(false);
  const { data: instance } = useApprovalInstance(
    applicationType,
    applicationId,
  );

  const pendingLabel =
    approvalStatus === "ForApproval" && instance?.status === "InProgress"
      ? instance.currentStepApproverLabel
        ? `Pending with ${instance.currentStepApproverLabel}` +
          (instance.totalSteps > 1
            ? ` (Step ${instance.currentStepNumber}/${instance.totalSteps})`
            : "")
        : `Pending (Step ${instance.currentStepNumber}/${instance.totalSteps})`
      : null;

  const hasHistory = !!instance && instance.actions.length > 0;
  // Who decided each step so far, so the list shows the approvers on every step without opening
  // the drawer.
  const decisions = (instance?.actions ?? []).filter(
    (a) =>
      a.action === "Approved" ||
      a.action === "Declined" ||
      a.action === "Skipped",
  );

  return (
    <>
      <Space direction="vertical" size={0}>
        {statusTag ?? (
          <Tag color={STATUS_COLOR[approvalStatus] ?? "default"}>
            {STATUS_LABEL[approvalStatus] ?? approvalStatus}
          </Tag>
        )}
        {decisions.map((a, i) => (
          <span key={`${a.stepNumber}-${i}`} className="text-xs">
            <span className="opacity-60">Step {a.stepNumber} · </span>
            {a.action === "Skipped"
              ? "Skipped"
              : `${a.actorName ?? "—"}${a.onBehalfOfName ? ` (for ${a.onBehalfOfName})` : ""}`}
            {a.action !== "Skipped" && (
              <span
                className={`ms-1 ${a.action === "Declined" ? "text-red-500" : "text-green-600"}`}
              >
                {a.action === "Declined" ? "✗" : "✓"}
              </span>
            )}
          </span>
        ))}
        {(pendingLabel || hasHistory) && (
          <Button
            type="link"
            size="small"
            className="h-auto! p-0!"
            onClick={() => setOpen(true)}
          >
            {pendingLabel ?? "View progress"}
          </Button>
        )}
      </Space>
      <Drawer
        title="Approval Progress"
        open={open}
        onClose={() => setOpen(false)}
        width={420}
      >
        <ApprovalTimeline
          applicationType={applicationType}
          applicationId={applicationId}
        />
      </Drawer>
    </>
  );
}
