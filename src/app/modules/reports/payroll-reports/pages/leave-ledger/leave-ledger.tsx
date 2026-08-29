import { useState } from "react";
import { DatePicker, Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { useLeaveLedger } from "../../hooks/use-payroll-reports-queries";
import type { LeaveCreditsBalanceResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Leave Type",
  "Granted",
  "Used",
  "Reserved",
  "Balance",
  "Available to File",
];

const toRows = (records: LeaveCreditsBalanceResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    r.leaveDescription || r.leaveCode,
    fmt(r.granted),
    fmt(r.used),
    fmt(r.reserved),
    fmt(r.balance),
    fmt(r.availableToFile),
  ]);

const columns: ColumnsType<LeaveCreditsBalanceResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 120,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
  {
    title: "Leave Type",
    key: "leaveType",
    width: 180,
    render: (_, r) => r.leaveDescription || r.leaveCode,
  },
  {
    title: "Granted",
    dataIndex: "granted",
    key: "granted",
    align: "right",
    render: fmt,
  },
  {
    title: "Used",
    dataIndex: "used",
    key: "used",
    align: "right",
    render: fmt,
  },
  {
    title: "Reserved",
    dataIndex: "reserved",
    key: "reserved",
    align: "right",
    render: fmt,
  },
  {
    title: "Balance",
    dataIndex: "balance",
    key: "balance",
    align: "right",
    render: (v: number) => <strong>{fmt(v)}</strong>,
  },
  {
    title: "Available to File",
    dataIndex: "availableToFile",
    key: "available",
    align: "right",
    fixed: "right",
    render: fmt,
  },
];

export default function LeaveLedger() {
  const [year, setYear] = useState(dayjs().year());
  const { data = [], isLoading, refetch } = useLeaveLedger(year);

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.LEAVE_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.LEAVE_SUBTITLE}
      data={data}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => `${r.employeeId}-${r.leaveId}`}
      exportFileName={`leave-ledger-${year}`}
      exportHeaders={EXPORT_HEADERS}
      exportRows={toRows}
      filters={
        <Form layout="vertical">
          <Form.Item label="Year" className="mb-0" style={{ maxWidth: 180 }}>
            <DatePicker
              picker="year"
              style={{ width: "100%" }}
              value={dayjs().year(year)}
              allowClear={false}
              onChange={(date) => date && setYear(date.year())}
            />
          </Form.Item>
        </Form>
      }
    />
  );
}
