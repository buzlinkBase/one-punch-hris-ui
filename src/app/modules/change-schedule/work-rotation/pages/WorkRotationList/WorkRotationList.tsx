import { useState } from "react";
import { Button, Typography, Select, Form, DatePicker } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import type { WorkRotationFilter } from "../../models/api/request/work-rotation-filter.model";
import {
  useWorkRotations,
  useDeleteWorkRotation,
} from "../../hooks/useWorkRotationQueries";
import WorkRotationTable from "../../components/WorkRotationTable";
import { WORK_ROTATION_LABEL } from "../../constants/label.const";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const PAYROLL_GROUP_OPTIONS = [
  { value: "pg-1", label: "Payroll Group 1" },
  { value: "pg-2", label: "Payroll Group 2" },
  { value: "pg-3", label: "Payroll Group 3" },
];

const CLIENT_OPTIONS = [
  { value: "client-1", label: "Client A" },
  { value: "client-2", label: "Client B" },
  { value: "client-3", label: "Client C" },
];

export default function WorkRotationList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<WorkRotationFilter>({});

  const { data: records = [], isLoading } = useWorkRotations(filter);
  const { mutate: remove } = useDeleteWorkRotation();

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
  ) => {
    if (dates && dates[0] && dates[1]) {
      setFilter((f) => ({
        ...f,
        fromPayrollDate: dates[0]!.format("YYYY-MM-DD"),
        toPayrollDate: dates[1]!.format("YYYY-MM-DD"),
      }));
    } else {
      setFilter((f) => {
        const next = { ...f };
        delete next.fromPayrollDate;
        delete next.toPayrollDate;
        return next;
      });
    }
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {WORK_ROTATION_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage employee work rotation plans and time shift assignments.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate({ to: "/change-schedule/work-rotation/create" })
            }
          >
            Add Work Rotation Plan
          </Button>
        </div>
      </div>

      <Form layout="inline" className="mb-4 flex flex-wrap gap-2">
        <Form.Item label={WORK_ROTATION_LABEL.FILTER_PAYROLL_GROUP}>
          <Select
            allowClear
            placeholder="All"
            options={PAYROLL_GROUP_OPTIONS}
            value={filter.payrollGroupId}
            onChange={(val) =>
              setFilter((f) => ({ ...f, payrollGroupId: val }))
            }
            style={{ width: 180 }}
          />
        </Form.Item>
        <Form.Item label={WORK_ROTATION_LABEL.FILTER_CLIENT}>
          <Select
            allowClear
            placeholder="All"
            options={CLIENT_OPTIONS}
            value={filter.clientId}
            onChange={(val) => setFilter((f) => ({ ...f, clientId: val }))}
            style={{ width: 160 }}
          />
        </Form.Item>
        <Form.Item label={WORK_ROTATION_LABEL.PAYROLL_DATE}>
          <RangePicker
            format="YYYY-MM-DD"
            onChange={handleDateRangeChange}
            style={{ width: 280 }}
          />
        </Form.Item>
      </Form>

      <WorkRotationTable data={records} loading={isLoading} onDelete={remove} />
    </div>
  );
}
