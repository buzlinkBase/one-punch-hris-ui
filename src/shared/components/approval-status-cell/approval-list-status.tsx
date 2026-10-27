import type { ReactNode } from "react";
import { StatusTag } from "@/shared/components/status-tag/status-tag";
import { ApprovalStatusCell } from "./approval-status-cell";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";

interface Props {
  applicationType: ApprovalApplicationType;
  applicationId: string;
  approvalStatus?: string | null;
  /**
   * Show the step and who it's pending with (For Approval / In Progress tabs). Explicitly `false`
   * (the History tab) lists who approved each step instead; leave unset for a plain status.
   */
  showProgress?: boolean;
  /** The table's own status display otherwise; defaults to StatusTag. */
  children?: ReactNode;
}

/**
 * Status column of an Applications list: the table's usual status, or -- for a pending row when
 * `showProgress` is on -- "Pending with X (Step n/m)" with the approval timeline a click away.
 */
export function ApprovalListStatus({
  applicationType,
  applicationId,
  approvalStatus,
  showProgress,
  children,
}: Props) {
  const tag = children ?? <StatusTag status={approvalStatus} />;
  // A pending row on the For Approval / In Progress tabs shows where it stands; a decided row on
  // the History tab (showProgress explicitly off) lists who approved each step. Either way the
  // timeline is a click away.
  if (showProgress && approvalStatus === "ForApproval")
    return (
      <ApprovalStatusCell
        applicationType={applicationType}
        applicationId={applicationId}
        approvalStatus={approvalStatus}
      />
    );
  if (showProgress === false && approvalStatus)
    return (
      <ApprovalStatusCell
        applicationType={applicationType}
        applicationId={applicationId}
        approvalStatus={approvalStatus}
        statusTag={tag}
      />
    );
  return tag;
}
