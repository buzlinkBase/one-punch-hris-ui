import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Form,
  Select,
  Space,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  ClearOutlined,
  DownloadOutlined,
  FilterOutlined,
  PlayCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useDtrDetailRecords,
  useSaveDtrDetail,
} from "../../hooks/use-dtr-detail-queries";
import DtrDetailTable from "../../components/dtr-detail-table";
import DtrPostModal from "../../components/dtr-post-modal";
import type { DtrDetailFilter } from "../../models/api/request/dtr-detail-filter.model";
import {
  buildDtrCsv,
  fmtCell,
  GROUPED_COLS,
  LEFT_COLS,
} from "../../utils/dtr-export.utils";
import {
  downloadGroupedHeaderExcel,
  triggerDownload,
} from "@/shared/utils/export.utils";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

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

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean; fullLabel?: string },
) => {
  const q = input.toLowerCase();
  return (
    String(option?.label ?? "")
      .toLowerCase()
      .includes(q) ||
    String(option?.fullLabel ?? "")
      .toLowerCase()
      .includes(q)
  );
};

const EMPTY_FILTER: DtrDetailFilter = {};

export default function DtrGenerateTab() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [pending, setPending] = useState<DtrDetailFilter>(
    currentSemiMonthlyRange,
  );
  const [committedFilter, setCommittedFilter] =
    useState<DtrDetailFilter | null>(null);
  const [generateKey, setGenerateKey] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();

  const hasGenerated = committedFilter !== null;

  const { data: departments = [] } = useDepartments();
  const { data: clients = [] } = useClients();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: areas = [] } = useOperationAreas();
  const { data: branches = [] } = useBranches();
  const { data: employeeData = [] } = useEmployeeFilter();

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
  const payrollGrpOptions = payrollGroups.map((p) => ({
    value: p.id,
    label: p.code || p.name,
    fullLabel: p.code ? p.name : undefined,
  }));
  const areaOptions = areas
    .filter((a) => !pending.branchId || a.branchId === pending.branchId)
    .map((a) => ({
      value: a.id,
      label: a.code || a.name,
      fullLabel: a.code ? a.name : undefined,
    }));
  const employeeOptions = employeeData.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  // Pre-fill with the first payroll group when the user hasn't picked one yet.
  const effectivePayrollGroupId =
    pending.payrollGroupId ?? payrollGroups[0]?.id;

  const {
    data: records = [],
    isLoading,
    refetch,
  } = useDtrDetailRecords(committedFilter ?? EMPTY_FILTER, {
    enabled: hasGenerated,
    generateKey,
  });

  const { mutateAsync: saveRecords, isPending: isSaving } = useSaveDtrDetail();
  const [postModalOpen, setPostModalOpen] = useState(false);

  const handleSaveDraftClick = () => {
    if (!records.length) {
      messageApi.warning("No data to save. Click Generate first.");
      return;
    }
    setPostModalOpen(true);
  };

  // "Save Draft" persists the calculated rows and starts the DTR posting approval flow --
  // it no longer posts outright. The batch only actually posts (DailyRecord.Posted flips true)
  // once it's approved from the Saved DTR tab. See DailyRecordService.SaveDraftAsync.
  const handleConfirmSaveDraft = async (postingDescription: string) => {
    const payload = records.map((r) => ({ ...r, postingDescription }));
    await saveRecords(payload);
    setPostModalOpen(false);
    messageApi.success(
      `${records.length} record${records.length !== 1 ? "s" : ""} saved as a draft, awaiting approval.`,
    );
  };

  const activeFilterCount = [
    pending.fromDate,
    pending.toDate,
    pending.branchId,
    pending.departmentId,
    pending.clientId,
    effectivePayrollGroupId,
    pending.operationAreaId,
    pending.employeeId,
  ].filter(Boolean).length;

  const handleGenerate = () => {
    if (!pending.fromDate || !pending.toDate) {
      messageApi.warning("Date Range is required.");
      return;
    }
    if (!effectivePayrollGroupId) {
      messageApi.warning("Payroll Group is required.");
      return;
    }
    setCommittedFilter({ ...pending, payrollGroupId: effectivePayrollGroupId });
    setGenerateKey((k) => k + 1);
  };

  const handleClear = () => {
    setPending(currentSemiMonthlyRange());
    setCommittedFilter(null);
  };

  // ── Export ────────────────────────────────────────────────────────────────────

  const handleExport = (format: "csv" | "excel") => {
    if (!records.length) {
      messageApi.info("No data to export. Click Generate first.");
      return;
    }
    const date = dayjs().format("YYYYMMDD");
    if (format === "csv") {
      triggerDownload(buildDtrCsv(records), `dtr-detail-${date}.csv`);
    } else {
      downloadGroupedHeaderExcel(
        LEFT_COLS,
        GROUPED_COLS,
        records,
        fmtCell,
        `dtr-detail-${date}.xlsx`,
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
    <div className="flex flex-col gap-4">
      {contextHolder}
      <div className="flex justify-end">
        <Space>
          <Dropdown
            menu={{ items: exportMenuItems }}
            trigger={["click"]}
            disabled={!records.length}
          >
            <Button icon={<DownloadOutlined />} disabled={!records.length}>
              Export
            </Button>
          </Dropdown>
          <PermissionGate permission="DTR Master:Manage">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              disabled={!records.length}
              loading={isSaving}
              onClick={handleSaveDraftClick}
            >
              Save Draft
            </Button>
          </PermissionGate>
          <Badge count={activeFilterCount} size="small">
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFiltersOpen((v) => !v)}
              type={filtersOpen ? "default" : "text"}
            >
              Filters
            </Button>
          </Badge>
        </Space>
      </div>

      {filtersOpen && (
        <Card size="small">
          <Form layout="vertical">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4">
              <Form.Item
                label="Date Range"
                className="mb-3 sm:col-span-2"
                required
                validateStatus={
                  !pending.fromDate || !pending.toDate ? "error" : ""
                }
                help={
                  !pending.fromDate || !pending.toDate ? "Required" : undefined
                }
              >
                <MobileRangePicker
                  style={{ width: "100%" }}
                  status={
                    !pending.fromDate || !pending.toDate ? "error" : undefined
                  }
                  value={
                    pending.fromDate && pending.toDate
                      ? [dayjs(pending.fromDate), dayjs(pending.toDate)]
                      : null
                  }
                  onChange={(dates) =>
                    setPending((f) => ({
                      ...f,
                      fromDate: dates?.[0]?.format("YYYY-MM-DD"),
                      toDate: dates?.[1]?.format("YYYY-MM-DD"),
                    }))
                  }
                />
              </Form.Item>
              <Form.Item
                label="Payroll Group"
                className="mb-3"
                required
                validateStatus={!effectivePayrollGroupId ? "error" : ""}
                help={!effectivePayrollGroupId ? "Required" : undefined}
              >
                <Select
                  showSearch
                  status={!effectivePayrollGroupId ? "error" : undefined}
                  filterOption={filterByLabel}
                  placeholder="Select payroll group"
                  options={payrollGrpOptions}
                  optionRender={(opt) =>
                    opt.data.fullLabel
                      ? `${opt.data.label} - ${opt.data.fullLabel}`
                      : String(opt.data.label ?? "")
                  }
                  value={effectivePayrollGroupId}
                  onChange={(v) =>
                    setPending((f) => ({ ...f, payrollGroupId: v }))
                  }
                />
              </Form.Item>
              <Form.Item label="Branch" className="mb-3">
                <Select
                  allowClear
                  showSearch
                  filterOption={filterByLabel}
                  placeholder="All branches"
                  options={branchOptions}
                  optionRender={(opt) =>
                    opt.data.fullLabel
                      ? `${opt.data.label} - ${opt.data.fullLabel}`
                      : String(opt.data.label ?? "")
                  }
                  value={pending.branchId}
                  onChange={(v) =>
                    // Project Site is restricted to the selected Branch.
                    setPending((f) => ({
                      ...f,
                      branchId: v,
                      operationAreaId: undefined,
                    }))
                  }
                />
              </Form.Item>
              <Form.Item label="Department" className="mb-3">
                <Select
                  allowClear
                  showSearch
                  filterOption={filterByLabel}
                  placeholder="All departments"
                  options={deptOptions}
                  optionRender={(opt) =>
                    opt.data.fullLabel
                      ? `${opt.data.label} - ${opt.data.fullLabel}`
                      : String(opt.data.label ?? "")
                  }
                  value={pending.departmentId}
                  onChange={(v) =>
                    setPending((f) => ({ ...f, departmentId: v }))
                  }
                />
              </Form.Item>
              <Form.Item label="Client" className="mb-3">
                <Select
                  allowClear
                  showSearch
                  filterOption={filterByLabel}
                  placeholder="All clients"
                  options={clientOptions}
                  optionRender={(opt) =>
                    opt.data.fullLabel
                      ? `${opt.data.label} - ${opt.data.fullLabel}`
                      : String(opt.data.label ?? "")
                  }
                  value={pending.clientId}
                  onChange={(v) => setPending((f) => ({ ...f, clientId: v }))}
                />
              </Form.Item>
              <Form.Item label="Project Site" className="mb-3">
                <Select
                  allowClear
                  showSearch
                  filterOption={filterByLabel}
                  placeholder="All project sites"
                  options={areaOptions}
                  optionRender={(opt) =>
                    opt.data.fullLabel
                      ? `${opt.data.label} - ${opt.data.fullLabel}`
                      : String(opt.data.label ?? "")
                  }
                  value={pending.operationAreaId}
                  onChange={(v) =>
                    setPending((f) => ({ ...f, operationAreaId: v }))
                  }
                />
              </Form.Item>
              <Form.Item label="Employee" className="mb-3">
                <Select
                  allowClear
                  showSearch
                  filterOption={filterByLabel}
                  placeholder="All employees"
                  options={employeeOptions}
                  value={pending.employeeId}
                  onChange={(v) => setPending((f) => ({ ...f, employeeId: v }))}
                />
              </Form.Item>
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <Button icon={<ClearOutlined />} onClick={handleClear}>
                Clear
              </Button>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={isLoading}
                disabled={
                  !pending.fromDate ||
                  !pending.toDate ||
                  !effectivePayrollGroupId
                }
                onClick={handleGenerate}
              >
                Generate
              </Button>
            </div>
          </Form>
        </Card>
      )}

      <DtrDetailTable
        data={records}
        loading={isLoading}
        onChanged={() => refetch()}
        dateFrom={committedFilter?.fromDate}
        dateTo={committedFilter?.toDate}
      />

      <DtrPostModal
        open={postModalOpen}
        recordCount={records.length}
        isSaving={isSaving}
        onClose={() => setPostModalOpen(false)}
        onConfirm={handleConfirmSaveDraft}
      />
    </div>
  );
}
