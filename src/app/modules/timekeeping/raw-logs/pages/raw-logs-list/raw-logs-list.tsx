import { useRef, useState } from "react";
import { Button, Dropdown, Form, Space, Tabs, Typography, message } from "antd";
import type { MenuProps } from "antd";
import { DownloadOutlined, PlayCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useRawAttendanceLogs,
  useRawColumnarLogs,
  useCleanRowLogs,
  useCleanColumnarLogs,
} from "../../hooks/use-raw-logs-queries";
import RawAttendanceTable from "../../components/raw-attendance-table";
import RawColumnarTable from "../../components/raw-columnar-table";
import CleanRowTable from "../../components/clean-row-table";
import CleanColumnarTable from "../../components/clean-columnar-table";
import { RAW_LOGS_LABEL } from "../../constants/label.const";
import type { RawLogsFilterRequest } from "../../models/api/response/raw-attendance-log.model";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import {
  buildFlatCsv,
  downloadExcel,
  triggerDownload,
} from "@/shared/utils/export.utils";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { formatClockDateTime } from "@/shared/utils/clock-format.util";
import { AppEmpty } from "@/shared/components/app-empty/app-empty";
import {
  FilterPanel,
  FilterToggleButton,
} from "@/shared/components/filter-panel/filter-panel";
import { FilterSelect } from "@/shared/components/filter-panel/filter-select";
import {
  compactChips,
  formatRangeChip,
  labelOf,
} from "@/shared/utils/filter-chips.util";

const { Title } = Typography;

const EMPTY_FILTER: RawLogsFilterRequest = {};

// Export timestamps carry seconds; fall back to the raw value if it isn't a parseable date-time.
const stamp = (v?: string | null): string =>
  formatClockDateTime(v) || (v ?? "");

function currentSemiMonthlyRange(): { fromDate: string; toDate: string } {
  const today = dayjs();
  const day = today.date();
  if (day <= 15) {
    return {
      fromDate: today.startOf("month").format("YYYY-MM-DD"),
      toDate: today.date(15).format("YYYY-MM-DD"),
    };
  }
  return {
    fromDate: today.date(16).format("YYYY-MM-DD"),
    toDate: today.endOf("month").format("YYYY-MM-DD"),
  };
}

interface TabState {
  filter: RawLogsFilterRequest;
  key: number;
}

const notGeneratedYet = (
  <div className="py-10">
    <AppEmpty description="Set the filters, then click Generate to load logs." />
  </div>
);

