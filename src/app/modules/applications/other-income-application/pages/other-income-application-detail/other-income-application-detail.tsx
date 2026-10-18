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
  useCreateOtherIncomeApplication,
  useOtherIncomeApplication,
  useUpdateOtherIncomeApplication,
} from "../../hooks/use-other-income-application-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { useOtherIncomes } from "@/app/modules/setup/other-income/hooks/use-other-income-queries";
import {
  otherIncomeApplicationFormSchema,
  type OtherIncomeApplicationFormValues,
} from "../../models/forms/other-income-application-form.schema";
import type { OtherIncomeRuleFields } from "../../models/api/request/create-other-income-application.model";
import {
  ALL_DAY_TYPE_BITS,
  ALL_WEEKDAY_BITS,
  FREQUENCY_OPTIONS,
  OTHER_INCOME_APPLICATION_LABEL,
  PAY_MODE_OPTIONS,
  PERIODIC_FREQUENCY_OPTIONS,
  SKIP_REASON_LABEL,
} from "../../constants/label.const";
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
  type OtherIncomeScheduleRow,
} from "@/shared/utils/other-income-schedule.util";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { isActiveStatus } from "@/shared/utils/status.util";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
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

const ALL_WEEKDAYS_MASK = bitsToMask(ALL_WEEKDAY_BITS);
const ALL_DAY_TYPES_MASK = bitsToMask(ALL_DAY_TYPE_BITS);

function formatAmount(value: number): string {
  return (value ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

function toDateOnly(value?: string | null): string {
  return value?.replace(/Z$/, "").split("T")[0] ?? "";
}

function scheduleColumns(
  isPeriodic: boolean,
  hasStatus: boolean,
  actions: ScheduleRowHandlers<OtherIncomeScheduleRow> | null,
): ColumnsType<OtherIncomeScheduleRow> {
  const columns: ColumnsType<OtherIncomeScheduleRow> = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 50,
      align: "center",
    },
    {
      title: isPeriodic ? "Paid On" : "Payment Date",
      dataIndex: "date",
      key: "date",
      width: 140,
    },
  ];

  if (isPeriodic) {
    columns.push({
      title: "Attendance Period",
      key: "period",
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
        if (!r.id) return <Tag>Not saved</Tag>;
        if (r.isSkipped) {
          return (
            <Tag color="orange">
              Skipped
              {r.skipReason
                ? ` — ${SKIP_REASON_LABEL[r.skipReason] ?? r.skipReason}`
                : ""}
            </Tag>
          );
        }
        return r.consumedByPayrollId ? (
          <Tag color="green">Paid</Tag>
        ) : (
          <Tag>Pending</Tag>
        );
      },
    });
  }

  if (actions) {
    columns.push({
      title: "Actions",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, r) => (
        <ScheduleRowActions
          locked={!!r.consumedByPayrollId}
          onEdit={() => actions.onEdit(r)}
          onRemove={() => actions.onRemove(r)}
        />
      ),
    });
  }

  return columns;
}

// What the API stores for the rule. A fixed schedule carries no attendance rule at all.
function buildRuleFields(
  values: OtherIncomeApplicationFormValues,
): OtherIncomeRuleFields {
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
  };
}

const DEFAULT_VALUES: OtherIncomeApplicationFormValues = {
  employeeId: "",
  incomeId: "",
  encodeDate: dayjs().format("YYYY-MM-DD"),
  startDate: "",
  endDate: "",
  frequencyOfPayment: "SemiMonthly",
  amount: 0,
  remarks: "",
  payMode: "FixedSchedule",
  attendanceBasis: "None",
  minHours: null,
  maxLateMinutes: null,
  maxUndertimeMinutes: null,
  applicableDays: ALL_WEEKDAY_BITS,
  dayTypes: ALL_DAY_TYPE_BITS,
  requireAllDays: true,
  minQualifyingDays: null,
};

