import { useMemo, useState } from "react";
import { Button, Card, Col, DatePicker, Form, Row, Statistic, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import { useDeductionLedger } from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import {
  buildDeductionGroups,
  flattenDeductionGroups,
  type DeductionLedgerGroup,
  type DeductionLedgerLine,
} from "./deduction-ledger.util";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const fmtDate = (v: string) => (v ? dayjs(v).format("MMM DD, YYYY") : "—");

// Groups never expand on their own past this many employees, so a long list stays scannable.
const AUTO_EXPAND_LIMIT = 5;

type LedgerRow =
  | {
      key: string;
      kind: "group";
      group: DeductionLedgerGroup;
      children: LedgerRow[];
    }
  | { key: string; kind: "line"; line: DeductionLedgerLine };

const toRows = (groups: DeductionLedgerGroup[]): LedgerRow[] =>
  groups.map((group) => ({
    key: group.key,
    kind: "group",
    group,
    children: group.children.map((line) => ({
      key: line.key,
      kind: "line",
      line,
    })),
  }));

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Deduction Type",
  "Deduction Name",
  "Total Principal",
  "Interest Rate",
  "Start Date",
  "End Date",
  "Balance",
  "Running Balance",
];

const exportRows = (rows: LedgerRow[]) =>
  flattenDeductionGroups(
    rows.flatMap((r) => (r.kind === "group" ? [r.group] : [])),
  ).map((r) => [
    r.employeeNo,
    r.fullName,
    r.deductionTypeName,
    r.deductionName,
    fmt(r.totalPrincipal),
    fmt(r.interestRate),
    r.startDate,
    r.endDate,
    fmt(r.currentBalance),
    fmt(r.runningBalance),
  ]);

const columns: ColumnsType<LedgerRow> = [
  {
    title: "Employee / Deduction",
    key: "name",
    width: 280,
    render: (_, row) =>
      row.kind === "group" ? (
        <div>
          <span className="font-semibold">{row.group.fullName}</span>
          <Tag className="ml-2">
            {row.group.children.length}{" "}
            {row.group.children.length === 1 ? "deduction" : "deductions"}
          </Tag>
          {row.group.employeeNo && (
            <div className="text-xs text-gray-500">{row.group.employeeNo}</div>
          )}
        </div>
      ) : (
        <div>
          <span>{row.line.deductionName}</span>
          <div className="text-xs text-gray-500">
            {row.line.deductionTypeName}
          </div>
        </div>
      ),
  },
  {
    title: "Principal",
    key: "principal",
    align: "right",
    render: (_, row) =>
      row.kind === "line" ? fmt(row.line.totalPrincipal) : "",
  },
  {
    title: "Interest %",
    key: "interest",
    align: "right",
    render: (_, row) => (row.kind === "line" ? fmt(row.line.interestRate) : ""),
  },
  {
    title: "Period",
    key: "period",
    render: (_, row) => {
      const [start, end] =
        row.kind === "group"
          ? [row.group.startDate, row.group.endDate]
          : [row.line.startDate, row.line.endDate];
      return (
        <span className="whitespace-nowrap text-gray-600">
          {fmtDate(start)} – {fmtDate(end)}
        </span>
      );
    },
  },
  {
    title: "Balance",
    key: "balance",
    align: "right",
    render: (_, row) =>
      row.kind === "group" ? (
        <strong>{fmt(row.group.total)}</strong>
      ) : (
        fmt(row.line.currentBalance)
      ),
  },
  {
    title: "Running Balance",
    key: "running",
    align: "right",
    fixed: "right",
    render: (_, row) =>
      row.kind === "line" ? (
        <span className="text-gray-600">{fmt(row.line.runningBalance)}</span>
      ) : null,
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

  const groups = useMemo(
    () => buildDeductionGroups(deductionNameFilter.filtered),
    [deductionNameFilter.filtered],
  );
  const rows = useMemo(() => toRows(groups), [groups]);

  // null = follow the default (open small result sets, keep long ones collapsed).
  const [expanded, setExpanded] = useState<string[] | null>(null);
  const expandedKeys =
    expanded ??
    (groups.length <= AUTO_EXPAND_LIMIT ? groups.map((g) => g.key) : []);
  const allExpanded = expandedKeys.length === groups.length;

  const totalOutstanding = groups.reduce((sum, g) => sum + g.total, 0);
  const deductionCount = groups.reduce((sum, g) => sum + g.children.length, 0);

  return (
    <PayrollReportShell<LedgerRow>
      title={PAYROLL_REPORTS_LABEL.DEDUCTION_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.DEDUCTION_SUBTITLE}
      data={rows}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => r.key}
      exportFileName="deduction-ledger"
      exportHeaders={EXPORT_HEADERS}
      exportRows={exportRows}
      expandable={{
        expandedRowKeys: expandedKeys,
        onExpandedRowsChange: (keys) => setExpanded(keys.map(String)),
      }}
      summary={
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Employees with balances"
                value={groups.length}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic title="Open deductions" value={deductionCount} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Total outstanding"
                value={fmt(totalOutstanding)}
              />
            </Card>
          </Col>
        </Row>
      }
      filters={
        <Form layout="vertical">
          <div className="flex items-end gap-4 flex-wrap">
            <Form.Item label="As Of" className="mb-0 w-55">
              <DatePicker
                className="w-full"
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
            <Button
              onClick={() =>
                setExpanded(allExpanded ? [] : groups.map((g) => g.key))
              }
              disabled={groups.length === 0}
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </Button>
          </div>
        </Form>
      }
    />
  );
}
