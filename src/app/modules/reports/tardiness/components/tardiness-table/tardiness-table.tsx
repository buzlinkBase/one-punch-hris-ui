import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TardinessResponse } from "../../models/api/response/tardiness-response.model";
import { TARDINESS_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: TardinessResponse[];
  loading?: boolean;
}

export default function TardinessTable({ data, loading }: Props) {
  const { widths, handleResize } = useResizableColumns({
    employeeName: 200,
    department: 180,
    late: 120,
    underTime: 120,
  });

  const columns: ColumnsType<TardinessResponse> = [
    {
      title: TARDINESS_LABEL.EMPLOYEE_NAME,
      dataIndex: "employeeName",
      key: "employeeName",
      width: widths.employeeName,
      onHeaderCell: () =>
        ({
          width: widths.employeeName,
          onResize: (w: number) => handleResize("employeeName", w),
        }) as object,
    },
    {
      title: TARDINESS_LABEL.DEPARTMENT,
      dataIndex: "department",
      key: "department",
      width: widths.department,
      onHeaderCell: () =>
        ({
          width: widths.department,
          onResize: (w: number) => handleResize("department", w),
        }) as object,
    },
    {
      title: TARDINESS_LABEL.LATE,
      dataIndex: "late",
      key: "late",
      width: widths.late,
      onHeaderCell: () =>
        ({
          width: widths.late,
          onResize: (w: number) => handleResize("late", w),
        }) as object,
      align: "right",
    },
    {
      title: TARDINESS_LABEL.UNDER_TIME,
      dataIndex: "underTime",
      key: "underTime",
      width: widths.underTime,
      onHeaderCell: () =>
        ({
          width: widths.underTime,
          onResize: (w: number) => handleResize("underTime", w),
        }) as object,
      align: "right",
    },
  ];

  return (
    <Table
      rowKey="id"
      dataSource={data}
      columns={columns}
      size="small"
      loading={loading}
      pagination={{ pageSize: 10 }}
      scroll={{ x: "max-content" }}
      sticky
      components={{ header: { cell: ResizableTitle } }}
    />
  );
}
