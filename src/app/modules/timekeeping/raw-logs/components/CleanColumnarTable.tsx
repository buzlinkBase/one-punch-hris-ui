import { useState } from "react";
import { Table, Input, Tag, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { CleanAttendanceLogColumnar } from "../models/api/response/raw-attendance-log.model";
import { RAW_LOGS_LABEL } from "../constants/label.const";

interface Props {
  data: CleanAttendanceLogColumnar[];
  loading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETE":
      return "green";
    case "INCOMPLETE":
      return "orange";
    case "FLAGGED":
      return "red";
    default:
      return "default";
  }
};

export default function CleanColumnarTable({ data, loading }: Props) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    Object.values(item).some((val) => {
      if (typeof val === "object") {
        return Object.values(val).some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()),
        );
      }
      if (Array.isArray(val)) return false;
      return String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase());
    }),
  );

  const columns: ColumnsType<CleanAttendanceLogColumnar> = [
    {
      title: RAW_LOGS_LABEL.EMPLOYEE_NO,
      dataIndex: "employeeNo",
      key: "employeeNo",
      width: 120,
      fixed: "left",
    },
    {
      title: RAW_LOGS_LABEL.EMPLOYEE_NAME,
      dataIndex: "employeeName",
      key: "employeeName",
      width: 150,
    },
    {
      title: RAW_LOGS_LABEL.DEPARTMENT,
      dataIndex: "department",
      key: "department",
      width: 120,
    },
    {
      title: RAW_LOGS_LABEL.PAYROLL_DATE,
      dataIndex: "payrollDate",
      key: "payrollDate",
      width: 120,
    },
    {
      title: RAW_LOGS_LABEL.SHIFT_NAME,
      key: "shiftName",
      width: 100,
      render: (_, record) => record.timeShiftInfo.shiftName,
    },
    {
      title: RAW_LOGS_LABEL.SHIFT_START,
      key: "shiftStart",
      width: 100,
      render: (_, record) => record.timeShiftInfo.shiftStart,
    },
    {
      title: RAW_LOGS_LABEL.BREAK_OUT,
      key: "breakOut",
      width: 100,
      render: (_, record) => record.timeShiftInfo.breakOut,
    },
    {
      title: RAW_LOGS_LABEL.BREAK_IN,
      key: "breakIn",
      width: 100,
      render: (_, record) => record.timeShiftInfo.breakIn,
    },
    {
      title: RAW_LOGS_LABEL.SHIFT_END,
      key: "shiftEnd",
      width: 100,
      render: (_, record) => record.timeShiftInfo.shiftEnd,
    },
    ...Array.from({ length: 8 }, (_, i) => ({
      title: `Log ${i + 1}`,
      key: `log-${i}`,
      width: 80,
      render: (_: unknown, record: CleanAttendanceLogColumnar) => (
        <Tooltip title={record.logs[i] || "N/A"}>
          <span>{record.logs[i] || "-"}</span>
        </Tooltip>
      ),
    })),
    {
      title: RAW_LOGS_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: 110,
      fixed: "right",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
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
        pagination={{ pageSize: 10 }}
        scroll={{ x: 2000 }}
        sticky
      />
    </div>
  );
}
