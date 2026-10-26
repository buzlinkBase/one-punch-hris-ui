import { Tag } from "antd";
import { APPROVAL_STATUS_LABEL } from "@/shared/constants/approval-status.const";
import { statusTone } from "@/shared/utils/status-tone.util";

interface StatusTagProps {
  status?: string | null;
  /** Overrides the display text; defaults to the approval label, else the raw status. */
  label?: string;
}

/** One status-to-colour mapping for every list, so "Approved" is the same green everywhere. */
export function StatusTag({ status, label }: StatusTagProps) {
  if (!status) return null;
  return (
    <Tag color={statusTone(status)}>
      {label ?? APPROVAL_STATUS_LABEL[status] ?? status}
    </Tag>
  );
}
