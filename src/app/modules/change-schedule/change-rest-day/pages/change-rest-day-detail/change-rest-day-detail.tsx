import { useEffect, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { ArrowRightOutlined, SearchOutlined } from "@ant-design/icons";
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
  changeRestDayFormSchema,
  type ChangeRestDayFormValues,
} from "../../models/forms/change-rest-day-form.schema";
import {
  useChangeRestDay,
  useCreateChangeRestDay,
  useUpdateChangeRestDay,
} from "../../hooks/use-change-rest-day-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { changeRestDayMapper } from "../../services/change-rest-day.mapper";
import { CHANGE_REST_DAY_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { getNotify } from "@/shared/utils/notify";
import type { EmployeeFilterResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/employee-filter-response.model";
import type { CreateChangeRestDay } from "../../models/api/request/create-change-rest-day.model";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const { Title, Text } = Typography;

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

// ── Route entry point ────────────────────────────────────────────────────────

export default function ChangeRestDayDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  if (id) return <EditForm id={id} />;
  return <CreateBatchForm />;
}

// ── Create — Step 1: find employees, Step 2: set dates ──────────────────────

interface CommittedFilter {
  branchId: string | null;
  deptId: string | null;
  clientId: string | null;
  priorDate: Dayjs;
}

function CreateBatchForm() {
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();

  // Step 1 — employee filter
  const [branchId, setBranchId] = useState<string | null>(null);
  const [deptId, setDeptId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [priorDate, setPriorDate] = useState<Dayjs | null>(null);
  const [committedFilter, setCommittedFilter] =
    useState<CommittedFilter | null>(null);
  const [searchKey, setSearchKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Step 2 — replacement date (payrollDateTo); priorDate is payrollDateFrom
  const [newDate, setNewDate] = useState<Dayjs | null>(null);

  const { data: employees = [], isLoading: isEmployeesLoading } =
    useEmployeeFilter(
      {
        branchId: committedFilter?.branchId ?? undefined,
        departmentId: committedFilter?.deptId ?? undefined,
        clientId: committedFilter?.clientId ?? undefined,
        dayName: committedFilter ? committedFilter.priorDate.day() : undefined,
      },
      { enabled: committedFilter !== null, searchKey },
    );

  const { data: departments = [] } = useDepartments();
  const { data: clients = [] } = useClients();
  const { data: branches = [] } = useBranches();
  const { mutateAsync: create, isPending: isSubmitting } =
    useCreateChangeRestDay();

  const { widths, handleResize } = useResizableColumns({
    name: 150,
    departmentName: 160,
    branchName: 140,
    clientName: 140,
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

  const hasSearched = committedFilter !== null;
  // Guard against a stale/shared React Query cache: other pages fetch the
  // full employee list under an equivalent key, so `employees` can be
  // populated even while this query is disabled. Only show rows once the
  // user has actually clicked Search.
  const visibleEmployees = hasSearched ? employees : [];
  const selectedCount = selectedIds.size;
  const allChecked =
    visibleEmployees.length > 0 &&
    visibleEmployees.every((e) => selectedIds.has(e.id));
  const someChecked =
    !allChecked && visibleEmployees.some((e) => selectedIds.has(e.id));

  const handleSearch = () => {
    if (!priorDate) {
      messageApi.warning("Select the Prior Day-Off Date first.");
      return;
    }
    setSelectedIds(new Set());
    setCommittedFilter({ branchId, deptId, clientId, priorDate });
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
  ];

  const handleSubmit = async () => {
    if (!selectedIds.size) {
      messageApi.warning("Select at least one employee.");
      return;
    }
    if (!committedFilter) {
      messageApi.warning("Search for employees first.");
      return;
    }
    if (!newDate) {
      messageApi.warning("Set the New Day-Off Date.");
      return;
    }
    if (newDate.isSame(committedFilter.priorDate, "day")) {
      messageApi.error(
        "New Day-Off Date cannot be the same as the Prior Day-Off Date.",
      );
      return;
    }
    const payload: CreateChangeRestDay = {
      fromDay: committedFilter.priorDate.day(),
      toDay: newDate.day(),
      payrollDateFrom: committedFilter.priorDate.format("YYYY-MM-DD"),
      payrollDateTo: newDate.format("YYYY-MM-DD"),
      employeeIds: [...selectedIds],
    };

    try {
      await create(payload);
      getNotify().success({
        message: "Rest Day Change Saved",
        description: `Applied to ${selectedIds.size} employee${selectedIds.size !== 1 ? "s" : ""}.`,
      });
      navigate({ to: "/change-schedule/change-rest-day" });
    } catch {
      messageApi.error("Failed to create records. Please try again.");
    }
  };

  const isSubmitDisabled =
    !selectedIds.size || !committedFilter || !newDate || isSubmitting;
  const saveLabel =
    selectedIds.size && committedFilter && newDate
      ? `${NAVIGATION_BUTTON_LABEL.SAVE} (${selectedIds.size} employee${selectedIds.size !== 1 ? "s" : ""})`
      : NAVIGATION_BUTTON_LABEL.SAVE;

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {CHANGE_REST_DAY_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Select the day-off date to filter employees, then set the
              replacement date.
            </p>
          </div>
          <Space>
            <Tag color="success">New Record</Tag>
            <Button
              onClick={() =>
                navigate({ to: "/change-schedule/change-rest-day" })
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
          <div className="form-grid-4">
            <Form.Item label="Day-Off Date" required className="mb-3">
              <DatePicker
                style={{ width: "100%" }}
                value={priorDate}
                onChange={(d) => {
                  setPriorDate(d ?? null);
                  if (d && newDate && d.isSame(newDate, "day")) {
                    setNewDate(null);
                    messageApi.warning(
                      "New Day-Off Date was cleared because it matched the Prior Day-Off Date.",
                    );
                  }
                }}
              />
            </Form.Item>
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
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            disabled={!priorDate}
          >
            Search Employees
          </Button>
        </Form>
      </Card>

      {hasSearched && (
        <div className="flex items-center justify-between mb-2">
          <Text type="secondary" style={{ fontSize: 13 }}>
            {visibleEmployees.length} employee
            {visibleEmployees.length !== 1 ? "s" : ""} with{" "}
            <Text strong style={{ fontSize: 13 }}>
              {committedFilter!.priorDate.format("dddd")}
            </Text>{" "}
            rest day found
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
            ? "No employees found with a rest day on that date."
            : "Select the Prior Day-Off Date and click Search Employees.",
        }}
        components={{ header: { cell: ResizableTitle } }}
      />

      {/* Step 2 — Set Replacement Date */}
      <Card
        size="small"
        className="mb-4"
        title={
          <Text strong style={{ fontSize: 13 }}>
            Step 2 — Set Replacement Date
          </Text>
        }
      >
        <Form layout="vertical">
          <div className="form-grid-2">
            <Form.Item
              label={
                <Space size={4}>
                  <ArrowRightOutlined style={{ color: "#1DA081" }} />
                  {CHANGE_REST_DAY_LABEL.NEW_DATE}
                </Space>
              }
              required
            >
              <DatePicker
                style={{ width: "100%" }}
                value={newDate}
                disabledDate={(d) =>
                  priorDate ? d.isSame(priorDate, "day") : false
                }
                onChange={(d) => {
                  if (d && priorDate && d.isSame(priorDate, "day")) {
                    messageApi.warning(
                      "New Day-Off Date cannot be the same as the Prior Day-Off Date.",
                    );
                    return;
                  }
                  setNewDate(d ?? null);
                }}
              />
            </Form.Item>
          </div>
          {selectedIds.size > 0 && committedFilter && newDate && (
            <Alert
              type="info"
              showIcon
              message={`${selectedIds.size} employee${selectedIds.size !== 1 ? "s" : ""} — ${committedFilter.priorDate.format("dddd")} → ${newDate.format("dddd")}, from ${committedFilter.priorDate.format("MMM DD, YYYY")} to ${newDate.format("MMM DD, YYYY")}`}
            />
          )}
        </Form>
      </Card>

      <div className="form-action-footer">
        <Space className="form-action-footer-row">
          <Button
            onClick={() => navigate({ to: "/change-schedule/change-rest-day" })}
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
  const { data: selected } = useChangeRestDay(id);
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateChangeRestDay();
  const { data: employeeData = [] } = useEmployeeFilter();

  const employeeOptions = employeeData.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ChangeRestDayFormValues>({
    resolver: zodResolver(changeRestDayFormSchema),
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const fromDate = watch("fromDate");
  const toDate = watch("toDate");

  useEffect(() => {
    if (selected) reset(changeRestDayMapper.toFormValues(selected));
  }, [selected, reset]);

  const onSubmit = async (values: ChangeRestDayFormValues) => {
    await update({
      id,
      fromDay: dayjs(values.fromDate).day(),
      toDay: dayjs(values.newDate).day(),
      payrollDateFrom: values.fromDate,
      payrollDateTo: values.newDate,
      employeeIds: [values.employeeId],
    });
    navigate({ to: "/change-schedule/change-rest-day" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {CHANGE_REST_DAY_LABEL.EDIT_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Update the rest day change record.
            </p>
          </div>
          <Space>
            <Tag color="processing">Editing</Tag>
            <Button
              onClick={() =>
                navigate({ to: "/change-schedule/change-rest-day" })
              }
            >
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Card className="form-section-card" title="Employee">
            <Form.Item
              label={CHANGE_REST_DAY_LABEL.EMPLOYEE}
              required
              validateStatus={errors.employeeId ? "error" : ""}
              help={errors.employeeId?.message}
            >
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <Select
                    showSearch
                    filterOption={(input, opt) =>
                      String(opt?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    placeholder="Select employee"
                    options={employeeOptions}
                    value={field.value || undefined}
                    onChange={field.onChange}
                    style={{ width: "100%", maxWidth: 400 }}
                  />
                )}
              />
            </Form.Item>
          </Card>

          <Card className="form-section-card" title="Rest Day Change">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 items-start">
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

              <Form.Item
                label={
                  <Space size={4}>
                    <ArrowRightOutlined style={{ color: "#1DA081" }} />
                    {CHANGE_REST_DAY_LABEL.NEW_DATE}
                  </Space>
                }
                required
                validateStatus={errors.newDate ? "error" : ""}
                help={errors.newDate?.message}
              >
                <Controller
                  name="newDate"
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
                navigate({ to: "/change-schedule/change-rest-day" })
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
