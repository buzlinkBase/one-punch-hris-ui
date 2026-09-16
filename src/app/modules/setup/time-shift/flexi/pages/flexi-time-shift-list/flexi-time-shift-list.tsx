import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useFlexiTimeShifts,
  useDeleteFlexiTimeShift,
} from "../../hooks/use-flexi-time-shift-queries";
import FlexiTimeShiftTable from "../../components/flexi-time-shift-table";
import { FLEXI_TIME_SHIFT_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function FlexiTimeShiftList() {
  const navigate = useNavigate();
  const {
    data: allShifts = [],
    isLoading,
    refetch,
    isFetching,
  } = useFlexiTimeShifts();
  const shifts = allShifts.filter((s) => s.shiftType === "FLEXI");
  const { mutate: remove } = useDeleteFlexiTimeShift();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {FLEXI_TIME_SHIFT_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure flexible shift windows and required working hours.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <PermissionGate permission="Time Shift Setup:Create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() =>
                  navigate({ to: "/setup/time-shift/flexi/create" })
                }
              >
                Add Flexi Shift
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>
      <FlexiTimeShiftTable
        data={shifts}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
