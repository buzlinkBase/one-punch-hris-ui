import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TardinessResponse } from "../../models/api/response/tardiness-response.model";
import { TARDINESS_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import dayjs from "dayjs";

interface Props {
  data: TardinessResponse[];
  loading?: boolean;
}

export default function TardinessTable({ data, loading }: Props) {
  const { widths, handleResize } = useResizableColumns({
    workDate: 120,
    employeeNo: 120,
    fullName: 180,
    department: 150,
    scheduledIn: 140,
    actualIn: 140,
    gracePeriodMinutes: 130,
    tardinessMinutes: 160,
    deductibleMinutes: 160,
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

  const columns: ColumnsType<TardinessResponse> = [
    {
      ...col("workDate", TARDINESS_LABEL.DATE, 120),
      render: (v: string) => dayjs(v).format("MMM DD, YYYY"),
    },
    col("employeeNo", TARDINESS_LABEL.EMPLOYEE_ID, 120),
    {
      ...col("fullName", TARDINESS_LABEL.EMPLOYEE_NAME, 180),
      render: (v: string | null) => v ?? "—",
    },
    {
      ...col("department", TARDINESS_LABEL.DEPARTMENT, 150),
      render: (v: string | null) => v ?? "—",
    },
    {
      ...col("scheduledIn", TARDINESS_LABEL.SCHEDULED_IN, 140),
      render: (v: string) => dayjs(v).format("hh:mm A"),
    },
    {
      title: TARDINESS_LABEL.ACTUAL_IN,
      dataIndex: "actualIn",
      key: "actualIn",
      width: widths.actualIn ?? 140,
      onHeaderCell: () =>
        ({
          width: widths.actualIn ?? 140,
          onResize: (w: number) => handleResize("actualIn", w),
        }) as object,
      render: (v: string | null, row: TardinessResponse) => {
        if (!v) return <span className="text-gray-400">—</span>;
        return (
          <span
            style={{ color: row.tardinessMinutes > 0 ? "#f5222d" : undefined }}
          >
            {dayjs(v).format("hh:mm A")}
          </span>
        );
      },
    },
    {
      ...col("gracePeriodMinutes", TARDINESS_LABEL.GRACE_PERIOD, 130),
      render: (v: number) => `${v} mins`,
    },
    {
      title: TARDINESS_LABEL.TARDINESS_MINS,
      dataIndex: "tardinessMinutes",
      key: "tardinessMinutes",
      width: widths.tardinessMinutes ?? 160,
      onHeaderCell: () =>
        ({
          width: widths.tardinessMinutes ?? 160,
          onResize: (w: number) => handleResize("tardinessMinutes", w),
        }) as object,
      align: "right",
      render: (v: number) =>
        v > 0 ? (
          <Tag color="orange">{v} mins</Tag>
        ) : (
          <Tag color="success">On time</Tag>
        ),
    },
    {
      title: TARDINESS_LABEL.DEDUCTIBLE,
      dataIndex: "deductibleMinutes",
      key: "deductibleMinutes",
      width: widths.deductibleMinutes ?? 160,
      onHeaderCell: () =>
        ({
          width: widths.deductibleMinutes ?? 160,
          onResize: (w: number) => handleResize("deductibleMinutes", w),
        }) as object,
      align: "right",
      render: (v: number, row: TardinessResponse) =>
        row.isWithinGracePeriod ? (
          <Tag color="blue">0 mins (Grace)</Tag>
        ) : v > 0 ? (
          <Tag color="red">{v} mins</Tag>
        ) : (
          <Tag color="success">—</Tag>
        ),
    },
  ];

  return (
    <Table
      rowKey={(r, i) => `${r.employeeNo}-${r.workDate}-${i}`}
      dataSource={data}
      columns={columns}
      size="small"
      loading={loading}
      pagination={{ pageSize: 15 }}
      scroll={{ x: "max-content" }}
      sticky
      components={{ header: { cell: ResizableTitle } }}
    />
  );
}
