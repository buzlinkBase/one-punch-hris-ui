import { Button, Popconfirm, Space, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useCompanyClosed } from "@/app/modules/billing/hooks/use-company-closed";

// What a schedule table's Actions column does with a row; null when the user can't edit.
export interface ScheduleRowHandlers<T> {
  onEdit: (row: T) => void;
  onRemove: (row: T) => void;
}

interface ScheduleRowActionsProps {
  // A row payroll has already used can't be changed or removed (the API refuses it too).
  locked: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

export function ScheduleRowActions({
  locked,
  onEdit,
  onRemove,
}: ScheduleRowActionsProps) {
  // A closed company (read-only, suspended, on hold) changes no schedule row.
  if (useCompanyClosed()) return null;
  if (locked) {
    return (
      <Tooltip title="Already processed by payroll">
        <Space size={4}>
          <Button
            aria-label="Edit"
            size="small"
            type="text"
            icon={<EditOutlined />}
            disabled
          />
          <Button
            aria-label="Delete"
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
            disabled
          />
        </Space>
      </Tooltip>
    );
  }

  return (
    <Space size={4}>
      <Tooltip title="Edit">
        <Button
          aria-label="Edit"
          size="small"
          type="text"
          icon={<EditOutlined />}
          onClick={onEdit}
        />
      </Tooltip>
      <Popconfirm
        title="Remove this row from the schedule?"
        okText="Remove"
        okButtonProps={{ danger: true }}
        onConfirm={onRemove}
      >
        <Tooltip title="Remove">
          <Button
            aria-label="Remove"
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
          />
        </Tooltip>
      </Popconfirm>
    </Space>
  );
}
