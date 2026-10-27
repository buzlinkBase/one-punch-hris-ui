import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Form,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  ClearOutlined,
  DownloadOutlined,
  FilterOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useDtrCoverage,
  useDtrSummary,
  useFetchDtrDetailRows,
  useQueueDtrDraftSave,
} from "../../hooks/use-dtr-detail-queries";
import DtrPostModal from "../../components/dtr-post-modal";
import DtrCoverageOverview from "../../components/dtr-coverage-overview";
import DtrReviewTable from "../../components/dtr-review-table";
import {
  COVERAGE_STATUS_COLOR,
  COVERAGE_STATUS_LABEL,
  COVERAGE_STATUS_ORDER,
  buildCoverageRows,
  buildEmployeeSummaries,
  countByCoverage,
  isSavable,
  unsavedEmployeeIds,
} from "../../utils/dtr-coverage.util";
import type { DtrDetailFilter } from "../../models/api/request/dtr-detail-filter.model";
import type { DtrDetailResponse } from "../../models/api/response/dtr-detail-response.model";
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
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
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

// While a background Save Draft runs, how often the saved days are re-read, and how long the
// screen waits before it stops showing "Saving" (the bell carries the outcome either way).
const SAVE_POLL_MS = 4_000;
const SAVE_WAIT_MS = 10 * 60_000;

const { Text } = Typography;

const fmtRange = (from?: string, to?: string) =>
  from && to
    ? `${dayjs(from).format("MMM D")} – ${dayjs(to).format("MMM D, YYYY")}`
    : "";

