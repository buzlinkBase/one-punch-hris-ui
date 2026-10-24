import { useMemo, useState } from "react";
import {
  Button,
  Dropdown,
  Empty,
  Input,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  DownloadOutlined,
  LeftOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useDtrBatchCodes,
  useDtrSummaryByBatch,
} from "../../hooks/use-dtr-summary-queries";
import DtrSummaryTable from "../../components/dtr-summary-table";
import { DTR_SUMMARY_LABEL } from "../../constants/label.const";
import {
  buildDtrSummaryCsv,
  fmtCell,
  GROUPED_COLS,
  LEFT_COLS,
} from "../../utils/dtr-summary-export.utils";
import type { BatchesModel } from "../../models/api/response/batches.model";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
} from "../../../detail/constants/label.const";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { QUICK_RANGES } from "@/shared/utils/quick-date-ranges.util";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { getLastMonthToCurrentRange } from "@/shared/utils/cutoff.util";
import {
  filterPayrollGroupOption,
  payrollGroupOptionRender,
  toPayrollGroupOptions,
} from "@/shared/utils/payroll-group-options.util";
import {
  downloadGroupedHeaderExcel,
  triggerDownload,
} from "@/shared/utils/export.utils";

const { Title, Text } = Typography;

// Newest period first; code breaks ties between batches covering the same period.
const byLatestFirst = (a: BatchesModel, b: BatchesModel) =>
  (b.toDate ?? "").localeCompare(a.toDate ?? "") ||
  (b.fromDate ?? "").localeCompare(a.fromDate ?? "") ||
  (b.code ?? "").localeCompare(a.code ?? "");

const periodText = (b?: BatchesModel) =>
  b?.fromDate && b.toDate
    ? `${dayjs(b.fromDate).format("MMM DD")} – ${dayjs(b.toDate).format("MMM DD, YYYY")}`
    : "—";

const statusTag = (b: BatchesModel) =>
  b.pendingDeletion ? (
    <Tag color="volcano">Pending Deletion</Tag>
  ) : (
    <Tag color={APPROVAL_STATUS_COLOR[b.approvalStatus ?? ""] ?? "default"}>
      {APPROVAL_STATUS_LABEL[b.approvalStatus ?? ""] ?? "Approved"}
    </Tag>
  );

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-24 flex-col">
      <Text type="secondary" className="text-xs">
        {label}
      </Text>
      <Text strong>{value}</Text>
    </div>
  );
}

