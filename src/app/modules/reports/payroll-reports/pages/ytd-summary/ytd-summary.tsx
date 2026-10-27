import { useState } from "react";
import { DatePicker, Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ClientFilter } from "../../components/client-filter/client-filter";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import { useYtdSummary } from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { YtdPayrollSummaryResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { formatMoney } from "@/shared/utils/money.util";

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
    r.totalBasicPay,
    r.totalOvertimePay,
    r.totalHolidayPay,
    r.totalAllowances,
    r.totalOtherIncome,
    r.totalGrossIncome,
    r.totalSSS,
    r.totalPhilHealth,
    r.totalPagIbig,
    r.totalWithholdingTax,
    r.totalOtherDeductions,
    r.totalDeductions,
    r.totalNetPay,
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
    render: formatMoney,
  },
  {
    title: "Overtime",
    dataIndex: "totalOvertimePay",
    key: "ot",
    align: "right",
    render: formatMoney,
  },
  {
    title: "Holiday Pay",
    dataIndex: "totalHolidayPay",
    key: "hol",
    align: "right",
    render: formatMoney,
  },
  {
    title: "Allowances",
    dataIndex: "totalAllowances",
    key: "allow",
    align: "right",
    render: formatMoney,
  },
  {
    title: "Other Income",
    dataIndex: "totalOtherIncome",
    key: "other",
    align: "right",
    render: formatMoney,
  },
  {
    title: "Gross Income",
    dataIndex: "totalGrossIncome",
    key: "gross",
    align: "right",
    render: formatMoney,
  },
  {
    title: "SSS",
    dataIndex: "totalSSS",
    key: "sss",
    align: "right",
    render: formatMoney,
  },
  {
    title: "PhilHealth",
    dataIndex: "totalPhilHealth",
    key: "phic",
    align: "right",
    render: formatMoney,
  },
  {
    title: "Pag-IBIG",
    dataIndex: "totalPagIbig",
    key: "hdmf",
    align: "right",
    render: formatMoney,
  },
  {
    title: "W-Tax",
    dataIndex: "totalWithholdingTax",
    key: "tax",
    align: "right",
    render: formatMoney,
  },
  {
    title: "Other Deductions",
    dataIndex: "totalOtherDeductions",
    key: "otherDed",
    align: "right",
    render: formatMoney,
  },
  {
    title: "Total Deductions",
    dataIndex: "totalDeductions",
    key: "totalDed",
    align: "right",
    render: formatMoney,
  },
  {
    title: "Net Pay",
    dataIndex: "totalNetPay",
    key: "net",
    align: "right",
    fixed: "right",
    render: (v: number) => <strong>{formatMoney(v)}</strong>,
  },
];

export default function YtdSummary() {
  const [clientId, setClientId] = useState<string | undefined>();
  const [year, setYear] = useState(dayjs().year());
  const { data = [], isLoading, refetch } = useYtdSummary(year, clientId);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.YTD_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.YTD_SUBTITLE}
      data={employeeFilter.filtered}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => r.employeeId}
      exportFileName={`ytd-summary-${year}`}
      exportHeaders={EXPORT_HEADERS}
      exportRows={toRows}
      totals={{
        fields: [
          "totalBasicPay",
          "totalOvertimePay",
          "totalHolidayPay",
          "totalAllowances",
          "totalOtherIncome",
          "totalGrossIncome",
          "totalSSS",
          "totalPhilHealth",
          "totalPagIbig",
          "totalWithholdingTax",
          "totalOtherDeductions",
          "totalDeductions",
          "totalNetPay",
        ],
        exportHeaders: [
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
        ],
      }}
      filters={
        <Form layout="vertical">
          <div className="flex items-end gap-4 flex-wrap">
            <Form.Item label="Year" className="mb-0" style={{ maxWidth: 180 }}>
              <DatePicker
                picker="year"
                style={{ width: "100%" }}
                value={dayjs().year(year)}
                allowClear={false}
                onChange={(date) => date && setYear(date.year())}
              />
            </Form.Item>
            <ClientFilter value={clientId} onChange={setClientId} />
            <ReportNameFilter
              label="Employee"
              options={employeeFilter.options}
              value={employeeFilter.selected}
              onChange={employeeFilter.setSelected}
            />
          </div>
        </Form>
      }
    />
  );
}
