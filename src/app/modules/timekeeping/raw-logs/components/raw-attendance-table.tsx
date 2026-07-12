import { useState } from "react";
import { Input, Table, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { RawAttendanceLog } from "../models/api/response/raw-attendance-log.model";

interface Props {
  data: RawAttendanceLog[];
  loading?: boolean;
}

const columns: ColumnsType<RawAttendanceLog> = [
  {
    title: "Employee",
    dataIndex: "name",
    key: "name",
    render: (v: string | null) => v ?? "—",
  },
  {
    title: "Work Date Time",
    dataIndex: "workDateTime",
    key: "workDateTime",
    width: 180,
    render: (v: string) => dayjs(v).format("MMM DD, YYYY hh:mm A"),
  },
  {
    title: "Log Source",
    dataIndex: "logSource",
    key: "logSource",
    width: 130,
    render: (v: string) => <Tag>{v}</Tag>,
  },
  {
    title: "Batch",
    dataIndex: "batch",
    key: "batch",
    width: 200,
    render: (v: string) =>
      v ? <Tag color="blue">{v}</Tag> : <Tag color="default">Manual</Tag>,
  },
];

export default function RawAttendanceTable({ data, loading }: Props) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? data.filter((item) =>
        [item.name, item.workDateTime, item.logSource, item.batch].some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
      )
    : data;

  return (
    <div className="flex flex-col gap-3">
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search employee, source, batch..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ maxWidth: 320 }}
      />
      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        size="small"
        loading={loading}
        pagination={{ pageSize: 15 }}
        scroll={{ x: "max-content" }}
        sticky
      />
    </div>
  );
}
