import { useState } from "react";
import { DatePicker, Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import { useDeductionLedger } from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { DeductionLedgerResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Deduction Type",
  "Deduction Name",
  "Total Principal",
  "Interest Rate",
  "Start Date",
  "End Date",
  "Current Balance",
];

const toRows = (records: DeductionLedgerResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    r.deductionTypeName,
    r.deductionName,
    fmt(r.totalPrincipal),
    fmt(r.interestRate),
    r.startDate,
    r.endDate,
    fmt(r.currentBalance),
  ]);

const columns: ColumnsType<DeductionLedgerResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 120,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
  {
    title: "Deduction Type",
    dataIndex: "deductionTypeName",
    key: "type",
    width: 160,
  },
  {
    title: "Deduction Name",
    dataIndex: "deductionName",
    key: "deductionName",
    width: 160,
  },
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

export default function DeductionLedger() {
  const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
  const { data = [], isLoading, refetch } = useDeductionLedger(asOf);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);
  const deductionTypeFilter = useReportNameFilter(
    employeeFilter.filtered,
    (r) => r.deductionTypeName,
  );
  const deductionNameFilter = useReportNameFilter(
    deductionTypeFilter.filtered,
    (r) => r.deductionName,
  );

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.DEDUCTION_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.DEDUCTION_SUBTITLE}
      data={deductionNameFilter.filtered}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => `${r.employeeId}-${r.deductionId}`}
      exportFileName="deduction-ledger"
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
            <ReportNameFilter
              label="Deduction Type"
              options={deductionTypeFilter.options}
              value={deductionTypeFilter.selected}
              onChange={deductionTypeFilter.setSelected}
            />
            <ReportNameFilter
              label="Deduction Name"
              options={deductionNameFilter.options}
              value={deductionNameFilter.selected}
              onChange={deductionNameFilter.setSelected}
            />
          </div>
        </Form>
      }
    />
  );
}