export default function DtrSummaryList() {
  const [selectedBatchCode, setSelectedBatchCode] = useState<
    string | undefined
  >(undefined);
  const [search, setSearch] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  // The list is limited by the date range (default: last month through this month), not by the
  // backend -- widen it (e.g. "This year" or a custom range) to preview older batches.
  const [dateRange, setDateRange] = useState<[string, string]>(() => {
    const { fromDate, toDate } = getLastMonthToCurrentRange();
    return [fromDate, toDate];
  });
  const [payrollGroupId, setPayrollGroupId] = useState<string | undefined>();

  const {
    data: batchData,
    isLoading: isLoadingCodes,
    refetch: refetchCodes,
  } = useDtrBatchCodes(dateRange[0], dateRange[1]);
  const { data: payrollGroups = [] } = usePayrollGroups();

  const batches = useMemo(
    () =>
      [...(batchData ?? [])]
        .filter((b) => !payrollGroupId || b.payrollGroupId === payrollGroupId)
        .sort(byLatestFirst),
    [batchData, payrollGroupId],
  );

  // A pick that the range / group filter no longer lists is treated as cleared.
  const activeBatchCode = batches.some((b) => b.code === selectedBatchCode)
    ? selectedBatchCode
    : undefined;

  // Loads as soon as a batch is picked -- no separate Search click needed.
  const {
    data: records = [],
    isFetching: isLoadingRecords,
    refetch: refetchRecords,
  } = useDtrSummaryByBatch(activeBatchCode ?? "");

  const selectedIndex = batches.findIndex((b) => b.code === activeBatchCode);
  const selectedBatch = selectedIndex >= 0 ? batches[selectedIndex] : undefined;
  const payrollGroup = payrollGroups.find(
    (p) => p.id === selectedBatch?.payrollGroupId,
  );

  const options = batches.map((b) => ({
    value: b.code ?? "",
    label: b.code ?? "",
    batch: b,
  }));

  // Batches are newest first, so "previous period" is the next index.
  const goToBatch = (index: number) => {
    const code = batches[index]?.code;
    if (code) setSelectedBatchCode(code);
  };

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => (r.fullName ?? "").toLowerCase().includes(q));
  }, [records, search]);

  const totalOf = (field: "regularNetHours" | "lateHours" | "absentCount") =>
    filteredRecords.reduce((acc, r) => acc + (r[field] ?? 0), 0);
  const totalOt = filteredRecords.reduce(
    (acc, r) => acc + (r.regularOTHours ?? 0) + (r.restDayOTHours ?? 0),
    0,
  );

  // ── Export ────────────────────────────────────────────────────────────────────

  const handleExport = (format: "csv" | "excel") => {
    if (!filteredRecords.length) {
      messageApi.info("No data to export. Select a batch first.");
      return;
    }
    const suffix = activeBatchCode
      ? activeBatchCode.replace(/[^a-zA-Z0-9_-]/g, "_")
      : dayjs().format("YYYYMMDD");
    if (format === "csv") {
      triggerDownload(
        buildDtrSummaryCsv(filteredRecords),
        `dtr-summary-${suffix}.csv`,
      );
    } else {
      downloadGroupedHeaderExcel(
        LEFT_COLS,
        GROUPED_COLS,
        filteredRecords,
        fmtCell,
        `dtr-summary-${suffix}.xlsx`,
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

  return (
    <div className="content-page">
      {contextHolder}

      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {DTR_SUMMARY_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              View aggregated DTR summary by batch code.
            </p>
          </div>
          <Space>
            <Dropdown
              menu={{ items: exportMenuItems }}
              trigger={["click"]}
              disabled={!filteredRecords.length}
            >
              <Button
                icon={<DownloadOutlined />}
                disabled={!filteredRecords.length}
              >
                Export
              </Button>
            </Dropdown>
          </Space>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1">
            {QUICK_RANGES.map((q) => {
              const [from, to] = q.range();
              const active = dateRange[0] === from && dateRange[1] === to;
              return (
                <Button
                  key={q.key}
                  size="small"
                  type={active ? "primary" : "default"}
                  onClick={() => setDateRange([from, to])}
                >
                  {q.label}
                </Button>
              );
            })}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <MobileRangePicker
              allowClear={false}
              value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
              onChange={(dates) => {
                if (dates?.[0] && dates[1])
                  setDateRange([
                    dates[0].format("YYYY-MM-DD"),
                    dates[1].format("YYYY-MM-DD"),
                  ]);
              }}
            />
            <Select
              allowClear
              showSearch
              placeholder="All payroll groups"
              value={payrollGroupId}
              onChange={setPayrollGroupId}
              options={toPayrollGroupOptions(payrollGroups)}
              filterOption={filterPayrollGroupOption}
              optionRender={payrollGroupOptionRender}
              className="w-full sm:w-48"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Space.Compact className="w-full sm:max-w-xl sm:flex-1">
            <Tooltip title="Older batch">
              <Button
                icon={<LeftOutlined />}
                disabled={
                  selectedIndex < 0 || selectedIndex >= batches.length - 1
                }
                onClick={() => goToBatch(selectedIndex + 1)}
              />
            </Tooltip>
            <Select
              showSearch
              allowClear
              loading={isLoadingCodes}
              placeholder={`Select or search a DTR batch (${batches.length} in range)…`}
              className="w-full"
              options={options}
              value={activeBatchCode}
              onChange={(code) => {
                setSelectedBatchCode(code);
                setSearch("");
              }}
              filterOption={(input, option) => {
                const b = option?.batch as BatchesModel | undefined;
                return `${b?.code ?? ""} ${b?.postingDescription ?? ""} ${periodText(b)}`
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
              optionRender={(opt) => {
                const b = opt.data.batch as BatchesModel;
                return (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <Text strong>{b.code}</Text>
                      <Text type="secondary" className="text-xs">
                        {periodText(b)} · {b.employeeCount ?? 0} employees
                      </Text>
                    </div>
                    {statusTag(b)}
                  </div>
                );
              }}
            />
            <Tooltip title="Newer batch">
              <Button
                icon={<RightOutlined />}
                disabled={selectedIndex <= 0}
                onClick={() => goToBatch(selectedIndex - 1)}
              />
            </Tooltip>
          </Space.Compact>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search employee…"
            value={search}
            disabled={!activeBatchCode}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button
            icon={<ReloadOutlined />}
            loading={isLoadingCodes || isLoadingRecords}
            onClick={() => {
              refetchCodes();
              if (activeBatchCode) refetchRecords();
            }}
          >
            Refresh
          </Button>
        </div>

        {selectedBatch && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gray-100 pt-3">
            <Stat label="Period" value={periodText(selectedBatch)} />
            <Stat
              label="Payroll Group"
              value={payrollGroup?.code || payrollGroup?.name || "—"}
            />
            <div className="flex flex-col">
              <Text type="secondary" className="text-xs">
                Status
              </Text>
              <span>
                {statusTag(selectedBatch)}
                {selectedBatch.isPosted && <Tag color="blue">Posted</Tag>}
              </span>
            </div>
            <Stat
              label="Employees"
              value={
                search.trim()
                  ? `${filteredRecords.length} of ${records.length}`
                  : String(records.length || selectedBatch.employeeCount || 0)
              }
            />
            <Stat
              label="Regular Hrs"
              value={totalOf("regularNetHours").toFixed(2)}
            />
            <Stat label="Overtime Hrs" value={totalOt.toFixed(2)} />
            <Stat label="Late Hrs" value={totalOf("lateHours").toFixed(2)} />
            <Stat label="Absences" value={String(totalOf("absentCount"))} />
            {selectedBatch.postingDescription && (
              <Text type="secondary" className="w-full text-sm">
                {selectedBatch.postingDescription}
              </Text>
            )}
          </div>
        )}
      </div>

      {activeBatchCode ? (
        <DtrSummaryTable data={filteredRecords} loading={isLoadingRecords} />
      ) : (
        <Empty
          className="py-16"
          description={
            batches.length > 0
              ? "Select a DTR batch to view its summary."
              : "No DTR batches in this date range. Widen the range to see older batches."
          }
        />
      )}
    </div>
  );
}
