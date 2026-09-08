import { Card, Descriptions, Skeleton, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  useMyEmployee,
  useMyFixedSchedule,
} from "../../../shared/hooks/use-my-employee-queries";
import type { EmployeeFixedScheduleResponse } from "@/app/modules/change-schedule/fixed-schedule/models/api/response/employee-fixed-schedule-response.model";
import type { DayName } from "@/app/modules/setup/employee/models/api/response/employee-response.model";

const { Title } = Typography;

const DAYS: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function formatTime(value: string) {
  const [h, m] = value.split(":");
  const hour = Number(h);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${period}`;
}

interface Row {
  day: DayName;
  schedule?: EmployeeFixedScheduleResponse;
}

export default function PortalShiftSchedule() {
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { data: fixedSchedule, isLoading: scheduleLoading } =
    useMyFixedSchedule();

  const isLoading = employeeLoading || scheduleLoading;
  const restDayNames = new Set(employee?.restDays?.map((r) => r.dayName) ?? []);

  const rows: Row[] = DAYS.map((day) => ({
    day,
    schedule: fixedSchedule?.find((s) => s.dayName === day),
  }));

  const columns: ColumnsType<Row> = [
    { title: "Day", dataIndex: "day", width: 120 },
    {
      title: "Status",
      key: "status",
      render: (_, r) =>
        restDayNames.has(r.day) ? (
          <Tag color="default">Rest Day</Tag>
        ) : r.schedule ? (
          <Tag color="blue">Assigned Shift</Tag>
        ) : (
          <Tag color="green">Permanent Shift</Tag>
        ),
    },
    {
      title: "Shift",
      key: "shift",
      render: (_, r) =>
        r.schedule?.timeShiftName ?? employee?.timeShiftName ?? "—",
    },
    {
      title: "Time",
      key: "time",
      render: (_, r) =>
        r.schedule
          ? `${formatTime(r.schedule.startTime)} – ${formatTime(r.schedule.endTime)}`
          : "—",
    },
  ];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              My Shift Schedule
            </Title>
            <p className="page-toolbar-subtitle">
              Your permanent shift, rest days, and any per-day schedule
              overrides.
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <div className="flex flex-col gap-4">
            <Card>
              <Descriptions
                bordered
                column={{ xs: 1, sm: 1, md: 2 }}
                size="small"
              >
                <Descriptions.Item label="Permanent Shift">
                  {employee?.timeShiftName || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Rest Days">
                  {employee?.restDays?.length
                    ? employee.restDays.map((r) => r.dayName).join(", ")
                    : "—"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Card>
              <Table<Row>
                rowKey={(r) => r.day}
                columns={columns}
                dataSource={rows}
                pagination={false}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
