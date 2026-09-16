import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useSplitTimeShifts,
  useDeleteSplitTimeShift,
} from "../../hooks/use-split-time-shift-queries";
import SplitTimeShiftTable from "../../components/split-time-shift-table";
import { SPLIT_TIME_SHIFT_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function SplitTimeShiftList() {
  const navigate = useNavigate();
  const {
    data: allShifts = [],
    isLoading,
    refetch,
    isFetching,
  } = useSplitTimeShifts();
  const shifts = allShifts.filter((s) => s.shiftType === "SPLIT");
  const { mutate: remove } = useDeleteSplitTimeShift();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {SPLIT_TIME_SHIFT_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure split shift schedules with separate work periods.
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
                  navigate({ to: "/setup/time-shift/split/create" })
                }
              >
                Add Split Shift
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>
      <SplitTimeShiftTable
        data={shifts}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
