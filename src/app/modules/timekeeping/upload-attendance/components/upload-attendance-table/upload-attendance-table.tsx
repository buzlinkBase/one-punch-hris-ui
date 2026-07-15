import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { UploadAttendanceResponse } from "../../models/api/response/upload-attendance-response.model";
import { UPLOAD_ATTENDANCE_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: UploadAttendanceResponse[];
  loading?: boolean;
}

export default function UploadAttendanceTable({ data, loading }: Props) {
  const { widths, handleResize } = useResizableColumns({
    employeeName: 150,
    timeLog: 180,
    source: 130,
  });

  const columns: ColumnsType<UploadAttendanceResponse> = [
    {
      title: UPLOAD_ATTENDANCE_LABEL.EMPLOYEE,
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
      title: UPLOAD_ATTENDANCE_LABEL.TIME_LOG,
      dataIndex: "timeLog",
      key: "timeLog",
      width: widths.timeLog,
      onHeaderCell: () =>
        ({
          width: widths.timeLog,
          onResize: (w: number) => handleResize("timeLog", w),
        }) as object,
      render: (value: string) => dayjs(value).format("MMM DD, YYYY hh:mm A"),
    },
    {
      title: UPLOAD_ATTENDANCE_LABEL.SOURCE,
      dataIndex: "source",
      key: "source",
      width: widths.source,
      onHeaderCell: () =>
        ({
          width: widths.source,
          onResize: (w: number) => handleResize("source", w),
        }) as object,
      render: (value: UploadAttendanceResponse["source"]) => (
        <Tag color={value === "UPLOADED" ? "processing" : "default"}>
          {value}
        </Tag>
      ),
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
