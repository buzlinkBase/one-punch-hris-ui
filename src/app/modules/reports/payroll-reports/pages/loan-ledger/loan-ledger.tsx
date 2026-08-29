import { useState } from "react";
import { DatePicker, Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { useLoanLedger } from "../../hooks/use-payroll-reports-queries";
import type { LoanLedgerResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Loan Type",
  "Loan Name",
  "Total Principal",
  "Interest Rate",
  "Start Date",
  "End Date",
  "Current Balance",
];

const toRows = (records: LoanLedgerResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    r.loanTypeName,
    r.loanName,
    fmt(r.totalPrincipal),
    fmt(r.interestRate),
    r.startDate,
    r.endDate,
    fmt(r.currentBalance),
  ]);

const columns: ColumnsType<LoanLedgerResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 120,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
  { title: "Loan Type", dataIndex: "loanTypeName", key: "type", width: 160 },
  { title: "Loan Name", dataIndex: "loanName", key: "loanName", width: 160 },
  {
    title: "Principal",
    dataIndex: "totalPrincipal",
    key: "principal",
    align: "right",
    render: fmt,
  },
  {
    title: "Interest %",
    dataIndex: "interestRate",
    key: "interest",
    align: "right",
    render: fmt,
  },
  {
    title: "Start Date",
    dataIndex: "startDate",
    key: "start",
    render: (v: string) => (v ? dayjs(v).format("MMM DD, YYYY") : "—"),
  },
  {
    title: "End Date",
    dataIndex: "endDate",
    key: "end",
    render: (v: string) => (v ? dayjs(v).format("MMM DD, YYYY") : "—"),
  },
  {
    title: "Current Balance",
    dataIndex: "currentBalance",
    key: "balance",
    align: "right",
    fixed: "right",
    render: (v: number) => <strong>{fmt(v)}</strong>,
  },
];

export default function LoanLedger() {
  const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
  const { data = [], isLoading, refetch } = useLoanLedger(asOf);

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.LOAN_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.LOAN_SUBTITLE}
      data={data}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => `${r.employeeId}-${r.deductionId}`}
      exportFileName="loan-ledger"
      exportHeaders={EXPORT_HEADERS}
      exportRows={toRows}
      filters={
        <Form layout="vertical">
          <Form.Item label="As Of" className="mb-0" style={{ maxWidth: 220 }}>
            <DatePicker
              style={{ width: "100%" }}
              value={dayjs(asOf)}
              allowClear={false}
              onChange={(date) => date && setAsOf(date.format("YYYY-MM-DD"))}
            />
          </Form.Item>
        </Form>
      }
    />
  );
}
