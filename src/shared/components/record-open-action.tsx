import { Button, Tooltip, type ButtonProps } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";

interface RecordOpenActionProps {
  /** Pencil "Edit" when true, eye "View" (read-only detail page) otherwise. */
  canEdit: boolean;
  onOpen: () => void;
  size?: ButtonProps["size"];
  type?: ButtonProps["type"];
}

/**
 * Row action that opens a record's detail page. Users without edit rights still get a way in --
 * as a read-only View -- since reaching the list already required the module's View permission.
 */
export function RecordOpenAction({
  canEdit,
  onOpen,
  size,
  type = "text",
}: RecordOpenActionProps) {
  return (
    <Tooltip title={canEdit ? "Edit" : "View"}>
      <Button
        size={size}
        type={type}
        icon={canEdit ? <EditOutlined /> : <EyeOutlined />}
        onClick={onOpen}
      />
    </Tooltip>
  );
}
