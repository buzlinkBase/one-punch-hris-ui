import { useEffect, useMemo, useState } from "react";
import { apiErrorMessage } from "@/core/http/api-error";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Descriptions,
  Form,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { LeftOutlined, RightOutlined, SearchOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import {
  useWorkRotation,
  useCreateWorkRotation,
  useUpdateWorkRotation,
} from "../../hooks/use-work-rotation-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { authStorage } from "@/core/auth/auth-storage";
import { useMyEmployee } from "@/app/modules/portal/shared/hooks/use-my-employee-queries";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import {
  filterPayrollGroupOption,
  payrollGroupOptionRender,
  toPayrollGroupOptions,
} from "@/shared/utils/payroll-group-options.util";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import {
  workRotationFormSchema,
  type WorkRotationFormValues,
} from "../../models/forms/work-rotation-form.schema";
import { workRotationMapper } from "../../services/work-rotation.mapper";
import {
  clientAfterSiteChange,
  clientSiteMismatch,
  siteAfterClientChange,
  siteOptionGroups,
} from "../../utils/site-client-options.util";
import { WORK_ROTATION_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import {
  FilterPanel,
  FilterToggleButton,
} from "@/shared/components/filter-panel/filter-panel";
import { compactChips, labelOf } from "@/shared/utils/filter-chips.util";
import { getNotify } from "@/shared/utils/notify";
import type { EmployeeFilterResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/employee-filter-response.model";
import { useUnsavedChangesGuard } from "@/shared/hooks/use-unsaved-changes-guard";

const { Title, Text } = Typography;

const DOW_LABELS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

// ── Multi-date calendar picker ────────────────────────────────────────────────

interface MultiDatePickerProps {
  value: string[];
  onChange: (dates: string[]) => void;
}

function MultiDatePicker({ value, onChange }: MultiDatePickerProps) {
  const [current, setCurrent] = useState<Dayjs>(() =>
    value.length ? dayjs(value[0]).startOf("month") : dayjs().startOf("month"),
  );

  const selected = useMemo(() => new Set(value), [value]);
  const today = dayjs().format("YYYY-MM-DD");

  // 42 cells (6 weeks) starting from the Sunday of the first week of the month
  const cells = useMemo<Dayjs[]>(() => {
    const start = current.startOf("month").startOf("week");
    return Array.from({ length: 42 }, (_, i) => start.add(i, "day"));
  }, [current]);

  const toggle = (d: Dayjs) => {
    const key = d.format("YYYY-MM-DD");
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange([...next].sort());
  };

  const clearAll = () => onChange([]);

  const selectAllInMonth = () => {
    const next = new Set(selected);
    const daysInMonth = current.daysInMonth();
    for (let i = 1; i <= daysInMonth; i++) {
      next.add(current.date(i).format("YYYY-MM-DD"));
    }
    onChange([...next].sort());
  };

  return (
    <div style={{ display: "inline-block", userSelect: "none" }}>
      {/* Month navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
          minWidth: 224,
        }}
      >
        <Space size={0}>
          <Button
            aria-label="Previous"
            type="text"
            size="small"
            icon={<LeftOutlined />}
            style={{ fontSize: 10 }}
            onClick={() => setCurrent((c) => c.subtract(1, "year"))}
          />
          <Button
            aria-label="Previous"
            type="text"
            size="small"
            icon={<LeftOutlined />}
            onClick={() => setCurrent((c) => c.subtract(1, "month"))}
          />
        </Space>
        <Text style={{ fontWeight: 600, fontSize: 13, textAlign: "center" }}>
          {current.format("MMMM YYYY")}
        </Text>
        <Space size={0}>
          <Button
            aria-label="Next"
            type="text"
            size="small"
            icon={<RightOutlined />}
            onClick={() => setCurrent((c) => c.add(1, "month"))}
          />
          <Button
            aria-label="Next"
            type="text"
            size="small"
            icon={<RightOutlined />}
            style={{ fontSize: 10 }}
            onClick={() => setCurrent((c) => c.add(1, "year"))}
          />
        </Space>
      </div>

      {/* Day-of-week headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 32px)",
          marginBottom: 2,
        }}
      >
        {DOW_LABELS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "#888",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 32px)",
          gap: "2px 0",
        }}
      >
        {cells.map((d) => {
          const key = d.format("YYYY-MM-DD");
          const isCurrentMonth = d.month() === current.month();
          const isSelected = selected.has(key);
          const isToday = key === today;

          return (
            <button
              type="button"
              key={key}
              onClick={() => toggle(d)}
              aria-pressed={isSelected}
              aria-label={d.format("MMMM D, YYYY")}
              className={[
                "flex h-7 cursor-pointer items-center justify-center rounded border-0 text-[13px] transition-colors duration-100",
                isSelected
                  ? "bg-[#1DA081] text-white"
                  : !isCurrentMonth
                    ? "bg-transparent text-[#bbb]"
                    : isToday
                      ? "bg-transparent text-[#1DA081]"
                      : "bg-transparent text-inherit",
                isSelected || isToday ? "font-semibold" : "font-normal",
              ].join(" ")}
            >
              {d.date()}
            </button>
          );
        })}
      </div>

      {/* Footer actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 8,
          minWidth: 224,
        }}
      >
        <Text style={{ fontSize: 12, color: "#666" }}>
          {selected.size > 0
            ? `${selected.size} date${selected.size !== 1 ? "s" : ""} selected`
            : "Click dates to select"}
        </Text>
        <Space size={4}>
          <Button
            type="link"
            size="small"
            style={{ fontSize: 12, padding: 0 }}
            onClick={selectAllInMonth}
          >
            All in month
          </Button>
          {selected.size > 0 && (
            <Button
              type="link"
              size="small"
              danger
              style={{ fontSize: 12, padding: 0 }}
              onClick={clearAll}
            >
              Clear
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
}

// ── Time shift options shared hook ────────────────────────────────────────────

function useTimeShiftOptions() {
  const { data: shifts = [], isLoading } = useFixedTimeShifts();

  const options = shifts.map((s) => ({
    value: s.id,
    label:
      s.startTime && s.endTime
        ? `${s.shiftName} (${s.startTime} – ${s.endTime})`
        : s.shiftName,
  }));

  return { options, isLoading };
}

// ── Route entry point ────────────────────────────────────────────────────────

export default function WorkRotationDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  if (id) return <EditForm id={id} />;
  return <CreateForm />;
}

// ── Create — Step 1: find employees, Step 2: time shift + payroll dates ───────

function CreateForm() {
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();

  // Step 1 — employee filter
  const [branchId, setBranchId] = useState<string | null>(null);
  const [deptId, setDeptId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [payrollGroupId, setPayrollGroupId] = useState<string | null>(null);
  const [operationAreaId, setOperationAreaId] = useState<string | null>(null);
  // Optional: narrow the search to specific employees. The server's employee filter has no
  // employee id, so this is applied to its result -- the other filters still decide who is
  // searched, and an empty pick means everyone they return.
  const [pickedEmployeeIds, setPickedEmployeeIds] = useState<string[]>([]);
  const [committedEmployeeIds, setCommittedEmployeeIds] = useState<string[]>(
    [],
  );
  const [committedFilter, setCommittedFilter] = useState<Record<
    string,
    string | null | undefined
  > | null>(null);
  const [searchKey, setSearchKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Step 2 — time shift + specific payroll dates
  const [timeShiftId, setTimeShiftId] = useState<string | null>(null);
  const [payrollDates, setPayrollDates] = useState<string[]>([]);
  const [scheduledAreaId, setScheduledAreaId] = useState<string | null>(null);
  const [scheduledClientId, setScheduledClientId] = useState<string | null>(
    null,
  );

  // Work Rotation:Create is unscoped (matches today's behavior for everyone who already has it,
  // or has neither permission — see WorkSchedulePlansController.ValidateTeamScopeAsync on the
  // backend, which this mirrors). Only a caller holding ManageOwnTeam WITHOUT Create — e.g. a
  // Supervisor Custom Role — is locked to their own direct reports, with no filter panel to
  // configure since there's nothing to choose: it's always "my team."
  const canManageAllEmployees = authStorage.hasPermission(
    "Work Rotation:Create",
  );
  const isTeamScoped =
    !canManageAllEmployees &&
    authStorage.hasPermission("Work Rotation:ManageOwnTeam");
  const { data: myEmployee } = useMyEmployee();

  const { data: employees = [], isLoading: isEmployeesLoading } =
    useEmployeeFilter(
      isTeamScoped
        ? { managerId: myEmployee?.id }
        : {
            branchId: committedFilter?.branchId ?? undefined,
            departmentId: committedFilter?.deptId ?? undefined,
            clientId: committedFilter?.clientId ?? undefined,
            payrollGroupId: committedFilter?.payrollGroupId ?? undefined,
            operationAreaId: committedFilter?.operationAreaId ?? undefined,
          },
      {
        enabled: isTeamScoped ? !!myEmployee?.id : committedFilter !== null,
        searchKey,
      },
    );

  // Every employee, to pick from in the Employee filter (the list is only fetched for the picker;
  // the search above still decides who appears in the table).
  const { data: allEmployees = [], isLoading: isAllEmployeesLoading } =
    useEmployeeFilter({}, { enabled: !isTeamScoped });
  const { data: departments = [] } = useDepartments();
  const { data: clients = [] } = useClients();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: areas = [] } = useOperationAreas();
  const { data: branches = [] } = useBranches();
  const { options: timeShiftOptions, isLoading: isTimeShiftLoading } =
    useTimeShiftOptions();
  const { mutateAsync: createRotation, isPending: isSubmitting } =
    useCreateWorkRotation();

  const { widths, handleResize } = useResizableColumns({
    name: 150,
    departmentName: 160,
    branchName: 140,
    clientName: 140,
    payrollGroupName: 140,
    areaName: 140,
  });

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: `${b.code} - ${b.name}`,
  }));
  const deptOptions = departments.map((d) => ({
    value: d.id,
    label: `${d.code} - ${d.name}`,
  }));
  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));
  const payrollGroupOptions = toPayrollGroupOptions(payrollGroups);
  const employeeOptions = allEmployees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));
  const areaOptions = areas
    .filter((a) => !branchId || a.branchId === branchId)
    .map((a) => ({
      value: a.id,
      label: `${a.code} - ${a.name}`,
    }));
  // Where the selected employees report on the chosen dates — any site, not just the
  // Step 1 branch filter.
  const selectedScheduledArea = scheduledAreaId
    ? areas.find((a) => a.id === scheduledAreaId)
    : undefined;
  // Client first, then the sites under it: the site list narrows to the chosen client's sites plus
  // the ones not tied to any client, and a site that belongs to a client fills the client in.
  const scheduledClientOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));
  const selectedScheduledClient = scheduledClientId
    ? scheduledClientOptions.find((c) => c.value === scheduledClientId)
    : null;
  // Only an entry saved before the pickers narrowed each other can still disagree.
  const scheduledClientMismatch = clientSiteMismatch(
    areas,
    scheduledClientId,
    scheduledAreaId,
  );
  const clientNameOf = (id: string) =>
    clients.find((c) => c.id === id)?.name ?? "this client";
  const scheduledSiteGroups = siteOptionGroups(
    areas,
    scheduledClientId,
    clientNameOf,
    scheduledAreaId,
  );
  const changeScheduledClient = (clientId: string | null) => {
    setScheduledClientId(clientId);
    setScheduledAreaId(siteAfterClientChange(areas, clientId, scheduledAreaId));
  };
  const changeScheduledSite = (siteId: string | null) => {
    setScheduledAreaId(siteId);
    setScheduledClientId(
      clientAfterSiteChange(areas, siteId, scheduledClientId),
    );
  };

  const filterChips = compactChips([
    labelOf(branchOptions, branchId ?? undefined),
    labelOf(deptOptions, deptId ?? undefined),
    labelOf(clientOptions, clientId ?? undefined),
    labelOf(payrollGroupOptions, payrollGroupId ?? undefined),
    labelOf(areaOptions, operationAreaId ?? undefined),
    pickedEmployeeIds.length
      ? `${pickedEmployeeIds.length} employee${pickedEmployeeIds.length !== 1 ? "s" : ""}`
      : undefined,
  ]);
  const activeFilterCount = [
    branchId,
    deptId,
    clientId,
    payrollGroupId,
    operationAreaId,
    pickedEmployeeIds.length ? "picked" : null,
  ].filter(Boolean).length;

  const hasSearched = isTeamScoped
    ? !!myEmployee?.id
    : committedFilter !== null;
  // Guard against a stale/shared React Query cache: other pages fetch the
  // full employee list under an equivalent key, so `employees` can be
  // populated even while this query is disabled. Only show rows once the
  // user has actually clicked Search.
  const visibleEmployees = hasSearched
    ? committedEmployeeIds.length
      ? employees.filter((e) => committedEmployeeIds.includes(e.id))
      : employees
    : [];
  const selectedCount = selectedIds.size;
  const allChecked =
    visibleEmployees.length > 0 &&
    visibleEmployees.every((e) => selectedIds.has(e.id));
  const someChecked =
    !allChecked && visibleEmployees.some((e) => selectedIds.has(e.id));

  const selectedTimeShift = timeShiftId
    ? timeShiftOptions.find((t) => t.value === timeShiftId)
    : null;

  const handleSearch = () => {
    setSelectedIds(new Set());
    setCommittedFilter({
      branchId,
      deptId,
      clientId,
      payrollGroupId,
      operationAreaId,
    });
    setCommittedEmployeeIds(pickedEmployeeIds);
    setSearchKey((k) => k + 1);
    // The results are the point once searched; the chips keep the filters visible.
    setFiltersOpen(false);
  };

  const handleReset = () => {
    setBranchId(null);
    setDeptId(null);
    setClientId(null);
    setPayrollGroupId(null);
    setOperationAreaId(null);
    setPickedEmployeeIds([]);
    setCommittedFilter(null);
    setCommittedEmployeeIds([]);
    setSelectedIds(new Set());
    setFiltersOpen(true);
  };

  const toggle = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const columns: TableColumnsType<EmployeeFilterResponse> = [
    {
      width: 40,
      title: (
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked}
          onChange={(e) =>
            e.target.checked
              ? setSelectedIds(new Set(visibleEmployees.map((e) => e.id)))
              : setSelectedIds(new Set())
          }
        />
      ),
      render: (_: unknown, emp: EmployeeFilterResponse) => (
        <Checkbox
          checked={selectedIds.has(emp.id)}
          onChange={(e) => toggle(emp.id, e.target.checked)}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: widths.name,
      onHeaderCell: () =>
        ({
          width: widths.name,
          onResize: (w: number) => handleResize("name", w),
        }) as object,
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
      width: widths.departmentName,
      onHeaderCell: () =>
        ({
          width: widths.departmentName,
          onResize: (w: number) => handleResize("departmentName", w),
        }) as object,
    },
    {
      title: "Branch",
      dataIndex: "branchName",
      key: "branchName",
      width: widths.branchName,
      onHeaderCell: () =>
        ({
          width: widths.branchName,
          onResize: (w: number) => handleResize("branchName", w),
        }) as object,
    },
    {
      title: "Client",
      dataIndex: "clientName",
      key: "clientName",
      width: widths.clientName,
      onHeaderCell: () =>
        ({
          width: widths.clientName,
          onResize: (w: number) => handleResize("clientName", w),
        }) as object,
    },
    {
      title: "Payroll Group",
      dataIndex: "payrollGroupName",
      key: "payrollGroupName",
      width: widths.payrollGroupName,
      onHeaderCell: () =>
        ({
          width: widths.payrollGroupName,
          onResize: (w: number) => handleResize("payrollGroupName", w),
        }) as object,
    },
    {
      title: "Project Site",
      dataIndex: "areaName",
      key: "areaName",
      width: widths.areaName,
      onHeaderCell: () =>
        ({
          width: widths.areaName,
          onResize: (w: number) => handleResize("areaName", w),
        }) as object,
    },
  ];

  const handleSubmit = async () => {
    if (!selectedIds.size) {
      messageApi.warning("Select at least one employee.");
      return;
    }
    if (!timeShiftId) {
      messageApi.warning("Select a time shift.");
      return;
    }
    if (!payrollDates.length) {
      messageApi.warning("Select at least one payroll date.");
      return;
    }

    try {
      await createRotation({
        employeeIds: [...selectedIds],
        timeShiftId,
        payrollDates,
        operationAreaId: scheduledAreaId,
        clientId: scheduledClientId,
      });
      getNotify().success({
        message: "Work Rotation Saved",
        description: `Applied to ${selectedIds.size} employee${selectedIds.size !== 1 ? "s" : ""} on ${payrollDates.length} date${payrollDates.length !== 1 ? "s" : ""}.`,
      });
      navigate({ to: "/change-schedule/work-rotation" });
    } catch {
      getNotify().error({
        message: "Save Failed",
        description: "Failed to create records. Please try again.",
      });
    }
  };

  const isSubmitDisabled =
    !selectedIds.size || !timeShiftId || !payrollDates.length || isSubmitting;

  const saveLabel =
    selectedIds.size && timeShiftId && payrollDates.length
      ? `${NAVIGATION_BUTTON_LABEL.SAVE} (${selectedIds.size} employee${selectedIds.size !== 1 ? "s" : ""}, ${payrollDates.length} date${payrollDates.length !== 1 ? "s" : ""})`
      : NAVIGATION_BUTTON_LABEL.SAVE;

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {WORK_ROTATION_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Find employees and assign a work rotation plan for specific
              payroll dates.
            </p>
          </div>
          <Space>
            <Tag color="success">New Record</Tag>
            {!isTeamScoped && (
              <FilterToggleButton
                open={filtersOpen}
                onOpenChange={setFiltersOpen}
                activeCount={activeFilterCount}
              />
            )}
            <Button
              onClick={() => navigate({ to: "/change-schedule/work-rotation" })}
            >
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      {/* Filters — collapse into chips once searched (skipped entirely when team-scoped: there's nothing to
          configure, the picker below is always locked to the caller's own direct reports) */}
      {isTeamScoped ? (
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message="Showing your team"
          description="You can schedule Work Rotation for employees who report directly to you."
        />
      ) : (
        <FilterPanel
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          chips={filterChips}
          onClear={handleReset}
          onApply={handleSearch}
          applyLabel="Search Employees"
          applyIcon={<SearchOutlined />}
          applyLoading={hasSearched && isEmployeesLoading}
          gridClassName="grid grid-cols-1 sm:grid-cols-3 gap-x-4"
        >
          <Form.Item label="Branch" className="mb-3">
            <Select
              placeholder="All branches"
              options={branchOptions}
              value={branchId ?? undefined}
              onChange={(v: string | undefined) => {
                setBranchId(v ?? null);
                // Project Site is restricted to the selected Branch.
                setOperationAreaId(null);
              }}
              showSearch={{ filterOption: filterByLabel }}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Department" className="mb-3">
            <Select
              placeholder="All departments"
              options={deptOptions}
              value={deptId ?? undefined}
              onChange={(v: string | undefined) => setDeptId(v ?? null)}
              showSearch={{ filterOption: filterByLabel }}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Client" className="mb-3">
            <Select
              placeholder="All clients"
              options={clientOptions}
              value={clientId ?? undefined}
              onChange={(v: string | undefined) => setClientId(v ?? null)}
              showSearch={{ filterOption: filterByLabel }}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Payroll Group" className="mb-3">
            <Select
              placeholder="All payroll groups"
              options={payrollGroupOptions}
              optionRender={payrollGroupOptionRender}
              value={payrollGroupId ?? undefined}
              onChange={(v: string | undefined) => setPayrollGroupId(v ?? null)}
              showSearch={{ filterOption: filterPayrollGroupOption }}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Project Site" className="mb-3">
            <Select
              placeholder="All project sites"
              options={areaOptions}
              value={operationAreaId ?? undefined}
              onChange={(v: string | undefined) =>
                setOperationAreaId(v ?? null)
              }
              showSearch={{ filterOption: filterByLabel }}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Employee" className="mb-3">
            <Select
              mode="multiple"
              placeholder="All employees"
              options={employeeOptions}
              value={pickedEmployeeIds}
              onChange={setPickedEmployeeIds}
              loading={isAllEmployeesLoading}
              maxTagCount="responsive"
              showSearch={{ filterOption: filterByLabel }}
              allowClear
            />
          </Form.Item>
        </FilterPanel>
      )}

      {hasSearched && (
        <div className="flex items-center justify-between mb-2">
          <Text type="secondary" style={{ fontSize: 13 }}>
            {visibleEmployees.length} employee
            {visibleEmployees.length !== 1 ? "s" : ""} found
            {selectedCount > 0 && (
              <Text strong style={{ fontSize: 13 }}>
                {" · "}
                {selectedCount} selected
              </Text>
            )}
          </Text>
          <div className="flex gap-2">
            <Button
              size="small"
              onClick={() =>
                setSelectedIds(new Set(visibleEmployees.map((e) => e.id)))
              }
              disabled={visibleEmployees.length === 0 || allChecked}
            >
              Select All
            </Button>
            <Button
              size="small"
              onClick={() => setSelectedIds(new Set())}
              disabled={selectedCount === 0}
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      <Table<EmployeeFilterResponse>
        rowKey="id"
        columns={columns}
        dataSource={visibleEmployees}
        loading={hasSearched && isEmployeesLoading}
        size="small"
        pagination={{ pageSize: 10, size: "small", showSizeChanger: false }}
        className="mb-4"
        scroll={{ x: "max-content" }}
        locale={{
          emptyText: hasSearched
            ? "No employees found for the selected filters."
            : "Set filters above and click Search Employees to load employees.",
        }}
        components={{ header: { cell: ResizableTitle } }}
      />

      {/* Step 2 — Time Shift & Payroll Dates */}
      <Card
        size="small"
        className="mb-4"
        title={
          <Text strong style={{ fontSize: 13 }}>
            Set Time Shift &amp; Payroll Dates
          </Text>
        }
      >
        <Form layout="vertical">
          <div className="form-grid-2">
            <div>
              <Form.Item
                label={WORK_ROTATION_LABEL.USE_TIME_SHIFT}
                required
                className="mb-3"
              >
                <Select
                  showSearch
                  allowClear
                  loading={isTimeShiftLoading}
                  placeholder="Select time shift"
                  options={timeShiftOptions}
                  value={timeShiftId ?? undefined}
                  onChange={(v: string | undefined) =>
                    setTimeShiftId(v ?? null)
                  }
                  filterOption={(input, option) =>
                    String(option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={WORK_ROTATION_LABEL.CLIENT}
                extra={WORK_ROTATION_LABEL.CLIENT_HINT}
                className="mb-3"
              >
                <Select
                  placeholder={WORK_ROTATION_LABEL.CLIENT_PLACEHOLDER}
                  options={scheduledClientOptions}
                  value={scheduledClientId ?? undefined}
                  onChange={(v: string | undefined) =>
                    changeScheduledClient(v ?? null)
                  }
                  showSearch={{ filterOption: filterByLabel }}
                  allowClear
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                label={WORK_ROTATION_LABEL.AREA}
                extra={
                  scheduledClientId
                    ? WORK_ROTATION_LABEL.AREA_FILTERED_HINT
                    : WORK_ROTATION_LABEL.AREA_HINT
                }
                validateStatus={scheduledClientMismatch ? "warning" : ""}
                help={
                  scheduledClientMismatch
                    ? `This project site belongs to ${scheduledClientMismatch.clientName ?? "another client"}. The client you pick is used instead.`
                    : undefined
                }
                className="mb-3"
              >
                <Select
                  placeholder={WORK_ROTATION_LABEL.AREA_PLACEHOLDER}
                  options={scheduledSiteGroups}
                  value={scheduledAreaId ?? undefined}
                  onChange={(v: string | undefined) =>
                    changeScheduledSite(v ?? null)
                  }
                  showSearch={{ filterOption: filterByLabel }}
                  allowClear
                  className="w-full"
                />
              </Form.Item>
            </div>

            <Form.Item label="Payroll Dates" required className="mb-3">
              <div style={{ overflowX: "auto" }}>
                <MultiDatePicker
                  value={payrollDates}
                  onChange={setPayrollDates}
                />
              </div>
            </Form.Item>
          </div>

          {selectedIds.size > 0 && timeShiftId && payrollDates.length > 0 && (
            <Alert
              type="info"
              showIcon
              message={`Will apply to ${selectedIds.size} employee${selectedIds.size !== 1 ? "s" : ""} — ${selectedTimeShift?.label ?? timeShiftId} on ${payrollDates.length} date${payrollDates.length !== 1 ? "s" : ""}${selectedScheduledArea ? ` at ${selectedScheduledArea.code} - ${selectedScheduledArea.name}` : ""}${selectedScheduledClient ? ` for ${selectedScheduledClient.label}` : ""}`}
            />
          )}
        </Form>
      </Card>

      <div className="form-action-footer">
        <Space className="form-action-footer-row">
          <Button
            onClick={() => navigate({ to: "/change-schedule/work-rotation" })}
          >
            {NAVIGATION_BUTTON_LABEL.BACK}
          </Button>
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
          >
            {saveLabel}
          </Button>
        </Space>
      </div>
    </div>
  );
}

// ── Edit — single record ─────────────────────────────────────────────────────

function EditForm({ id }: { id: string }) {
  const navigate = useNavigate();
  const { data: selected, isLoading: isRecordLoading } = useWorkRotation(id);
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateWorkRotation();
  const { options: timeShiftOptions, isLoading: isTimeShiftLoading } =
    useTimeShiftOptions();
  const { data: areas = [] } = useOperationAreas();
  const { data: clients = [] } = useClients();
  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));
  const clientNameOf = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.name ?? "this client";

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<WorkRotationFormValues>({
    resolver: zodResolver(workRotationFormSchema),
  });
  const { allowNavigation } = useUnsavedChangesGuard(isDirty);

  // Client first, then the sites under it: the site list narrows to the chosen client's sites plus
  // the ones not tied to any client, and a site that belongs to a client fills the client in.
  const watchedAreaId = useWatch({ control, name: "operationAreaId" }) ?? null;
  const watchedClientId = useWatch({ control, name: "clientId" }) ?? null;
  const siteGroups = siteOptionGroups(
    areas,
    watchedClientId,
    clientNameOf,
    watchedAreaId,
  );
  const changeClient = (clientId: string | null) => {
    setValue("clientId", clientId);
    setValue(
      "operationAreaId",
      siteAfterClientChange(areas, clientId, watchedAreaId),
    );
  };
  const changeSite = (siteId: string | null) => {
    setValue("operationAreaId", siteId);
    setValue("clientId", clientAfterSiteChange(areas, siteId, watchedClientId));
  };
  // Only an entry saved before the pickers narrowed each other can still disagree.
  const mismatchedSite = clientSiteMismatch(
    areas,
    watchedClientId,
    watchedAreaId,
  );

  useEffect(() => {
    if (selected) {
      reset(workRotationMapper.toFormValues(selected));
    }
  }, [selected, reset]);

  const onSubmit = async (values: WorkRotationFormValues) => {
    if (!selected) return;
    try {
      await update({
        id,
        employeeId: selected.employeeId,
        timeShiftId: values.timeShiftId,
        payrollDate: values.payrollDate,
        operationAreaId: values.operationAreaId ?? null,
        clientId: values.clientId ?? null,
      });
      getNotify().success({
        message: "Work Rotation Updated",
        description: "Record has been updated successfully.",
      });
      allowNavigation();
      navigate({ to: "/change-schedule/work-rotation" });
    } catch (err) {
      // The server explains a clash with another entry on the chosen date; show that, not a
      // generic failure.
      getNotify().error({
        message: "Update Failed",
        description: apiErrorMessage(
          err,
          "Failed to update the record. Please try again.",
        ),
      });
    }
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {WORK_ROTATION_LABEL.EDIT_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Update the time shift and payroll date for this record.
            </p>
          </div>
          <Space>
            <Tag color="processing">Editing</Tag>
            <Button
              onClick={() => navigate({ to: "/change-schedule/work-rotation" })}
            >
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        {selected && (
          <Card
            className="form-section-card"
            title="Current Record"
            loading={isRecordLoading}
          >
            <Descriptions size="small" column={2}>
              <Descriptions.Item label={WORK_ROTATION_LABEL.EMPLOYEE}>
                {selected.fullName}
              </Descriptions.Item>
              <Descriptions.Item label={WORK_ROTATION_LABEL.PAYROLL_DATE}>
                {selected.payrollDate}
              </Descriptions.Item>
              <Descriptions.Item label={WORK_ROTATION_LABEL.TIME_SHIFT}>
                {selected.shiftName}
              </Descriptions.Item>
              <Descriptions.Item label={WORK_ROTATION_LABEL.AREA}>
                {selected.areaName || "—"}
              </Descriptions.Item>
              <Descriptions.Item label={WORK_ROTATION_LABEL.CLIENT}>
                {selected.clientName || "—"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Card className="form-section-card" title="Work Rotation Details">
            <div className="form-grid-2">
              <Form.Item
                label={WORK_ROTATION_LABEL.USE_TIME_SHIFT}
                required
                validateStatus={errors.timeShiftId ? "error" : ""}
                help={errors.timeShiftId?.message}
              >
                <Controller
                  name="timeShiftId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      showSearch
                      allowClear
                      loading={isTimeShiftLoading}
                      placeholder="Select time shift"
                      options={timeShiftOptions}
                      value={field.value || undefined}
                      onChange={field.onChange}
                      filterOption={(input, option) =>
                        String(option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label={WORK_ROTATION_LABEL.PAYROLL_DATE}
                required
                validateStatus={errors.payrollDate ? "error" : ""}
                help={errors.payrollDate?.message}
              >
                <Controller
                  name="payrollDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      style={{ width: "100%" }}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) =>
                        field.onChange(d ? d.format("YYYY-MM-DD") : "")
                      }
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label={WORK_ROTATION_LABEL.CLIENT}
                extra={WORK_ROTATION_LABEL.CLIENT_HINT}
                className="sm:col-span-2"
              >
                <Select
                  placeholder={WORK_ROTATION_LABEL.CLIENT_PLACEHOLDER}
                  options={clientOptions}
                  value={watchedClientId ?? undefined}
                  onChange={(v: string | undefined) => changeClient(v ?? null)}
                  showSearch={{ filterOption: filterByLabel }}
                  allowClear
                  className="w-full"
                />
              </Form.Item>

              <Form.Item
                label={WORK_ROTATION_LABEL.AREA}
                extra={
                  watchedClientId
                    ? WORK_ROTATION_LABEL.AREA_FILTERED_HINT
                    : WORK_ROTATION_LABEL.AREA_HINT
                }
                validateStatus={mismatchedSite ? "warning" : ""}
                help={
                  mismatchedSite
                    ? `This project site belongs to ${mismatchedSite.clientName ?? "another client"}. The client you pick is used instead.`
                    : undefined
                }
                className="sm:col-span-2"
              >
                <Select
                  placeholder={WORK_ROTATION_LABEL.AREA_PLACEHOLDER}
                  options={siteGroups}
                  value={watchedAreaId ?? undefined}
                  onChange={(v: string | undefined) => changeSite(v ?? null)}
                  showSearch={{ filterOption: filterByLabel }}
                  allowClear
                  className="w-full"
                />
              </Form.Item>
            </div>
          </Card>

          <div className="form-actions">
            <Button
              type="primary"
              htmlType="submit"
              loading={isUpdating}
              disabled={isUpdating}
            >
              Update
            </Button>
            <Button
              onClick={() => navigate({ to: "/change-schedule/work-rotation" })}
            >
              {NAVIGATION_BUTTON_LABEL.CANCEL}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