export default function RawLogsList() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("raw-attendance");
  const [pending, setPending] = useState<RawLogsFilterRequest>(
    currentSemiMonthlyRange,
  );

  // Each tab tracks its own committed filter + generate key independently.
  // Only Generate (not tab switching) populates a tab's state.
  const [tabStates, setTabStates] = useState<Record<string, TabState>>({});

  const seqRef = useRef(0);
  const [messageApi, contextHolder] = message.useMessage();

  const { data: departments = [] } = useDepartments();
  const { data: clients = [] } = useClients();
  const { data: areas = [] } = useOperationAreas();
  const { data: branches = [] } = useBranches();
  const { data: employees = [] } = useEmployeeFilter();

  // Per-tab query state helpers
  const ts = (tab: string) => tabStates[tab];
  const tabFilter = (tab: string) => ts(tab)?.filter ?? EMPTY_FILTER;
  const tabKey = (tab: string) => ts(tab)?.key ?? 0;
  const tabEnabled = (tab: string) => !!ts(tab);

  const { data: rawAttendanceLogs = [], isLoading: rawAttendanceLoading } =
    useRawAttendanceLogs(tabFilter("raw-attendance"), {
      enabled: tabEnabled("raw-attendance"),
      generateKey: tabKey("raw-attendance"),
    });

  const { data: rawColumnarLogs = [], isLoading: rawColumnarLoading } =
    useRawColumnarLogs(tabFilter("raw-columnar"), {
      enabled: tabEnabled("raw-columnar"),
      generateKey: tabKey("raw-columnar"),
    });

  const { data: cleanRowLogs = [], isLoading: cleanRowLoading } =
    useCleanRowLogs(tabFilter("clean-row"), {
      enabled: tabEnabled("clean-row"),
      generateKey: tabKey("clean-row"),
    });

  const { data: cleanColumnarLogs = [], isLoading: cleanColumnarLoading } =
    useCleanColumnarLogs(tabFilter("clean-columnar"), {
      enabled: tabEnabled("clean-columnar"),
      generateKey: tabKey("clean-columnar"),
    });

  const isActiveTabLoading =
    (activeTab === "raw-attendance" && rawAttendanceLoading) ||
    (activeTab === "raw-columnar" && rawColumnarLoading) ||
    (activeTab === "clean-row" && cleanRowLoading) ||
    (activeTab === "clean-columnar" && cleanColumnarLoading);

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: b.code || b.name,
    fullLabel: b.code ? b.name : undefined,
  }));
  const deptOptions = departments.map((d) => ({
    value: d.id,
    label: d.code || d.name,
    fullLabel: d.code ? d.name : undefined,
  }));
  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: c.code || c.name,
    fullLabel: c.code ? c.name : undefined,
  }));
  const areaOptions = areas
    .filter((a) => !pending.branchId || a.branchId === pending.branchId)
    .map((a) => ({
      value: a.id,
      label: a.code || a.name,
      fullLabel: a.code ? a.name : undefined,
    }));
  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const activeFilterCount = [
    pending.fromDate,
    pending.toDate,
    pending.branchId,
    pending.departmentId,
    pending.clientId,
    pending.operationAreaId,
    pending.employeeId,
  ].filter(Boolean).length;

  // What the current filter is, shown while the filter card is collapsed.
  const filterChips = compactChips([
    formatRangeChip(pending.fromDate, pending.toDate),
    labelOf(branchOptions, pending.branchId),
    labelOf(deptOptions, pending.departmentId),
    labelOf(clientOptions, pending.clientId),
    labelOf(areaOptions, pending.operationAreaId),
    labelOf(employeeOptions, pending.employeeId),
  ]);

  // ── Export helpers ──────────────────────────────────────────────────────────

  type AnyRow = Record<string, string>;

  const activeTabData = (): { rows: AnyRow[]; name: string } => {
    switch (activeTab) {
      case "raw-attendance":
        return {
          name: "raw-attendance",
          rows: rawAttendanceLogs.map((r) => ({
            Employee: r.name ?? "",
            WorkDateTime: stamp(r.workDateTime),
            LogSource: r.logSource,
            Batch: r.batch,
          })),
        };
      case "raw-columnar":
        return {
          name: "raw-columnar",
          rows: rawColumnarLogs.map((r) => ({
            EmpNo: r.empNo,
            FullName: r.fullName,
            Department: r.department,
            WorkDate: r.workDate,
            ShiftName: r.shiftName,
            ShiftStart: stamp(r.shiftStart),
            ShiftEnd: stamp(r.shiftEnd),
            BreakOut: stamp(r.breakOut),
            BreakIn: stamp(r.breakIn),
            ...Object.fromEntries(
              Array.from({ length: 20 }, (_, i) => {
                const k = `log${i + 1}` as keyof typeof r;
                const v = r[k] as { workTime: string } | null;
                return [`Log${i + 1}`, stamp(v?.workTime)];
              }).filter(([, v]) => v !== ""),
            ),
          })),
        };
      case "clean-row":
        return {
          name: "clean-row",
          rows: cleanRowLogs.map((r) => ({
            EmpNo: r.empNo,
            FullName: r.fullName,
            Department: r.department,
            WorkDate: r.workDate,
            ShiftName: r.shiftName,
            ShiftStart: stamp(r.shiftStart),
            ShiftEnd: stamp(r.shiftEnd),
            BreakOut: stamp(r.breakOut),
            BreakIn: stamp(r.breakIn),
            Log1: stamp(r.log1?.workTime),
          })),
        };
      case "clean-columnar":
        return {
          name: "clean-columnar",
          rows: cleanColumnarLogs.map((r) => ({
            EmpNo: r.empNo,
            FullName: r.fullName,
            Department: r.department,
            WorkDate: r.workDate,
            ShiftName: r.shiftName,
            ShiftStart: stamp(r.shiftStart),
            ShiftEnd: stamp(r.shiftEnd),
            BreakOut: stamp(r.breakOut),
            BreakIn: stamp(r.breakIn),
            ...Object.fromEntries(
              Array.from({ length: 20 }, (_, i) => {
                const k = `log${i + 1}` as keyof typeof r;
                const v = r[k] as { workTime: string } | null;
                return [`Log${i + 1}`, stamp(v?.workTime)];
              }).filter(([, v]) => v !== ""),
            ),
          })),
        };
      default:
        return { rows: [], name: activeTab };
    }
  };

  const handleExport = (format: "csv" | "excel") => {
    const { rows, name } = activeTabData();
    if (!rows.length) {
      messageApi.info("No data to export. Click Generate first.");
      return;
    }
    // Every row's columns, not just the first row's -- columnar rows only carry the Log columns
    // they have, so a later row with more punches would otherwise lose them in the file.
    const headers = [...new Set(rows.flatMap((r) => Object.keys(r)))];
    const strRows = rows.map((r) => headers.map((h) => r[h] ?? ""));
    const date = dayjs().format("YYYY-MM-DD");
    if (format === "csv") {
      triggerDownload(buildFlatCsv(headers, strRows), `${name}-${date}.csv`);
    } else {
      void downloadExcel(headers, strRows, `${name}-${date}.xlsx`);
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

  const activeTabHasData =
    (activeTab === "raw-attendance" && rawAttendanceLogs.length > 0) ||
    (activeTab === "raw-columnar" && rawColumnarLogs.length > 0) ||
    (activeTab === "clean-row" && cleanRowLogs.length > 0) ||
    (activeTab === "clean-columnar" && cleanColumnarLogs.length > 0);

  // ────────────────────────────────────────────────────────────────────────────

  const handleGenerate = () => {
    if (!pending.fromDate || !pending.toDate) {
      messageApi.warning("Date Range is required.");
      return;
    }
    seqRef.current += 1;
    setTabStates((prev) => ({
      ...prev,
      [activeTab]: {
        filter: { ...pending },
        key: seqRef.current,
      },
    }));
    // The results are the point once generated; the chips below keep the filters visible.
    setFiltersOpen(false);
  };

  const handleClear = () => {
    setPending(currentSemiMonthlyRange());
    setTabStates({});
  };

  return (
    <div className="content-page">
      {contextHolder}

      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {RAW_LOGS_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">{RAW_LOGS_LABEL.SUBTITLE}</p>
          </div>
          <Space>
            <Dropdown
              menu={{ items: exportMenuItems }}
              trigger={["click"]}
              disabled={!activeTabHasData}
            >
              <Button icon={<DownloadOutlined />} disabled={!activeTabHasData}>
                Export
              </Button>
            </Dropdown>
            <FilterToggleButton
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              activeCount={activeFilterCount}
            />
          </Space>
        </div>
      </div>

      <FilterPanel
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        chips={filterChips}
        onClear={handleClear}
        onApply={handleGenerate}
        applyLabel="Generate"
        applyIcon={<PlayCircleOutlined />}
        applyLoading={isActiveTabLoading}
        applyDisabled={!pending.fromDate || !pending.toDate}
      >
        <Form.Item
          label="Date Range"
          className="mb-3 sm:col-span-2"
          required
          validateStatus={!pending.fromDate || !pending.toDate ? "error" : ""}
          help={!pending.fromDate || !pending.toDate ? "Required" : undefined}
        >
          <MobileRangePicker
            className="w-full"
            status={!pending.fromDate || !pending.toDate ? "error" : undefined}
            value={
              pending.fromDate && pending.toDate
                ? [dayjs(pending.fromDate), dayjs(pending.toDate)]
                : null
            }
            onChange={(dates) =>
              setPending((c) => ({
                ...c,
                fromDate: dates?.[0]?.format("YYYY-MM-DD"),
                toDate: dates?.[1]?.format("YYYY-MM-DD"),
              }))
            }
          />
        </Form.Item>
        <Form.Item label="Branch" className="mb-3">
          <FilterSelect
            placeholder="All branches"
            options={branchOptions}
            value={pending.branchId}
            onChange={(v) =>
              // Project Site is restricted to the selected Branch.
              setPending((c) => ({
                ...c,
                branchId: v,
                operationAreaId: undefined,
              }))
            }
          />
        </Form.Item>
        <Form.Item label="Department" className="mb-3">
          <FilterSelect
            placeholder="All departments"
            options={deptOptions}
            value={pending.departmentId}
            onChange={(v) => setPending((c) => ({ ...c, departmentId: v }))}
          />
        </Form.Item>
        <Form.Item label={RAW_LOGS_LABEL.CLIENT} className="mb-3">
          <FilterSelect
            placeholder="All clients"
            options={clientOptions}
            value={pending.clientId}
            onChange={(v) => setPending((c) => ({ ...c, clientId: v }))}
          />
        </Form.Item>
        <Form.Item label="Project Site" className="mb-3">
          <FilterSelect
            placeholder="All project sites"
            options={areaOptions}
            value={pending.operationAreaId}
            onChange={(v) => setPending((c) => ({ ...c, operationAreaId: v }))}
          />
        </Form.Item>
        <Form.Item label={RAW_LOGS_LABEL.EMPLOYEE_FILTER} className="mb-3">
          <FilterSelect
            placeholder="All employees"
            options={employeeOptions}
            value={pending.employeeId}
            onChange={(v) => setPending((c) => ({ ...c, employeeId: v }))}
          />
        </Form.Item>
      </FilterPanel>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "raw-attendance",
            label: RAW_LOGS_LABEL.TAB_RAW_ATTENDANCE,
            children: tabEnabled("raw-attendance") ? (
              <RawAttendanceTable
                data={rawAttendanceLogs}
                loading={rawAttendanceLoading}
              />
            ) : (
              notGeneratedYet
            ),
          },
          {
            key: "raw-columnar",
            label: RAW_LOGS_LABEL.TAB_RAW_COLUMNAR,
            children: tabEnabled("raw-columnar") ? (
              <RawColumnarTable
                data={rawColumnarLogs}
                loading={rawColumnarLoading}
              />
            ) : (
              notGeneratedYet
            ),
          },
          {
            key: "clean-row",
            label: RAW_LOGS_LABEL.TAB_CLEAN_ROW,
            children: tabEnabled("clean-row") ? (
              <CleanRowTable data={cleanRowLogs} loading={cleanRowLoading} />
            ) : (
              notGeneratedYet
            ),
          },
          {
            key: "clean-columnar",
            label: RAW_LOGS_LABEL.TAB_CLEAN_COLUMNAR,
            children: tabEnabled("clean-columnar") ? (
              <CleanColumnarTable
                data={cleanColumnarLogs}
                loading={cleanColumnarLoading}
              />
            ) : (
              notGeneratedYet
            ),
          },
        ]}
      />
    </div>
  );
}
