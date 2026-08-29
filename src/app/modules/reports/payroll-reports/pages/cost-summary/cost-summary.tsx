import { useState } from "react";
import { Form, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { useCostSummary } from "../../hooks/use-payroll-reports-queries";
import type {
  CostSummaryGroupBy,
  CostSummaryResponse,
} from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const GROUP_BY_OPTIONS: { value: CostSummaryGroupBy; label: string }[] = [
  { value: "department", label: "Department" },
  { value: "client", label: "Client" },
  { value: "branch", label: "Branch" },
];

const EXPORT_HEADERS = [
  "Group",
  "Employee Count",
  "Total Basic Pay",
  "Total Gross Income",
  "Total Deductions",
  "Employer Contributions Cost",
  "Total Net Pay",
];

const toRows = (records: CostSummaryResponse[]) =>
  records.map((r) => [
    r.groupName,
    String(r.employeeCount),
    fmt(r.totalBasicPay),
    fmt(r.totalGrossIncome),
    fmt(r.totalDeductions),
    fmt(r.employerContributionsCost),
    fmt(r.totalNetPay),
  ]);

const columns: ColumnsType<CostSummaryResponse> = [
  {
    title: "Group",
    dataIndex: "groupName",
    key: "group",
    width: 180,
    fixed: "left",
  },
  {
    title: "Employees",
    dataIndex: "employeeCount",
    key: "count",
    align: "right",
    width: 100,
  },
  {
    title: "Basic Pay",
    dataIndex: "totalBasicPay",
    key: "basic",
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
    title: "Deductions",
    dataIndex: "totalDeductions",
    key: "ded",
    align: "right",
    render: fmt,
  },
  {
    title: "Employer Cost",
    dataIndex: "employerContributionsCost",
    key: "erCost",
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

export default function CostSummary() {
  const [range, setRange] = useState<[string, string]>([
    dayjs().startOf("month").format("YYYY-MM-DD"),
    dayjs().endOf("month").format("YYYY-MM-DD"),
  ]);
  const [groupBy, setGroupBy] = useState<CostSummaryGroupBy>("department");
  const {
    data = [],
    isLoading,
    refetch,
  } = useCostSummary(range[0], range[1], groupBy);

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.COST_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.COST_SUBTITLE}
      data={data}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => r.groupId ?? r.groupName}
      exportFileName={`cost-summary-${groupBy}`}
      exportHeaders={EXPORT_HEADERS}
      exportRows={toRows}
      filters={
        <Form layout="vertical">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-4"
            style={{ maxWidth: 480 }}
          >
            <Form.Item label="Date Range" className="mb-0">
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
            <Form.Item label="Group By" className="mb-0">
              <Select
                options={GROUP_BY_OPTIONS}
                value={groupBy}
                onChange={setGroupBy}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>
        </Form>
      }
    />
  );
}
