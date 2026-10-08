import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
  theme,
} from "antd";
import type { MenuProps } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
  FileTextOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useSearch } from "@tanstack/react-router";
import {
  usePayrolls,
  usePayrollBatches,
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
import { getLastMonthToCurrentRange } from "@/shared/utils/cutoff.util";
import { APPROVAL_STATUS_LABEL } from "../../constants/label.const";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import {
  buildPayrollBatchOptions,
  sortBatchesLatestFirst,
} from "./utils/payroll-batch-option.util";
import { getEmptyMessage } from "./payroll-summary-empty";
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

type StatusFilter =
  "All" | "ForApproval" | "Approved" | "Declined" | "Cancelled";

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "All", label: "All" },
  ...(
    Object.entries(APPROVAL_STATUS_LABEL) as [
      Exclude<StatusFilter, "All">,
      string,
    ][]
  ).map(([value, label]) => ({ value, label })),
];

export default function PayrollSummary() {
  const { token } = theme.useToken();
  // Arriving from the Saved Payroll Runs tab's "View" action pre-selects that exact run —
  // see PayrollBatchesTab's navigate({ to: "/payroll/summary", search: { batchId } }).
  const searchParams = useSearch({ from: "/payroll/summary" }) as Record<
    string,
    string
  >;
  const [selectedBatchId, setSelectedBatchId] = useState<string | undefined>(
    searchParams.batchId,
  );
  // Defaults to Approved so the report reads clean day-to-day — switch to All/For Approval/
  // Declined to inspect a pending or declined run's figures from this page.
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Approved");

  // Narrows the batch selector below -- defaults to last month through this month, same as
  // the Saved Payroll Runs tab, so the dropdown isn't a long scroll through every run ever made
  // yet still includes a run generated late for the previous period.
  // Arriving pre-selected via ?batchId= instead falls back to no filter (the backend's own wide
  // default) so that specific batch is guaranteed to be in the dropdown's option list.
  const [batchDateRange, setBatchDateRange] = useState<[string, string] | null>(
    () => {
      if (searchParams.batchId) return null;
      const { fromDate, toDate } = getLastMonthToCurrentRange();
      return [fromDate, toDate];
    },
  );
  const { data: batchData, isFetching: isFetchingBatches } = usePayrollBatches(
    batchDateRange?.[0],
    batchDateRange?.[1],
  );
  const batches = useMemo(
    () => sortBatchesLatestFirst(batchData ?? []),
    [batchData],
  );

  // Open on the newest run instead of an empty page, and fall back to it when a range change
  // drops the picked run from the list. While the list is still loading the pick is kept as-is,
  // so a deep-linked batch isn't replaced before it arrives.
  const batchId =
    isFetchingBatches || batches.some((b) => b.id === selectedBatchId)
      ? selectedBatchId
      : batches[0]?.id;

  const selectedIndex = batches.findIndex((b) => b.id === batchId);
  const stepBatch = (offset: number) => {
    const next = batches[selectedIndex + offset];
    if (next) setSelectedBatchId(next.id);
  };

  const { data: employees = [] } = useEmployees();
  // Remarks, status, employee count, payout date and generator, so several runs of the same
  // period can be told apart -- see buildPayrollBatchOptions.
  const batchOptions = useMemo(
    () =>
      buildPayrollBatchOptions(
        batches,
        (id) => employees.find((e) => e.id === id)?.fullName ?? undefined,
      ),
    [batches, employees],
  );

  const selectedBatch = useMemo(
    () => batches.find((b) => b.id === batchId),
    [batches, batchId],
  );

  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = usePayrolls({ payrollBatchId: batchId });

  const allResults = useMemo<PayrollRunResult[]>(
    () => response?.data ?? [],
    [response],
  );

  const results = useMemo(
    () =>
      statusFilter === "All"
        ? allResults
        : allResults.filter((r) => r.approvalStatus === statusFilter),
    [allResults, statusFilter],
  );

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
    if (!results.length || !selectedBatch) return;
    const printTab = window.open("about:blank", "_blank");
    try {
      const blob = await httpClient.get<Blob>(
        `${buildApiUrl(API_PREFIX.hrms, "payrolls")}/print-summary`,
        {
          params: {
            from: selectedBatch.payPeriodStart,
            to: selectedBatch.payPeriodEnd,
          },
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
    if (!results.length || !selectedBatch) return;
    const suffix = `${selectedBatch.payPeriodStart}_${selectedBatch.payPeriodEnd}`;
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

  const emptyMessage = getEmptyMessage({
    hasBatches: batches.length > 0,
    batchSelected: !!batchId,
    loadedCount: allResults.length,
    statusLabel:
      STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label ??
      statusFilter,
    statusFiltered: statusFilter !== "All",
  });

  const tableProps = {
    rowKey: "employeeId",
    loading: isLoading,
    locale: {
      emptyText: (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <div className="font-medium">{emptyMessage.title}</div>
              <div className="text-xs opacity-70">{emptyMessage.hint}</div>
            </div>
          }
        />
      ),
    },
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
              value={
                batchDateRange
                  ? [dayjs(batchDateRange[0]), dayjs(batchDateRange[1])]
                  : null
              }
              onChange={(dates) => {
                if (dates)
                  setBatchDateRange([
                    dates[0]?.format("YYYY-MM-DD") ?? "",
                    dates[1]?.format("YYYY-MM-DD") ?? "",
                  ]);
              }}
            />
            <Space.Compact>
              <Button
                icon={<LeftOutlined />}
                title="Older payroll"
                disabled={
                  selectedIndex < 0 || selectedIndex >= batches.length - 1
                }
                onClick={() => stepBatch(1)}
              />
              <Select
                value={batchId}
                onChange={setSelectedBatchId}
                placeholder="Select a payroll batch"
                showSearch
                optionFilterProp="label"
                className="w-80"
                popupMatchSelectWidth={false}
                classNames={{ popup: { root: "min-w-[420px] max-w-[90vw]" } }}
                notFoundContent="No payroll batches in this date range"
                options={batchOptions}
                optionRender={(option) => {
                  const { remarks, period, status, statusColor, meta } =
                    option.data as {
                      remarks: string | null;
                      period: string;
                      status: string;
                      statusColor: string;
                      meta: string;
                    };
                  return (
                    <div className="whitespace-normal py-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{period}</span>
                        <Tag color={statusColor} className="mr-0!">
                          {status}
                        </Tag>
                      </div>
                      {remarks && <div className="text-sm">{remarks}</div>}
                      <div className="text-xs opacity-70">{meta}</div>
                    </div>
                  );
                }}
              />
              <Button
                icon={<RightOutlined />}
                title="Newer payroll"
                disabled={selectedIndex <= 0}
                onClick={() => stepBatch(-1)}
              />
            </Space.Compact>
            <Select<StatusFilter>
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_FILTER_OPTIONS}
              className="w-37.5"
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
    </div>
  );
}
