import { Alert } from "antd";

interface ApprovalRestartNoticeProps {
  /** The record's current status -- the notice only applies to a still-pending application. */
  status?: string;
  className?: string;
}

/**
 * Shown while editing a pending application: the server sends an edited application back to its
 * first approver if anyone already approved it (ApprovalEngineService.RestartIfProgressedAsync),
 * so whoever saves should know an in-progress approval chain will start over.
 */
export function ApprovalRestartNotice({
  status,
  className = "mb-4",
}: ApprovalRestartNoticeProps) {
  if (status !== "ForApproval") return null;
  return (
    <Alert
      type="info"
      showIcon
      className={className}
      message="If an approver has already approved this, saving your changes sends it back to the first approver."
    />
  );
}
