import { useState } from "react";
import { DatePicker, Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { useThirteenthMonth } from "../../hooks/use-payroll-reports-queries";
import type { ThirteenthMonthResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Total Basic Pay (Year)",
  "13th Month Pay",
];

const toRows = (records: ThirteenthMonthResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    fmt(r.totalBasicPayForYear),
    fmt(r.thirteenthMonthPay),
  ]);

const columns: ColumnsType<ThirteenthMonthResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 120,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 220 },
  {
    title: "Total Basic Pay (Year)",
    dataIndex: "totalBasicPayForYear",
    key: "basic",
    align: "right",
    render: fmt,
  },
  {
    title: "13th Month Pay",
    dataIndex: "thirteenthMonthPay",
    key: "thirteenth",
    align: "right",
    fixed: "right",
    render: (v: number) => <strong>{fmt(v)}</strong>,
  },
];

export default function ThirteenthMonthPay() {
  const [year, setYear] = useState(dayjs().year());
  const { data = [], isLoading, refetch } = useThirteenthMonth(year);

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.THIRTEENTH_MONTH_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.THIRTEENTH_MONTH_SUBTITLE}
      data={data}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => r.employeeId}
      exportFileName={`13th-month-pay-${year}`}
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
