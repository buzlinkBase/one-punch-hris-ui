import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  theme,
} from "antd";
import { FilePdfOutlined, WarningOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { useMonthlyRemittanceReturn } from "../../hooks/use-payroll-reports-queries";
import { payrollReportsApi } from "../../services/payroll-reports.api";
import type {
  MonthlyRemittanceReturnEmployeeResponse,
  MonthlyRemittanceReturnResponse,
} from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { openPdfInNewTab } from "@/shared/utils/download-file.util";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "ATC",
  "Gross Compensation",
  "Line 16A",
  "Line 16B",
  "Line 16C",
  "Taxable Compensation",
  "Tax Withheld",
];

const toRows = (records: MonthlyRemittanceReturnEmployeeResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    r.atcCode,
    fmt(r.grossCompensation),
    fmt(r.statutoryMinimumWage),
    fmt(r.mwePremiumPay),
    fmt(r.otherNonTaxable),
    fmt(r.taxableCompensation),
    fmt(r.taxWithheld),
  ]);

const columns: ColumnsType<MonthlyRemittanceReturnEmployeeResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 110,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
  {
    title: "ATC",
    dataIndex: "atcCode",
    key: "atc",
    width: 110,
    render: (v: string, r) => (
      <Space size={4}>
        <Tag color={v === "KR020" ? "green" : "blue"}>{v}</Tag>
        {r.isUnclassified && (
          <Tooltip title="Minimum Wage Earner status couldn't be determined — missing Branch/Region/Minimum Wage Rate. Defaulted to KR010.">
            <WarningOutlined style={{ color: "#faad14" }} />
          </Tooltip>
        )}
      </Space>
    ),
  },
  {
    title: "Gross Comp. (L15)",
    dataIndex: "grossCompensation",
    key: "gross",
    align: "right",
    render: fmt,
  },
  {
    title: "L16A",
    dataIndex: "statutoryMinimumWage",
    key: "l16a",
    align: "right",
    render: fmt,
  },
  {
    title: "L16B",
    dataIndex: "mwePremiumPay",
    key: "l16b",
    align: "right",
    render: fmt,
  },
  {
    title: "L16C",
    dataIndex: "otherNonTaxable",
    key: "l16c",
    align: "right",
    render: fmt,
  },
  {
    title: "Taxable Comp. (L18)",
    dataIndex: "taxableCompensation",
    key: "taxable",
    align: "right",
    render: fmt,
  },
  {
    title: "Tax Withheld (L19)",
    dataIndex: "taxWithheld",
    key: "withheld",
    align: "right",
    fixed: "right",
    render: fmt,
  },
];

// Drives both the summary matrix and the drill-down modal — one entry per BIR line item.
interface LineDef {
  key: string;
  label: string;
  summaryValue: (s: MonthlyRemittanceReturnResponse) => number;
  employeeValue: (e: MonthlyRemittanceReturnEmployeeResponse) => number;
}

const LINES: LineDef[] = [
  {
    key: "line15",
    label: "Line 15 — Total Amount of Compensation",
    summaryValue: (s) => s.line15_TotalCompensation,
    employeeValue: (e) => e.grossCompensation,
  },
  {
    key: "line16A",
    label: "Line 16A — Statutory Minimum Wage (MWEs)",
    summaryValue: (s) => s.line16A_StatutoryMinimumWage,
    employeeValue: (e) => e.statutoryMinimumWage,
  },
  {
    key: "line16B",
    label: "Line 16B — Holiday/OT/Hazard/Night Diff Pay (MWEs)",
    summaryValue: (s) => s.line16B_MWEPremiumPay,
    employeeValue: (e) => e.mwePremiumPay,
  },
  {
    key: "line16C",
    label: "Line 16C — Other Non-Taxable Compensation",
    summaryValue: (s) => s.line16C_OtherNonTaxable,
    employeeValue: (e) => e.otherNonTaxable,
  },
  {
    key: "line17",
    label: "Line 17 — Total Non-Taxable Compensation",
    summaryValue: (s) => s.line17_TotalNonTaxable,
    employeeValue: (e) =>
      e.statutoryMinimumWage + e.mwePremiumPay + e.otherNonTaxable,
  },
  {
    key: "line18",
    label: "Line 18 — Taxable Compensation",
    summaryValue: (s) => s.line18_TaxableCompensation,
    employeeValue: (e) => e.taxableCompensation,
  },
  {
    key: "line19",
    label: "Line 19 — Tax Required to be Withheld",
    summaryValue: (s) => s.line19_TaxWithheld,
    employeeValue: (e) => e.taxWithheld,
  },
];

