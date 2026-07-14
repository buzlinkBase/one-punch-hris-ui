import { useState } from "react";
import { Table, Input, Tag, Tooltip, Badge } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { IncompletePunch } from "../models/api/response/incomplete-punch.model";
import { INCOMPLETE_PUNCHES_LABEL } from "../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

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

  const { widths, handleResize } = useResizableColumns({
    employeeNo: 120,
    employeeName: 150,
    department: 120,
    payrollDate: 120,
    shiftName: 100,
    shiftStart: 100,
    breakOut: 100,
    breakIn: 100,
    shiftEnd: 100,
    ...Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [`log-${i}`, 80]),
    ),
    missingLogs: 110,
  });

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
      width: widths.employeeNo,
      fixed: "left",
      onHeaderCell: () =>
        ({
          width: widths.employeeNo,
          onResize: (w: number) => handleResize("employeeNo", w),
        }) as object,
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.EMPLOYEE_NAME,
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
      title: INCOMPLETE_PUNCHES_LABEL.DEPARTMENT_COL,
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
      title: INCOMPLETE_PUNCHES_LABEL.PAYROLL_DATE,
      dataIndex: "payrollDate",
      key: "payrollDate",
      width: widths.payrollDate,
      onHeaderCell: () =>
        ({
          width: widths.payrollDate,
          onResize: (w: number) => handleResize("payrollDate", w),
        }) as object,
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.SHIFT_NAME,
      key: "shiftName",
      width: widths.shiftName,
      onHeaderCell: () =>
        ({
          width: widths.shiftName,
          onResize: (w: number) => handleResize("shiftName", w),
        }) as object,
      render: (_, record) => record.timeShiftInfo.shiftName,
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.SHIFT_START,
      key: "shiftStart",
      width: widths.shiftStart,
      onHeaderCell: () =>
        ({
          width: widths.shiftStart,
          onResize: (w: number) => handleResize("shiftStart", w),
        }) as object,
      render: (_, record) => record.timeShiftInfo.shiftStart,
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.BREAK_OUT,
      key: "breakOut",
      width: widths.breakOut,
      onHeaderCell: () =>
        ({
          width: widths.breakOut,
          onResize: (w: number) => handleResize("breakOut", w),
        }) as object,
      render: (_, record) => record.timeShiftInfo.breakOut,
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.BREAK_IN,
      key: "breakIn",
      width: widths.breakIn,
      onHeaderCell: () =>
        ({
          width: widths.breakIn,
          onResize: (w: number) => handleResize("breakIn", w),
        }) as object,
      render: (_, record) => record.timeShiftInfo.breakIn,
    },
    {
      title: INCOMPLETE_PUNCHES_LABEL.SHIFT_END,
      key: "shiftEnd",
      width: widths.shiftEnd,
      onHeaderCell: () =>
        ({
          width: widths.shiftEnd,
          onResize: (w: number) => handleResize("shiftEnd", w),
        }) as object,
      render: (_, record) => record.timeShiftInfo.shiftEnd,
    },
    ...Array.from({ length: 20 }, (_, i) => ({
      title: `Log ${i + 1}`,
      key: `log-${i}`,
      width: widths[`log-${i}`],
      onHeaderCell: () =>
        ({
          width: widths[`log-${i}`],
          onResize: (w: number) => handleResize(`log-${i}`, w),
        }) as object,
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
      width: widths.missingLogs,
      onHeaderCell: () =>
        ({
          width: widths.missingLogs,
          onResize: (w: number) => handleResize("missingLogs", w),
        }) as object,
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
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}
