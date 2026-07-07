import { useState } from "react";
import { Table, Input, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { RawAttendanceLog } from "../models/api/response/raw-attendance-log.model";
import { RAW_LOGS_LABEL } from "../constants/label.const";

interface Props {
  data: RawAttendanceLog[];
  loading?: boolean;
}

export default function RawAttendanceTable({ data, loading }: Props) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<RawAttendanceLog> = [
    {
      title: RAW_LOGS_LABEL.BIO_ID,
      dataIndex: "bioId",
      key: "bioId",
      width: 120,
    },
    {
      title: RAW_LOGS_LABEL.EMPLOYEE,
      dataIndex: "employeeName",
      key: "employeeName",
      render: (_, record) => `${record.employeeNo} - ${record.employeeName}`,
    },
    {
      title: RAW_LOGS_LABEL.LOG_DATE_TIME,
      dataIndex: "logDateTime",
      key: "logDateTime",
      width: 180,
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: RAW_LOGS_LABEL.TIME_LOG,
      dataIndex: "timeLog",
      key: "timeLog",
      width: 100,
    },
    {
      title: RAW_LOGS_LABEL.LOG_TYPE,
      dataIndex: "logType",
      key: "logType",
      width: 100,
      render: (type) => (
        <Tag color={type === "IN" ? "green" : "red"}>{type}</Tag>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search..."
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