export default function DtrGenerateTab() {
  // Branch / department / client / project site / employee narrowing stays tucked away until
  // asked for -- the cutoff and payroll group are all most runs need.
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [pending, setPending] = useState<DtrDetailFilter>(
    currentSemiMonthlyRange,
  );
  const [committedFilter, setCommittedFilter] =
    useState<DtrDetailFilter | null>(null);
  const [generateKey, setGenerateKey] = useState(0);
  // Who Save Draft covers. null = untouched since the last Generate, which means "everyone with
  // days still to save" (and follows the list when coverage refetches).
  const [pickedIds, setPickedIds] = useState<string[] | null>(null);
  // Employees whose Save Draft was queued and may not be written yet. They can't be ticked again,
  // so the same days are never queued twice while the server is still on them.
  const [saving, setSaving] = useState<{ ids: string[] } | null>(null);
  // The save that just finished writing, so the "saved" message is said once.
  const [finishedSaving, setFinishedSaving] = useState<{
    ids: string[];
  } | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const hasGenerated = committedFilter !== null;

  const { data: departments = [] } = useDepartments();
  const { data: clients = [] } = useClients();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: areas = [] } = useOperationAreas();
  const { data: branches = [] } = useBranches();
  const { data: employeeData = [] } = useEmployeeFilter();
  const { data: allEmployees = [] } = useEmployees();

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
  const groupLabel = (id?: string) =>
    payrollGrpOptions.find((o) => o.value === id)?.label ?? "";

  // ── Coverage: who already has DTR for the cutoff ─────────────────────────────────────────
  const {
    data: coverage = [],
    isFetching: coverageLoading,
    refetch: refetchCoverage,
  } = useDtrCoverage(pending.fromDate, pending.toDate);
  // Department / client / employee narrowing applies to the coverage view too (the server's
  // rows carry the employee's own tags); branch and project site only narrow generation.
  const matchesNarrowing = (e: {
    id?: string;
    employeeId?: string;
    clientId?: string | null;
    departmentId?: string | null;
  }) =>
    (!pending.departmentId || e.departmentId === pending.departmentId) &&
    (!pending.clientId || e.clientId === pending.clientId) &&
    (!pending.employeeId || (e.employeeId ?? e.id) === pending.employeeId);
  const coverageRows = useMemo(
    () =>
      pending.fromDate && pending.toDate
        ? buildCoverageRows(
            coverage.filter(matchesNarrowing),
            allEmployees.filter(matchesNarrowing),
            pending.fromDate,
            pending.toDate,
          )
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      coverage,
      allEmployees,
      pending.fromDate,
      pending.toDate,
      pending.departmentId,
      pending.clientId,
      pending.employeeId,
    ],
  );
  const groupCoverageCounts = useMemo(
    () =>
      countByCoverage(
        coverageRows.filter((r) => r.payrollGroupId === pending.payrollGroupId),
      ),
    [coverageRows, pending.payrollGroupId],
  );

  // ── Generated DTR, summarised per employee ────────────────────────────────────────────────
  // One small summary per employee; each employee's day rows load only when that row is expanded.
  const {
    data: serverSummaries = [],
    isLoading,
    refetch,
  } = useDtrSummary(committedFilter ?? EMPTY_FILTER, {
    enabled: hasGenerated,
    generateKey,
  });
  // Coverage for the range that was actually generated (usually the same query as above), so
  // already-saved days are known even if the date picker has moved on since.
  // Re-read while a queued save is still being written, so the table catches up by itself.
  const { data: committedCoverage = [] } = useDtrCoverage(
    committedFilter?.fromDate,
    committedFilter?.toDate,
    (data) =>
      saving &&
      unsavedEmployeeIds(serverSummaries, data ?? [], saving.ids).length > 0
        ? SAVE_POLL_MS
        : false,
  );
  const { summaries: generatedSummaries, coverageById } = useMemo(() => {
    const savedDates = new Map(
      committedCoverage.map((c) => [c.employeeId, c.savedDates ?? []]),
    );
    const statusRows =
      committedFilter?.fromDate && committedFilter?.toDate
        ? buildCoverageRows(
            committedCoverage,
            [],
            committedFilter.fromDate,
            committedFilter.toDate,
          )
        : [];
    return {
      summaries: buildEmployeeSummaries(serverSummaries, savedDates),
      coverageById: new Map(statusRows.map((r) => [r.employeeId, r.status])),
    };
  }, [serverSummaries, committedCoverage, committedFilter]);

  // The moment the server has written every queued day, the save is over: forget it. Without this
  // the employees stayed marked as saving, and after their saved DTR was deleted they came back as
  // "Saving" instead of "To save". Adjusting state while rendering (guarded) is the supported way
  // to react to data that just arrived.
  if (
    saving &&
    serverSummaries.length > 0 &&
    unsavedEmployeeIds(serverSummaries, committedCoverage, saving.ids)
      .length === 0
  ) {
    setFinishedSaving(saving);
    setSaving(null);
  }

  // Queued employees whose days aren't all saved yet show as "Saving" instead of "To save".
  const summaries = useMemo(() => {
    if (!saving) return generatedSummaries;
    const queued = new Set(saving.ids);
    return generatedSummaries.map((s) =>
      queued.has(s.employeeId) && isSavable(s)
        ? { ...s, saveState: "Saving" as const }
        : s,
    );
  }, [generatedSummaries, saving]);

  // Stop waiting after a while -- a failed save leaves nothing to catch up to; the bell says why.
  useEffect(() => {
    if (!saving) return;
    const timer = setTimeout(() => setSaving(null), SAVE_WAIT_MS);
    return () => clearTimeout(timer);
  }, [saving]);

  // Said once per finished save.
  useEffect(() => {
    if (finishedSaving) {
      messageApi.success("DTR draft saved. It's now awaiting approval.");
    }
  }, [finishedSaving, messageApi]);

  const selectedIds = useMemo(() => {
    const savable = new Set(
      summaries.filter(isSavable).map((s) => s.employeeId),
    );
    return pickedIds ? pickedIds.filter((id) => savable.has(id)) : [...savable];
  }, [summaries, pickedIds]);
  const selectedSummaries = useMemo(() => {
    const ids = new Set(selectedIds);
    return summaries.filter((s) => ids.has(s.employeeId));
  }, [summaries, selectedIds]);
  // Days Save Draft will write: the ticked employees' days with no saved DTR yet.
  const daysToSave = selectedSummaries.reduce((n, s) => n + s.newDays, 0);
  const skippedDays = selectedSummaries.reduce((n, s) => n + s.savedDays, 0);

  const { mutateAsync: queueSave, isPending: isSaving } =
    useQueueDtrDraftSave();
  const { mutateAsync: fetchRows, isPending: isExporting } =
    useFetchDtrDetailRows();
  const [postModalOpen, setPostModalOpen] = useState(false);

  // "Save Draft" hands the server what this was generated from plus the ticked employees; the
  // server recomputes and saves their days that have no saved DTR yet, in the background, and
  // starts the DTR posting approval flow -- the batch only posts (DailyRecord.Posted flips true)
  // once it's approved from the Saved DTR tab. The bell tells the requester when it's done. See
  // DtrDraftSaveService.
  const handleConfirmSaveDraft = async (postingDescription: string) => {
    if (!committedFilter?.fromDate || !committedFilter.toDate) return;
    if (!committedFilter.payrollGroupId) return;
    await queueSave({
      fromDate: committedFilter.fromDate,
      toDate: committedFilter.toDate,
      payrollGroupId: committedFilter.payrollGroupId,
      branchId: committedFilter.branchId,
      departmentId: committedFilter.departmentId,
      clientId: committedFilter.clientId,
      operationAreaId: committedFilter.operationAreaId,
      employeeIds: selectedIds,
      postingDescription: postingDescription || undefined,
    });
    setPostModalOpen(false);
    setPickedIds(null);
    setSaving((current) => ({
      ids: [...new Set([...(current?.ids ?? []), ...selectedIds])],
    }));
    messageApi.info(
      `Saving DTR for ${selectedSummaries.length} employee${selectedSummaries.length !== 1 ? "s" : ""} in the background. This page updates when it's done, and you'll get a notification.`,
    );
  };

  const moreFilterCount = [
    pending.branchId,
    pending.departmentId,
    pending.clientId,
    pending.operationAreaId,
    pending.employeeId,
  ].filter(Boolean).length;

  const canGenerate =
    !!pending.fromDate && !!pending.toDate && !!pending.payrollGroupId;

  const handleGenerate = () => {
    if (!canGenerate) return;
    setCommittedFilter({ ...pending });
    setGenerateKey((k) => k + 1);
    setPickedIds(null);
  };

  const handleClear = () => {
    setPending(currentSemiMonthlyRange());
    setCommittedFilter(null);
    setPickedIds(null);
  };

  // ── Export ────────────────────────────────────────────────────────────────────

  // The review screen only holds per-employee summaries, so the day rows are fetched now.
  const handleExport = async (format: "csv" | "excel") => {
    if (!committedFilter || !summaries.length) {
      messageApi.info("No data to export. Click Generate first.");
      return;
    }
    let records: DtrDetailResponse[];
    try {
      records = await fetchRows(committedFilter);
    } catch {
      messageApi.error("Couldn't load the DTR for export. Please try again.");
      return;
    }
    const date = dayjs().format("YYYYMMDD");
    if (format === "csv") {
      triggerDownload(buildDtrCsv(records), `dtr-detail-${date}.csv`);
    } else {
      void downloadGroupedHeaderExcel(
        LEFT_COLS,
        GROUPED_COLS,
        records,
        fmtCell,
        `dtr-detail-${date}.xlsx`,
      );
    }
  };

  const exportMenuItems: MenuProps["items"] = [
    {
      key: "csv",
      label: "Export as CSV",
      onClick: () => void handleExport("csv"),
    },
    {
      key: "excel",
      label: "Export as Excel",
      onClick: () => void handleExport("excel"),
    },
  ];

  const selectOptionRender = (opt: {
    data: { label?: string; fullLabel?: string };
  }) =>
    opt.data.fullLabel
      ? `${opt.data.label} - ${opt.data.fullLabel}`
      : String(opt.data.label ?? "");

  return (
    <div className="flex flex-col gap-4">
      {contextHolder}

      <Card size="small" title="1. Choose the cutoff and payroll group">
        <Form layout="vertical">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4">
            <Form.Item
              label="Cutoff"
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
              help={
                !pending.payrollGroupId
                  ? "Pick one here or click a group below"
                  : undefined
              }
            >
              <Select
                showSearch
                filterOption={filterByLabel}
                placeholder="Select payroll group"
                options={payrollGrpOptions}
                optionRender={selectOptionRender}
                value={pending.payrollGroupId}
                onChange={(v) =>
                  setPending((f) => ({ ...f, payrollGroupId: v }))
                }
              />
            </Form.Item>
            <Form.Item label=" " className="mb-3">
              <Badge count={moreFilterCount} size="small">
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setMoreFiltersOpen((v) => !v)}
                  type={moreFiltersOpen ? "default" : "dashed"}
                >
                  {moreFiltersOpen ? "Fewer filters" : "More filters"}
                </Button>
              </Badge>
            </Form.Item>
          </div>

          {moreFiltersOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4">
              <Form.Item label="Branch" className="mb-3">
                <Select
                  allowClear
                  showSearch
                  filterOption={filterByLabel}
                  placeholder="All branches"
                  options={branchOptions}
                  optionRender={selectOptionRender}
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
                  optionRender={selectOptionRender}
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
                  optionRender={selectOptionRender}
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
                  optionRender={selectOptionRender}
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
          )}
        </Form>
      </Card>

      {pending.fromDate && pending.toDate && (
        <Card
          size="small"
          title={`DTR coverage — ${fmtRange(pending.fromDate, pending.toDate)}`}
          extra={
            <Tooltip title="Refresh — picks up DTR saved or approved since this page opened">
              <Button
                aria-label="Refresh — picks up DTR saved or approved since this page opened"
                size="small"
                type="text"
                icon={<ReloadOutlined />}
                loading={coverageLoading}
                onClick={() => refetchCoverage()}
              />
            </Tooltip>
          }
        >
          <div className="flex flex-col gap-3">
            <DtrCoverageOverview
              groups={payrollGrpOptions}
              rows={coverageRows}
              loading={coverageLoading && !coverage.length}
              selectedGroupId={pending.payrollGroupId ?? null}
              onSelect={(id) =>
                setPending((f) => ({ ...f, payrollGroupId: id }))
              }
            />
            {pending.payrollGroupId && (
              <div className="flex flex-wrap items-center gap-2">
                <Text strong>{groupLabel(pending.payrollGroupId)}:</Text>
                {COVERAGE_STATUS_ORDER.map((s) => (
                  <Tag
                    key={s}
                    color={COVERAGE_STATUS_COLOR[s]}
                    className="m-0!"
                  >
                    {groupCoverageCounts[s]} {COVERAGE_STATUS_LABEL[s]}
                  </Tag>
                ))}
                {groupCoverageCounts.NotGenerated +
                  groupCoverageCounts.Partial ===
                  0 && (
                  <Text type="secondary" className="text-xs">
                    Everyone in this group already has DTR saved for the cutoff.
                  </Text>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Generate sits under the coverage, so the group is checked before generating. */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Text type="secondary" className="text-xs">
          Generating calculates DTR from attendance logs. Nothing is saved until
          you review it and click Save Draft.
        </Text>
        <Space>
          <Button icon={<ClearOutlined />} onClick={handleClear}>
            Clear
          </Button>
          <Tooltip
            title={canGenerate ? "" : "Select a cutoff and a payroll group"}
          >
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              loading={isLoading}
              disabled={!canGenerate}
              onClick={handleGenerate}
            >
              Generate
            </Button>
          </Tooltip>
        </Space>
      </div>

      {hasGenerated && (
        <Card
          size="small"
          title={`2. Review and save — ${groupLabel(committedFilter?.payrollGroupId)}, ${fmtRange(committedFilter?.fromDate, committedFilter?.toDate)}`}
          extra={
            <Space>
              <Dropdown
                menu={{ items: exportMenuItems }}
                trigger={["click"]}
                disabled={!summaries.length}
              >
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  disabled={!summaries.length}
                  loading={isExporting}
                >
                  Export
                </Button>
              </Dropdown>
              <PermissionGate permission="DTR Master:Manage">
                <Tooltip
                  title={
                    daysToSave
                      ? ""
                      : "Tick at least one employee with days to save"
                  }
                >
                  <Button
                    size="small"
                    type="primary"
                    icon={<SaveOutlined />}
                    disabled={!daysToSave}
                    loading={isSaving}
                    onClick={() => setPostModalOpen(true)}
                  >
                    Save Draft
                    {daysToSave
                      ? ` (${selectedSummaries.length} employee${selectedSummaries.length !== 1 ? "s" : ""})`
                      : ""}
                  </Button>
                </Tooltip>
              </PermissionGate>
            </Space>
          }
        >
          <DtrReviewTable
            summaries={summaries}
            coverageById={coverageById}
            loading={isLoading}
            selectedIds={selectedIds}
            onSelectionChange={setPickedIds}
            onChanged={() => refetch()}
            filter={committedFilter ?? EMPTY_FILTER}
          />
        </Card>
      )}

      <DtrPostModal
        open={postModalOpen}
        recordCount={daysToSave}
        employeeCount={selectedSummaries.length}
        skippedCount={skippedDays}
        isSaving={isSaving}
        onClose={() => setPostModalOpen(false)}
        onConfirm={handleConfirmSaveDraft}
      />
    </div>
  );
}
