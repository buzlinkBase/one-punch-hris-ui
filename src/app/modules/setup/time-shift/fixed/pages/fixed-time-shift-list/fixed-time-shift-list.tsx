import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useFixedTimeShifts,
  useDeleteFixedTimeShift,
} from "../../hooks/use-fixed-time-shift-queries";
import FixedTimeShiftTable from "../../components/fixed-time-shift-table";
import { FIXED_TIME_SHIFT_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function FixedTimeShiftList() {
  const navigate = useNavigate();
  const {
    data: allShifts = [],
    isLoading,
    refetch,
    isFetching,
  } = useFixedTimeShifts();
  const shifts = allShifts.filter((s) => s.shiftType === "FIXED");
  const { mutate: remove } = useDeleteFixedTimeShift();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {FIXED_TIME_SHIFT_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Create standard schedules with fixed start and end times.
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
                  navigate({ to: "/setup/time-shift/fixed/create" })
                }
              >
                Add Fixed Shift
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>
      <FixedTimeShiftTable
        data={shifts}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
