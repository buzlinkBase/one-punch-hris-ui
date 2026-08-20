import { useEffect, useRef, useState, lazy, Suspense } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  DatePicker,
  Typography,
  Card,
  Space,
  Tag,
  Checkbox,
  Switch,
  Tabs,
  Avatar,
  message,
} from "antd";
import {
  UserOutlined,
  CameraOutlined,
  PlusOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import {
  useForm,
  Controller,
  useWatch,
  type Resolver,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  employeeFormSchema,
  type EmployeeFormValues,
} from "../../models/forms/employee-form.schema";
import type { DayName } from "../../models/api/response/employee-response.model";
import {
  useEmployee,
  useCreateEmployee,
  useUpdateEmployee,
} from "../../hooks/use-employee-queries";
import { employeeMapper } from "../../services/employee.mapper";
import {
  EMPLOYEE_LABEL,
  MODE_OF_PAYMENT_OPTIONS,
  SALARY_TYPE_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  JOB_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  BLOOD_TYPE_OPTIONS,
  COMPUTATION_BASIS_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import { useSplitTimeShifts } from "@/app/modules/setup/time-shift/split/hooks/use-split-time-shift-queries";
import { useFlexiTimeShifts } from "@/app/modules/setup/time-shift/flexi/hooks/use-flexi-time-shift-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { useSections } from "@/app/modules/setup/section/hooks/use-section-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { usePositions } from "@/app/modules/setup/position/hooks/use-position-queries";
import QuickAddPayrollGroupModal from "../../components/quick-add-payroll-group-modal";
import QuickAddDepartmentModal from "../../components/quick-add-department-modal";
import QuickAddOperationAreaModal from "../../components/quick-add-operation-area-modal";
import QuickAddClientModal from "../../components/quick-add-client-modal";
import QuickAddSectionModal from "../../components/quick-add-section-modal";
import QuickAddBranchModal from "../../components/quick-add-branch-modal";
import QuickAddPositionModal from "../../components/quick-add-position-modal";
import EmployeeDependentsTab from "../../components/employee-dependents-tab";
import EmployeeEducationTab from "../../components/employee-education-tab";
import EmployeeSkillsTab from "../../components/employee-skills-tab";
import EmployeeDocRecordsTab from "../../components/employee-doc-records-tab";
import EmployeeEmploymentHistoryTab from "../../components/employee-employment-history-tab";
import EmployeeAssignAssetsTab from "../../components/employee-assign-assets-tab";

const Employee201Modal = lazy(
  () => import("@/app/modules/reports/employee-201/employee-201-modal"),
);

const { Title, Text } = Typography;

const capitalizeFirst = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const STATUS_COLORS: Record<string, string> = {
  Regular: "success",
  PartTime: "geekblue",
  Probationary: "processing",
  Contract: "warning",
  Temporary: "cyan",
  Casual: "default",
  Intern: "magenta",
  OnLeave: "gold",
  Suspended: "orange",
  Terminated: "error",
  Resigned: "volcano",
  Retired: "purple",
  Deceased: "gray",
};

const STATUS_LABELS: Record<string, string> = {
  PartTime: "Part Time",
  OnLeave: "On Leave",
};

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

const REST_DAY_OPTIONS = [
  { value: "Monday", label: "Mon" },
  { value: "Tuesday", label: "Tue" },
  { value: "Wednesday", label: "Wed" },
  { value: "Thursday", label: "Thu" },
  { value: "Friday", label: "Fri" },
  { value: "Saturday", label: "Sat" },
  { value: "Sunday", label: "Sun" },
];

const datePicker = (
  value: string | null | undefined,
  onChange: (v: string | null) => void,
  allowClear = true,
) => (
  <DatePicker
    className="w-full"
    value={value ? dayjs(value) : null}
    onChange={(date) => onChange(date ? date.format("YYYY-MM-DD") : null)}
    allowClear={allowClear}
  />
);

export default function EmployeeDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: selected } = useEmployee(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateEmployee();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateEmployee();
  const { data: departments = [], isLoading: isDepartmentsLoading } =
    useDepartments();
  const { data: operationAreas = [], isLoading: isAreasLoading } =
    useOperationAreas();
  const { data: payrollGroups = [], isLoading: isPayrollGroupsLoading } =
    usePayrollGroups();
  const { data: fixedShifts = [], isLoading: isFixedShiftsLoading } =
    useFixedTimeShifts();
  const { data: splitShifts = [], isLoading: isSplitShiftsLoading } =
    useSplitTimeShifts();
  const { data: flexiShifts = [], isLoading: isFlexiShiftsLoading } =
    useFlexiTimeShifts();
  const { data: clients = [], isLoading: isClientsLoading } = useClients();
  const { data: sections = [], isLoading: isSectionsLoading } = useSections();
  const { data: branches = [], isLoading: isBranchesLoading } = useBranches();
  const { data: positions = [], isLoading: isPositionsLoading } =
    usePositions();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema) as Resolver<EmployeeFormValues>,
    defaultValues: employeeMapper.toDefaultValues(),
  });

  const [show201, setShow201] = useState(false);
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [pgModalOpen, setPgModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [positionModalOpen, setPositionModalOpen] = useState(false);

  useEffect(() => {
    if (isEdit && selected) {
      reset(employeeMapper.toFormValues(selected));
    }
  }, [selected, isEdit, reset]);

  useEffect(() => {
    if (!isEdit) {
      const state = location.state as { bioId?: number | null } | null;
      if (state?.bioId != null) {
        setValue("bioId", state.bioId);
      }
    }
  }, [isEdit, location.state, setValue]);

  const onSubmit = async (values: EmployeeFormValues) => {
    const selectedDays = values.restDays ?? [];
    const payload = {
      ...values,
      restDays: selectedDays.map((dayName) => {
        const existing = selected?.restDays?.find((r) => r.dayName === dayName);
        return { id: existing?.id, dayName: dayName as DayName };
      }),
    };
    try {
      if (isEdit && id) {
        await update({ id, ...payload });
      } else {
        await add(payload);
      }
      navigate({ to: "/setup/employee" });
    } catch {
      // handled by global error interceptor
    }
  };

  const handleInvalid = (fieldErrors: FieldErrors<EmployeeFormValues>) => {
    const keys = Object.keys(fieldErrors);
    const tabsWithErrors: string[] = [];
    const personalFields = ["firstName", "lastName"];
    const employmentFields = [
      "payrollGroupId",
      "jobLevel",
      "employmentStatus",
      "dateRegistered",
    ];
    const compensationFields = ["salaryType", "modeOfPayment"];
    if (keys.some((k) => personalFields.includes(k)))
      tabsWithErrors.push("Personal Information");
    if (keys.some((k) => employmentFields.includes(k)))
      tabsWithErrors.push("Employment Details");
    if (keys.some((k) => compensationFields.includes(k)))
      tabsWithErrors.push("Compensation");
    message.warning(
      tabsWithErrors.length
        ? `Required fields missing in: ${tabsWithErrors.join(", ")}. Please review and fill them in.`
        : "Please fill in all required fields before saving.",
      5,
    );
  };

  const isSubmitting = isUpdating || isCreating;
  const imgInputRef = useRef<HTMLInputElement>(null);

  const watchedDepartmentId = useWatch({ control, name: "departmentId" });
  const watchedFirstName = useWatch({ control, name: "firstName" });
  const watchedLastName = useWatch({ control, name: "lastName" });
  const watchedMiddleName = useWatch({ control, name: "middleName" });
  const watchedSuffix = useWatch({ control, name: "suffix" });
  const watchedEmpNo = useWatch({ control, name: "employeeNo" });
  const watchedEmploymentStatus = useWatch({
    control,
    name: "employmentStatus",
  });

  const isRefLoading =
    isDepartmentsLoading ||
    isAreasLoading ||
    isPayrollGroupsLoading ||
    isFixedShiftsLoading ||
    isSplitShiftsLoading ||
    isFlexiShiftsLoading ||
    isClientsLoading ||
    isSectionsLoading ||
    isBranchesLoading ||
    isPositionsLoading;

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: `${d.code} - ${d.name}`,
  }));
  const areaOptions = operationAreas.map((a) => ({
    value: a.id,
    label: `${a.code} - ${a.name}`,
  }));
  const payrollGroupOptions = payrollGroups.map((p) => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

  const formatShiftTime = (t: string) => {
    const dot = t.indexOf(".");
    const hasDayOffset = dot > 0 && dot < t.lastIndexOf(":");
    const timePart = hasDayOffset ? t.slice(dot + 1) : t;
    const [h, m] = timePart.split(":");
    return hasDayOffset ? `+1d ${h}:${m}` : `${h}:${m}`;
  };

  const timeShiftOptions = [
    ...fixedShifts
      .filter((s) => s.shiftType === "FIXED")
      .map((s) => ({
        value: s.id,
        label: `${s.shiftName} (Fixed)`,
        shiftName: s.shiftName,
        shiftType: "FIXED" as const,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    ...splitShifts
      .filter((s) => s.shiftType === "SPLIT")
      .map((s) => ({
        value: s.id,
        label: `${s.shiftName} (Split)`,
        shiftName: s.shiftName,
        shiftType: "SPLIT" as const,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    ...flexiShifts
      .filter((s) => s.shiftType === "FLEXI")
      .map((s) => ({
        value: s.id,
        label: `${s.shiftName} (Flexi)`,
        shiftName: s.shiftName,
        shiftType: "FLEXI" as const,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
  ];

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));
  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: `${b.code} - ${b.name}`,
  }));
  const positionOptions = positions.map((p) => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));
  const sectionOptions = sections
    .filter(
      (s) => !watchedDepartmentId || s.departmentId === watchedDepartmentId,
    )
    .map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }));

  const displayName =
    watchedLastName || watchedFirstName
      ? [watchedLastName, watchedFirstName].filter(Boolean).join(", ") +
        (watchedMiddleName ? ` ${watchedMiddleName.charAt(0)}.` : "") +
        (watchedSuffix ? ` ${watchedSuffix}` : "")
      : null;

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit ? EMPLOYEE_LABEL.EDIT_TITLE : EMPLOYEE_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Complete all required employee profile, assignment, and payroll
              details.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            {isEdit && id && (
              <Button
                icon={<PrinterOutlined />}
                onClick={() => setShow201(true)}
              >
                Print 201
              </Button>
            )}
            <Button onClick={() => navigate({ to: "/setup/employee" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit, handleInvalid)}>
        {/* ── 201 File Header ── */}
        <Card className="mb-4">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Controller
              name="profileImg"
              control={control}
              render={({ field }) => (
                <div
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                  onClick={() => imgInputRef.current?.click()}
                  title="Click to upload photo"
                >
                  <Avatar
                    size={72}
                    src={field.value || undefined}
                    icon={!field.value ? <UserOutlined /> : undefined}
                    style={{
                      backgroundColor: !field.value ? "#1DA081" : undefined,
                      fontSize: 32,
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.2s",
                    }}
                    className="avatar-upload-overlay"
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.opacity = "1")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.opacity = "0")
                    }
                  >
                    <CameraOutlined style={{ color: "#fff", fontSize: 20 }} />
                  </div>
                  <input
                    ref={imgInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () =>
                        field.onChange(reader.result as string);
                      reader.readAsDataURL(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>
                {displayName ?? (
                  <Text
                    type="secondary"
                    style={{ fontWeight: 400, fontSize: 16 }}
                  >
                    New Employee
                  </Text>
                )}
              </div>
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {watchedEmpNo && (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    EMP# {watchedEmpNo}
                  </Text>
                )}
                {watchedEmploymentStatus && (
                  <Tag
                    color={STATUS_COLORS[watchedEmploymentStatus] ?? "default"}
                  >
                    {STATUS_LABELS[watchedEmploymentStatus] ??
                      watchedEmploymentStatus}
                  </Tag>
                )}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                }}
              >
                201 File
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                {isEdit ? "Personnel Record" : "New Record"}
              </div>
            </div>
          </div>
        </Card>

        {/* ── Tabbed Sections ── */}
        <Card>
          <Tabs
            type="card"
            items={[
              {
                key: "personal",
                label: "Personal Information",
                forceRender: true,
                children: (
                  <div className="form-grid-2" style={{ paddingTop: 16 }}>
                    <Form.Item
                      label={EMPLOYEE_LABEL.FIRST_NAME}
                      required
                      validateStatus={errors.firstName ? "error" : ""}
                      help={errors.firstName?.message}
                    >
                      <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            onChange={(e) =>
                              field.onChange(capitalizeFirst(e.target.value))
                            }
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      label={EMPLOYEE_LABEL.LAST_NAME}
                      required
                      validateStatus={errors.lastName ? "error" : ""}
                      help={errors.lastName?.message}
                    >
                      <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            onChange={(e) =>
                              field.onChange(capitalizeFirst(e.target.value))
                            }
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.MIDDLE_NAME}>
                      <Controller
                        name="middleName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            onChange={(e) =>
                              field.onChange(capitalizeFirst(e.target.value))
                            }
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.SUFFIX}>
                      <Controller
                        name="suffix"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Jr., Sr., III…"
                            onChange={(e) =>
                              field.onChange(capitalizeFirst(e.target.value))
                            }
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.GENDER}>
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            value={field.value ?? undefined}
                            options={GENDER_OPTIONS}
                            allowClear
                            placeholder="Select gender"
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.CIVIL_STATUS}>
                      <Controller
                        name="civilStatus"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            value={field.value ?? undefined}
                            options={CIVIL_STATUS_OPTIONS}
                            allowClear
                            placeholder="Select civil status"
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.DOB}>
                      <Controller
                        name="dob"
                        control={control}
                        render={({ field }) =>
                          datePicker(field.value, field.onChange)
                        }
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.BLOOD_TYPE}>
                      <Controller
                        name="bloodType"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            value={field.value ?? undefined}
                            options={BLOOD_TYPE_OPTIONS}
                            allowClear
                            placeholder="Select blood type"
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.CONTACT}>
                      <Controller
                        name="contact"
                        control={control}
                        render={({ field }) => <Input {...field} />}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.ADDRESS1}>
                      <Controller
                        name="address1"
                        control={control}
                        render={({ field }) => <Input {...field} />}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.ADDRESS2}>
                      <Controller
                        name="address2"
                        control={control}
                        render={({ field }) => <Input {...field} />}
                      />
                    </Form.Item>

                    <Form.Item
                      label={EMPLOYEE_LABEL.EMAIL}
                      validateStatus={errors.email ? "error" : ""}
                      help={errors.email?.message}
                    >
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="email"
                            placeholder="employee@example.com"
                            autoComplete="off"
                          />
                        )}
                      />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: "employment",
                label: "Employment Details",
                forceRender: true,
                children: (
                  <div className="form-grid-2" style={{ paddingTop: 16 }}>
                    <Form.Item label={EMPLOYEE_LABEL.EMPLOYEE_NO}>
                      <Controller
                        name="employeeNo"
                        control={control}
                        render={({ field }) => <Input {...field} />}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.BIO_ID}>
                      <Controller
                        name="bioId"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            className="w-full"
                            min={0}
                            placeholder=""
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.DEPARTMENT}>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        <Controller
                          name="departmentId"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={field.value ?? undefined}
                              onChange={(v) => {
                                field.onChange(v ?? null);
                                setValue("sectionId", null);
                              }}
                              options={departmentOptions}
                              loading={isRefLoading}
                              allowClear
                              showSearch
                              filterOption={filterByLabel}
                              placeholder="Select department"
                              style={{ flex: 1 }}
                            />
                          )}
                        />
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => setDeptModalOpen(true)}
                          title="Add new department"
                        />
                      </div>
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.SECTION}>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        <Controller
                          name="sectionId"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={field.value ?? undefined}
                              onChange={(v) => field.onChange(v ?? null)}
                              options={sectionOptions}
                              loading={isSectionsLoading}
                              allowClear
                              showSearch
                              filterOption={filterByLabel}
                              placeholder="Select section"
                              style={{ flex: 1 }}
                            />
                          )}
                        />
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => setSectionModalOpen(true)}
                          title="Add new section"
                        />
                      </div>
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.AREA}>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        <Controller
                          name="areaId"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={field.value ?? undefined}
                              onChange={(v) => field.onChange(v ?? null)}
                              options={areaOptions}
                              loading={isRefLoading}
                              allowClear
                              showSearch
                              filterOption={filterByLabel}
                              placeholder="Select project site"
                              style={{ flex: 1 }}
                            />
                          )}
                        />
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => setAreaModalOpen(true)}
                          title="Add new operation area"
                        />
                      </div>
                    </Form.Item>

                    <Form.Item
                      label={EMPLOYEE_LABEL.PAYROLL_GROUP}
                      required
                      validateStatus={errors.payrollGroupId ? "error" : ""}
                      help={errors.payrollGroupId?.message}
                    >
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        <Controller
                          name="payrollGroupId"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={field.value || undefined}
                              onChange={(v?: string) => field.onChange(v ?? "")}
                              options={payrollGroupOptions}
                              loading={isRefLoading}
                              allowClear
                              showSearch
                              filterOption={filterByLabel}
                              placeholder="Select payroll group"
                              style={{ flex: 1 }}
                            />
                          )}
                        />
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => setPgModalOpen(true)}
                          title="Add new payroll group"
                        />
                      </div>
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.CLIENT}>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        <Controller
                          name="clientId"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={field.value ?? undefined}
                              onChange={(v) => field.onChange(v ?? null)}
                              options={clientOptions}
                              loading={isClientsLoading}
                              allowClear
                              showSearch
                              filterOption={filterByLabel}
                              placeholder="Select client"
                              style={{ flex: 1 }}
                            />
                          )}
                        />
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => setClientModalOpen(true)}
                          title="Add new client"
                        />
                      </div>
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.BRANCH}>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        <Controller
                          name="branchId"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={field.value ?? undefined}
                              onChange={(v) => field.onChange(v ?? null)}
                              options={branchOptions}
                              loading={isBranchesLoading}
                              allowClear
                              showSearch
                              filterOption={filterByLabel}
                              placeholder="Select branch"
                              style={{ flex: 1 }}
                            />
                          )}
                        />
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => setBranchModalOpen(true)}
                          title="Add new branch"
                        />
                      </div>
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.POSITION}>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        <Controller
                          name="positionId"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={field.value ?? undefined}
                              onChange={(v) => field.onChange(v ?? null)}
                              options={positionOptions}
                              loading={isPositionsLoading}
                              allowClear
                              showSearch
                              filterOption={filterByLabel}
                              placeholder="Select position"
                              style={{ flex: 1 }}
                            />
                          )}
                        />
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => setPositionModalOpen(true)}
                          title="Add new position"
                        />
                      </div>
                    </Form.Item>

                    <Form.Item
                      label={EMPLOYEE_LABEL.JOB_LEVEL}
                      required
                      validateStatus={errors.jobLevel ? "error" : ""}
                      help={errors.jobLevel?.message}
                    >
                      <Controller
                        name="jobLevel"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            value={field.value ?? undefined}
                            options={JOB_LEVEL_OPTIONS}
                            placeholder="Select job level"
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.TIME_SHIFT}>
                      <Controller
                        name="timeShiftId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            value={field.value ?? undefined}
                            onChange={(v) => field.onChange(v ?? null)}
                            options={timeShiftOptions}
                            loading={isRefLoading}
                            allowClear
                            showSearch
                            filterOption={filterByLabel}
                            placeholder="Select time shift"
                            optionRender={(opt) => {
                              const o =
                                opt.data as (typeof timeShiftOptions)[number];
                              const isFixed = o.shiftType === "FIXED";
                              return (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <span style={{ fontWeight: 500 }}>
                                    {o.shiftName}
                                  </span>
                                  <span
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                      flexShrink: 0,
                                    }}
                                  >
                                    <span
                                      style={{ fontSize: 11, color: "#6b7280" }}
                                    >
                                      {formatShiftTime(o.startTime)} –{" "}
                                      {formatShiftTime(o.endTime)}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        padding: "1px 6px",
                                        borderRadius: 4,
                                        background: isFixed
                                          ? "#d1fae5"
                                          : "#ede9fe",
                                        color: isFixed ? "#065f46" : "#5b21b6",
                                      }}
                                    >
                                      {isFixed ? "Fixed" : "Split"}
                                    </span>
                                  </span>
                                </div>
                              );
                            }}
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      label={EMPLOYEE_LABEL.EMPLOYMENT_STATUS}
                      required
                      validateStatus={errors.employmentStatus ? "error" : ""}
                      help={errors.employmentStatus?.message}
                    >
                      <Controller
                        name="employmentStatus"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={EMPLOYMENT_STATUS_OPTIONS}
                            placeholder="Select status"
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.HIRING_ENTITY}>
                      <Controller
                        name="hiringEntity"
                        control={control}
                        render={({ field }) => <Input {...field} />}
                      />
                    </Form.Item>

                    <Form.Item
                      label={EMPLOYEE_LABEL.DATE_REGISTERED}
                      required
                      validateStatus={errors.dateRegistered ? "error" : ""}
                      help={errors.dateRegistered?.message}
                    >
                      <Controller
                        name="dateRegistered"
                        control={control}
                        render={({ field }) =>
                          datePicker(
                            field.value,
                            (v) => field.onChange(v ?? ""),
                            false,
                          )
                        }
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.HIRE_DATE}>
                      <Controller
                        name="hireDate"
                        control={control}
                        render={({ field }) =>
                          datePicker(field.value, field.onChange)
                        }
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.CONTRACT_START}>
                      <Controller
                        name="contractStart"
                        control={control}
                        render={({ field }) =>
                          datePicker(field.value, field.onChange)
                        }
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.CONTRACT_END}>
                      <Controller
                        name="contractEnd"
                        control={control}
                        render={({ field }) =>
                          datePicker(field.value, field.onChange)
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label={EMPLOYEE_LABEL.DATE_RESIGNED}
                      className="col-span-2"
                    >
                      <Controller
                        name="dateResigned"
                        control={control}
                        render={({ field }) =>
                          datePicker(field.value, field.onChange)
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label={EMPLOYEE_LABEL.REST_DAYS}
                      className="col-span-2"
                    >
                      <Controller
                        name="restDays"
                        control={control}
                        render={({ field }) => (
                          <Checkbox.Group
                            options={REST_DAY_OPTIONS}
                            value={field.value ?? []}
                            onChange={(checkedValues) =>
                              field.onChange(checkedValues as string[])
                            }
                            className="flex gap-4 flex-wrap"
                          />
                        )}
                      />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: "compensation",
                label: "Compensation",
                forceRender: true,
                children: (
                  <div className="form-grid-2" style={{ paddingTop: 16 }}>
                    <Form.Item
                      label={EMPLOYEE_LABEL.SALARY_TYPE}
                      required
                      validateStatus={errors.salaryType ? "error" : ""}
                      help={errors.salaryType?.message}
                    >
                      <Controller
                        name="salaryType"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} options={SALARY_TYPE_OPTIONS} />
                        )}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.MONTHLY_RATE}>
                      <Controller
                        name="monthlyRate"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            className="w-full"
                            min={0}
                            precision={2}
                            formatter={(v) =>
                              `₱ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.DAILY_RATE}>
                      <Controller
                        name="dailyRate"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            className="w-full"
                            min={0}
                            precision={2}
                            formatter={(v) =>
                              `₱ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.COLA}>
                      <Controller
                        name="cola"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            className="w-full"
                            min={0}
                            precision={2}
                            formatter={(v) =>
                              `₱ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      label={EMPLOYEE_LABEL.MODE_OF_PAYMENT}
                      required
                      validateStatus={errors.modeOfPayment ? "error" : ""}
                      help={errors.modeOfPayment?.message}
                    >
                      <Controller
                        name="modeOfPayment"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={MODE_OF_PAYMENT_OPTIONS}
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item label={EMPLOYEE_LABEL.BANK_NAME}>
                      <Controller
                        name="bankName"
                        control={control}
                        render={({ field }) => <Input {...field} />}
                      />
                    </Form.Item>

                    <Form.Item
                      label={EMPLOYEE_LABEL.BANK_NO}
                      className="col-span-2"
                    >
                      <Controller
                        name="bankNo"
                        control={control}
                        render={({ field }) => <Input {...field} />}
                      />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: "govids",
                label: "Gov't IDs & Rates",
                forceRender: true,
                children: (
                  <div className="pt-4 flex flex-col gap-3">
                    {/* SSS */}
                    <Card size="small" title="SSS">
                      <div className="form-grid-2">
                        <Form.Item label={EMPLOYEE_LABEL.SSS_NO}>
                          <Controller
                            name="sssNo"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                        </Form.Item>
                        <Form.Item label="Computation Basis">
                          <Controller
                            name="sssRate.computationType"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                options={COMPUTATION_BASIS_OPTIONS}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item label="EE Rate">
                          <Controller
                            name="sssRate.eE"
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                className="w-full"
                                min={0}
                                step={0.01}
                                precision={4}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item label="ER Rate">
                          <Controller
                            name="sssRate.eR"
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                className="w-full"
                                min={0}
                                step={0.01}
                                precision={4}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item label="EC">
                          <Controller
                            name="sssRate.eC"
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                className="w-full"
                                min={0}
                                step={0.01}
                                precision={4}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item label="Add-Ons">
                          <Controller
                            name="sssRate.addOns"
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                className="w-full"
                                min={0}
                                step={0.01}
                                precision={4}
                              />
                            )}
                          />
                        </Form.Item>
                      </div>
                    </Card>

                    {/* PhilHealth */}
                    <Card size="small" title="PhilHealth (PHIC)">
                      <div className="form-grid-2">
                        <Form.Item label={EMPLOYEE_LABEL.PHIC_NO}>
                          <Controller
                            name="phicNo"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                        </Form.Item>
                        <Form.Item label="Computation Basis">
                          <Controller
                            name="phicRate.computationType"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                options={COMPUTATION_BASIS_OPTIONS}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item label="EE Rate">
                          <Controller
                            name="phicRate.eE"
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                className="w-full"
                                min={0}
                                step={0.01}
                                precision={4}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item label="ER Rate">
                          <Controller
                            name="phicRate.eR"
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                className="w-full"
                                min={0}
                                step={0.01}
                                precision={4}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item label="Add-Ons" className="col-span-2">
                          <Controller
                            name="phicRate.addOns"
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                className="w-full"
                                min={0}
                                step={0.01}
                                precision={4}
                              />
                            )}
                          />
                        </Form.Item>
                      </div>
                    </Card>

                    {/* Pag-IBIG */}
                    <Card size="small" title="Pag-IBIG (HDMF)">
                      <div className="form-grid-2">
                        <Form.Item label={EMPLOYEE_LABEL.HDMF_NO}>
                          <Controller
                            name="hdmfNo"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                        </Form.Item>
                        <Form.Item label="Computation Basis">
                          <Controller
                            name="hdmfRate.computationType"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                options={COMPUTATION_BASIS_OPTIONS}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item label="EE Rate">
                          <Controller
                            name="hdmfRate.eE"
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                className="w-full"
                                min={0}
                                step={0.01}
                                precision={4}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item label="ER Rate">
                          <Controller
                            name="hdmfRate.eR"
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                className="w-full"
                                min={0}
                                step={0.01}
                                precision={4}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item label="Add-Ons" className="col-span-2">
                          <Controller
                            name="hdmfRate.addOns"
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                className="w-full"
                                min={0}
                                step={0.01}
                                precision={4}
                              />
                            )}
                          />
                        </Form.Item>
                      </div>
                    </Card>

                    {/* Tax / BIR */}
                    <Card size="small" title="Income Tax (BIR)">
                      <div className="form-grid-2">
                        <Form.Item label={EMPLOYEE_LABEL.TIN}>
                          <Controller
                            name="tin"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                        </Form.Item>
                        <Form.Item label="Computation Basis">
                          <Controller
                            name="taxRate.computationType"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                options={COMPUTATION_BASIS_OPTIONS}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item label="EE Rate">
                          <Controller
                            name="taxRate.eE"
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                className="w-full"
                                min={0}
                                step={0.01}
                                precision={4}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item label="Add-Ons">
                          <Controller
                            name="taxRate.addOns"
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                {...field}
                                className="w-full"
                                min={0}
                                step={0.01}
                                precision={4}
                              />
                            )}
                          />
                        </Form.Item>
                      </div>
                    </Card>
                  </div>
                ),
              },
              {
                key: "settings",
                label: "Eligibility",
                forceRender: true,
                children: (
                  <div style={{ paddingTop: 16, maxWidth: 480 }}>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span>Eligible for Overtime Pay</span>
                        <Controller
                          name="settings.isEligibleForOvertime"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value ?? false}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Eligible for Holiday Pay</span>
                        <Controller
                          name="settings.isEligibleForHolidayPay"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value ?? false}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Eligible for Night Differential Pay</span>
                        <Controller
                          name="settings.isEligibleForNightDifferential"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value ?? false}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Eligible for Leave Credits Pay</span>
                        <Controller
                          name="settings.isEligibleForLeaveCredits"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value ?? false}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Eligible for 13th Month Pay</span>
                        <Controller
                          name="settings.isEligibleFor13thMonth"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value ?? false}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "dependents",
                label: "Dependents",
                disabled: !isEdit,
                children: (
                  <div style={{ paddingTop: 16 }}>
                    <EmployeeDependentsTab employeeId={id} />
                  </div>
                ),
              },
              {
                key: "education",
                label: "Education",
                disabled: !isEdit,
                children: (
                  <div style={{ paddingTop: 16 }}>
                    <EmployeeEducationTab employeeId={id} />
                  </div>
                ),
              },
              {
                key: "skills",
                label: "Skills",
                disabled: !isEdit,
                children: (
                  <div style={{ paddingTop: 16 }}>
                    <EmployeeSkillsTab employeeId={id} />
                  </div>
                ),
              },
              {
                key: "employment-history",
                label: "Employment History",
                disabled: !isEdit,
                children: (
                  <div style={{ paddingTop: 16 }}>
                    <EmployeeEmploymentHistoryTab employeeId={id} />
                  </div>
                ),
              },
              {
                key: "doc-records",
                label: "Documents",
                disabled: !isEdit,
                children: (
                  <div style={{ paddingTop: 16 }}>
                    <EmployeeDocRecordsTab employeeId={id} />
                  </div>
                ),
              },
              {
                key: "assets",
                label: "Assets",
                disabled: !isEdit,
                children: (
                  <div style={{ paddingTop: 16 }}>
                    <EmployeeAssignAssetsTab employeeId={id} />
                  </div>
                ),
              },
            ]}
          />
        </Card>

        <div className="form-action-footer">
          <Space className="form-action-footer-row">
            <Button onClick={() => navigate({ to: "/setup/employee" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isRefLoading}
            >
              {NAVIGATION_BUTTON_LABEL.SAVE}
            </Button>
          </Space>
        </div>
      </Form>

      {isEdit && id && show201 && (
        <Suspense fallback={null}>
          <Employee201Modal
            employeeId={id}
            open={show201}
            onClose={() => setShow201(false)}
          />
        </Suspense>
      )}

      <QuickAddDepartmentModal
        open={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        onCreated={(id) => {
          setValue("departmentId", id);
          setValue("sectionId", null);
          setDeptModalOpen(false);
        }}
      />
      <QuickAddOperationAreaModal
        open={areaModalOpen}
        onClose={() => setAreaModalOpen(false)}
        onCreated={(id) => {
          setValue("areaId", id);
          setAreaModalOpen(false);
        }}
      />
      <QuickAddPayrollGroupModal
        open={pgModalOpen}
        onClose={() => setPgModalOpen(false)}
        onCreated={(id) => {
          setValue("payrollGroupId", id);
          setPgModalOpen(false);
        }}
      />
      <QuickAddClientModal
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onCreated={(id) => {
          setValue("clientId", id);
          setClientModalOpen(false);
        }}
      />
      <QuickAddSectionModal
        open={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        defaultDepartmentId={watchedDepartmentId}
        onCreated={(id) => {
          setValue("sectionId", id);
          setSectionModalOpen(false);
        }}
      />
      <QuickAddBranchModal
        open={branchModalOpen}
        onClose={() => setBranchModalOpen(false)}
        onCreated={(id) => {
          setValue("branchId", id);
          setBranchModalOpen(false);
        }}
      />
      <QuickAddPositionModal
        open={positionModalOpen}
        onClose={() => setPositionModalOpen(false)}
        onCreated={(id) => {
          setValue("positionId", id);
          setPositionModalOpen(false);
        }}
      />
    </div>
  );
}
