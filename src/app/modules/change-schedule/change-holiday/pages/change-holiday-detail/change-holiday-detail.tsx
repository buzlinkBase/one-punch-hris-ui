import { useEffect, useState } from "react";
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
import { SearchOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  useChangeHoliday,
  useCreateChangeHoliday,
  useUpdateChangeHoliday,
} from "../../hooks/use-change-holiday-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
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
import { useHolidays } from "@/app/modules/setup/holiday/hooks/use-holiday-queries";
import { CHANGE_HOLIDAY_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { getNotify } from "@/shared/utils/notify";
import { isActiveStatus } from "@/shared/utils/status.util";
import { apiErrorMessage } from "@/core/http/api-error";
import type { HolidayResponse } from "@/app/modules/setup/holiday/models/api/response/holiday-response.model";
import type { EmployeeFilterResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/employee-filter-response.model";
import type { CreateChangeHoliday } from "../../models/api/request/create-change-holiday.model";
import {
  FilterPanel,
  FilterToggleButton,
} from "@/shared/components/filter-panel/filter-panel";
import { compactChips, labelOf } from "@/shared/utils/filter-chips.util";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { z } from "zod";
import { useUnsavedChangesGuard } from "@/shared/hooks/use-unsaved-changes-guard";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title, Text } = Typography;

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

// Edit form schema — holiday + date range only
const editSchema = z.object({
  holidayId: z.string().min(1, "Holiday is required"),
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
});
type EditFormValues = z.infer<typeof editSchema>;

// ── Route entry point ────────────────────────────────────────────────────────

export default function ChangeHolidayDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  if (id) return <EditForm id={id} />;
  return <CreateForm />;
}

// "Osmeña Day (Sep 09, 2026) · Cebu City Area, Mandaue City Area" -- a localized
// holiday shows its project sites so same-named entries can be told apart.
const holidayLabel = (h: HolidayResponse) => {
  const base = `${h.description} (${h.holDate})`;
  return h.areaNames?.length ? `${base} · ${h.areaNames.join(", ")}` : base;
};

// The project sites a localized special holiday is limited to, or null when it
// applies everywhere (nationwide special or regular holiday).
const holidaySites = (h: HolidayResponse | null | undefined) => {
  const type = (h?.holidayType ?? h?.holType)?.toUpperCase();
  return type === "SPECIAL" && h?.areaIds?.length ? new Set(h.areaIds) : null;
};

// ── Create — Step 1: find employees, Step 2: holiday + date range ────────────

