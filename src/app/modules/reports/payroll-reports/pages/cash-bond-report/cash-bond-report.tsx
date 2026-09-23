import { useState } from "react";
import { DatePicker, Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import { useCashBondReport } from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { CashBondReportResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Cash Bond Rate",
  "Total Collected",
  "Payroll Runs",
];

const toRows = (records: CashBondReportResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    fmt(r.cashBondRate),
    fmt(r.totalCollected),
    String(r.payrollRunsCount),
  ]);

const columns: ColumnsType<CashBondReportResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 120,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
  {
    title: "Cash Bond Rate",
    dataIndex: "cashBondRate",
    key: "rate",
    align: "right",
    render: fmt,
  },
  {
    title: "Total Collected",
    dataIndex: "totalCollected",
    key: "collected",
    align: "right",
    fixed: "right",
    render: (v: number) => <strong>{fmt(v)}</strong>,
  },
  {
    title: "Payroll Runs",
    dataIndex: "payrollRunsCount",
    key: "runs",
    align: "right",
  },
];

export default function CashBondReport() {
  const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
  const { data = [], isLoading, refetch } = useCashBondReport(asOf);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.CASH_BOND_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.CASH_BOND_SUBTITLE}
      data={employeeFilter.filtered}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => r.employeeId}
      exportFileName="cash-bond-tracking"
      exportHeaders={EXPORT_HEADERS}
      exportRows={toRows}
      filters={
        <Form layout="vertical">
          <div className="flex items-end gap-4 flex-wrap">
            <Form.Item label="As Of" className="mb-0" style={{ maxWidth: 220 }}>
              <DatePicker
                style={{ width: "100%" }}
                value={dayjs(asOf)}
                allowClear={false}
                onChange={(date) => date && setAsOf(date.format("YYYY-MM-DD"))}
              />
            </Form.Item>
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
