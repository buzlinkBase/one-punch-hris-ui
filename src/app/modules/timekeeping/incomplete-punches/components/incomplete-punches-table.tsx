import { useState } from "react";
import { Table, Input, Tag, Tooltip, Badge } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { IncompletePunch } from "../models/api/response/incomplete-punch.model";
import { INCOMPLETE_PUNCHES_LABEL } from "../constants/label.const";

interface Props {
  data: IncompletePunch[];
  loading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "MISSING_IN":
      return "red";
    case "MISSING_OUT":
      return "orange";
    case "PARTIAL":
      return "gold";
    case "MULTIPLE_GAPS":
      return "volcano";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "MISSING_IN":
      return INCOMPLETE_PUNCHES_LABEL.STATUS_MISSING_IN;
    case "MISSING_OUT":
      return INCOMPLETE_PUNCHES_LABEL.STATUS_MISSING_OUT;
    case "PARTIAL":
      return INCOMPLETE_PUNCHES_LABEL.STATUS_PARTIAL;
    case "MULTIPLE_GAPS":
      return INCOMPLETE_PUNCHES_LABEL.STATUS_MULTIPLE_GAPS;
    default:
      return status;
  }
};

export default function IncompletePunchesTable({ data, loading }: Props) {
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

  const columns: ColumnsType<IncompletePunch> = [
    {
      title: INCOMPLETE_PUNCHES_LABEL.EMPLOYEE_NO,
      dataIndex: "employeeNo",
      key: "employeeNo",
      width: 120,
      fixed: "left",
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.EMPLOYEE_NAME,
      dataIndex: "employeeName",
      key: "employeeName",
      width: 150,
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.DEPARTMENT_COL,
      dataIndex: "department",
      key: "department",
      width: 120,
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.PAYROLL_DATE,
      dataIndex: "payrollDate",
      key: "payrollDate",
      width: 120,
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.SHIFT_NAME,
      key: "shiftName",
      width: 100,
      render: (_, record) => record.timeShiftInfo.shiftName,
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.SHIFT_START,
      key: "shiftStart",
      width: 100,
      render: (_, record) => record.timeShiftInfo.shiftStart,
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.BREAK_OUT,
      key: "breakOut",
      width: 100,
      render: (_, record) => record.timeShiftInfo.breakOut,
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.BREAK_IN,
      key: "breakIn",
      width: 100,
      render: (_, record) => record.timeShiftInfo.breakIn,
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.SHIFT_END,
      key: "shiftEnd",
      width: 100,
      render: (_, record) => record.timeShiftInfo.shiftEnd,
    },
    ...Array.from({ length: 20 }, (_, i) => ({
      title: `Log ${i + 1}`,
      key: `log-${i}`,
      width: 80,
      render: (_: unknown, record: IncompletePunch) => (
        <Tooltip title={record.logs[i] || "N/A"}>
          <span>{record.logs[i] || "-"}</span>
        </Tooltip>
      ),
    })),
    {
      title: INCOMPLETE_PUNCHES_LABEL.MISSING_LOGS,
      dataIndex: "missingLogs",
      key: "missingLogs",
      width: 110,
      render: (count) => <Badge count={count} showZero color="red" />,
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: 130,
      fixed: "right",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
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
        pagination={{ pageSize: 10 }}
        scroll={{ x: 2800 }}
        sticky
      />
    </div>
  );
}