function CreateForm() {
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();

  // Step 1 — employee filter
  const [branchId, setBranchId] = useState<string | null>(null);
  const [deptId, setDeptId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [payrollGroupId, setPayrollGroupId] = useState<string | null>(null);
  const [operationAreaId, setOperationAreaId] = useState<string | null>(null);
  const [committedFilter, setCommittedFilter] = useState<Record<
    string,
    string | null | undefined
  > | null>(null);
  const [searchKey, setSearchKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Step 2 — holiday + replacement date
  const [holidayId, setHolidayId] = useState<string | null>(null);
  const [replaceDate, setReplaceDate] = useState<Dayjs | null>(null);

  const { data: employees = [], isLoading: isEmployeesLoading } =
    useEmployeeFilter(
      {
        branchId: committedFilter?.branchId ?? undefined,
        departmentId: committedFilter?.deptId ?? undefined,
        clientId: committedFilter?.clientId ?? undefined,
        payrollGroupId: committedFilter?.payrollGroupId ?? undefined,
        operationAreaId: committedFilter?.operationAreaId ?? undefined,
      },
      { enabled: committedFilter !== null, searchKey },
    );

  const { data: departments = [] } = useDepartments();
  const { data: clients = [] } = useClients();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: areas = [] } = useOperationAreas();
  const { data: branches = [] } = useBranches();
  const { data: holidays = [] } = useHolidays();
  const { mutateAsync: createHoliday, isPending: isSubmitting } =
    useCreateChangeHoliday();

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
  const areaOptions = areas
    .filter((a) => !branchId || a.branchId === branchId)
    .map((a) => ({
      value: a.id,
      label: `${a.code} - ${a.name}`,
    }));
  const holidayOptions = holidays
    .filter((h) => isActiveStatus(h.status))
    .map((h) => ({
      value: h.id,
      label: holidayLabel(h),
    }));

  const filterChips = compactChips([
    labelOf(branchOptions, branchId ?? undefined),
    labelOf(deptOptions, deptId ?? undefined),
    labelOf(clientOptions, clientId ?? undefined),
    labelOf(payrollGroupOptions, payrollGroupId ?? undefined),
    labelOf(areaOptions, operationAreaId ?? undefined),
  ]);
  const activeFilterCount = [
    branchId,
    deptId,
    clientId,
    payrollGroupId,
    operationAreaId,
  ].filter(Boolean).length;

  const hasSearched = committedFilter !== null;
  // Guard against a stale/shared React Query cache: other pages fetch the
  // full employee list under an equivalent key, so `employees` can be
  // populated even while this query is disabled. Only show rows once the
  // user has actually clicked Search.
  const visibleEmployees = hasSearched ? employees : [];
  const selectedCount = selectedIds.size;

  const selectedHoliday = holidayId
    ? holidays.find((h) => h.id === holidayId)
    : null;
  const selectedHolidayLabel = selectedHoliday
    ? holidayLabel(selectedHoliday)
    : null;
  // A localized holiday can only be moved for employees assigned to one of its sites.
  const coveredSites = holidaySites(selectedHoliday);
  const isCovered = (e: EmployeeFilterResponse) =>
    !coveredSites || (!!e.areaId && coveredSites.has(e.areaId));
  const selectableEmployees = visibleEmployees.filter(isCovered);
  const uncoveredCount = visibleEmployees.length - selectableEmployees.length;

  const allChecked =
    selectableEmployees.length > 0 &&
    selectableEmployees.every((e) => selectedIds.has(e.id));
  const someChecked =
    !allChecked && selectableEmployees.some((e) => selectedIds.has(e.id));

  const handleHolidayChange = (id: string | null) => {
    setHolidayId(id);
    const sites = holidaySites(holidays.find((h) => h.id === id));
    if (!sites) return;
    // Drop anyone already ticked who isn't at one of the new holiday's sites.
    setSelectedIds((prev) => {
      const next = new Set<string>();
      visibleEmployees.forEach((e) => {
        if (prev.has(e.id) && e.areaId && sites.has(e.areaId)) next.add(e.id);
      });
      return next;
    });
  };

  const handleSearch = () => {
    setSelectedIds(new Set());
    setCommittedFilter({
      branchId,
      deptId,
      clientId,
      payrollGroupId,
      operationAreaId,
    });
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
    setCommittedFilter(null);
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
              ? setSelectedIds(new Set(selectableEmployees.map((e) => e.id)))
              : setSelectedIds(new Set())
          }
        />
      ),
      render: (_: unknown, emp: EmployeeFilterResponse) => (
        <Checkbox
          checked={selectedIds.has(emp.id)}
          disabled={!isCovered(emp)}
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
      render: (name: string | null | undefined, emp: EmployeeFilterResponse) =>
        isCovered(emp) ? (
          name
        ) : (
          <span className="text-gray-400">
            {name ?? "—"} <Tag className="ml-1">Not covered</Tag>
          </span>
        ),
    },
  ];

  const handleSubmit = async () => {
    if (!selectedIds.size) {
      messageApi.warning("Select at least one employee.");
      return;
    }
    if (!holidayId) {
      messageApi.warning("Select a holiday.");
      return;
    }
    if (!replaceDate) {
      messageApi.warning("Set the replacement date.");
      return;
    }

    const payload: CreateChangeHoliday = {
      employeeIds: [...selectedIds],
      holidayId,
      payrollDateFrom: dayjs(selectedHoliday!.holDate).format("YYYY-MM-DD"),
      payrollDateTo: replaceDate.format("YYYY-MM-DD"),
    };

    try {
      await createHoliday(payload);
      getNotify().success({
        message: "Holiday Change Saved",
        description: `Applied to ${selectedIds.size} employee${selectedIds.size !== 1 ? "s" : ""}.`,
      });
      navigate({ to: "/change-schedule/change-holiday" });
    } catch (err) {
      getNotify().error({
        message: "Save Failed",
        description: apiErrorMessage(
          err,
          "Failed to create records. Please try again.",
        ),
      });
    }
  };

  const isSubmitDisabled =
    !selectedIds.size || !holidayId || !replaceDate || isSubmitting;
  const saveLabel =
    selectedIds.size && holidayId && replaceDate
      ? `${NAVIGATION_BUTTON_LABEL.SAVE} (${selectedIds.size} employee${selectedIds.size !== 1 ? "s" : ""})`
      : NAVIGATION_BUTTON_LABEL.SAVE;

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {CHANGE_HOLIDAY_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Find employees and assign a holiday change with a payroll date
              range.
            </p>
          </div>
          <Space>
            <Tag color="success">New Record</Tag>
            <FilterToggleButton
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              activeCount={activeFilterCount}
            />
            <Button
              onClick={() =>
                navigate({ to: "/change-schedule/change-holiday" })
              }
            >
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      {/* Filters — collapse into chips once employees are searched */}
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
            onChange={(v: string | undefined) => setOperationAreaId(v ?? null)}
            showSearch={{ filterOption: filterByLabel }}
            allowClear
          />
        </Form.Item>
      </FilterPanel>

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
                setSelectedIds(new Set(selectableEmployees.map((e) => e.id)))
              }
              disabled={selectableEmployees.length === 0 || allChecked}
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

      {/* Step 2 — Holiday & Replacement Date */}
      <Card
        size="small"
        className="mb-4"
        title={
          <Text strong style={{ fontSize: 13 }}>
            Set Holiday &amp; Replacement Date
          </Text>
        }
      >
        <Form layout="vertical">
          <div className="form-grid-2">
            <Form.Item
              label={CHANGE_HOLIDAY_LABEL.HOLIDAY}
              required
              className="mb-3"
              extra={
                selectedHoliday ? (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Holiday date:{" "}
                    <Text strong style={{ fontSize: 12 }}>
                      {selectedHoliday.holDate}
                    </Text>
                  </Text>
                ) : null
              }
            >
              <Select
                showSearch={{ filterOption: filterByLabel }}
                allowClear
                placeholder="Select holiday"
                options={holidayOptions}
                value={holidayId ?? undefined}
                onChange={(v: string | undefined) =>
                  handleHolidayChange(v ?? null)
                }
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              label={CHANGE_HOLIDAY_LABEL.REPLACEMENT_DATE}
              required
              className="mb-3"
            >
              <DatePicker
                style={{ width: "100%" }}
                value={replaceDate}
                disabledDate={(d) =>
                  selectedHoliday
                    ? d.isSame(dayjs(selectedHoliday.holDate), "day")
                    : false
                }
                onChange={(d) => setReplaceDate(d ?? null)}
              />
            </Form.Item>
          </div>
          {coveredSites && (
            <Alert
              type="warning"
              showIcon
              className="mb-3"
              message={`Local holiday: only employees assigned to ${selectedHoliday?.areaNames?.join(", ")} can be included.${uncoveredCount > 0 ? ` ${uncoveredCount} employee${uncoveredCount !== 1 ? "s" : ""} in the list ${uncoveredCount !== 1 ? "are" : "is"} not covered.` : ""}`}
            />
          )}
          {selectedIds.size > 0 && holidayId && replaceDate && (
            <Alert
              type="info"
              showIcon
              message={`Will apply to ${selectedIds.size} employee${selectedIds.size !== 1 ? "s" : ""} — ${selectedHolidayLabel}, replacement date ${replaceDate.format("MMM DD, YYYY")}`}
            />
          )}
        </Form>
      </Card>

      <div className="form-action-footer">
        <Space className="form-action-footer-row">
          <Button
            onClick={() => navigate({ to: "/change-schedule/change-holiday" })}
          >
            {NAVIGATION_BUTTON_LABEL.BACK}
          </Button>
          <PermissionGate permission="Change Holiday:Create">
            <Button
              type="primary"
              loading={isSubmitting}
              disabled={isSubmitDisabled}
              onClick={handleSubmit}
            >
              {saveLabel}
            </Button>
          </PermissionGate>
        </Space>
      </div>
    </div>
  );
}

