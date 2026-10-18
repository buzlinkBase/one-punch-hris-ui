import { Button, Popconfirm } from "antd";
import { SyncOutlined } from "@ant-design/icons";

interface GenerateScheduleButtonProps {
  // True once rows were edited or removed by hand: regenerating would throw that work away.
  hasManualChanges: boolean;
  onGenerate: () => void;
}

export function GenerateScheduleButton({
  hasManualChanges,
  onGenerate,
}: GenerateScheduleButtonProps) {
  const button = (
    <Button
      icon={<SyncOutlined />}
      onClick={hasManualChanges ? undefined : onGenerate}
    >
      Generate Schedule
    </Button>
  );

  if (!hasManualChanges) return button;

  return (
    <Popconfirm
      title="Regenerate the schedule?"
      description="This discards the changes you made to individual rows."
      okText="Regenerate"
      onConfirm={onGenerate}
    >
      {button}
    </Popconfirm>
  );
}
