import { Button, Popconfirm, Space, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

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
  if (locked) {
    return (
      <Tooltip title="Already processed by payroll">
        <Space size={4}>
          <Button size="small" type="text" icon={<EditOutlined />} disabled />
          <Button
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
          <Button size="small" type="text" danger icon={<DeleteOutlined />} />
        </Tooltip>
      </Popconfirm>
    </Space>
  );
}
