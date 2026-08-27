import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Radio,
  Alert,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  batchLeaveFormSchema,
  type BatchLeaveFormValues,
} from "../../models/forms/leave-application-batch-form.schema";
import type { CreateLeaveApplication } from "../../models/api/request/create-leave-application.model";
import { useCreateLeaveApplicationBatch } from "../../hooks/use-leave-application-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { useLeaveTypes } from "@/app/modules/setup/leave-type/hooks/use-leave-type-queries";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;
const { TextArea } = Input;

const DURATION_MODE_OPTIONS = [
  { label: "Single Day", value: "singleday" },
  { label: "Multi-Day Range", value: "multiday" },
  { label: "Partial Day / Hourly", value: "partial" },
];

const DAY_FRACTION_OPTIONS = [
  { label: "Full Day", value: "fullday" },
  { label: "AM Half", value: "am" },
  { label: "PM Half", value: "pm" },
];

const PARTIAL_MODE_OPTIONS = [
  { label: "Time Range", value: "timerange" },
  { label: "Hours Only", value: "hours" },
];

const PAY_TYPE_OPTIONS = [
  { label: "With Pay", value: "WithPay" },
  { label: "Without Pay", value: "WithoutPay" },
];

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

const defaultEntry = () => ({
  employeeId: "",
  leaveId: "",
  payType: "WithPay",
  applicationRemarks: "",
});

