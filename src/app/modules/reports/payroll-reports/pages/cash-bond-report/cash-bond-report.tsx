import { useState } from "react";
import { DatePicker, Form, Progress, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import { useCashBondReport } from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { CashBondReportResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
} from "@/app/modules/applications/pass-slip/constants/label.const";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Target Amount",
  "Total Collected",
  "Remaining",
  "Start Date",
  "End Date",
  "Status",
];

const toRows = (records: CashBondReportResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    fmt(r.targetAmount),
    fmt(r.totalCollected),
    fmt(r.remaining),
    r.startDate,
    r.endDate,
    APPROVAL_STATUS_LABEL[r.approvalStatus] ?? r.approvalStatus,
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
    title: "Target",
    dataIndex: "targetAmount",
    key: "target",
    align: "right",
    render: fmt,
  },
  {
    title: "Collected",
    dataIndex: "totalCollected",
    key: "collected",
    align: "right",
    render: fmt,
  },
  {
    title: "Progress",
    key: "progress",
    width: 160,
    render: (_, r) => (
      <Progress
        percent={
          r.targetAmount > 0
            ? Math.min(
                100,
                Math.round((r.totalCollected / r.targetAmount) * 100),
              )
            : 0
        }
        size="small"
      />
    ),
  },
  {
    title: "Remaining",
    dataIndex: "remaining",
    key: "remaining",
    align: "right",
    fixed: "right",
    render: (v: number) => <strong>{fmt(v)}</strong>,
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
    title: "Status",
    dataIndex: "approvalStatus",
    key: "status",
    render: (v: string) => (
      <Tag color={APPROVAL_STATUS_COLOR[v] ?? "success"}>
        {APPROVAL_STATUS_LABEL[v] ?? v}
      </Tag>
    ),
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
      rowKey={(r) => `${r.employeeId}-${r.applicationId}`}
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
