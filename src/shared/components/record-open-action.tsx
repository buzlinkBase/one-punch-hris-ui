import { Button, Tooltip, type ButtonProps } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useCompanyClosed } from "@/app/modules/billing/hooks/use-company-closed";

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
 * A closed company (read-only, suspended, on hold) always gets the View.
 */
export function RecordOpenAction({
  canEdit,
  onOpen,
  size,
  type = "text",
}: RecordOpenActionProps) {
  const closed = useCompanyClosed();
  const editable = canEdit && !closed;
  return (
    <Tooltip title={editable ? "Edit" : "View"}>
      <Button
        size={size}
        type={type}
        icon={editable ? <EditOutlined /> : <EyeOutlined />}
        onClick={onOpen}
      />
    </Tooltip>
  );
}
