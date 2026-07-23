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
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useHolidays } from "@/app/modules/setup/holiday/hooks/use-holiday-queries";
import { CHANGE_HOLIDAY_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { getNotify } from "@/shared/utils/notify";
import type { EmployeeFilterResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/employee-filter-response.model";
import type { CreateChangeHoliday } from "../../models/api/request/create-change-holiday.model";
import { z } from "zod";

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
  const payrollGroupOptions = payrollGroups.map((p) => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));
  const areaOptions = areas.map((a) => ({
    value: a.id,
    label: `${a.code} - ${a.name}`,
  }));
  const holidayOptions = holidays.map((h) => ({
    value: h.id,
    label: `${h.description} (${h.holDate})`,
  }));

  const hasSearched = committedFilter !== null;
  const selectedCount = selectedIds.size;
  const allChecked =
    employees.length > 0 && employees.every((e) => selectedIds.has(e.id));
  const someChecked =
    !allChecked && employees.some((e) => selectedIds.has(e.id));

  const selectedHoliday = holidayId
    ? holidays.find((h) => h.id === holidayId)
    : null;
  const selectedHolidayLabel = selectedHoliday
    ? `${selectedHoliday.description} (${selectedHoliday.holDate})`
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
    setSearchKey((k) => k + 1);
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
              ? setSelectedIds(new Set(employees.map((e) => e.id)))
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
    } catch {
      getNotify().error({
        message: "Save Failed",
        description: "Failed to create records. Please try again.",
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

      {/* Step 1 — Find Employees */}
      <Card
        size="small"
        className="mb-4"
        title={
          <Text strong style={{ fontSize: 13 }}>
            Step 1 — Find Employees
          </Text>
        }
      >
        <Form layout="vertical">
          <div className="grid grid-cols-3 gap-x-4">
            <Form.Item label="Branch" className="mb-3">
              <Select
                placeholder="All branches"
                options={branchOptions}
                value={branchId ?? undefined}
                onChange={(v: string | undefined) => setBranchId(v ?? null)}
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
            <Form.Item label="Payroll Group" className="mb-0">
              <Select
                placeholder="All payroll groups"
                options={payrollGroupOptions}
                value={payrollGroupId ?? undefined}
                onChange={(v: string | undefined) =>
                  setPayrollGroupId(v ?? null)
                }
                showSearch={{ filterOption: filterByLabel }}
                allowClear
              />
            </Form.Item>
            <Form.Item label="Project Site" className="mb-0">
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
            <Form.Item label="&nbsp;" className="mb-0">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                style={{ width: "100%" }}
              >
                Search Employees
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>

      {hasSearched && (
        <div className="flex items-center justify-between mb-2">
          <Text type="secondary" style={{ fontSize: 13 }}>
            {employees.length} employee{employees.length !== 1 ? "s" : ""} found
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
                setSelectedIds(new Set(employees.map((e) => e.id)))
              }
              disabled={employees.length === 0 || allChecked}
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
        dataSource={employees}
        loading={isEmployeesLoading}
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
            Step 2 — Set Holiday &amp; Replacement Date
          </Text>
        }
      >
        <Form layout="vertical">
          <div className="grid grid-cols-2 gap-x-4">
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
                onChange={(v: string | undefined) => setHolidayId(v ?? null)}
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

// ── Edit — single batch record ───────────────────────────────────────────────

function EditForm({ id }: { id: string }) {
  const navigate = useNavigate();
  const { data: selected, isLoading: isRecordLoading } = useChangeHoliday(id);
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateChangeHoliday();
  const { data: holidays = [] } = useHolidays();

  const holidayOptions = holidays.map((h) => ({
    value: h.id,
    label: `${h.description} (${h.holDate})`,
  }));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

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
                label={CHANGE_HOLIDAY_LABEL.FROM_DATE}
                required
                validateStatus={errors.fromDate ? "error" : ""}
                help={errors.fromDate?.message}
              >
                <Controller
                  name="fromDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      style={{ width: "100%" }}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) =>
                        field.onChange(d?.format("YYYY-MM-DD") ?? "")
                      }
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label={CHANGE_HOLIDAY_LABEL.TO_DATE}
                required
                validateStatus={errors.toDate ? "error" : ""}
                help={errors.toDate?.message}
              >
                <Controller
                  name="toDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      style={{ width: "100%" }}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) =>
                        field.onChange(d?.format("YYYY-MM-DD") ?? "")
                      }
                    />
                  )}
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