function RemittanceMatrix({
  summary,
  onLineClick,
  onViewUnclassified,
}: {
  summary: MonthlyRemittanceReturnResponse | undefined;
  onLineClick: (line: LineDef) => void;
  onViewUnclassified: () => void;
}) {
  const { token } = theme.useToken();

  return (
    <div className="mb-4">
      {summary?.hasUnwithheldTaxWarning && (
        <Alert
          type="warning"
          showIcon
          className="mb-3"
          message="Taxable Compensation is greater than ₱0.00 but Tax Withheld is ₱0.00 — check for missing withholding."
        />
      )}
      {!!summary?.unclassifiedEmployeeCount && (
        <Alert
          type="warning"
          showIcon
          className="mb-3"
          message={
            <>
              {summary.unclassifiedEmployeeCount} employee(s) could not be
              classified as Minimum Wage Earner or not (missing Branch, Branch
              Region, or Minimum Wage Rate setup) — defaulted to regular
              (KR010). Their Line 16A/16B may be understated if they're actually
              minimum wage earners.{" "}
              <a onClick={onViewUnclassified}>View affected employees</a>
            </>
          }
        />
      )}
      <div
        style={{
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {LINES.map((line, i) => (
          <div
            key={line.key}
            onClick={() => onLineClick(line)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 16px",
              cursor: "pointer",
              borderBottom:
                i < LINES.length - 1
                  ? `1px solid ${token.colorBorderSecondary}`
                  : undefined,
              background:
                line.key === "line19" ? token.colorFillAlter : undefined,
              fontWeight:
                line.key === "line17" || line.key === "line19" ? 600 : 400,
            }}
          >
            <span>{line.label}</span>
            <span>{fmt(summary ? line.summaryValue(summary) : 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Bir1601C() {
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const [amendedReturn, setAmendedReturn] = useState(false);
  const [drillDownLine, setDrillDownLine] = useState<LineDef | null>(null);
  const [showUnclassified, setShowUnclassified] = useState(false);

  const range: [string, string] = [
    month.startOf("month").format("YYYY-MM-DD"),
    month.endOf("month").format("YYYY-MM-DD"),
  ];
  const { data, isLoading, refetch } = useMonthlyRemittanceReturn(
    range[0],
    range[1],
    amendedReturn,
  );

  const employees = useMemo(() => data?.employees ?? [], [data]);
  const summary = data?.summary;

  const drillDownRows = useMemo(() => {
    if (!drillDownLine) return [];
    return employees
      .filter((e) => drillDownLine.employeeValue(e) !== 0)
      .sort(
        (a, b) =>
          drillDownLine.employeeValue(b) - drillDownLine.employeeValue(a),
      );
  }, [drillDownLine, employees]);

  const unclassifiedRows = useMemo(
    () => employees.filter((e) => e.isUnclassified),
    [employees],
  );

  return (
    <>
      <PayrollReportShell
        title={PAYROLL_REPORTS_LABEL.BIR_1601C_TITLE}
        subtitle={PAYROLL_REPORTS_LABEL.BIR_1601C_SUBTITLE}
        data={employees}
        loading={isLoading}
        columns={columns}
        onRefresh={() => refetch()}
        rowKey={(r) => r.employeeId}
        exportFileName="bir-1601c"
        exportHeaders={EXPORT_HEADERS}
        exportRows={toRows}
        notice={
          <>
            <Alert
              type="info"
              showIcon
              className="mb-4"
              message="This is a summary of return figures for transcription into eBIRForms/eFPS — BIR does not accept a raw file upload for the 1601-C. Click a line below to see the employees behind it."
            />
            <RemittanceMatrix
              summary={summary}
              onLineClick={setDrillDownLine}
              onViewUnclassified={() => setShowUnclassified(true)}
            />
          </>
        }
        extraActions={
          <Button
            icon={<FilePdfOutlined />}
            onClick={() =>
              openPdfInNewTab(
                payrollReportsApi.urls.monthlyRemittanceReturnPrint,
                {
                  from: range[0],
                  to: range[1],
                  amendedReturn: amendedReturn ? "true" : "false",
                },
              )
            }
          >
            Preview PDF
          </Button>
        }
        filters={
          <Form layout="vertical">
            <div className="flex items-end gap-6 flex-wrap">
              <Form.Item
                label="Posting Month"
                className="mb-0"
                style={{ maxWidth: 200 }}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  picker="month"
                  value={month}
                  onChange={(date) => {
                    if (date) setMonth(date);
                  }}
                  allowClear={false}
                />
              </Form.Item>
              <Form.Item label="Amended Return" className="mb-0">
                <Switch checked={amendedReturn} onChange={setAmendedReturn} />
              </Form.Item>
            </div>
          </Form>
        }
      />

      <Modal
        open={!!drillDownLine}
        onCancel={() => setDrillDownLine(null)}
        footer={null}
        title={drillDownLine?.label}
        width={640}
        destroyOnHidden
      >
        <Table
          rowKey="employeeId"
          size="small"
          dataSource={drillDownRows}
          pagination={{ pageSize: 10, size: "small" }}
          columns={[
            {
              title: "Employee No",
              dataIndex: "employeeNo",
              key: "no",
              width: 100,
            },
            { title: "Full Name", dataIndex: "fullName", key: "name" },
            {
              title: "ATC",
              dataIndex: "atcCode",
              key: "atc",
              width: 80,
              render: (v: string) => (
                <Tag color={v === "KR020" ? "green" : "blue"}>{v}</Tag>
              ),
            },
            {
              title: "Amount",
              key: "amount",
              align: "right",
              width: 120,
              render: (
                _: unknown,
                r: MonthlyRemittanceReturnEmployeeResponse,
              ) => (drillDownLine ? fmt(drillDownLine.employeeValue(r)) : "—"),
            },
          ]}
          locale={{
            emptyText:
              "No employees contribute to this line for the selected period.",
          }}
        />
      </Modal>

      <Modal
        open={showUnclassified}
        onCancel={() => setShowUnclassified(false)}
        footer={null}
        title="Employees Needing Branch/Region Setup"
        width={520}
        destroyOnHidden
      >
        <p className="text-sm text-gray-500 mb-3">
          These employees have payroll data this period but their Minimum Wage
          Earner status couldn't be determined — assign a Branch (with a Region)
          that has a Minimum Wage Rate configured, then refresh this report.
        </p>
        <Table
          rowKey="employeeId"
          size="small"
          dataSource={unclassifiedRows}
          pagination={{ pageSize: 10, size: "small" }}
          columns={[
            {
              title: "Employee No",
              dataIndex: "employeeNo",
              key: "no",
              width: 100,
            },
            { title: "Full Name", dataIndex: "fullName", key: "name" },
          ]}
        />
      </Modal>
    </>
  );
}
