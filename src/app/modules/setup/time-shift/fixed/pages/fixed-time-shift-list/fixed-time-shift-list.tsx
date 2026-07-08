import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useFixedTimeShifts,
  useDeleteFixedTimeShift,
} from "../../hooks/use-fixed-time-shift-queries";
import FixedTimeShiftTable from "../../components/fixed-time-shift-table";
import { FIXED_TIME_SHIFT_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function FixedTimeShiftList() {
  const navigate = useNavigate();
  const { data: allShifts = [], isLoading } = useFixedTimeShifts();
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/setup/time-shift/fixed/create" })}
          >
            Add Fixed Shift
          </Button>
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
