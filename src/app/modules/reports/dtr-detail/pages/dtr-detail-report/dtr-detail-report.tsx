import { useState } from "react";
import { Button, Dropdown, Form, Typography, message } from "antd";
import type { MenuProps } from "antd";
import { DownloadOutlined, PlayCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useDtrDetailRecords } from "@/app/modules/daily-time-record/detail/hooks/use-dtr-detail-queries";
import DtrDetailTable from "@/app/modules/daily-time-record/detail/components/dtr-detail-table";
import type { DtrDetailFilter } from "@/app/modules/daily-time-record/detail/models/api/request/dtr-detail-filter.model";
import {
  buildDtrReportCsv,
  fmtReportCell,
  GROUPED_COLS,
  REPORT_LEFT_COLS,
} from "@/app/modules/daily-time-record/detail/utils/dtr-export.utils";
import type { DtrReportRow } from "@/app/modules/daily-time-record/detail/utils/dtr-export.utils";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { AppEmpty } from "@/shared/components/app-empty/app-empty";
import {
  FilterPanel,
  FilterToggleButton,
} from "@/shared/components/filter-panel/filter-panel";
import { FilterSelect } from "@/shared/components/filter-panel/filter-select";
import {
  downloadGroupedHeaderExcel,
  triggerDownload,
} from "@/shared/utils/export.utils";
import {
  compactChips,
  formatRangeChip,
  labelOf,
} from "@/shared/utils/filter-chips.util";

const { Title } = Typography;

const EMPTY_FILTER: DtrDetailFilter = {};

interface SelectOption {
  value: string;
  label: string;
  fullLabel?: string;
}