export default function LeaveApplicationBatch() {
  const navigate = useNavigate();
  const { mutateAsync: createBatch, isPending } =
    useCreateLeaveApplicationBatch();
  const { data: employees = [] } = useEmployeeFilter();
  const { data: leaveTypes = [] } = useLeaveTypes();

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const leaveTypeOptions = leaveTypes.map((l) => ({
    value: l.id,
    label: `${l.code} - ${l.description}`,
  }));

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BatchLeaveFormValues>({
    resolver: zodResolver(batchLeaveFormSchema),
    defaultValues: {
      mode: "singleday",
      leaveDate: "",
      dayFraction: "fullday",
      leaveDateFrom: "",
      leaveDateTo: "",
      partialMode: "timerange",
      startTime: "",
      endTime: "",
      totalHours: undefined,
      entries: [defaultEntry()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  const mode = useWatch({ control, name: "mode" });
  const partialMode = useWatch({ control, name: "partialMode" });
  const leaveDate = useWatch({ control, name: "leaveDate" });
  const leaveDateFrom = useWatch({ control, name: "leaveDateFrom" });
  const leaveDateTo = useWatch({ control, name: "leaveDateTo" });
  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });

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

  const crossMidnight =
    mode === "partial" &&
    partialMode === "timerange" &&
    isCrossMidnight(startTime ?? "", endTime ?? "");

  const businessDays =
    mode === "multiday"
      ? countBusinessDays(leaveDateFrom ?? "", leaveDateTo ?? "")
      : 0;

  const onSubmit = async (values: BatchLeaveFormValues) => {
    const isMultiDay = values.mode === "multiday";
    const dateFrom = isMultiDay ? values.leaveDateFrom! : values.leaveDate!;
    const dateTo = isMultiDay ? values.leaveDateTo! : values.leaveDate!;

    const durationType =
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

    const pMode = values.partialMode ?? "timerange";
    let timePayload: {
      isManualEntry: boolean;
      startTime?: string | null;
      endTime?: string | null;
      totalMinutes?: number | null;
    };

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

    const payload: CreateLeaveApplication[] = values.entries.map((entry) => ({
      employeeId: entry.employeeId,
      leaveId: entry.leaveId,
      durationType,
      leaveDateFrom: dateFrom,
      leaveDateTo: dateTo,
      dayFraction: dayFractionPayload,
      payType: entry.payType,
      applicationRemarks: entry.applicationRemarks,
      ...timePayload,
    }));

    await createBatch(payload);
    navigate({ to: "/applications/leave" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              File Leave
            </Title>
            <p className="page-toolbar-subtitle">
              File leave for one or more employees with the same duration and
              date.
            </p>
          </div>
          <Space>
            <Button onClick={() => navigate({ to: "/applications/leave" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* Shared duration settings */}
          <Form.Item label="Duration Type">
            <Controller
              name="mode"
              control={control}
              render={({ field }) => (
                <Radio.Group
                  {...field}
                  options={DURATION_MODE_OPTIONS}
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
                      options={DAY_FRACTION_OPTIONS}
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
                <>
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
                  <Alert
                    type="info"
                    showIcon
                    className="mb-4"
                    style={{ maxWidth: 480 }}
                    message="Declaring hours only will be treated as starting from the beginning of the employee's shift."
                    description="Example: a 4-hour leave on a shift that starts at 8:00 AM is recorded as 8:00 AM – 12:00 PM. If the leave doesn't start at shift-start, use Time Range instead."
                  />
                </>
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

          {/* Employee entries */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_1fr_110px_1fr_36px] gap-2 px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-200">
              <span>Employee</span>
              <span>Leave Type</span>
              <span>Pay Type</span>
              <span>Remarks</span>
              <span />
            </div>

            <div className="divide-y divide-gray-100">
              {fields.map((field, index) => {
                const entryErrors = errors.entries?.[index];
                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 gap-3 px-3 py-3 sm:grid-cols-[1fr_1fr_110px_1fr_36px] sm:gap-2 sm:py-2 sm:items-start"
                  >
                    <Form.Item
                      label="Employee"
                      className="mb-0 sm:[&_.ant-form-item-label]:hidden"
                      validateStatus={entryErrors?.employeeId ? "error" : ""}
                      help={entryErrors?.employeeId?.message}
                    >
                      <Controller
                        name={`entries.${index}.employeeId`}
                        control={control}
                        render={({ field: f }) => (
                          <Select
                            {...f}
                            showSearch
                            placeholder="Select employee"
                            options={employeeOptions}
                            filterOption={filterOption}
                            value={f.value || undefined}
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Leave Type"
                      className="mb-0 sm:[&_.ant-form-item-label]:hidden"
                      validateStatus={entryErrors?.leaveId ? "error" : ""}
                      help={entryErrors?.leaveId?.message}
                    >
                      <Controller
                        name={`entries.${index}.leaveId`}
                        control={control}
                        render={({ field: f }) => (
                          <Select
                            {...f}
                            showSearch
                            placeholder="Leave type"
                            options={leaveTypeOptions}
                            filterOption={filterOption}
                            value={f.value || undefined}
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Pay Type"
                      className="mb-0 sm:[&_.ant-form-item-label]:hidden"
                      validateStatus={entryErrors?.payType ? "error" : ""}
                      help={entryErrors?.payType?.message}
                    >
                      <Controller
                        name={`entries.${index}.payType`}
                        control={control}
                        render={({ field: f }) => (
                          <Select {...f} options={PAY_TYPE_OPTIONS} />
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Remarks"
                      className="mb-0 sm:[&_.ant-form-item-label]:hidden"
                    >
                      <Controller
                        name={`entries.${index}.applicationRemarks`}
                        control={control}
                        render={({ field: f }) => (
                          <TextArea
                            {...f}
                            rows={1}
                            placeholder="Remarks"
                            style={{ resize: "none" }}
                          />
                        )}
                      />
                    </Form.Item>

                    <div className="flex justify-end sm:block sm:pt-1">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            className="mt-3 w-full"
            onClick={() => append(defaultEntry())}
          >
            Add Employee
          </Button>

          <div className="form-action-footer mt-4">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/applications/leave" })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <Button type="primary" htmlType="submit" loading={isPending}>
                Submit{fields.length > 1 ? ` (${fields.length} entries)` : ""}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}