export default function OtherIncomeApplicationDetail() {
  const navigate = useNavigate();
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = !!id;
  // Without the save permission the page is a read-only view of the record.
  const readOnly = !useHasPermission(
    isEdit ? "Other Income:Edit" : "Other Income:Create",
  );

  const { data: existing, isLoading: loadingExisting } =
    useOtherIncomeApplication(id);
  const { data: rawEmployees = [] } = useEmployees();
  const { data: rawIncomes = [] } = useOtherIncomes();
  const { mutate: create, isPending: creating } =
    useCreateOtherIncomeApplication();
  const { mutate: update, isPending: updating } =
    useUpdateOtherIncomeApplication();

  const [schedule, setSchedule] = useState<OtherIncomeScheduleRow[]>([]);
  const [editingRow, setEditingRow] = useState<OtherIncomeScheduleRow | null>(
    null,
  );
  // Rows were moved, re-priced or removed by hand since the last generate/load.
  const [scheduleEdited, setScheduleEdited] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OtherIncomeApplicationFormValues>({
    resolver: zodResolver(otherIncomeApplicationFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const values = watch();
  const isAttendanceMode = values.payMode !== "FixedSchedule";
  const isPeriodic = values.payMode === "PeriodicGated";

  const regenerateSchedule = useCallback(() => {
    setSchedule(
      generateOtherIncomeSchedule({
        payMode: values.payMode,
        startDate: values.startDate ?? "",
        endDate: values.endDate ?? "",
        frequency: values.frequencyOfPayment ?? "",
        amount: values.amount ?? 0,
        applicableDays: bitsToMask(values.applicableDays ?? []),
      }),
    );
    setScheduleEdited(false);
  }, [
    values.payMode,
    values.startDate,
    values.endDate,
    values.frequencyOfPayment,
    values.amount,
    values.applicableDays,
  ]);

  // Switching how it is given invalidates the generated rows and picks a frequency that suits it.
  const handlePayModeChange = (
    mode: OtherIncomeApplicationFormValues["payMode"],
  ) => {
    setValue("payMode", mode, { shouldValidate: true });
    setSchedule([]);
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
      reset({
        employeeId: existing.employeeId,
        incomeId: existing.incomeId,
        encodeDate: toDateOnly(existing.encodeDate),
        startDate: toDateOnly(existing.startDate),
        endDate: toDateOnly(existing.endDate),
        frequencyOfPayment: existing.frequencyOfPayment,
        amount: existing.amount,
        remarks: existing.remarks ?? "",
        payMode: (existing.payMode ??
          "FixedSchedule") as OtherIncomeApplicationFormValues["payMode"],
        attendanceBasis: (existing.attendanceBasis ??
          "None") as OtherIncomeApplicationFormValues["attendanceBasis"],
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
      });
      if (existing.schedule?.length) {
        setSchedule(
          existing.schedule.map((r, i) => ({
            id: r.id,
            index: i + 1,
            date: toDateOnly(r.date),
            amount: r.amount,
            periodStart: r.periodStart ? toDateOnly(r.periodStart) : undefined,
            periodEnd: r.periodEnd ? toDateOnly(r.periodEnd) : undefined,
            isSkipped: r.isSkipped,
            skipReason: r.skipReason,
            consumedByPayrollId: r.consumedByPayrollId,
          })),
        );
      }
    }
  }, [existing, reset]);

  const totalAmount = useMemo(
    () => schedule.reduce((s, r) => s + r.amount, 0),
    [schedule],
  );

  const takenDates = useMemo(
    () =>
      schedule.filter((r) => r.index !== editingRow?.index).map((r) => r.date),
    [schedule, editingRow],
  );

  const applyRowEdit = ({ date, amount }: ScheduleRowEditValue) => {
    if (!editingRow) return;
    const key = editingRow.index;
    setSchedule((rows) =>
      sortAndRenumber(
        updateRowAt(rows, "index", key, { date, amount }),
        "index",
      ),
    );
    setScheduleEdited(true);
    setEditingRow(null);
  };

  const removeRow = (row: OtherIncomeScheduleRow) => {
    setSchedule((rows) =>
      sortAndRenumber(removeRowAt(rows, "index", row.index), "index"),
    );
    setScheduleEdited(true);
  };

  // Only someone allowed to save the record may reshape its schedule.
  const rowActions: ScheduleRowHandlers<OtherIncomeScheduleRow> | null =
    readOnly ? null : { onEdit: setEditingRow, onRemove: removeRow };

  const summary = describeAttendanceRule({
    kind: "income",
    payMode: values.payMode,
    amount: values.amount,
    frequency: values.frequencyOfPayment,
    attendanceBasis: values.attendanceBasis,
    minHours: values.minHours,
    maxLateMinutes: values.maxLateMinutes,
    maxUndertimeMinutes: values.maxUndertimeMinutes,
    applicableDays: values.applicableDays ?? [],
    dayTypes: values.dayTypes ?? [],
    requireAllDays: values.requireAllDays,
    minQualifyingDays: values.minQualifyingDays,
  });

  const employeeOptions = rawEmployees.map((e) => ({
    value: e.id,
    label:
      e.fullName ??
      `${e.lastName}, ${e.firstName} ${e.middleName ?? ""}`.trim(),
  }));

  const incomeOptions = rawIncomes
    .filter((i) => isActiveStatus(i.status))
    .map((i) => ({
      value: i.id,
      label: `${i.code} — ${i.name}`,
    }));

  const onSubmit = (formValues: OtherIncomeApplicationFormValues) => {
    if (!schedule.length) {
      message.warning("Generate the payment schedule first.");
      return;
    }

    const common = {
      employeeId: formValues.employeeId,
      incomeId: formValues.incomeId,
      encodeDate: formValues.encodeDate,
      startDate: formValues.startDate,
      endDate: formValues.endDate,
      // A per-day income is by definition daily, whatever the dropdown last held.
      frequencyOfPayment:
        formValues.payMode === "PerQualifyingDay"
          ? "Daily"
          : formValues.frequencyOfPayment,
      amount: formValues.amount,
      remarks: formValues.remarks ?? "",
      ...buildRuleFields(formValues),
    };
    const callbacks = {
      onSuccess: () => {
        message.success("Saved.");
        navigate({ to: "/applications/other-income" });
      },
      onError: () => message.error("Failed to save."),
    };

    if (isEdit && existing) {
      update(
        {
          ...common,
          id: existing.id,
          schedule: schedule.map((r) => ({
            id: r.id,
            date: r.date,
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
          schedule: schedule.map((r) => ({
            date: r.date,
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
  const hasStatus = schedule.some((r) => !!r.id);
  const totalLabel = isAttendanceMode ? "Maximum" : "Total";

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {readOnly && isEdit
                ? "View Other Income"
                : isEdit
                  ? OTHER_INCOME_APPLICATION_LABEL.EDIT_TITLE
                  : OTHER_INCOME_APPLICATION_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {OTHER_INCOME_APPLICATION_LABEL.SUBTITLE}
            </p>
          </div>
          <Space>
            {readOnly && <Tag>View only</Tag>}
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate({ to: "/applications/other-income" })}
            >
              Back
            </Button>
            <PermissionGate
              permission={isEdit ? "Other Income:Edit" : "Other Income:Create"}
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

      <Form layout="vertical" disabled={loadingExisting || readOnly}>
        <Card className="mb-4">
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
                label="Income Type"
                validateStatus={errors.incomeId ? "error" : ""}
                help={errors.incomeId?.message}
                required
              >
                <Controller
                  name="incomeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      showSearch
                      options={incomeOptions}
                      filterOption={(input, opt) =>
                        String(opt?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      placeholder="Select income type"
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
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
            <Col xs={24} md={8}>
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
          </Row>
        </Card>

        <Card title="How is it given?" className="mb-4">
          <PayModeSelector
            value={values.payMode}
            onChange={(mode) =>
              handlePayModeChange(
                mode as OtherIncomeApplicationFormValues["payMode"],
              )
            }
            options={PAY_MODE_OPTIONS}
          />

          <div className="mt-5 grid grid-cols-1 gap-x-4 md:grid-cols-3">
            {values.payMode !== "PerQualifyingDay" && (
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
                      options={
                        isPeriodic
                          ? PERIODIC_FREQUENCY_OPTIONS
                          : FREQUENCY_OPTIONS
                      }
                    />
                  )}
                />
              </Form.Item>
            )}
            <Form.Item
              label={
                values.payMode === "PerQualifyingDay"
                  ? "Amount per Day"
                  : "Amount per Period"
              }
              validateStatus={errors.amount ? "error" : ""}
              help={errors.amount?.message}
              required
            >
              <Controller
                name="amount"
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
          </div>

          {isAttendanceMode && (
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
              />
            </div>
          )}

          <Alert type="info" showIcon className="mb-4" message={summary} />

          <Form.Item label="Remarks">
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => <Input.TextArea {...field} rows={2} />}
            />
          </Form.Item>

          <div className="flex justify-end">
            <GenerateScheduleButton
              hasManualChanges={scheduleEdited}
              onGenerate={regenerateSchedule}
            />
          </div>
        </Card>

        {schedule.length > 0 && (
          <Card
            title={
              <span>
                {isAttendanceMode ? "Maximum Schedule" : "Payment Schedule"}
                <span className="ml-4 text-sm font-normal text-gray-500">
                  {schedule.length} payments · Total:{" "}
                  <strong>₱{formatAmount(totalAmount)}</strong>
                </span>
              </span>
            }
          >
            {isAttendanceMode && (
              <Alert
                type="warning"
                showIcon
                className="mb-3"
                message="This is the most the employee can earn. What is actually paid depends on attendance when payroll is generated; rows that don't qualify are skipped."
              />
            )}
            <div className="overflow-x-auto">
              <Table
                rowKey="index"
                dataSource={schedule}
                columns={scheduleColumns(isPeriodic, hasStatus, rowActions)}
                size="small"
                pagination={false}
                summary={(rows) => {
                  const tot = rows.reduce((s, r) => s + r.amount, 0);
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell
                        index={0}
                        colSpan={isPeriodic ? 3 : 2}
                      >
                        <strong>{totalLabel}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <strong>{formatAmount(tot)}</strong>
                      </Table.Summary.Cell>
                      {hasStatus && <Table.Summary.Cell index={2} />}
                      {rowActions && <Table.Summary.Cell index={3} />}
                    </Table.Summary.Row>
                  );
                }}
              />
            </div>
          </Card>
        )}

        {schedule.length === 0 && (
          <Divider plain>
            Fill in Start Date, End Date, Amount and the options above, then
            click "Generate Schedule"
          </Divider>
        )}
      </Form>

      <ScheduleRowEditModal
        row={editingRow}
        minDate={values.startDate || undefined}
        maxDate={values.endDate || undefined}
        takenDates={takenDates}
        onSave={applyRowEdit}
        onCancel={() => setEditingRow(null)}
      />
    </div>
  );
}
