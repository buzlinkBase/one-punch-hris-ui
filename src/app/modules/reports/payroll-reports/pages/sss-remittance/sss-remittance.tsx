import { useState } from "react";
import { Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import { useSssRemittance } from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { ContributionRemittanceResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "SSS No",
  "Period Start",
  "Period End",
  "Payroll Date",
  "EE Share",
  "ER Share",
  "Total",
];

const toRows = (records: ContributionRemittanceResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    r.govIdNumber,
    r.payrollFrom,
    r.payrollTo,
    r.payrollDate,
    fmt(r.employeeShare),
    fmt(r.employerShare),
    fmt(r.totalContribution),
  ]);

const columns: ColumnsType<ContributionRemittanceResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 120,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
  { title: "SSS No", dataIndex: "govIdNumber", key: "govId", width: 140 },
  {
    title: "Payroll Date",
    dataIndex: "payrollDate",
    key: "payrollDate",
    render: (v: string) => (v ? dayjs(v).format("MMM DD, YYYY") : "—"),
  },
  {
    title: "EE Share",
    dataIndex: "employeeShare",
    key: "ee",
    align: "right",
    render: fmt,
  },
  {
    title: "ER Share",
    dataIndex: "employerShare",
    key: "er",
    align: "right",
    render: fmt,
  },
  {
    title: "Total",
    dataIndex: "totalContribution",
    key: "total",
    align: "right",
    fixed: "right",
    render: fmt,
  },
];

export default function SssRemittance() {
  const [range, setRange] = useState<[string, string]>([
    dayjs().startOf("month").format("YYYY-MM-DD"),
    dayjs().endOf("month").format("YYYY-MM-DD"),
  ]);
  const {
    data = [],
    isLoading,
    refetch,
  } = useSssRemittance(range[0], range[1]);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.SSS_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.SSS_SUBTITLE}
      data={employeeFilter.filtered}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => r.employeeId}
      exportFileName="sss-remittance"
      exportHeaders={EXPORT_HEADERS}
      exportRows={toRows}
      filters={
        <Form layout="vertical">
          <div className="flex items-end gap-4 flex-wrap">
            <Form.Item
              label="Date Range"
              className="mb-0"
              style={{ maxWidth: 360 }}
            >
              <MobileRangePicker
                style={{ width: "100%" }}
                value={[dayjs(range[0]), dayjs(range[1])]}
                onChange={(dates) => {
                  if (dates)
                    setRange([
                      dates[0]?.format("YYYY-MM-DD") ?? "",
                      dates[1]?.format("YYYY-MM-DD") ?? "",
                    ]);
                }}
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
