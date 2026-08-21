import { useEffect, useMemo } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  DatePicker,
  TimePicker,
  Typography,
  Space,
  Tag,
  Card,
  Descriptions,
  Radio,
  Alert,
  notification,
} from "antd";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  leaveApplicationFormSchema,
  type LeaveApplicationFormValues,
} from "../../models/forms/leave-application-form.schema";
import type { LeaveApplicationResponse } from "../../models/api/response/leave-application-response.model";
import {
  useLeaveApplication,
  useCreateLeaveApplication,
  useUpdateLeaveApplication,
} from "../../hooks/use-leave-application-queries";
import { useLeaveTypes } from "@/app/modules/setup/leave-type/hooks/use-leave-type-queries";
import { useEmployee } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { LEAVE_APPLICATION_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;
const { TextArea } = Input;

const ALL_DURATION_MODE_OPTIONS = [
  { label: "Single Day", value: "singleday" },
  { label: "Multi-Day Range", value: "multiday" },
  { label: "Partial Day / Hourly", value: "partial" },
];

const ALL_DAY_FRACTION_OPTIONS = [
  { label: "Full Day", value: "fullday" },
  { label: "AM Half", value: "am" },
  { label: "PM Half", value: "pm" },
];

const PARTIAL_MODE_OPTIONS = [
  { label: "Time Range", value: "timerange" },
  { label: "Hours Only", value: "hours" },
];

const PAY_TYPE_OPTIONS = [
  { value: "WithPay", label: "With Pay" },
  { value: "WithoutPay", label: "Without Pay" },
];

const APPROVAL_STATUS_OPTIONS = [
  { value: "ForApproval", label: "For Approval" },
  { value: "Approved", label: "Approved" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Declined", label: "Declined" },
];

const STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Cancelled: "default",
  Declined: "error",
};

const PAY_SOURCE_COLOR: Record<string, string> = {
  Company: "blue",
  Government: "green",
  Shared: "cyan",
  Unpaid: "default",
  Other: "orange",
};

const PAY_SOURCE_LABEL: Record<string, string> = {
  Company: "Company (employer-funded)",
  Government: "Government (SSS / GSIS)",
  Shared: "Shared (employer advances, government reimburses)",
  Unpaid: "Unpaid (no pay)",
  Other: "Other",
};

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

function isCrossMidnight(start: string, end: string): boolean {
  return !!start && !!end && end < start;
}

function buildStartDateTime(date: string, time: string): string {
  if (!date || !time) return "";
  return dayjs(`${date}T${time}`).format("YYYY-MM-DDTHH:mm:ss");
}

function buildEndDateTime(
  _startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
): string {
  const end = dayjs(`${endDate}T${endTime}`);
  const adjusted = endTime < startTime ? end.add(1, "day") : end;
  return adjusted.format("YYYY-MM-DDTHH:mm:ss");
}

function countBusinessDays(from: string, to: string): number {
  if (!from || !to) return 0;
  let count = 0;
  let current = dayjs(from);
  const end = dayjs(to);
  while (!current.isAfter(end)) {
    const dow = current.day();
    if (dow !== 0 && dow !== 6) count++;
    current = current.add(1, "day");
  }
  return count;
}

function parseDurationType(
  raw: string | undefined,
): "singleday" | "multiday" | "partial" | undefined {
  if (raw === "SingleDay") return "singleday";
  if (raw === "MultiDay") return "multiday";
  if (raw === "Partial") return "partial";
  return undefined;
}

function deriveEditState(r: LeaveApplicationResponse): {
  mode: "singleday" | "multiday" | "partial";
  dayFraction: "fullday" | "am" | "pm";
  partialMode: "timerange" | "hours";
} {
  const mode: "singleday" | "multiday" | "partial" =
    parseDurationType(r.durationType) ??
    (r.leaveDateFrom !== r.leaveDateTo
      ? "multiday"
      : r.dayFraction === "AM" || r.dayFraction === "PM"
        ? "singleday"
        : r.startTime || r.endTime || r.isManualEntry
          ? "partial"
          : "singleday");

  let dayFraction: "fullday" | "am" | "pm" = "fullday";
  if (mode === "singleday") {
    if (r.dayFraction === "AM") dayFraction = "am";
    else if (r.dayFraction === "PM") dayFraction = "pm";
  }

  const partialMode: "timerange" | "hours" = r.isManualEntry
    ? "hours"
    : "timerange";

  return { mode, dayFraction, partialMode };
}

export default function LeaveApplicationDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = useLeaveApplication(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } =
    useCreateLeaveApplication();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateLeaveApplication();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const { data: employees = [] } = useEmployeeFilter();

  const leaveTypeOptions = leaveTypes.map((l) => ({
    value: l.id,
    label: `${l.code} - ${l.description}`,
  }));

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LeaveApplicationFormValues>({
    resolver: zodResolver(leaveApplicationFormSchema),
    defaultValues: {
      employeeId: "",
      leaveId: "",
      mode: "singleday",
      leaveDate: "",
      dayFraction: "fullday",
      leaveDateFrom: "",
      leaveDateTo: "",
      partialMode: "timerange",
      startTime: "",
      endTime: "",
      totalHours: undefined,
      payType: "WithPay",
      applicationRemarks: "",
      supportingDocumentUrl: "",
      approvalStatus: "ForApproval",
    },
  });

  const mode = useWatch({ control, name: "mode" });
  const partialMode = useWatch({ control, name: "partialMode" });
  const leaveDate = useWatch({ control, name: "leaveDate" });
  const leaveDateFrom = useWatch({ control, name: "leaveDateFrom" });
  const leaveDateTo = useWatch({ control, name: "leaveDateTo" });
  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });
  const leaveId = useWatch({ control, name: "leaveId" });
  const dayFraction = useWatch({ control, name: "dayFraction" });
  const employeeId = useWatch({ control, name: "employeeId" });

  const { data: employee } = useEmployee(employeeId || undefined);

  const policy = useMemo(
    () => leaveTypes.find((l) => l.id === leaveId) ?? null,
    [leaveTypes, leaveId],
  );

  const minServiceError = useMemo(() => {
    if (!policy || !employee) return null;
    const required = policy.minServiceMonths ?? 0;
    if (required === 0) return null;
    if (!employee.hireDate) return null;
    const effectiveDate = mode === "multiday" ? leaveDateFrom : leaveDate;
    const checkDate = effectiveDate ? dayjs(effectiveDate) : dayjs();
    const monthsServed = checkDate.diff(dayjs(employee.hireDate), "month");
    if (monthsServed < required) {
      return `${employee.firstName} ${employee.lastName} has ${monthsServed} month${monthsServed !== 1 ? "s" : ""} of service. This leave type requires at least ${required} month${required !== 1 ? "s" : ""}.`;
    }
    return null;
  }, [policy, employee, mode, leaveDate, leaveDateFrom]);

  // Filter duration modes based on policy
  const durationModeOptions = useMemo(() => {
    if (!policy) return ALL_DURATION_MODE_OPTIONS;
    return ALL_DURATION_MODE_OPTIONS.filter(
      (o) => o.value !== "partial" || policy.allowPartial,
    );
  }, [policy]);

  // Filter day fraction options based on policy
  const dayFractionOptions = useMemo(() => {
    if (!policy || policy.allowHalfDay) return ALL_DAY_FRACTION_OPTIONS;
    return ALL_DAY_FRACTION_OPTIONS.map((o) => ({
      ...o,
      disabled: o.value === "am" || o.value === "pm",
    }));
  }, [policy]);

  const clearEntryFields = () => {
    setValue("leaveDate", "");
    setValue("dayFraction", "fullday");
    setValue("leaveDateFrom", "");
    setValue("leaveDateTo", "");
    setValue("partialMode", "timerange");
    setValue("startTime", "");
    setValue("endTime", "");
    setValue("totalHours", undefined);
  };

  // If selected mode becomes unavailable after policy load, reset to singleday
  useEffect(() => {
    if (policy && mode === "partial" && !policy.allowPartial) {
      setValue("mode", "singleday");
      clearEntryFields();
    }
    if (
      policy &&
      !policy.allowHalfDay &&
      (dayFraction === "am" || dayFraction === "pm")
    ) {
      setValue("dayFraction", "fullday");
    }
  }, [policy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isEdit && selected) {
      const {
        mode: editMode,
        dayFraction,
        partialMode: pMode,
      } = deriveEditState(selected);
      reset({
        employeeId: selected.employeeId,
        leaveId: selected.leaveId,
        mode: editMode,
        leaveDate: editMode !== "multiday" ? selected.leaveDateFrom : "",
        dayFraction,
        leaveDateFrom: editMode === "multiday" ? selected.leaveDateFrom : "",
        leaveDateTo: editMode === "multiday" ? selected.leaveDateTo : "",
        partialMode: pMode,
        startTime:
          editMode === "partial" && pMode === "timerange" && selected.startTime
            ? dayjs(selected.startTime).format("HH:mm:ss")
            : "",
        endTime:
          editMode === "partial" && pMode === "timerange" && selected.endTime
            ? dayjs(selected.endTime).format("HH:mm:ss")
            : "",
        totalHours:
          editMode === "partial" &&
          pMode === "hours" &&
          selected.totalMinutes != null
            ? selected.totalMinutes / 60
            : undefined,
        payType: selected.payType ?? "WithPay",
        applicationRemarks: selected.applicationRemarks ?? "",
        supportingDocumentUrl: selected.supportingDocumentUrl ?? "",
        approvalStatus: selected.approvalStatus,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: LeaveApplicationFormValues) => {
    if (minServiceError) {
      notification.error({
        message: "Minimum Service Requirement Not Met",
        description: minServiceError,
        placement: "topRight",
      });
      return;
    }
    const isMultiDay = values.mode === "multiday";
    const dateFrom = isMultiDay ? values.leaveDateFrom! : values.leaveDate!;
    const dateTo = isMultiDay ? values.leaveDateTo! : values.leaveDate!;

    const durationType: "SingleDay" | "MultiDay" | "Partial" =
      values.mode === "multiday"
        ? "MultiDay"
        : values.mode === "partial"
          ? "Partial"
          : "SingleDay";

    let dayFractionPayload: "FullDay" | "AM" | "PM" = "FullDay";
    if (values.mode === "singleday") {
      if (values.dayFraction === "am") dayFractionPayload = "AM";
      else if (values.dayFraction === "pm") dayFractionPayload = "PM";
    }

    let timePayload: {
      isManualEntry: boolean;
      startTime?: string | null;
      endTime?: string | null;
      totalMinutes?: number | null;
    };

    const pMode = values.partialMode ?? "timerange";
    if (values.mode === "partial" && pMode === "timerange") {
      timePayload = {
        isManualEntry: false,
        startTime: buildStartDateTime(dateFrom, values.startTime ?? ""),
        endTime: buildEndDateTime(
          dateFrom,
          dateTo,
          values.startTime ?? "",
          values.endTime ?? "",
        ),
        totalMinutes: null,
      };
    } else if (values.mode === "partial" && pMode === "hours") {
      timePayload = {
        isManualEntry: true,
        startTime: null,
        endTime: null,
        totalMinutes: Math.round((values.totalHours ?? 0) * 60),
      };
    } else {
      timePayload = {
        isManualEntry: false,
        startTime: null,
        endTime: null,
        totalMinutes: null,
      };
    }

    const basePayload = {
      employeeId: values.employeeId,
      leaveId: values.leaveId,
      durationType,
      leaveDateFrom: dateFrom,
      leaveDateTo: dateTo,
      dayFraction: dayFractionPayload,
      payType: values.payType,
      applicationRemarks: values.applicationRemarks,
      supportingDocumentUrl: values.supportingDocumentUrl || undefined,
      ...timePayload,
    };

    if (isEdit && id) {
      await update({
        id,
        approvalStatus: values.approvalStatus,
        ...basePayload,
      });
    } else {
      await add(basePayload);
    }
    navigate({ to: "/applications/leave" });
  };

  const crossMidnight =
    mode === "partial" &&
    partialMode === "timerange" &&
    isCrossMidnight(startTime ?? "", endTime ?? "");

  const businessDays =
    mode === "multiday"
      ? countBusinessDays(leaveDateFrom ?? "", leaveDateTo ?? "")
      : 0;

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? LEAVE_APPLICATION_LABEL.EDIT_TITLE
                : LEAVE_APPLICATION_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              File a leave request against an approved leave type.
            </p>
          </div>
          <Space>
            {isEdit && selected ? (
              <Tag color={STATUS_COLOR[selected.approvalStatus] ?? "default"}>
                {selected.approvalStatus === "ForApproval"
                  ? "For Approval"
                  : selected.approvalStatus}
              </Tag>
            ) : (
              <Tag color="success">New Record</Tag>
            )}
            <Button onClick={() => navigate({ to: "/applications/leave" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        {isEdit && selected && (
          <Card size="small" className="mb-4">
            <Descriptions size="small" column={3}>
              <Descriptions.Item label="Status">
                <Tag color={STATUS_COLOR[selected.approvalStatus] ?? "default"}>
                  {selected.approvalStatus === "ForApproval"
                    ? "For Approval"
                    : selected.approvalStatus}
                </Tag>
              </Descriptions.Item>
              {selected.reviewedOn && (
                <Descriptions.Item label={LEAVE_APPLICATION_LABEL.REVIEWED_ON}>
                  {dayjs(selected.reviewedOn).format("MMM DD, YYYY")}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <div className="form-grid-2">
            <Form.Item
              label={LEAVE_APPLICATION_LABEL.EMPLOYEE}
              validateStatus={errors.employeeId ? "error" : ""}
              help={errors.employeeId?.message}
            >
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder="Select employee"
                    options={employeeOptions}
                    filterOption={filterOption}
                    value={field.value || undefined}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={LEAVE_APPLICATION_LABEL.LEAVE_TYPE}
              validateStatus={errors.leaveId ? "error" : ""}
              help={errors.leaveId?.message}
            >
              <Controller
                name="leaveId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder="Select leave type"
                    options={leaveTypeOptions}
                    filterOption={filterOption}
                    value={field.value || undefined}
                  />
                )}
              />
            </Form.Item>
          </div>

          {/* Policy info panel */}
          {policy && (
            <Card
              size="small"
              className="mb-4"
              style={{
                background: "var(--ant-color-bg-container-disabled, #fafafa)",
              }}
            >
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                <span>
                  <Tag
                    color={PAY_SOURCE_COLOR[policy.paySource] ?? "default"}
                    style={{ fontSize: 11 }}
                  >
                    {PAY_SOURCE_LABEL[policy.paySource] ?? policy.paySource}
                  </Tag>
                  {policy.isStatutory && (
                    <Tag color="gold" style={{ fontSize: 11 }}>
                      Statutory
                    </Tag>
                  )}
                </span>
                {policy.credits > 0 && (
                  <span>
                    <CalendarOutlined className="mr-1" />
                    {policy.credits} credit{policy.credits !== 1 ? "s" : ""}
                  </span>
                )}
                {policy.maxDaysPerYear != null && (
                  <span>
                    <ClockCircleOutlined className="mr-1" />
                    Max {policy.maxDaysPerYear} day
                    {policy.maxDaysPerYear !== 1 ? "s" : ""}/year
                  </span>
                )}
                {policy.maxConsecutiveDays != null && (
                  <span>
                    <ClockCircleOutlined className="mr-1" />
                    Max {policy.maxConsecutiveDays} consecutive day
                    {policy.maxConsecutiveDays !== 1 ? "s" : ""}
                  </span>
                )}
                {policy.minServiceMonths > 0 && (
                  <span>
                    <UserOutlined className="mr-1" />
                    Requires {policy.minServiceMonths} mo. service
                  </span>
                )}
                {policy.genderRestriction !== "None" && (
                  <span style={{ color: "#d48806" }}>
                    <ExclamationCircleOutlined className="mr-1" />
                    {policy.genderRestriction === "MaleOnly"
                      ? "Male only"
                      : "Female only"}
                  </span>
                )}
                {!policy.allowHalfDay && (
                  <span style={{ color: "#8c8c8c" }}>Half-day not allowed</span>
                )}
                {!policy.allowPartial && (
                  <span style={{ color: "#8c8c8c" }}>
                    Partial/hourly not allowed
                  </span>
                )}
              </div>

              {policy.requiresSupportingDocument && (
                <Alert
                  type="warning"
                  showIcon
                  banner
                  message="Supporting document required for this leave type"
                  className="mt-2"
                  style={{ fontSize: 12 }}
                />
              )}
            </Card>
          )}

          {minServiceError && (
            <Alert
              type="error"
              showIcon
              message="Minimum Service Requirement Not Met"
              description={minServiceError}
              className="mb-4"
            />
          )}

          <Form.Item label="Duration Type">
            <Controller
              name="mode"
              control={control}
              render={({ field }) => (
                <Radio.Group
                  {...field}
                  options={durationModeOptions}
                  optionType="button"
                  buttonStyle="solid"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    clearEntryFields();
                  }}
                />
              )}
            />
          </Form.Item>

          {/* Single Day */}
          {mode === "singleday" && (
            <div className="form-grid-2" style={{ maxWidth: 520 }}>
              <Form.Item
                label="Leave Date"
                validateStatus={errors.leaveDate ? "error" : ""}
                help={errors.leaveDate?.message}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  value={leaveDate ? dayjs(leaveDate) : null}
                  onChange={(d) =>
                    setValue("leaveDate", d?.format("YYYY-MM-DD") ?? "")
                  }
                />
              </Form.Item>
              <Form.Item
                label="Day Fraction"
                validateStatus={errors.dayFraction ? "error" : ""}
                help={errors.dayFraction?.message}
              >
                <Controller
                  name="dayFraction"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group
                      {...field}
                      options={dayFractionOptions}
                      optionType="button"
                    />
                  )}
                />
              </Form.Item>
            </div>
          )}

          {/* Multi-Day Range */}
          {mode === "multiday" && (
            <Form.Item
              label="Leave Date Range"
              validateStatus={
                errors.leaveDateFrom || errors.leaveDateTo ? "error" : ""
              }
              help={
                errors.leaveDateFrom?.message ?? errors.leaveDateTo?.message
              }
              style={{ maxWidth: 420 }}
            >
              <DatePicker.RangePicker
                style={{ width: "100%" }}
                value={
                  leaveDateFrom && leaveDateTo
                    ? [dayjs(leaveDateFrom), dayjs(leaveDateTo)]
                    : null
                }
                onChange={(dates) => {
                  setValue(
                    "leaveDateFrom",
                    dates?.[0]?.format("YYYY-MM-DD") ?? "",
                  );
                  setValue(
                    "leaveDateTo",
                    dates?.[1]?.format("YYYY-MM-DD") ?? "",
                  );
                }}
              />
              {leaveDateFrom && leaveDateTo && (
                <div className="mt-1 text-xs text-gray-500">
                  {businessDays} business day{businessDays !== 1 ? "s" : ""}
                </div>
              )}
            </Form.Item>
          )}

          {/* Partial Day / Hourly */}
          {mode === "partial" && (
            <div className="rounded-lg border border-blue-100 bg-blue-50/40 px-4 pt-4 pb-1 mb-6">
              <Form.Item label="Entry Method">
                <Controller
                  name="partialMode"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group
                      {...field}
                      options={PARTIAL_MODE_OPTIONS}
                      optionType="button"
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setValue("startTime", "");
                        setValue("endTime", "");
                        setValue("totalHours", undefined);
                      }}
                    />
                  )}
                />
              </Form.Item>

              {partialMode === "hours" ? (
                <div className="form-grid-2" style={{ maxWidth: 480 }}>
                  <Form.Item
                    label="Leave Date"
                    validateStatus={errors.leaveDate ? "error" : ""}
                    help={errors.leaveDate?.message}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      value={leaveDate ? dayjs(leaveDate) : null}
                      onChange={(d) =>
                        setValue("leaveDate", d?.format("YYYY-MM-DD") ?? "")
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    label="Total Hours"
                    validateStatus={errors.totalHours ? "error" : ""}
                    help={errors.totalHours?.message}
                  >
                    <Controller
                      name="totalHours"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          style={{ width: "100%" }}
                          min={0.25}
                          max={999}
                          step={0.25}
                          precision={2}
                          addonAfter="hrs"
                          placeholder="e.g. 4"
                          onChange={(val) => field.onChange(val ?? undefined)}
                        />
                      )}
                    />
                  </Form.Item>
                </div>
              ) : (
                <div className="form-grid-3">
                  <Form.Item
                    label="Leave Date"
                    validateStatus={errors.leaveDate ? "error" : ""}
                    help={errors.leaveDate?.message}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      value={leaveDate ? dayjs(leaveDate) : null}
                      onChange={(d) =>
                        setValue("leaveDate", d?.format("YYYY-MM-DD") ?? "")
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    label="Start Time"
                    validateStatus={errors.startTime ? "error" : ""}
                    help={errors.startTime?.message}
                  >
                    <TimePicker
                      style={{ width: "100%" }}
                      use12Hours
                      format="hh:mm A"
                      value={startTime ? dayjs(startTime, "HH:mm:ss") : null}
                      onChange={(t) =>
                        setValue("startTime", t?.format("HH:mm:ss") ?? "")
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    label={
                      <span className="flex items-center gap-2">
                        End Time
                        {crossMidnight && (
                          <Tag
                            color="blue"
                            className="text-[11px] leading-none"
                          >
                            +1 day
                          </Tag>
                        )}
                      </span>
                    }
                    validateStatus={errors.endTime ? "error" : ""}
                    help={errors.endTime?.message}
                  >
                    <TimePicker
                      style={{ width: "100%" }}
                      use12Hours
                      format="hh:mm A"
                      value={endTime ? dayjs(endTime, "HH:mm:ss") : null}
                      onChange={(t) =>
                        setValue("endTime", t?.format("HH:mm:ss") ?? "")
                      }
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          )}

          <div className="form-grid-4">
            <Form.Item
              label={LEAVE_APPLICATION_LABEL.PAY_TYPE}
              validateStatus={errors.payType ? "error" : ""}
              help={errors.payType?.message}
            >
              <Controller
                name="payType"
                control={control}
                render={({ field }) => (
                  <Select {...field} options={PAY_TYPE_OPTIONS} />
                )}
              />
            </Form.Item>

            <Form.Item label={LEAVE_APPLICATION_LABEL.STATUS}>
              <Controller
                name="approvalStatus"
                control={control}
                render={({ field }) => (
                  <Select {...field} options={APPROVAL_STATUS_OPTIONS} />
                )}
              />
            </Form.Item>
          </div>

          <Form.Item
            label={LEAVE_APPLICATION_LABEL.REMARKS}
            validateStatus={errors.applicationRemarks ? "error" : ""}
            help={errors.applicationRemarks?.message}
          >
            <Controller
              name="applicationRemarks"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  rows={3}
                  placeholder="State the reason for your leave (e.g. medical, vacation, family)"
                />
              )}
            />
          </Form.Item>

          {policy?.requiresSupportingDocument && (
            <Form.Item
              label={
                <span className="flex items-center gap-1">
                  <FileTextOutlined />
                  Supporting Document URL
                </span>
              }
              validateStatus={errors.supportingDocumentUrl ? "error" : ""}
              help={errors.supportingDocumentUrl?.message}
            >
              <Controller
                name="supportingDocumentUrl"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Paste a link to the uploaded supporting document"
                    allowClear
                  />
                )}
              />
            </Form.Item>
          )}

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/applications/leave" })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreating || isUpdating}
              >
                {NAVIGATION_BUTTON_LABEL.SAVE}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}
