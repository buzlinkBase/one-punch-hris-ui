import { useEffect, useRef, useState } from "react";
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
  Divider,
  Radio,
  Tabs,
  Avatar,
  Tooltip,
  message,
} from "antd";
import {
  UserOutlined,
  CameraOutlined,
  PlusOutlined,
  PrinterOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import httpClient from "@/core/http/http-client";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";
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
  DAILY_RATE_MODE_OPTIONS,
  FACTOR_DAYS_OPTIONS,
  FACTOR_DAYS_GROUPS,
  FACTOR_DAYS_DEFAULT_FLAGS,
  MONTHLY_TOTAL_DAYS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  JOB_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  BLOOD_TYPE_OPTIONS,
  COMPUTATION_BASIS_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { isActiveStatus } from "@/shared/utils/status.util";
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
import { usePayrollInclusionDefaults } from "@/app/modules/setup/company-policy/hooks/use-payroll-inclusion-defaults-queries";
import QuickAddPayrollGroupModal from "../../components/quick-add-payroll-group-modal";
import QuickAddDepartmentModal from "../../components/quick-add-department-modal";
import QuickAddOperationAreaModal from "../../components/quick-add-operation-area-modal";
import QuickAddClientModal from "../../components/quick-add-client-modal";
import QuickAddSectionModal from "../../components/quick-add-section-modal";
import QuickAddBranchModal from "../../components/quick-add-branch-modal";
import QuickAddPositionModal from "../../components/quick-add-position-modal";
import QuickAddTimeShiftModal from "../../components/quick-add-time-shift-modal";
import EmployeeDependentsTab from "../../components/employee-dependents-tab";
import EmployeeEducationTab from "../../components/employee-education-tab";
import EmployeeFixedScheduleTab from "../../components/employee-fixed-schedule-tab";
import { useEmployeeFixedSchedule } from "@/app/modules/change-schedule/fixed-schedule/hooks/use-employee-fixed-schedule-queries";
import type { EmployeeFixedScheduleDayModel } from "../../models/api/response/employee-response.model";
import EmployeeSkillsTab from "../../components/employee-skills-tab";
import EmployeeDocRecordsTab from "../../components/employee-doc-records-tab";
import EmployeeEmploymentHistoryTab from "../../components/employee-employment-history-tab";
import EmployeeAssignAssetsTab from "../../components/employee-assign-assets-tab";

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

const computationBasisLabel = (
  <span>
    Computation Basis
    <Tooltip
      title={
        <div>
          <div>
            <strong>None</strong> — nothing gets deducted for this contribution.
          </div>
          <div className="mt-1">
            <strong>Fixed Per Payroll</strong> — the EE/ER amounts below are
            deducted in full every time payroll runs, no matter how often that
            is. Paid semi-monthly? It's deducted twice a month, not split in
            half.
          </div>
          <div className="mt-1">
            <strong>Fixed Monthly</strong> — the EE/ER amounts below are the
            total for the whole month. The system automatically divides that
            across however many payroll runs happen that month (e.g. split in
            half for semi-monthly).
          </div>
          <div className="mt-1">
            <strong>Table</strong> — the amounts below are ignored. The system
            looks up the correct amount from the official government
            contribution table instead, based on what the employee actually
            earns each period.
          </div>
        </div>
      }
      overlayStyle={{ maxWidth: 360 }}
    >
      <InfoCircleOutlined
        style={{ color: "#8c8c8c", fontSize: 13, marginLeft: 4 }}
      />
    </Tooltip>
  </span>
);

export default function EmployeeDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const formGridClass = isMobile ? "form-grid-1" : "form-grid-2";
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
  const { data: payrollInclusionDefaults } = usePayrollInclusionDefaults();

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

  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [pgModalOpen, setPgModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [positionModalOpen, setPositionModalOpen] = useState(false);
  const [timeShiftModalOpen, setTimeShiftModalOpen] = useState(false);

  const [fixedSchedule, setFixedSchedule] = useState<
    EmployeeFixedScheduleDayModel[]
  >([]);
  const { data: existingFixedSchedule, isFetching: isFetchingFixedSchedule } =
    useEmployeeFixedSchedule(id);
  const fixedScheduleLoaded = useRef(false);

  useEffect(() => {
    // With refetchOnMount: "always", `data` can be populated synchronously from a
    // stale cache entry while a background refetch is still in flight — wait for
    // isFetching to settle so the draft is seeded from the fresh result, not a
    // leftover value from a previous visit to this employee.
    if (
      isEdit &&
      existingFixedSchedule &&
      !isFetchingFixedSchedule &&
      !fixedScheduleLoaded.current
    ) {
      fixedScheduleLoaded.current = true;
      setFixedSchedule(
        existingFixedSchedule.map((s) => ({
          id: s.id,
          dayName: s.dayName,
          timeShiftId: s.timeShiftId,
        })),
      );
    }
  }, [isEdit, existingFixedSchedule, isFetchingFixedSchedule]);

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
      restDays: selectedDays.map((dayName) => ({
        dayName: dayName as DayName,
      })),
      fixedSchedule: fixedSchedule.map(({ dayName, timeShiftId }) => ({
        dayName,
        timeShiftId,
      })),
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
  const watchedSalaryType = useWatch({ control, name: "salaryType" });
  const watchedUseEmployeeOverride = useWatch({
    control,
    name: "useEmployeeOverride",
  });
  const watchedDailyRateMode = useWatch({ control, name: "dailyRateMode" });
  const watchedFactorDays = useWatch({ control, name: "factorDays" });
  const watchedUseActualMonthDays = useWatch({
    control,
    name: "useActualMonthDays",
  });
  const watchedMonthlyRate = useWatch({ control, name: "monthlyRate" });

  // Applies the Rest Day/Regular Holiday/Special Non-Working conventions baked into a
  // Factor Days denominator to the employee's own 3 inclusion toggles (Night Diff has no
  // Factor-Days convention, so it's left untouched). Reused by the Factor Days selects and
  // by "Use Employee-Specific Fixed Salary Inclusions" turning back on.
  const applyFactorDaysBooleanDefaults = (days: number | null | undefined) => {
    const defaults =
      days != null
        ? FACTOR_DAYS_DEFAULT_FLAGS[
            days as keyof typeof FACTOR_DAYS_DEFAULT_FLAGS
          ]
        : undefined;
    if (!defaults) return;
    setValue("isRestDayPaid", defaults.isRestDayPaid);
    setValue("isRegularHolidayIncluded", defaults.isRegularHolidayIncluded);
    setValue(
      "isSpecialNonWorkingIncluded",
      defaults.isSpecialNonWorkingIncluded,
    );
  };

  // Applies the company-wide Fixed Salary Defaults (Company Policy) to the employee's 4
  // inclusion toggles. Used when "Use Employee-Specific Fixed Salary Inclusions" turns off.
  const applyTenantInclusionDefaults = () => {
    setValue(
      "isRestDayPaid",
      payrollInclusionDefaults?.defaultRestDayPaid ?? false,
    );
    setValue(
      "isRegularHolidayIncluded",
      payrollInclusionDefaults?.defaultRegularHolidayIncluded ?? false,
    );
    setValue(
      "isSpecialNonWorkingIncluded",
      payrollInclusionDefaults?.defaultSpecialNonWorkingIncluded ?? false,
    );
    setValue(
      "isNightDiffIncluded",
      payrollInclusionDefaults?.defaultNightDiffIncluded ?? false,
    );
  };

  // Keep the 4 inclusion toggles showing the live company-wide Fixed Salary Defaults
  // whenever the override is off — covers the initial state (new employees default to
  // override-off) and existing employees loaded with their override already off, not
  // just the moment the switch is flipped.
  useEffect(() => {
    if (watchedUseEmployeeOverride) return;
    applyTenantInclusionDefaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedUseEmployeeOverride, payrollInclusionDefaults, setValue]);

  const sssComputationType = useWatch({
    control,
    name: "sssRate.computationType",
  });
  const phicComputationType = useWatch({
    control,
    name: "phicRate.computationType",
  });
  const hdmfComputationType = useWatch({
    control,
    name: "hdmfRate.computationType",
  });
  const taxComputationType = useWatch({
    control,
    name: "taxRate.computationType",
  });
  const isSSSRateDisabled =
    sssComputationType === "Table" || sssComputationType === "None";
  const isPHICRateDisabled =
    phicComputationType === "Table" || phicComputationType === "None";
  const isHDMFRateDisabled =
    hdmfComputationType === "Table" || hdmfComputationType === "None";
  const isTaxRateDisabled =
    taxComputationType === "Table" || taxComputationType === "None";

  const isCalculatedEDR =
    watchedSalaryType === "FIXED" && watchedDailyRateMode === "CalculatedEDR";
  const isMonthlyTotalDays =
    watchedSalaryType === "FIXED" &&
    watchedDailyRateMode === "MonthlyTotalDays";
  const isDailyRateComputed = isCalculatedEDR || isMonthlyTotalDays;

  // Keep Daily Rate in sync with the selected formula:
  // Calculated EDR:     (Monthly Rate * 12) / Factor Days — annual factor
  // Monthly Total Days: Monthly Rate / Factor Days (flat) — or / actual days in the
  //                     current calendar month when "Use Actual Days in Month" is on
  //                     (preview only; the payroll run resolves this per pay period).
  useEffect(() => {
    if (isCalculatedEDR && watchedFactorDays) {
      const computed = ((watchedMonthlyRate ?? 0) * 12) / watchedFactorDays;
      setValue("dailyRate", Math.round(computed * 100) / 100, {
        shouldDirty: true,
      });
    } else if (isMonthlyTotalDays && watchedUseActualMonthDays) {
      const computed = (watchedMonthlyRate ?? 0) / dayjs().daysInMonth();
      setValue("dailyRate", Math.round(computed * 100) / 100, {
        shouldDirty: true,
      });
    } else if (isMonthlyTotalDays && watchedFactorDays) {
      const computed = (watchedMonthlyRate ?? 0) / watchedFactorDays;
      setValue("dailyRate", Math.round(computed * 100) / 100, {
        shouldDirty: true,
      });
    }
  }, [
    isCalculatedEDR,
    isMonthlyTotalDays,
    watchedFactorDays,
    watchedUseActualMonthDays,
    watchedMonthlyRate,
    setValue,
  ]);

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

  const departmentOptions = departments
    .filter((d) => isActiveStatus(d.status))
    .map((d) => ({
      value: d.id,
      label: `${d.code} - ${d.name}`,
    }));
  const areaOptions = operationAreas
    .filter((a) => isActiveStatus(a.status))
    .map((a) => ({
      value: a.id,
      label: `${a.code} - ${a.name}`,
    }));
  const payrollGroupOptions = payrollGroups
    .filter((p) => isActiveStatus(p.status))
    .map((p) => ({
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

  const clientOptions = clients
    .filter((c) => isActiveStatus(c.status))
    .map((c) => ({
      value: c.id,
      label: `${c.code} - ${c.name}`,
    }));
  const branchOptions = branches
    .filter((b) => isActiveStatus(b.status))
    .map((b) => ({
      value: b.id,
      label: `${b.code} - ${b.name}`,
    }));
  const positionOptions = positions
    .filter((p) => isActiveStatus(p.status))
    .map((p) => ({
      value: p.id,
      label: `${p.code} - ${p.name}`,
    }));
  const sectionOptions = sections
    .filter(
      (s) =>
        isActiveStatus(s.status) &&
        (!watchedDepartmentId || s.departmentId === watchedDepartmentId),
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
                onClick={async () => {
                  // Open the tab synchronously (before the await) so popup blockers
                  // treat it as a direct response to the click.
                  const printTab = window.open("about:blank", "_blank");
                  try {
                    const blob = await httpClient.get<Blob>(
                      `${buildApiUrl(API_PREFIX.hrms, "employees")}/${id}/print-201`,
                      { responseType: "blob" },
                    );
                    const url = URL.createObjectURL(blob);
                    if (printTab) printTab.location.href = url;
                  } catch {
                    printTab?.close();
                    message.error(
                      "Failed to generate the 201 file. Please try again.",
                    );
                  }
                }}
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
          <div className="flex flex-wrap items-center gap-5">
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
            <div style={{ flex: "1 1 200px", minWidth: 180 }}>
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
                  <div className={formGridClass} style={{ paddingTop: 16 }}>
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
                  <div className={formGridClass} style={{ paddingTop: 16 }}>
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
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
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
                              style={{ flex: 1 }}
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
                                        style={{
                                          fontSize: 11,
                                          color: "#6b7280",
                                        }}
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
                                          color: isFixed
                                            ? "#065f46"
                                            : "#5b21b6",
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
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => setTimeShiftModalOpen(true)}
                          title="Add new time shift"
                        />
                      </div>
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
                  <div className={formGridClass} style={{ paddingTop: 16 }}>
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

                    <Form.Item
                      label={EMPLOYEE_LABEL.MONTHLY_RATE}
                      help={
                        watchedSalaryType === "VARIABLE"
                          ? "Not applicable for Variable salary"
                          : undefined
                      }
                    >
                      <Controller
                        name="monthlyRate"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            className="w-full"
                            min={0}
                            precision={2}
                            disabled={watchedSalaryType === "VARIABLE"}
                            formatter={(v) =>
                              `₱ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                          />
                        )}
                      />
                    </Form.Item>

                    {watchedSalaryType === "FIXED" && (
                      <Form.Item
                        label={EMPLOYEE_LABEL.DAILY_RATE_MODE}
                        className="col-span-2"
                      >
                        <Controller
                          name="dailyRateMode"
                          control={control}
                          render={({ field }) => (
                            <Radio.Group
                              value={field.value ?? "Manual"}
                              onChange={(e) => {
                                const newMode = e.target.value;
                                field.onChange(newMode);
                                if (newMode === "CalculatedEDR") {
                                  const isValid = FACTOR_DAYS_OPTIONS.some(
                                    (o) => o.value === watchedFactorDays,
                                  );
                                  if (!isValid) {
                                    setValue("factorDays", 252);
                                    if (watchedUseEmployeeOverride) {
                                      applyFactorDaysBooleanDefaults(252);
                                    }
                                  }
                                } else if (newMode === "MonthlyTotalDays") {
                                  const isValid =
                                    MONTHLY_TOTAL_DAYS_OPTIONS.some(
                                      (o) => o.value === watchedFactorDays,
                                    );
                                  if (!isValid) {
                                    setValue("factorDays", 26);
                                    if (watchedUseEmployeeOverride) {
                                      applyFactorDaysBooleanDefaults(26);
                                    }
                                  }
                                }
                              }}
                              options={DAILY_RATE_MODE_OPTIONS.map((o) =>
                                o.value === "CalculatedEDR"
                                  ? {
                                      ...o,
                                      label: (
                                        <Tooltip title="EDR = Equivalent Daily Rate. Divides the annualized monthly salary (Monthly Rate × 12) by the selected Factor Days to derive a standard daily rate.">
                                          <span>
                                            {o.label}{" "}
                                            <InfoCircleOutlined className="text-[11px] opacity-70" />
                                          </span>
                                        </Tooltip>
                                      ),
                                    }
                                  : o,
                              )}
                              optionType="button"
                            />
                          )}
                        />
                      </Form.Item>
                    )}

                    {isCalculatedEDR && (
                      <Form.Item label={EMPLOYEE_LABEL.FACTOR_DAYS}>
                        <Controller
                          name="factorDays"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={field.value ?? undefined}
                              onChange={(v) => {
                                field.onChange(v);
                                if (watchedUseEmployeeOverride) {
                                  applyFactorDaysBooleanDefaults(v);
                                }
                              }}
                              options={FACTOR_DAYS_GROUPS.map((g) => ({
                                label: g.group,
                                options: g.options.map((o) => ({
                                  value: o.value,
                                  label: o.label,
                                })),
                              }))}
                              showSearch
                              filterOption={(input, option) =>
                                typeof option?.label === "string" &&
                                option.label
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                              placeholder="Select factor days"
                            />
                          )}
                        />
                        {watchedFactorDays && (
                          <Text type="secondary" className="text-xs mt-1 block">
                            {
                              FACTOR_DAYS_OPTIONS.find(
                                (o) => o.value === watchedFactorDays,
                              )?.description
                            }
                          </Text>
                        )}
                      </Form.Item>
                    )}

                    {isMonthlyTotalDays && (
                      <Form.Item
                        label="Use Actual Days in Month"
                        className="col-span-2"
                      >
                        <Controller
                          name="useActualMonthDays"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value ?? false}
                              onChange={field.onChange}
                            />
                          )}
                        />
                        <Text type="secondary" className="text-xs mt-1 block">
                          Divides by the real number of days in each payroll
                          month (28–31), resolved per pay period, instead of a
                          fixed divisor below.
                        </Text>
                      </Form.Item>
                    )}

                    {isMonthlyTotalDays && !watchedUseActualMonthDays && (
                      <Form.Item label={EMPLOYEE_LABEL.FACTOR_DAYS}>
                        <Controller
                          name="factorDays"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={field.value ?? undefined}
                              onChange={(v) => {
                                field.onChange(v);
                                if (watchedUseEmployeeOverride) {
                                  applyFactorDaysBooleanDefaults(v);
                                }
                              }}
                              options={MONTHLY_TOTAL_DAYS_OPTIONS.map((o) => ({
                                value: o.value,
                                label: o.label,
                              }))}
                              placeholder="Select monthly divisor"
                            />
                          )}
                        />
                        {watchedFactorDays && (
                          <Text type="secondary" className="text-xs mt-1 block">
                            {
                              MONTHLY_TOTAL_DAYS_OPTIONS.find(
                                (o) => o.value === watchedFactorDays,
                              )?.description
                            }
                          </Text>
                        )}
                      </Form.Item>
                    )}

                    <Form.Item
                      label={EMPLOYEE_LABEL.DAILY_RATE}
                      help={
                        isCalculatedEDR
                          ? "Computed as (Monthly Rate × 12) / Factor Days"
                          : isMonthlyTotalDays && watchedUseActualMonthDays
                            ? "Computed as Monthly Rate / days in the payroll month (preview uses the current month)"
                            : isMonthlyTotalDays
                              ? "Computed as Monthly Rate / Factor Days"
                              : undefined
                      }
                    >
                      <Controller
                        name="dailyRate"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            className="w-full"
                            min={0}
                            precision={2}
                            disabled={isDailyRateComputed}
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

                    {watchedSalaryType === "FIXED" && (
                      <div className="col-span-2 flex flex-col gap-2 mb-2">
                        <Divider className="my-1!" />
                        <Text type="secondary" className="text-xs -mt-1">
                          Fixed monthly rate — indicate whether it already
                          covers these, so payroll doesn't add them again.
                          Toggling on pays only the differential premium above
                          the base rate; off pays the full rate multiplier.
                        </Text>
                        <div className="flex items-center justify-between max-w-120">
                          <span>{EMPLOYEE_LABEL.USE_EMPLOYEE_OVERRIDE}</span>
                          <Controller
                            name="useEmployeeOverride"
                            control={control}
                            render={({ field }) => (
                              <Switch
                                checked={field.value ?? true}
                                onChange={(checked) => {
                                  field.onChange(checked);
                                  if (checked) {
                                    applyFactorDaysBooleanDefaults(
                                      watchedFactorDays,
                                    );
                                  } else {
                                    applyTenantInclusionDefaults();
                                  }
                                }}
                              />
                            )}
                          />
                        </div>
                        <Text type="secondary" className="text-xs -mt-1">
                          When off, payroll uses the company-wide Fixed Salary
                          Defaults from Company Policy instead of the toggles
                          below.
                        </Text>
                        <div className="flex items-center justify-between max-w-120">
                          <span>Monthly Rate Includes Rest Day Pay</span>
                          <Controller
                            name="isRestDayPaid"
                            control={control}
                            render={({ field }) => (
                              <Switch
                                checked={field.value ?? false}
                                onChange={field.onChange}
                                disabled={!watchedUseEmployeeOverride}
                              />
                            )}
                          />
                        </div>
                        <div className="flex items-center justify-between max-w-120">
                          <span>Monthly Rate Includes Regular Holiday Pay</span>
                          <Controller
                            name="isRegularHolidayIncluded"
                            control={control}
                            render={({ field }) => (
                              <Switch
                                checked={field.value ?? false}
                                onChange={field.onChange}
                                disabled={!watchedUseEmployeeOverride}
                              />
                            )}
                          />
                        </div>
                        <div className="flex items-center justify-between max-w-120">
                          <span>
                            Monthly Rate Includes Special Non-Working Holiday
                            Pay
                          </span>
                          <Controller
                            name="isSpecialNonWorkingIncluded"
                            control={control}
                            render={({ field }) => (
                              <Switch
                                checked={field.value ?? false}
                                onChange={field.onChange}
                                disabled={!watchedUseEmployeeOverride}
                              />
                            )}
                          />
                        </div>
                        <div className="flex items-center justify-between max-w-120">
                          <span>Monthly Rate Includes Night Differential</span>
                          <Controller
                            name="isNightDiffIncluded"
                            control={control}
                            render={({ field }) => (
                              <Switch
                                checked={field.value ?? false}
                                onChange={field.onChange}
                                disabled={!watchedUseEmployeeOverride}
                              />
                            )}
                          />
                        </div>
                        <Divider className="my-1!" />
                      </div>
                    )}

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
                      <div className={formGridClass}>
                        <Form.Item label={EMPLOYEE_LABEL.SSS_NO}>
                          <Controller
                            name="sssNo"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                        </Form.Item>
                        <Form.Item label={computationBasisLabel}>
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
                                disabled={isSSSRateDisabled}
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
                                disabled={isSSSRateDisabled}
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
                                disabled={isSSSRateDisabled}
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
                                disabled={isSSSRateDisabled}
                              />
                            )}
                          />
                        </Form.Item>
                      </div>
                    </Card>

                    {/* PhilHealth */}
                    <Card size="small" title="PhilHealth (PHIC)">
                      <div className={formGridClass}>
                        <Form.Item label={EMPLOYEE_LABEL.PHIC_NO}>
                          <Controller
                            name="phicNo"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                        </Form.Item>
                        <Form.Item label={computationBasisLabel}>
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
                                disabled={isPHICRateDisabled}
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
                                disabled={isPHICRateDisabled}
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
                                disabled={isPHICRateDisabled}
                              />
                            )}
                          />
                        </Form.Item>
                      </div>
                    </Card>

                    {/* Pag-IBIG */}
                    <Card size="small" title="Pag-IBIG (HDMF)">
                      <div className={formGridClass}>
                        <Form.Item label={EMPLOYEE_LABEL.HDMF_NO}>
                          <Controller
                            name="hdmfNo"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                        </Form.Item>
                        <Form.Item label={computationBasisLabel}>
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
                                disabled={isHDMFRateDisabled}
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
                                disabled={isHDMFRateDisabled}
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
                                disabled={isHDMFRateDisabled}
                              />
                            )}
                          />
                        </Form.Item>
                      </div>
                    </Card>

                    {/* Tax / BIR */}
                    <Card size="small" title="Income Tax (BIR)">
                      <div className={formGridClass}>
                        <Form.Item label={EMPLOYEE_LABEL.TIN}>
                          <Controller
                            name="tin"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                        </Form.Item>
                        <Form.Item label={computationBasisLabel}>
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
                                disabled={isTaxRateDisabled}
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
                                disabled={isTaxRateDisabled}
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
                key: "fixedSchedule",
                label: "Fixed Schedule",
                children: (
                  <div style={{ paddingTop: 16 }}>
                    <EmployeeFixedScheduleTab
                      value={fixedSchedule}
                      onChange={setFixedSchedule}
                    />
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
      <QuickAddTimeShiftModal
        open={timeShiftModalOpen}
        onClose={() => setTimeShiftModalOpen(false)}
        onCreated={(id) => {
          setValue("timeShiftId", id);
          setTimeShiftModalOpen(false);
        }}
      />
    </div>
  );
}
