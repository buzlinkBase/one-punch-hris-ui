import { Form, Input } from "antd";
import {
  APPROVAL_STATUS_LABEL,
  DEFAULT_FILING_STATUS,
} from "@/shared/constants/approval-status.const";

interface ApprovalStatusFieldProps {
  /** The record's current status; omitted on a new filing, which always starts For Approval. */
  status?: string;
  label?: string;
}

/**
 * Read-only status on an application entry form. Status is never user-editable -- it only
 * changes through the approve/decline actions (the approval engine), so no one can skip the
 * configured approvers from the form.
 */
export function ApprovalStatusField({
  status,
  label = "Status",
}: ApprovalStatusFieldProps) {
  const value = status ?? DEFAULT_FILING_STATUS;
  return (
    <Form.Item label={label}>
      <Input disabled value={APPROVAL_STATUS_LABEL[value] ?? value} />
    </Form.Item>
  );
}
