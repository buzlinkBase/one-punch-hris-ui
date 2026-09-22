import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Typography,
  message,
  theme,
} from "antd";
import type { MenuProps } from "antd";
import {
  ReloadOutlined,
  FileTextOutlined,
  PrinterOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  usePayrolls,
  usePostPayrollBatch,
  useDeletePayrollBatch,
} from "../../hooks/use-for-payroll-queries";
import type { PayrollRunResult } from "../../models/api/response/payroll-run-result.model";
import { otPay, ndPay } from "../../utils/ot-nd-pay.util";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import {
  buildFlatCsv,
  downloadMultiSheetExcel,
  triggerDownload,
} from "@/shared/utils/export.utils";
import { getSemiMonthlyCutoff } from "@/shared/utils/cutoff.util";
import PayrollRunBatchModal from "../../components/payroll-run-batch-modal";
import { earningsColumns } from "./columns/earnings.columns";
import { holidayColumns } from "./columns/holiday.columns";
import { deductionsColumns } from "./columns/deductions.columns";
import { hoursColumns } from "./columns/hours.columns";
import { erColumns } from "./columns/employer-contributions.columns";
import {
  EXPORT_HEADERS,
  buildExportRows,
  EARNINGS_HEADERS,
  buildEarningsRows,
  HOLIDAY_HEADERS,
  buildHolidayRows,
  DEDUCTIONS_HEADERS,
  buildDeductionsRows,
  ER_HEADERS,
  buildErRows,
  HOURS_HEADERS,
  buildHoursRows,
} from "./utils/payroll-summary-export.util";

const { Title } = Typography;

// Mirrors hrms-api's PayrollsController.RunTypeFeature -- Post/Delete on a mixed-type Payroll
// Summary batch need the permission for that specific batch's run type, not a fixed code.
const RUN_TYPE_FEATURE: Record<string, string> = {
  Regular: "Payroll Run",
  ThirteenthMonth: "13th Month Run",
  LastPay: "Last Pay Run",
  YearEndAdjustment: "Year-End Adjustment Run",
};

