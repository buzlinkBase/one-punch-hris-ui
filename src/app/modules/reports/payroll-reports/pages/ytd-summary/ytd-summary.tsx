import { useState } from "react";
import { DatePicker, Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { useYtdSummary } from "../../hooks/use-payroll-reports-queries";
import type { YtdPayrollSummaryResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Basic Pay",
  "Overtime",
  "Holiday Pay",
  "Allowances",
  "Other Income",
  "Gross Income",
  "SSS",
  "PhilHealth",
  "Pag-IBIG",
  "Withholding Tax",
  "Other Deductions",
  "Total Deductions",
  "Net Pay",
];

const toRows = (records: YtdPayrollSummaryResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    fmt(r.totalBasicPay),
    fmt(r.totalOvertimePay),
    fmt(r.totalHolidayPay),
    fmt(r.totalAllowances),
    fmt(r.totalOtherIncome),
    fmt(r.totalGrossIncome),
    fmt(r.totalSSS),
    fmt(r.totalPhilHealth),
    fmt(r.totalPagIbig),
    fmt(r.totalWithholdingTax),
    fmt(r.totalOtherDeductions),
    fmt(r.totalDeductions),
    fmt(r.totalNetPay),
  ]);

const columns: ColumnsType<YtdPayrollSummaryResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 120,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
  {
    title: "Basic Pay",
    dataIndex: "totalBasicPay",
    key: "basic",
    align: "right",
    render: fmt,
  },
  {
    title: "Overtime",
    dataIndex: "totalOvertimePay",
    key: "ot",
    align: "right",
    render: fmt,
  },
  {
    title: "Holiday Pay",
    dataIndex: "totalHolidayPay",
    key: "hol",
    align: "right",
    render: fmt,
  },
  {
    title: "Allowances",
    dataIndex: "totalAllowances",
    key: "allow",
    align: "right",
    render: fmt,
  },
  {
    title: "Other Income",
    dataIndex: "totalOtherIncome",
    key: "other",
    align: "right",
    render: fmt,
  },
  {
    title: "Gross Income",
    dataIndex: "totalGrossIncome",
    key: "gross",
    align: "right",
    render: fmt,
  },
  {
    title: "SSS",
    dataIndex: "totalSSS",
    key: "sss",
    align: "right",
    render: fmt,
  },
  {
    title: "PhilHealth",
    dataIndex: "totalPhilHealth",
    key: "phic",
    align: "right",
    render: fmt,
  },
  {
    title: "Pag-IBIG",
    dataIndex: "totalPagIbig",
    key: "hdmf",
    align: "right",
    render: fmt,
  },
  {
    title: "W-Tax",
    dataIndex: "totalWithholdingTax",
    key: "tax",
    align: "right",
    render: fmt,
  },
  {
    title: "Other Deductions",
    dataIndex: "totalOtherDeductions",
    key: "otherDed",
    align: "right",
    render: fmt,
  },
  {
    title: "Total Deductions",
    dataIndex: "totalDeductions",
    key: "totalDed",
    align: "right",
    render: fmt,
  },
  {
    title: "Net Pay",
    dataIndex: "totalNetPay",
    key: "net",
    align: "right",
    fixed: "right",
    render: (v: number) => <strong>{fmt(v)}</strong>,
  },
];

export default function YtdSummary() {
  const [year, setYear] = useState(dayjs().year());
  const { data = [], isLoading, refetch } = useYtdSummary(year);

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.YTD_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.YTD_SUBTITLE}
      data={data}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => r.employeeId}
      exportFileName={`ytd-summary-${year}`}
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
