import { useState } from "react";
import { Form, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ClientFilter } from "../../components/client-filter/client-filter";
import { useCostSummary } from "../../hooks/use-payroll-reports-queries";
import type {
  CostSummaryGroupBy,
  CostSummaryResponse,
} from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { formatMoney } from "@/shared/utils/money.util";

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
    r.employeeCount,
    r.totalBasicPay,
    r.totalGrossIncome,
    r.totalDeductions,
    r.employerContributionsCost,
    r.totalNetPay,
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
    title: "Deductions",
    dataIndex: "totalDeductions",
    key: "ded",
    align: "right",
    render: formatMoney,
  },
  {
    title: "Employer Cost",
    dataIndex: "employerContributionsCost",
    key: "erCost",
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

export default function CostSummary() {
  const [clientId, setClientId] = useState<string | undefined>();
  const [range, setRange] = useState<[string, string]>([
    dayjs().startOf("month").format("YYYY-MM-DD"),
    dayjs().endOf("month").format("YYYY-MM-DD"),
  ]);
  const [groupBy, setGroupBy] = useState<CostSummaryGroupBy>("department");
  const {
    data = [],
    isLoading,
    refetch,
  } = useCostSummary(range[0], range[1], groupBy, clientId);

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
      totals={{
        fields: [
          "totalBasicPay",
          "totalGrossIncome",
          "totalDeductions",
          "employerContributionsCost",
          "totalNetPay",
        ],
        exportHeaders: [
          "Total Basic Pay",
          "Total Gross Income",
          "Total Deductions",
          "Employer Contributions Cost",
          "Total Net Pay",
        ],
      }}
      exportIntegerHeaders={["Employee Count"]}
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
            <ClientFilter value={clientId} onChange={setClientId} />
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
