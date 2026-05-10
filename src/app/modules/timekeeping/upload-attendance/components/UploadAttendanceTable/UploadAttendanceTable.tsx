import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { UploadAttendanceResponse } from "../../models/api/response/upload-attendance-response.model";
import { UPLOAD_ATTENDANCE_LABEL } from "../../constants/label.const";

interface Props {
  data: UploadAttendanceResponse[];
  loading?: boolean;
}

const columns: ColumnsType<UploadAttendanceResponse> = [
  {
    title: UPLOAD_ATTENDANCE_LABEL.EMPLOYEE,
    dataIndex: "employeeName",
    key: "employeeName",
  },
  {
    title: UPLOAD_ATTENDANCE_LABEL.TIME_LOG,
    dataIndex: "timeLog",
    key: "timeLog",
    render: (value: string) => dayjs(value).format("MMM DD, YYYY hh:mm A"),
  },
  {
    title: UPLOAD_ATTENDANCE_LABEL.SOURCE,
    dataIndex: "source",
    key: "source",
    width: 130,
    render: (value: UploadAttendanceResponse["source"]) => (
      <Tag color={value === "UPLOADED" ? "processing" : "default"}>{value}</Tag>
    ),
  },
];

export default function UploadAttendanceTable({ data, loading }: Props) {
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
    />
  );
}