function currentSemiMonthlyRange(): { fromDate: string; toDate: string } {
  const today = dayjs();
  if (today.date() <= 15) {
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

const toOptions = (
  items: { id: string; code?: string | null; name: string }[],
): SelectOption[] =>
  items.map((i) => ({
    value: i.id,
    label: i.code || i.name,
    fullLabel: i.code ? i.name : undefined,
  }));

// Full name for exports, falling back to the short code/label.
const nameOf = (options: SelectOption[], id?: string | null): string => {
  const o = options.find((x) => x.value === id);
  return o ? (o.fullLabel ?? o.label) : "";
};

const notGeneratedYet = (
  <div className="py-10">
    <AppEmpty description="Set the filters, then click Generate to load the DTR." />
  </div>
);

export default function DtrDetailReport() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [pending, setPending] = useState<DtrDetailFilter>(
    currentSemiMonthlyRange,
  );
  const [committed, setCommitted] = useState<DtrDetailFilter | null>(null);
  const [generateKey, setGenerateKey] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();

  const { data: departments = [] } = useDepartments();
  const { data: clients = [] } = useClients();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: areas = [] } = useOperationAreas();
  const { data: branches = [] } = useBranches();
  const { data: employeeData = [] } = useEmployeeFilter();

  const clientOptions = toOptions(clients);
  const deptOptions = toOptions(departments);
  const branchOptions = toOptions(branches);
  const payrollGroupOptions = toOptions(payrollGroups);
  // Project Site picker is restricted to the selected Branch; exports resolve every site.
  const allAreaOptions = toOptions(areas);
  const areaOptions = toOptions(
    areas.filter((a) => !pending.branchId || a.branchId === pending.branchId),
  );
  const employeeOptions: SelectOption[] = employeeData.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const hasGenerated = committed !== null;
  const { data: records = [], isLoading } = useDtrDetailRecords(
    committed ?? EMPTY_FILTER,
    {
      enabled: hasGenerated,
      generateKey,
    },
  );

  const activeFilterCount = [
    pending.fromDate && pending.toDate,
    pending.clientId,
    pending.departmentId,
    pending.branchId,
    pending.operationAreaId,
    pending.payrollGroupId,
    pending.employeeId,
  ].filter(Boolean).length;

  const filterChips = compactChips([
    formatRangeChip(pending.fromDate, pending.toDate),
    labelOf(clientOptions, pending.clientId),
    labelOf(deptOptions, pending.departmentId),
    labelOf(branchOptions, pending.branchId),
    labelOf(allAreaOptions, pending.operationAreaId),
    labelOf(payrollGroupOptions, pending.payrollGroupId),
    labelOf(employeeOptions, pending.employeeId),
  ]);

  const missingRange = !pending.fromDate || !pending.toDate;

  const handleGenerate = () => {
    if (missingRange) {
      messageApi.warning("Date Range is required.");
      return;
    }
    setCommitted({ ...pending });
    setGenerateKey((k) => k + 1);
    // The results are the point once generated; the chips keep the filters visible.
    setFiltersOpen(false);
  };

  const handleClear = () => {
    setPending(currentSemiMonthlyRange());
    setCommitted(null);
  };

  const handleExport = (format: "csv" | "excel") => {
    if (!records.length) {
      messageApi.info("No data to export. Click Generate first.");
      return;
    }
    const rows: DtrReportRow[] = records.map((r) => ({
      ...r,
      clientName: nameOf(clientOptions, r.clientId),
      departmentName: nameOf(deptOptions, r.departmentId),
      branchName: nameOf(branchOptions, r.branchId),
      areaName: nameOf(allAreaOptions, r.areaId),
    }));
    const date = dayjs().format("YYYYMMDD");
    if (format === "csv") {
      triggerDownload(buildDtrReportCsv(rows), `dtr-detail-report-${date}.csv`);
    } else {
      void downloadGroupedHeaderExcel<DtrReportRow>(
        REPORT_LEFT_COLS,
        GROUPED_COLS,
        rows,
        fmtReportCell,
        `dtr-detail-report-${date}.xlsx`,
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
              DTR Detail Report
            </Title>
            <p className="page-toolbar-subtitle">
              Per-day time records filtered by client, department, employee and
              more. Export to CSV or Excel.
            </p>
          </div>
          <div className="flex gap-2">
            <Dropdown
              menu={{ items: exportMenuItems }}
              trigger={["click"]}
              disabled={!records.length}
            >
              <Button icon={<DownloadOutlined />} disabled={!records.length}>
                Export
              </Button>
            </Dropdown>
            <FilterToggleButton
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              activeCount={activeFilterCount}
            />
          </div>
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
        applyLoading={isLoading}
        applyDisabled={missingRange}
      >
        <Form.Item
          label="Date Range"
          className="mb-3 sm:col-span-2"
          required
          validateStatus={missingRange ? "error" : ""}
          help={missingRange ? "Required" : undefined}
        >
          <MobileRangePicker
            className="w-full"
            status={missingRange ? "error" : undefined}
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
        <Form.Item label="Client" className="mb-3">
          <FilterSelect
            placeholder="All clients"
            options={clientOptions}
            value={pending.clientId}
            onChange={(v) => setPending((c) => ({ ...c, clientId: v }))}
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
        <Form.Item label="Branch" className="mb-3">
          <FilterSelect
            placeholder="All branches"
            options={branchOptions}
            value={pending.branchId}
            onChange={(v) =>
              setPending((c) => ({
                ...c,
                branchId: v,
                operationAreaId: undefined,
              }))
            }
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
        <Form.Item label="Payroll Group" className="mb-3">
          <FilterSelect
            placeholder="All payroll groups"
            options={payrollGroupOptions}
            value={pending.payrollGroupId}
            onChange={(v) => setPending((c) => ({ ...c, payrollGroupId: v }))}
          />
        </Form.Item>
        <Form.Item label="Employee" className="mb-3">
          <FilterSelect
            placeholder="All employees"
            options={employeeOptions}
            value={pending.employeeId}
            onChange={(v) => setPending((c) => ({ ...c, employeeId: v }))}
          />
        </Form.Item>
      </FilterPanel>

      {hasGenerated ? (
        <DtrDetailTable
          data={records}
          loading={isLoading}
          readOnly
          showGrandTotal
          dateFrom={committed?.fromDate}
          dateTo={committed?.toDate}
        />
      ) : (
        notGeneratedYet
      )}
    </div>
  );
}
