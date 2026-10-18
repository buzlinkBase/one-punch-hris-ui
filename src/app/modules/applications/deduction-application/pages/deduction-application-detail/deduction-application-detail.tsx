import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import dayjs from "dayjs";
import {
  useCreateDeductionApplication,
  useDeductionApplication,
  useUpdateDeductionApplication,
} from "../../hooks/use-deduction-application-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { useDeductions } from "@/app/modules/setup/deduction/hooks/use-deduction-queries";
import {
  deductionApplicationAdminFormSchema,
  type DeductionApplicationAdminFormValues,
} from "../../models/forms/deduction-application-form.schema";
import type { DeductionRuleFields } from "../../models/api/request/create-deduction-application.model";
import {
  DEDUCTION_APPLICATION_LABEL,
  FREQUENCY_OPTIONS,
  ON_MISS_OPTIONS,
  PAY_MODE_OPTIONS,
  PERIODIC_FREQUENCY_OPTIONS,
} from "../../constants/label.const";
import {
  ALL_DAY_TYPE_BITS,
  ALL_WEEKDAY_BITS,
  SKIP_REASON_LABEL,
} from "@/shared/constants/attendance-rule.const";
import {
  AttendanceRuleFields,
  type AttendanceRuleFormValues,
} from "@/shared/components/attendance-rule-fields/attendance-rule-fields";
import { PayModeSelector } from "@/shared/components/pay-mode-selector/pay-mode-selector";
import { describeAttendanceRule } from "@/shared/utils/describe-attendance-rule.util";
import {
  bitsToMask,
  generateOtherIncomeSchedule,
  maskToBits,
} from "@/shared/utils/other-income-schedule.util";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { isActiveStatus } from "@/shared/utils/status.util";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalTimeline } from "@/shared/components/approval-timeline/approval-timeline";
import { ApprovalStatusField } from "@/shared/components/approval-status-field";
import { ApprovalRestartNotice } from "@/shared/components/approval-restart-notice";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import {
  generateLoanBreakdown,
  loanBreakdownColumns,
  recomputeLoanBalances,
  type LoanBreakdownRow,
} from "@/shared/utils/loan-amortization.util";
import {
  ScheduleRowActions,
  type ScheduleRowHandlers,
} from "@/shared/components/schedule-row-actions/schedule-row-actions";
import {
  ScheduleRowEditModal,
  type ScheduleRowEditValue,
} from "@/shared/components/schedule-row-edit-modal/schedule-row-edit-modal";
import { GenerateScheduleButton } from "@/shared/components/generate-schedule-button/generate-schedule-button";
import {
  removeRowAt,
  sortAndRenumber,
  updateRowAt,
} from "@/shared/utils/schedule-edit.util";

const { Title } = Typography;

// An amortization row, plus what an attendance-based row also carries.
type BreakdownRow = LoanBreakdownRow & {
  periodStart?: string;
  periodEnd?: string;
  // From the stored row: how payroll has treated it so far.
  stored?: boolean;
  status?: string;
  isSkipped?: boolean;
  isDeferred?: boolean;
  skipReason?: string | null;
};

const ALL_WEEKDAYS_MASK = bitsToMask(ALL_WEEKDAY_BITS);
const ALL_DAY_TYPES_MASK = bitsToMask(ALL_DAY_TYPE_BITS);

