import { Button, Popconfirm, Space, Tooltip } from "antd";
import { CloseOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useCompanyClosed } from "@/app/modules/billing/hooks/use-company-closed";

interface PortalApplicationRowActionsProps {
  status: string;
  onView: () => void;
  onEdit: () => void;
  withdrawTitle: string;
  onWithdraw: () => void;
  withdrawing?: boolean;
}

/**
 * Row actions on the portal's "My …" application lists: View is always available (read-only);
 * Edit and Withdraw only while the application is still pending. Editing after an approver has
 * signed off sends it back to the first approver (server-side). A closed company (read-only,
 * suspended, on hold) gets View only.
 */
export function PortalApplicationRowActions({
  status,
  onView,
  onEdit,
  withdrawTitle,
  onWithdraw,
  withdrawing,
}: PortalApplicationRowActionsProps) {
  const closed = useCompanyClosed();
  const isPending = status === "ForApproval" && !closed;
  return (
    <Space size={0}>
      <Tooltip title="View">
        <Button
          aria-label="View"
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={onView}
        />
      </Tooltip>
      {isPending && (
        <Tooltip title="Edit">
          <Button
            aria-label="Edit"
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={onEdit}
          />
        </Tooltip>
      )}
      {isPending && (
        <Popconfirm
          title={withdrawTitle}
          description="This cannot be undone. You'll need to file again if you change your mind."
          onConfirm={onWithdraw}
          okText="Withdraw"
          okButtonProps={{ danger: true, loading: withdrawing }}
          cancelText="Cancel"
        >
          <Button
            type="text"
            danger
            size="small"
            icon={<CloseOutlined />}
            title="Withdraw"
          />
        </Popconfirm>
      )}
    </Space>
  );
}
