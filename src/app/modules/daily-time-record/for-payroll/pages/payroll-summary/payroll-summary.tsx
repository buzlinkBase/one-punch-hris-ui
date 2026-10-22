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
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import {
  filterPayrollGroupOption,
  payrollGroupOptionRender,
  toPayrollGroupOptions,
} from "@/shared/utils/payroll-group-options.util";
import {
  buildPayrollBatchOptions,
  sortBatchesLatestFirst,
} from "./utils/payroll-batch-option.util";
import { getEmptyMessage } from "./payroll-summary-empty";
import {
  payrollColumns,
  type ExpandableGroup,
} from "./columns/payroll.columns";
import { deductionsColumns } from "./columns/deductions.columns";
import { hoursColumns } from "./columns/hours.columns";
import { erColumns } from "./columns/employer-contributions.columns";
import {
  EXCEL_AMOUNT_FORMAT,
  buildExportSheet,
  buildPayrollSheet,
  buildDeductionsSheet,
  ER_HEADERS,
  buildErRows,
  HOURS_HEADERS,
  buildHoursRows,
} from "./utils/payroll-summary-export.util";
import {
  buildFilterFileSuffix,
  buildPrintSummaryParams,
  filterPayrollResults,
  type PayrollSummaryFilter,
  type StatusFilter,
} from "./utils/payroll-summary-filter.util";

const { Title } = Typography;

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
  const [activeTab, setActiveTab] = useState("payroll");

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

  const { data: clients = [] } = useClients();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const [clientFilter, setClientFilter] = useState<string | undefined>();
  const [payrollGroupFilter, setPayrollGroupFilter] = useState<
    string | undefined
  >();
  const clientFilterOptions = useMemo(
    () => clients.map((c) => ({ value: c.id, label: `${c.code} - ${c.name}` })),
    [clients],
  );
  const payrollGroupFilterOptions = useMemo(
    () => toPayrollGroupOptions(payrollGroups),
    [payrollGroups],
  );

  // One filter for the table, Export and Print — see filterPayrollResults. Client / payroll
  // group match the client / payroll group each row was paid under, not the employee's current one.
  const filter = useMemo<PayrollSummaryFilter>(
    () => ({
      status: statusFilter,
      clientId: clientFilter,
      payrollGroupId: payrollGroupFilter,
    }),
    [statusFilter, clientFilter, payrollGroupFilter],
  );
  const results = useMemo(
    () => filterPayrollResults(allResults, filter),
    [allResults, filter],
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

  // Payroll tab: earnings -> deductions -> Net in one row; the 7 holiday categories and the
  // per-type Loans / Other Deductions / Other Income columns stay folded behind their header's
  // toggle until asked for.
  const [expanded, setExpanded] = useState<Record<ExpandableGroup, boolean>>({
    holiday: false,
    loans: false,
    otherDeductions: false,
    otherIncome: false,
  });
  const payrollTableColumns = payrollColumns({
    onPrint: handlePrintPayslip,
    results,
    expanded,
    onToggle: (group) => setExpanded((e) => ({ ...e, [group]: !e[group] })),
  });

  // Sends the selected batch plus the on-screen filter, so the PDF lists exactly the rows in
  // the table — see buildPrintSummaryParams / PayrollsController.PrintSummary.
  const handlePrintSummary = async () => {
    if (!results.length || !selectedBatch) return;
    const printTab = window.open("about:blank", "_blank");
    try {
      const blob = await httpClient.get<Blob>(
        `${buildApiUrl(API_PREFIX.hrms, "payrolls")}/print-summary`,
        {
          params: buildPrintSummaryParams(selectedBatch.id, filter),
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

  // Export files are built from `results`, so they hold exactly the filtered rows on screen; the
  // name carries the period and the applied filters.
  const buildExportSuffix = (batch: NonNullable<typeof selectedBatch>) =>
    `${batch.payPeriodStart}_${batch.payPeriodEnd}${buildFilterFileSuffix({
      status: statusFilter,
      clientCode: clients.find((c) => c.id === clientFilter)?.code,
      payrollGroupCode: payrollGroups.find((p) => p.id === payrollGroupFilter)
        ?.code,
    })}`;

  const handleExportDeductions = () => {
    if (!results.length || !selectedBatch) return;
    const deductions = buildDeductionsSheet(results);
    downloadMultiSheetExcel(
      [
        {
          name: "Deductions",
          headers: deductions.headers,
          rows: deductions.rows,
          numberFormat: EXCEL_AMOUNT_FORMAT,
        },
      ],
      `deductions-${buildExportSuffix(selectedBatch)}.xlsx`,
    );
  };

  const handleExport = (format: "csv" | "excel") => {
    if (!results.length || !selectedBatch) return;
    const suffix = buildExportSuffix(selectedBatch);
    if (format === "csv") {
      const csv = buildExportSheet(results);
      triggerDownload(
        buildFlatCsv(csv.headers, csv.rows),
        `payroll-summary-${suffix}.csv`,
      );
    } else {
      // One worksheet per tab, matching what's on screen exactly (Payroll with its Loans /
      // Other Deductions / Other Income groups unfolded).
      const payroll = buildPayrollSheet(results);
      const deductions = buildDeductionsSheet(results);
      downloadMultiSheetExcel(
        [
          {
            name: "Payroll",
            headers: payroll.headers,
            rows: payroll.rows,
            numberFormat: EXCEL_AMOUNT_FORMAT,
          },
          {
            name: "Deductions",
            headers: deductions.headers,
            rows: deductions.rows,
            numberFormat: EXCEL_AMOUNT_FORMAT,
          },
          {
            name: "Employer Contributions",
            headers: ER_HEADERS,
            rows: buildErRows(results),
            numberFormat: EXCEL_AMOUNT_FORMAT,
          },
          {
            name: "Hours Breakdown",
            headers: HOURS_HEADERS,
            rows: buildHoursRows(results),
            numberFormat: EXCEL_AMOUNT_FORMAT,
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
        </div>
      </div>

      <div className="mt-4 mb-4">
        <div>
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
            <Select
              value={clientFilter}
              onChange={setClientFilter}
              options={clientFilterOptions}
              placeholder="All clients"
              allowClear
              showSearch
              optionFilterProp="label"
              className="w-48"
            />
            <Select
              value={payrollGroupFilter}
              onChange={setPayrollGroupFilter}
              options={payrollGroupFilterOptions}
              placeholder="All payroll groups"
              allowClear
              showSearch={{ filterOption: filterPayrollGroupOption }}
              optionRender={payrollGroupOptionRender}
              className="w-48"
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
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            activeTab === "deductions" ? (
              <Button
                icon={<DownloadOutlined />}
                disabled={!results.length}
                onClick={handleExportDeductions}
              >
                Export Excel
              </Button>
            ) : null
          }
          items={[
            {
              key: "payroll",
              label: "Payroll",
              children: (
                <Table
                  dataSource={results}
                  columns={payrollTableColumns}
                  bordered
                  {...tableProps}
                />
              ),
            },
            {
              key: "deductions",
              label: "Deductions",
              children: (
                <Table
                  dataSource={results}
                  columns={deductionsColumns(results)}
                  bordered
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