// ── Edit — single batch record ───────────────────────────────────────────────

function EditForm({ id }: { id: string }) {
  const navigate = useNavigate();
  const { data: selected, isLoading: isRecordLoading } = useChangeHoliday(id);
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateChangeHoliday();
  const { data: holidays = [] } = useHolidays();

  const holidayOptions = holidays
    .filter((h) => isActiveStatus(h.status))
    .map((h) => ({
      value: h.id,
      label: holidayLabel(h),
    }));

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });
  const { allowNavigation } = useUnsavedChangesGuard(isDirty);

  // eslint-disable-next-line react-hooks/incompatible-library
  const fromDate = watch("fromDate");
  const toDate = watch("toDate");

  useEffect(() => {
    if (selected) {
      reset({
        holidayId: "",
        fromDate: selected.fromDate,
        toDate: selected.toDate,
      });
    }
  }, [selected, reset]);

  const onSubmit = async (values: EditFormValues) => {
    try {
      await update({
        id,
        employeeIds: [],
        holidayId: values.holidayId,
        payrollDateFrom: values.fromDate,
        payrollDateTo: values.toDate,
      });
      getNotify().success({
        message: "Holiday Change Updated",
        description: "Record has been updated successfully.",
      });
      allowNavigation();
      navigate({ to: "/change-schedule/change-holiday" });
    } catch {
      getNotify().error({
        message: "Update Failed",
        description: "Failed to update the record. Please try again.",
      });
    }
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {CHANGE_HOLIDAY_LABEL.EDIT_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Update the holiday and date range for this record.
            </p>
          </div>
          <Space>
            <Tag color="processing">Editing</Tag>
            <Button
              onClick={() =>
                navigate({ to: "/change-schedule/change-holiday" })
              }
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
            <Descriptions size="small" column={3}>
              <Descriptions.Item label={CHANGE_HOLIDAY_LABEL.EMPLOYEE}>
                {selected.fullName}
              </Descriptions.Item>
              <Descriptions.Item label={CHANGE_HOLIDAY_LABEL.HOLIDAY_NAME}>
                {selected.holidayName}
              </Descriptions.Item>
              <Descriptions.Item label={CHANGE_HOLIDAY_LABEL.CLIENT}>
                {selected.clientName}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Card className="form-section-card" title="Holiday Details">
            <div className="form-grid-2">
              <Form.Item
                label={CHANGE_HOLIDAY_LABEL.HOLIDAY}
                required
                validateStatus={errors.holidayId ? "error" : ""}
                help={errors.holidayId?.message}
              >
                <Controller
                  name="holidayId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select holiday"
                      options={holidayOptions}
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
                label="Payroll Period"
                required
                className="sm:col-span-2"
                validateStatus={errors.fromDate || errors.toDate ? "error" : ""}
                help={errors.fromDate?.message ?? errors.toDate?.message}
              >
                <MobileRangePicker
                  style={{ width: "100%" }}
                  value={
                    fromDate && toDate ? [dayjs(fromDate), dayjs(toDate)] : null
                  }
                  onChange={(dates) => {
                    setValue(
                      "fromDate",
                      dates?.[0]?.format("YYYY-MM-DD") ?? "",
                    );
                    setValue("toDate", dates?.[1]?.format("YYYY-MM-DD") ?? "");
                  }}
                />
              </Form.Item>
            </div>
          </Card>

          <div className="form-actions">
            <PermissionGate permission="Change Holiday:Edit">
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdating}
                disabled={isUpdating}
              >
                Update
              </Button>
            </PermissionGate>
            <Button
              onClick={() =>
                navigate({ to: "/change-schedule/change-holiday" })
              }
            >
              {NAVIGATION_BUTTON_LABEL.CANCEL}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