function formatAmount(value: number): string {
  return (value ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

function toDateOnly(value?: string | null): string {
  return value?.replace(/Z$/, "").split("T")[0] ?? "";
}

// Payroll has already deducted, skipped or held back this row, so it can't be changed or removed.
function isLockedRow(r: BreakdownRow): boolean {
  return !!r.stored && (r.status === "Paid" || !!r.isSkipped || !!r.isDeferred);
}

function actionsColumn(
  actions: ScheduleRowHandlers<BreakdownRow>,
): ColumnsType<BreakdownRow>[number] {
  return {
    title: "Actions",
    key: "actions",
    width: 100,
    align: "center",
    render: (_, r) => (
      <ScheduleRowActions
        locked={isLockedRow(r)}
        onEdit={() => actions.onEdit(r)}
        onRemove={() => actions.onRemove(r)}
      />
    ),
  };
}

// Columns of an attendance-based schedule: no principal / interest / running balance, but the
// attendance window of a periodic row and how payroll has treated each one so far.
function attendanceColumns(
  isPeriodic: boolean,
  hasStatus: boolean,
  actions: ScheduleRowHandlers<BreakdownRow> | null,
): ColumnsType<BreakdownRow> {
  const columns: ColumnsType<BreakdownRow> = [
    {
      title: "#",
      dataIndex: "period",
      key: "period",
      width: 50,
      align: "center",
    },
    {
      title: isPeriodic ? "Taken On" : "Date",
      dataIndex: "date",
      key: "date",
      width: 140,
    },
  ];
  if (isPeriodic) {
    columns.push({
      title: "Attendance Period",
      key: "window",
      render: (_, r) =>
        r.periodStart && r.periodEnd
          ? `${r.periodStart} to ${r.periodEnd}`
          : "—",
    });
  }
  columns.push({
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    align: "right",
    render: (v: number) => formatAmount(v),
  });
  if (hasStatus) {
    columns.push({
      title: "Status",
      key: "status",
      width: 260,
      render: (_, r) => {
        if (!r.stored) return <Tag>Not saved</Tag>;
        const reason = r.skipReason
          ? ` — ${SKIP_REASON_LABEL[r.skipReason] ?? r.skipReason}`
          : "";
        if (r.isSkipped) return <Tag color="orange">Skipped{reason}</Tag>;
        if (r.isDeferred) return <Tag color="gold">Held back{reason}</Tag>;
        return r.status === "Paid" ? (
          <Tag color="green">Deducted</Tag>
        ) : (
          <Tag>Pending</Tag>
        );
      },
    });
  }
  if (actions) columns.push(actionsColumn(actions));
  return columns;
}

// What the API stores for the rule. A fixed schedule carries no attendance rule at all.
function buildRuleFields(
  values: DeductionApplicationAdminFormValues,
): DeductionRuleFields {
  if (values.payMode === "FixedSchedule") {
    return {
      payMode: values.payMode,
      attendanceBasis: "None",
      minHours: null,
      maxLateMinutes: null,
      maxUndertimeMinutes: null,
      applicableDays: ALL_WEEKDAYS_MASK,
      dayTypes: ALL_DAY_TYPES_MASK,
      minQualifyingDays: null,
      onMiss: "Skip",
    };
  }
  return {
    payMode: values.payMode,
    attendanceBasis: values.attendanceBasis,
    minHours: values.minHours,
    maxLateMinutes: values.maxLateMinutes,
    maxUndertimeMinutes: values.maxUndertimeMinutes,
    applicableDays: bitsToMask(values.applicableDays),
    dayTypes: bitsToMask(values.dayTypes),
    minQualifyingDays:
      values.payMode === "PeriodicGated" && !values.requireAllDays
        ? values.minQualifyingDays
        : null,
    onMiss: values.onMiss,
  };
}

const DEFAULT_VALUES: DeductionApplicationAdminFormValues = {
  employeeId: "",
  deductionId: "",
  encodeDate: dayjs().format("YYYY-MM-DD"),
  startDate: "",
  endDate: "",
  frequencyOfPayment: "Monthly",
  terms: 12,
  totalPrincipal: 0,
  interestRate: 0,
  note: "",
  remarks: "",
  payMode: "FixedSchedule",
  amountPerPeriod: 0,
  attendanceBasis: "None",
  minHours: null,
  maxLateMinutes: null,
  maxUndertimeMinutes: null,
  applicableDays: ALL_WEEKDAY_BITS,
  dayTypes: ALL_DAY_TYPE_BITS,
  requireAllDays: true,
  minQualifyingDays: null,
  onMiss: "Skip",
};

export default function DeductionApplicationDetail() {
  const navigate = useNavigate();
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = !!id;
  // Without the save permission the page is a read-only view of the record.
  const readOnly = !useHasPermission(
    isEdit ? "Loan/Deduction:Edit" : "Loan/Deduction:Create",
  );

  const { data: existing, isLoading: loadingExisting } =
    useDeductionApplication(id);
  const { data: rawEmployees = [] } = useEmployees();
  const { data: rawDeductions = [] } = useDeductions();
  const { mutate: create, isPending: creating } =
    useCreateDeductionApplication();
  const { mutate: update, isPending: updating } =
    useUpdateDeductionApplication();

  const [breakdown, setBreakdown] = useState<BreakdownRow[]>([]);
  const [editingRow, setEditingRow] = useState<BreakdownRow | null>(null);
  // Rows were moved, re-priced or removed by hand since the last generate/load.
  const [scheduleEdited, setScheduleEdited] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeductionApplicationAdminFormValues>({
    resolver: zodResolver(deductionApplicationAdminFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const values = watch();
  const isAttendanceMode = values.payMode !== "FixedSchedule";
  const isPeriodic = values.payMode === "PeriodicGated";

  // Only a deduction switched on for attendance rules in Setup offers the other pay modes.
  const selectedDeduction = rawDeductions.find(
    (d) => d.id === values.deductionId,
  );
  const attendanceAllowed = selectedDeduction?.allowAttendanceRules === true;

  const regenerateBreakdown = useCallback(() => {
    setScheduleEdited(false);
    if (values.payMode === "FixedSchedule") {
      setBreakdown(
        generateLoanBreakdown(
          values.totalPrincipal ?? 0,
          values.interestRate ?? 0,
          values.terms ?? 0,
          values.startDate ?? "",
          values.frequencyOfPayment ?? "",
        ),
      );
      return;
    }
    // An attendance-based deduction is a flat charge: the whole amount is "principal".
    setBreakdown(
      generateOtherIncomeSchedule({
        payMode: values.payMode,
        startDate: values.startDate ?? "",
        endDate: values.endDate ?? "",
        frequency: values.frequencyOfPayment ?? "",
        amount: values.amountPerPeriod ?? 0,
        applicableDays: bitsToMask(values.applicableDays ?? []),
      }).map((r) => ({
        period: r.index,
        date: r.date,
        principal: r.amount,
        interest: 0,
        amount: r.amount,
        balance: 0,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
      })),
    );
  }, [
    values.payMode,
    values.totalPrincipal,
    values.interestRate,
    values.terms,
    values.startDate,
    values.endDate,
    values.frequencyOfPayment,
    values.amountPerPeriod,
    values.applicableDays,
  ]);

  // Switching how it is taken invalidates the generated rows and picks a frequency that suits it.
  const handlePayModeChange = (
    mode: DeductionApplicationAdminFormValues["payMode"],
  ) => {
    setValue("payMode", mode, { shouldValidate: true });
    setBreakdown([]);
    setScheduleEdited(false);
    if (mode === "FixedSchedule") {
      setValue("attendanceBasis", "None");
      return;
    }
    if (values.attendanceBasis === "None") {
      setValue("attendanceBasis", "Worked");
    }
    if (mode === "PerQualifyingDay") {
      setValue("frequencyOfPayment", "Daily");
    } else if (!["Weekly", "Monthly"].includes(values.frequencyOfPayment)) {
      setValue("frequencyOfPayment", "Weekly");
    }
  };

  useEffect(() => {
    if (existing) {
      const mode = (existing.payMode ??
        "FixedSchedule") as DeductionApplicationAdminFormValues["payMode"];
      reset({
        employeeId: existing.employeeId,
        deductionId: existing.deductionId,
        encodeDate: toDateOnly(existing.encodeDate),
        startDate: toDateOnly(existing.startDate),
        endDate: toDateOnly(existing.endDate),
        frequencyOfPayment: existing.frequencyOfPayment,
        terms: existing.terms,
        totalPrincipal: existing.totalPrincipal,
        interestRate: existing.interestRate,
        note: existing.note ?? "",
        remarks: existing.remarks ?? "",
        payMode: mode,
        amountPerPeriod:
          mode === "FixedSchedule" ? 0 : (existing.breakdown?.[0]?.amount ?? 0),
        attendanceBasis: (existing.attendanceBasis ??
          "None") as DeductionApplicationAdminFormValues["attendanceBasis"],
        minHours: existing.minHours ?? null,
        maxLateMinutes: existing.maxLateMinutes ?? null,
        maxUndertimeMinutes: existing.maxUndertimeMinutes ?? null,
        applicableDays: maskToBits(
          existing.applicableDays ?? ALL_WEEKDAYS_MASK,
          ALL_WEEKDAY_BITS,
        ),
        dayTypes: maskToBits(
          existing.dayTypes ?? ALL_DAY_TYPES_MASK,
          ALL_DAY_TYPE_BITS,
        ),
        requireAllDays: existing.minQualifyingDays == null,
        minQualifyingDays: existing.minQualifyingDays ?? null,
        onMiss: (existing.onMiss ??
          "Skip") as DeductionApplicationAdminFormValues["onMiss"],
      });
      if (existing.breakdown?.length) {
        setBreakdown(
          existing.breakdown.map((r, i) => ({
            id: r.id,
            period: i + 1,
            date: toDateOnly(r.date),
            principal: r.principal,
            interest: r.interest,
            amount: r.amount,
            balance: r.balance,
            periodStart: r.periodStart ? toDateOnly(r.periodStart) : undefined,
            periodEnd: r.periodEnd ? toDateOnly(r.periodEnd) : undefined,
            stored: true,
            status: r.status,
            isSkipped: r.isSkipped,
            isDeferred: r.isDeferred,
            skipReason: r.skipReason,
          })),
        );
      }
    }
  }, [existing, reset]);

  const totalAmount = useMemo(
    () => breakdown.reduce((s, r) => s + r.amount, 0),
    [breakdown],
  );

  const takenDates = useMemo(
    () =>
      breakdown
        .filter((r) => r.period !== editingRow?.period)
        .map((r) => r.date),
    [breakdown, editingRow],
  );

  // Keeps the rows in date order, numbered 1..n; an amortization also re-derives principal and
  // the running balance, since a payment's amount may have changed.
  const reshape = (rows: BreakdownRow[]) => {
    const ordered = sortAndRenumber(rows, "period");
    return isAttendanceMode
      ? ordered
      : recomputeLoanBalances(ordered, values.totalPrincipal ?? 0, isLockedRow);
  };

  const applyRowEdit = ({ date, amount }: ScheduleRowEditValue) => {
    if (!editingRow) return;
    const key = editingRow.period;
    // A flat (attendance) charge is all principal.
    const patch = isAttendanceMode
      ? { date, amount, principal: amount }
      : { date, amount };
    setBreakdown((rows) => reshape(updateRowAt(rows, "period", key, patch)));
    setScheduleEdited(true);
    setEditingRow(null);
  };

  const removeRow = (row: BreakdownRow) => {
    setBreakdown((rows) => reshape(removeRowAt(rows, "period", row.period)));
    setScheduleEdited(true);
  };

  // Only someone allowed to save the record may reshape its schedule.
  const rowActions: ScheduleRowHandlers<BreakdownRow> | null = readOnly
    ? null
    : { onEdit: setEditingRow, onRemove: removeRow };

  const fixedColumns: ColumnsType<BreakdownRow> = rowActions
    ? [...loanBreakdownColumns, actionsColumn(rowActions)]
    : loanBreakdownColumns;

  // A fixed schedule ends on its last installment; an attendance one ends on the chosen date.
  const endDate = isAttendanceMode
    ? values.endDate
    : (breakdown[breakdown.length - 1]?.date ?? "");

  const summary = describeAttendanceRule({
    kind: "deduction",
    payMode: values.payMode,
    amount: values.amountPerPeriod,
    frequency: values.frequencyOfPayment,
    attendanceBasis: values.attendanceBasis,
    minHours: values.minHours,
    maxLateMinutes: values.maxLateMinutes,
    maxUndertimeMinutes: values.maxUndertimeMinutes,
    applicableDays: values.applicableDays ?? [],
    dayTypes: values.dayTypes ?? [],
    requireAllDays: values.requireAllDays,
    minQualifyingDays: values.minQualifyingDays,
    onMiss: values.onMiss,
  });

  const employeeOptions = rawEmployees.map((e) => ({
    value: e.id,
    label:
      e.fullName ??
      `${e.lastName}, ${e.firstName} ${e.middleName ?? ""}`.trim(),
  }));

  const deductionOptions = rawDeductions
    .filter((d) => isActiveStatus(d.status))
    .map((d) => ({
      value: d.id,
      label: `${d.code} — ${d.name}`,
    }));

  const onSubmit = (formValues: DeductionApplicationAdminFormValues) => {
    if (!breakdown.length) {
      message.warning(
        isAttendanceMode
          ? "Generate the schedule first."
          : "Generate the amortization schedule first.",
      );
      return;
    }

    const attendance = formValues.payMode !== "FixedSchedule";
    const common = {
      employeeId: formValues.employeeId,
      deductionId: formValues.deductionId,
      encodeDate: formValues.encodeDate,
      startDate: formValues.startDate,
      endDate,
      // A per-day deduction is by definition daily, whatever the dropdown last held.
      frequencyOfPayment:
        formValues.payMode === "PerQualifyingDay"
          ? "Daily"
          : formValues.frequencyOfPayment,
      // Terms, principal and interest are amortization concepts; for a flat charge they just
      // describe the generated rows (no interest, the most it can take is the total). Rows may
      // have been removed by hand, so the term count always follows the schedule.
      terms: breakdown.length,
      totalPrincipal: attendance
        ? +totalAmount.toFixed(4)
        : formValues.totalPrincipal,
      interestRate: attendance ? 0 : formValues.interestRate,
      totalAmount: +totalAmount.toFixed(4),
      note: formValues.note ?? "",
      remarks: formValues.remarks ?? "",
      ...buildRuleFields(formValues),
    };
    const callbacks = {
      onSuccess: () => {
        message.success("Saved.");
        navigate({ to: "/applications/deduction-application" });
      },
      onError: () => message.error("Failed to save."),
    };

    if (isEdit && existing) {
      update(
        {
          ...common,
          id: existing.id,
          details: breakdown.map((r) => ({
            id: r.id,
            date: r.date,
            principal: r.principal,
            interest: r.interest,
            amount: r.amount,
            periodStart: r.periodStart,
            periodEnd: r.periodEnd,
          })),
        },
        callbacks,
      );
    } else {
      create(
        {
          ...common,
          breakdown: breakdown.map((r) => ({
            date: r.date,
            principal: r.principal,
            interest: r.interest,
            amount: r.amount,
            periodStart: r.periodStart,
            periodEnd: r.periodEnd,
          })),
        },
        callbacks,
      );
    }
  };

  const isSaving = creating || updating;
  const hasStatus = breakdown.some((r) => r.stored);

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {readOnly && isEdit
                ? "View Loan / Deduction"
                : isEdit
                  ? DEDUCTION_APPLICATION_LABEL.EDIT_TITLE
                  : DEDUCTION_APPLICATION_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {DEDUCTION_APPLICATION_LABEL.SUBTITLE}
            </p>
          </div>
          <Space>
            {readOnly && <Tag>View only</Tag>}
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() =>
                navigate({ to: "/applications/deduction-application" })
              }
            >
              Back
            </Button>
            <PermissionGate
              permission={
                isEdit ? "Loan/Deduction:Edit" : "Loan/Deduction:Create"
              }
            >
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit(onSubmit)}
                loading={isSaving}
              >
                Save
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>

      {isEdit && !readOnly && (
        <ApprovalRestartNotice status={existing?.approvalStatus} />
      )}

      <Form layout="vertical" disabled={loadingExisting || readOnly}>
        <Card className="mb-4">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <ApprovalStatusField status={existing?.approvalStatus} />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Employee"
                validateStatus={errors.employeeId ? "error" : ""}
                help={errors.employeeId?.message}
                required
              >
                <Controller
                  name="employeeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      showSearch
                      options={employeeOptions}
                      filterOption={(input, opt) =>
                        String(opt?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      placeholder="Select employee"
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Deduction / Loan Type"
                validateStatus={errors.deductionId ? "error" : ""}
                help={errors.deductionId?.message}
                required
              >
                <Controller
                  name="deductionId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      showSearch
                      options={deductionOptions}
                      filterOption={(input, opt) =>
                        String(opt?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      placeholder="Select deduction"
                      onChange={(v) => {
                        field.onChange(v);
                        // A deduction that isn't set up for attendance rules goes back to fixed.
                        const next = rawDeductions.find((d) => d.id === v);
                        if (
                          !next?.allowAttendanceRules &&
                          values.payMode !== "FixedSchedule"
                        ) {
                          handlePayModeChange("FixedSchedule");
                        }
                      }}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={isAttendanceMode ? 8 : 6}>
              <Form.Item
                label="Encode Date"
                validateStatus={errors.encodeDate ? "error" : ""}
                help={errors.encodeDate?.message}
                required
              >
                <Controller
                  name="encodeDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      className="w-full"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) =>
                        field.onChange(d?.format("YYYY-MM-DD") ?? "")
                      }
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={isAttendanceMode ? 8 : 6}>
              <Form.Item
                label="Start Date"
                validateStatus={errors.startDate ? "error" : ""}
                help={errors.startDate?.message}
                required
              >
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      className="w-full"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) =>
                        field.onChange(d?.format("YYYY-MM-DD") ?? "")
                      }
                    />
                  )}
                />
              </Form.Item>
            </Col>
            {isAttendanceMode && (
              <Col xs={24} md={8}>
                <Form.Item
                  label="End Date"
                  validateStatus={errors.endDate ? "error" : ""}
                  help={errors.endDate?.message}
                  required
                >
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        className="w-full"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(d) =>
                          field.onChange(d?.format("YYYY-MM-DD") ?? "")
                        }
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Card>

        {attendanceAllowed && (
          <Card title="How is it taken?" className="mb-4">
            <PayModeSelector
              value={values.payMode}
              onChange={(mode) =>
                handlePayModeChange(
                  mode as DeductionApplicationAdminFormValues["payMode"],
                )
              }
              options={PAY_MODE_OPTIONS}
            />
          </Card>
        )}

        <Card className="mb-4">
          <Row gutter={16}>
            {!isAttendanceMode && (
              <>
                <Col xs={24} md={6}>
                  <Form.Item
                    label="Frequency"
                    validateStatus={errors.frequencyOfPayment ? "error" : ""}
                    help={errors.frequencyOfPayment?.message}
                    required
                  >
                    <Controller
                      name="frequencyOfPayment"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} options={FREQUENCY_OPTIONS} />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    label="Terms (periods)"
                    validateStatus={errors.terms ? "error" : ""}
                    help={errors.terms?.message}
                    required
                  >
                    <Controller
                      name="terms"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          min={1}
                          className="w-full"
                          precision={0}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    label="Principal Amount"
                    validateStatus={errors.totalPrincipal ? "error" : ""}
                    help={errors.totalPrincipal?.message}
                    required
                  >
                    <Controller
                      name="totalPrincipal"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          min={0}
                          precision={2}
                          className="w-full"
                          addonBefore="₱"
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    label="Annual Interest Rate (%)"
                    validateStatus={errors.interestRate ? "error" : ""}
                    help={errors.interestRate?.message}
                    required
                  >
                    <Controller
                      name="interestRate"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          min={0}
                          precision={4}
                          className="w-full"
                          addonAfter="%"
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
              </>
            )}
            {isAttendanceMode && (
              <>
                {isPeriodic && (
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Frequency"
                      validateStatus={errors.frequencyOfPayment ? "error" : ""}
                      help={errors.frequencyOfPayment?.message}
                      required
                    >
                      <Controller
                        name="frequencyOfPayment"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={PERIODIC_FREQUENCY_OPTIONS}
                          />
                        )}
                      />
                    </Form.Item>
                  </Col>
                )}
                <Col xs={24} md={8}>
                  <Form.Item
                    label={
                      values.payMode === "PerQualifyingDay"
                        ? "Amount per Day"
                        : "Amount per Period"
                    }
                    validateStatus={errors.amountPerPeriod ? "error" : ""}
                    help={errors.amountPerPeriod?.message}
                    required
                  >
                    <Controller
                      name="amountPerPeriod"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          min={0}
                          precision={2}
                          className="w-full!"
                          addonBefore="₱"
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/5">
                    <AttendanceRuleFields
                      control={
                        control as unknown as Control<AttendanceRuleFormValues>
                      }
                      errors={
                        errors as unknown as FieldErrors<AttendanceRuleFormValues>
                      }
                      isPeriodic={isPeriodic}
                      requireAllDays={values.requireAllDays}
                      onMissOptions={ON_MISS_OPTIONS}
                    />
                  </div>
                </Col>
                <Col xs={24}>
                  <Alert
                    type="info"
                    showIcon
                    className="mb-4"
                    message={summary}
                  />
                </Col>
              </>
            )}
            <Col xs={24} md={12}>
              <Form.Item label="Note">
                <Controller
                  name="note"
                  control={control}
                  render={({ field }) => <Input.TextArea {...field} rows={2} />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Remarks">
                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => <Input.TextArea {...field} rows={2} />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} className="flex justify-end">
              <GenerateScheduleButton
                hasManualChanges={scheduleEdited}
                onGenerate={regenerateBreakdown}
              />
            </Col>
          </Row>
        </Card>

        {breakdown.length > 0 && (
          <Card
            title={
              <span>
                {isAttendanceMode
                  ? "Maximum Schedule"
                  : "Amortization Schedule"}
                <span className="ml-4 text-sm font-normal text-gray-500">
                  {breakdown.length} periods · Total:{" "}
                  <strong>₱{formatAmount(totalAmount)}</strong>
                  {endDate && ` · Ends ${endDate}`}
                </span>
              </span>
            }
          >
            {isAttendanceMode && (
              <Alert
                type="warning"
                showIcon
                className="mb-3"
                message="This is the most that can be deducted. What is actually taken depends on attendance when payroll is generated."
              />
            )}
            <div className="overflow-x-auto">
              {isAttendanceMode ? (
                <Table
                  rowKey="period"
                  dataSource={breakdown}
                  columns={attendanceColumns(isPeriodic, hasStatus, rowActions)}
                  size="small"
                  pagination={false}
                  summary={(rows) => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell
                        index={0}
                        colSpan={isPeriodic ? 3 : 2}
                      >
                        <strong>Maximum</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <strong>
                          {formatAmount(rows.reduce((s, r) => s + r.amount, 0))}
                        </strong>
                      </Table.Summary.Cell>
                      {hasStatus && <Table.Summary.Cell index={2} />}
                      {rowActions && <Table.Summary.Cell index={3} />}
                    </Table.Summary.Row>
                  )}
                />
              ) : (
                <Table
                  rowKey="period"
                  dataSource={breakdown}
                  columns={fixedColumns}
                  size="small"
                  pagination={false}
                  summary={(rows) => {
                    const totPrincipal = rows.reduce(
                      (s, r) => s + r.principal,
                      0,
                    );
                    const totInterest = rows.reduce(
                      (s, r) => s + r.interest,
                      0,
                    );
                    const totPayment = rows.reduce((s, r) => s + r.amount, 0);
                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={2}>
                          <strong>Total</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} align="right">
                          <strong>{formatAmount(totPrincipal)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3} align="right">
                          <strong>{formatAmount(totInterest)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4} align="right">
                          <strong>{formatAmount(totPayment)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={5} />
                        {rowActions && <Table.Summary.Cell index={6} />}
                      </Table.Summary.Row>
                    );
                  }}
                />
              )}
            </div>
          </Card>
        )}

        {breakdown.length === 0 && (
          <Divider plain>
            {isAttendanceMode
              ? 'Fill in the dates, amount and attendance options, then click "Generate Schedule"'
              : 'Fill in Principal, Terms, Interest Rate and Start Date, then click "Generate Schedule"'}
          </Divider>
        )}
      </Form>

      <ScheduleRowEditModal
        row={editingRow}
        minDate={values.startDate || undefined}
        maxDate={isAttendanceMode ? values.endDate || undefined : undefined}
        takenDates={takenDates}
        onSave={applyRowEdit}
        onCancel={() => setEditingRow(null)}
      />

      {isEdit && existing && (
        <Card size="small" title="Approval Progress" className="mt-4">
          <ApprovalTimeline
            applicationType="Loan"
            applicationId={existing.id}
            resolveEmployeeName={(empId) =>
              rawEmployees.find((e) => e.id === empId)?.fullName ?? undefined
            }
          />
        </Card>
      )}
    </div>
  );
}