export default function PayrollSummary() {
  const { token } = theme.useToken();
  const defaultCutoff = getSemiMonthlyCutoff();
  const [dateRange, setDateRange] = useState<[string, string]>([
    defaultCutoff.fromDate,
    defaultCutoff.toDate,
  ]);

  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = usePayrolls({
    from: dateRange[0],
    to: dateRange[1],
  });

  const results = useMemo<PayrollRunResult[]>(
    () => response?.data ?? [],
    [response],
  );

  // Every row from one Generate run shares a PayrollBatchId (the id of its PayrollBatch
  // header row) — grouped here so Post/Delete act on the whole run in one action instead of
  // one employee at a time. This is a run-level transaction, not a per-employee one: an
  // employee's payroll was never generated on its own, so it isn't posted or deleted on its
  // own either (and deleting per-row wouldn't even unblock regenerating — GenerateAsync
  // blocks re-running a DTR batch while ANY row from it still exists).
  const batchGroups = useMemo(() => {
    const map = new Map<
      string,
      { payrollBatchId: string; rows: PayrollRunResult[] }
    >();
    for (const r of results) {
      if (!r.id || !r.payrollBatchId) continue;
      if (!map.has(r.payrollBatchId))
        map.set(r.payrollBatchId, {
          payrollBatchId: r.payrollBatchId,
          rows: [],
        });
      map.get(r.payrollBatchId)!.rows.push(r);
    }
    return Array.from(map.values())
      .map((g) => ({
        payrollBatchId: g.payrollBatchId,
        count: g.rows.length,
        allPosted: g.rows.every((r) => r.isPosted),
        hasPosted: g.rows.some((r) => r.isPosted),
        fromDate: g.rows[0].payPeriodStart,
        toDate: g.rows[0].payPeriodEnd,
        payDate: g.rows[0].payDate,
        remarks: g.rows[0].remarks,
        runTypeFeature:
          RUN_TYPE_FEATURE[g.rows[0].payrollType ?? "Regular"] ?? "Payroll Run",
      }))
      .sort((a, b) => b.payrollBatchId.localeCompare(a.payrollBatchId));
  }, [results]);

  const [batchModalOpen, setBatchModalOpen] = useState(false);

  const { mutateAsync: postPayrollBatch, isPending: isPostingBatch } =
    usePostPayrollBatch();
  const { mutateAsync: deletePayrollBatch, isPending: isDeletingBatch } =
    useDeletePayrollBatch();

  const handlePostBatch = async (payrollBatchId: string, count: number) => {
    try {
      await postPayrollBatch(payrollBatchId);
      message.success(
        `Posted the full payroll run — ${count} record${count !== 1 ? "s" : ""} locked in as final.`,
      );
    } catch {
      message.error("Failed to post this payroll run. Please try again.");
    }
  };

  const handleDeleteBatch = async (payrollBatchId: string, count: number) => {
    try {
      await deletePayrollBatch(payrollBatchId);
      message.success(
        `Deleted the full payroll run — ${count} record${count !== 1 ? "s" : ""} removed. You can regenerate it now.`,
      );
    } catch {
      message.error("Failed to delete this payroll run. Please try again.");
    }
  };

  // Format (Standard vs Hours Breakdown) is no longer user-selectable — the server picks it
  // based on the OT/ND Calculation Method actually recorded on this payroll run (Compounded ->
  // Standard, Additive -> Hours Breakdown), so the printed itemization always matches how the
  // employee was actually paid. See PayrollsController.PrintPayslip.
  const handlePrintPayslip = async (record: PayrollRunResult) => {
    if (!record.id) {
      message.error("This payroll record has no printable payslip yet.");
      return;
    }
    const printTab = window.open("about:blank", "_blank");
    try {
      const blob = await httpClient.get<Blob>(
        `${buildApiUrl(API_PREFIX.hrms, "payrolls")}/${record.id}/print`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(blob);
      if (printTab) printTab.location.href = url;
    } catch {
      printTab?.close();
      message.error("Failed to generate the payslip. Please try again.");
    }
  };

  const handlePrintSummary = async () => {
    if (!results.length) {
      message.info("No data to print. Adjust the date range first.");
      return;
    }
    const printTab = window.open("about:blank", "_blank");
    try {
      const blob = await httpClient.get<Blob>(
        `${buildApiUrl(API_PREFIX.hrms, "payrolls")}/print-summary`,
        {
          params: { from: dateRange[0], to: dateRange[1] },
          responseType: "blob",
        },
      );
      const url = URL.createObjectURL(blob);
      if (printTab) printTab.location.href = url;
    } catch {
      printTab?.close();
      message.error("Failed to generate the report. Please try again.");
    }
  };

  const handleExport = (format: "csv" | "excel") => {
    if (!results.length) {
      message.info("No data to export. Adjust the date range first.");
      return;
    }
    const suffix = `${dateRange[0]}_${dateRange[1]}`;
    if (format === "csv") {
      triggerDownload(
        buildFlatCsv(EXPORT_HEADERS, buildExportRows(results)),
        `payroll-summary-${suffix}.csv`,
      );
    } else {
      // One worksheet per tab, matching what's on screen exactly.
      downloadMultiSheetExcel(
        [
          {
            name: "Earnings",
            headers: EARNINGS_HEADERS,
            rows: buildEarningsRows(results),
          },
          {
            name: "Holiday Breakdown",
            headers: HOLIDAY_HEADERS,
            rows: buildHolidayRows(results),
          },
          {
            name: "Deductions & Net",
            headers: DEDUCTIONS_HEADERS,
            rows: buildDeductionsRows(results),
          },
          {
            name: "Employer Contributions",
            headers: ER_HEADERS,
            rows: buildErRows(results),
          },
          {
            name: "Hours Breakdown",
            headers: HOURS_HEADERS,
            rows: buildHoursRows(results),
          },
        ],
        `payroll-summary-${suffix}.xlsx`,
      );
    }
  };

  const exportMenuItems: MenuProps["items"] = [
    { key: "csv", label: "Export as CSV", onClick: () => handleExport("csv") },
    {
      key: "excel",
      label: "Export as Excel",
      onClick: () => handleExport("excel"),
    },
  ];

  const totals = useMemo(
    () => ({
      gross: results.reduce((s, r) => s + r.grossIncome, 0),
      net: results.reduce((s, r) => s + r.netPay, 0),
      sss: results.reduce((s, r) => s + r.sssContribution, 0),
      phic: results.reduce((s, r) => s + r.philHealthContribution, 0),
      hdmf: results.reduce((s, r) => s + r.pagIbigContribution, 0),
      tax: results.reduce((s, r) => s + r.withholdingTax, 0),
      ot: results.reduce((s, r) => s + otPay(r), 0),
      nd: results.reduce((s, r) => s + ndPay(r), 0),
      regHours: results.reduce((s, r) => s + (r.regularNetHours ?? 0), 0),
    }),
    [results],
  );

  const tableProps = {
    rowKey: "employeeId",
    loading: isLoading,
    size: "small" as const,
    scroll: { x: "max-content" as const },
    pagination: { pageSize: 50, showSizeChanger: false },
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Payroll Summary
            </Title>
            <p className="page-toolbar-subtitle">
              View generated payroll records with full earnings, deductions, and
              hour breakdown.
            </p>
          </div>
          <Space wrap>
            <MobileRangePicker
              value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
              onChange={(dates) => {
                if (dates)
                  setDateRange([
                    dates[0]?.format("YYYY-MM-DD") ?? "",
                    dates[1]?.format("YYYY-MM-DD") ?? "",
                  ]);
              }}
            />
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <Dropdown
              menu={{ items: exportMenuItems }}
              trigger={["click"]}
              disabled={!results.length}
            >
              <Button icon={<DownloadOutlined />} disabled={!results.length}>
                Export
              </Button>
            </Dropdown>
            <PermissionGate permission="Payroll Summary:Export">
              <Button
                icon={<PrinterOutlined />}
                disabled={!results.length}
                onClick={handlePrintSummary}
              >
                Print
              </Button>
            </PermissionGate>
            <Button
              icon={<CheckCircleOutlined />}
              disabled={!batchGroups.length}
              onClick={() => setBatchModalOpen(true)}
            >
              Post / Delete Payroll Run
            </Button>
          </Space>
        </div>
      </div>

      {results.length > 0 && (
        <Row gutter={16} className="mb-4">
          <Col>
            <Card size="small">
              <Statistic
                title="Employees"
                value={results.length}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col>
            <Card size="small">
              <Statistic
                title="Total Gross"
                value={totals.gross}
                precision={2}
                prefix="₱"
              />
            </Card>
          </Col>
          <Col>
            <Card size="small">
              <Statistic
                title="Total Net Pay"
                value={totals.net}
                precision={2}
                prefix="₱"
                valueStyle={{ color: token.colorPrimary }}
              />
            </Card>
          </Col>
          <Col>
            <Card size="small">
              <Statistic
                title="Total OT Pay"
                value={totals.ot}
                precision={2}
                prefix="₱"
              />
            </Card>
          </Col>
          <Col>
            <Card size="small">
              <Statistic
                title="Regular Hours"
                value={totals.regHours}
                precision={2}
                suffix="h"
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Tabs
          items={[
            {
              key: "earnings",
              label: "Earnings",
              children: (
                <Table
                  dataSource={results}
                  columns={earningsColumns(handlePrintPayslip)}
                  {...tableProps}
                />
              ),
            },
            {
              key: "holidays",
              label: "Holiday Breakdown",
              children: (
                <Table
                  dataSource={results}
                  columns={holidayColumns}
                  {...tableProps}
                />
              ),
            },
            {
              key: "deductions",
              label: "Deductions & Net",
              children: (
                <Table
                  dataSource={results}
                  columns={deductionsColumns(token.colorPrimary)}
                  {...tableProps}
                />
              ),
            },
            {
              key: "er",
              label: "Employer Contributions",
              children: (
                <Table
                  dataSource={results}
                  columns={erColumns}
                  {...tableProps}
                />
              ),
            },
            {
              key: "hours",
              label: "Hours Breakdown",
              children: (
                <Table
                  dataSource={results}
                  columns={hoursColumns}
                  {...tableProps}
                />
              ),
            },
          ]}
        />
      </Card>

      <PayrollRunBatchModal
        open={batchModalOpen}
        batchGroups={batchGroups}
        onClose={() => setBatchModalOpen(false)}
        onPost={handlePostBatch}
        onDelete={handleDeleteBatch}
        isPosting={isPostingBatch}
        isDeleting={isDeletingBatch}
      />
    </div>
  );
}
