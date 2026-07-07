import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TardinessResponse } from "../../models/api/response/tardiness-response.model";
import { TARDINESS_LABEL } from "../../constants/label.const";

interface Props {
  data: TardinessResponse[];
  loading?: boolean;
}

const columns: ColumnsType<TardinessResponse> = [
  {
    title: TARDINESS_LABEL.EMPLOYEE_NAME,
    dataIndex: "employeeName",
    key: "employeeName",
  },
  {
    title: TARDINESS_LABEL.DEPARTMENT,
    dataIndex: "department",
    key: "department",
  },
  {
    title: TARDINESS_LABEL.LATE,
    dataIndex: "late",
    key: "late",
    align: "right",
  },
  {
    title: TARDINESS_LABEL.UNDER_TIME,
    dataIndex: "underTime",
    key: "underTime",
    align: "right",
  },
];

export default function TardinessTable({ data, loading }: Props) {
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
