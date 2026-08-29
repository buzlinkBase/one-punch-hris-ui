import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { RosterResponse } from "../../models/api/response/roster-response.model";
import {
  ROSTER_LABEL,
  SCHEDULE_SOURCE_LABEL,
} from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: RosterResponse[];
  loading?: boolean;
}

export default function RosterTable({ data, loading }: Props) {
  const { widths, handleResize } = useResizableColumns({
    workDate: 120,
    employeeNo: 120,
    fullName: 180,
    department: 150,
    shiftName: 150,
    shiftStart: 120,
    shiftEnd: 120,
    scheduleSource: 170,
    isRestDay: 100,
  });

  const col = (key: string, title: string, width: number) => ({
    title,
    dataIndex: key,
    key,
    width: widths[key] ?? width,
    onHeaderCell: () =>
      ({
        width: widths[key] ?? width,
        onResize: (w: number) => handleResize(key, w),
      }) as object,
  });

  const columns: ColumnsType<RosterResponse> = [
    {
      ...col("workDate", ROSTER_LABEL.DATE, 120),
      render: (v: string) => dayjs(v).format("MMM DD, YYYY"),
    },
    col("employeeNo", ROSTER_LABEL.EMPLOYEE_ID, 120),
    col("fullName", ROSTER_LABEL.EMPLOYEE_NAME, 180),
    {
      ...col("department", ROSTER_LABEL.DEPARTMENT, 150),
      render: (v: string | null) => v ?? "—",
    },
    col("shiftName", ROSTER_LABEL.SHIFT, 150),
    {
      ...col("shiftStart", ROSTER_LABEL.SHIFT_START, 120),
      render: (v: string | null) => (v ? dayjs(v).format("hh:mm A") : "—"),
    },
    {
      ...col("shiftEnd", ROSTER_LABEL.SHIFT_END, 120),
      render: (v: string | null) => (v ? dayjs(v).format("hh:mm A") : "—"),
    },
    {
      ...col("scheduleSource", ROSTER_LABEL.SCHEDULE_SOURCE, 170),
      render: (v: keyof typeof SCHEDULE_SOURCE_LABEL) => {
        const meta = SCHEDULE_SOURCE_LABEL[v];
        return <Tag color={meta?.color}>{meta?.label ?? v}</Tag>;
      },
    },
    {
      ...col("isRestDay", ROSTER_LABEL.REST_DAY, 100),
      align: "center",
      render: (v: boolean) =>
        v ? (
          <Tag color="blue">Rest Day</Tag>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
  ];

  return (
    <Table
      rowKey={(r, i) => `${r.employeeId}-${r.workDate}-${i}`}
      dataSource={data}
      columns={columns}
      size="small"
      loading={loading}
      pagination={{ pageSize: 20 }}
      scroll={{ x: "max-content" }}
      sticky
      components={{ header: { cell: ResizableTitle } }}
    />
  );
}
