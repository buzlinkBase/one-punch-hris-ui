import { useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import {
  useMyEmployee,
  useMySchedule,
} from "../../../shared/hooks/use-my-employee-queries";
import type { RosterResponse } from "@/app/modules/reports/rostering/models/api/response/roster-response.model";
import { SCHEDULE_SOURCE_LABEL } from "@/app/modules/reports/rostering/constants/label.const";

const { Title, Text } = Typography;

// Two weeks at a time, starting today (the viewer's local date).
const PAGE_DAYS = 14;
const DATE_FORMAT = "YYYY-MM-DD";

function shiftTime(row: RosterResponse): string {
  if (!row.shiftStart || !row.shiftEnd) return "—";
  const start = dayjs(row.shiftStart);
  const end = dayjs(row.shiftEnd);
  const overnight = !end.isSame(start, "day") ? " (+1)" : "";
  return `${start.format("h:mm A")} – ${end.format("h:mm A")}${overnight}`;
}

export default function PortalShiftSchedule() {
  const [start, setStart] = useState<Dayjs>(() => dayjs().startOf("day"));
  const end = start.add(PAGE_DAYS - 1, "day");
  const today = dayjs().format(DATE_FORMAT);

  const { data: employee } = useMyEmployee();
  const { data: schedule = [], isLoading } = useMySchedule(
    start.format(DATE_FORMAT),
    end.format(DATE_FORMAT),
  );

  const columns: ColumnsType<RosterResponse> = [
    {
      title: "Date",
      key: "date",
      width: 170,
      render: (_, r) => (
        <Space size={6}>
          <span>{dayjs(r.workDate).format("ddd, MMM D")}</span>
          {r.workDate === today && <Tag color="processing">Today</Tag>}
        </Space>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, r) => (
        <Space size={[4, 4]} wrap>
          {r.isRestDay && <Tag>Rest Day</Tag>}
          <Tag color={SCHEDULE_SOURCE_LABEL[r.scheduleSource]?.color}>
            {SCHEDULE_SOURCE_LABEL[r.scheduleSource]?.label ?? r.scheduleSource}
          </Tag>
        </Space>
      ),
    },
    { title: "Shift", dataIndex: "shiftName", key: "shift" },
    { title: "Time", key: "time", render: (_, r) => shiftTime(r) },
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
              Your shift and rest days for each date — the same schedule your
              DTR is computed from, including rotation plan changes.
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
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
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <Text strong>
                {start.format("MMM D")} – {end.format("MMM D, YYYY")}
              </Text>
              <Space>
                <Button
                  icon={<LeftOutlined />}
                  onClick={() => setStart((s) => s.subtract(PAGE_DAYS, "day"))}
                  aria-label="Previous two weeks"
                />
                <Button onClick={() => setStart(dayjs().startOf("day"))}>
                  Today
                </Button>
                <Button
                  icon={<RightOutlined />}
                  onClick={() => setStart((s) => s.add(PAGE_DAYS, "day"))}
                  aria-label="Next two weeks"
                />
              </Space>
            </div>
            <Table<RosterResponse>
              rowKey={(r) => r.workDate}
              columns={columns}
              dataSource={schedule}
              loading={isLoading}
              pagination={false}
              scroll={{ x: "max-content" }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
