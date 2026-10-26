import type { ReactNode } from "react";
import { Button, Tooltip } from "antd";

interface Props {
  /** Shown as the tooltip and read by screen readers, e.g. "Edit". */
  title: string;
  icon: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * The icon-only button every table's Actions column uses (Edit, Delete, Approve ...), so the
 * rows look and behave the same everywhere. Wrap it in a Popconfirm for destructive actions and
 * in a PermissionGate when the action needs a permission.
 */
export function IconAction({
  title,
  icon,
  onClick,
  danger,
  loading,
  disabled,
}: Props) {
  return (
    <Tooltip title={title}>
      <Button
        type="text"
        size="small"
        icon={icon}
        danger={danger}
        loading={loading}
        disabled={disabled}
        onClick={onClick}
        aria-label={title}
      />
    </Tooltip>
  );
}
