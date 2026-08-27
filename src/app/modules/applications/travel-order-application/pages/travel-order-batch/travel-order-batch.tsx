import { useForm, useFieldArray, Controller } from "react-hook-form";
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
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  batchTravelOrderFormSchema,
  type BatchTravelOrderFormValues,
} from "../../models/forms/travel-order-batch-form.schema";
import type { CreateTravelOrderApplication } from "../../models/api/request/create-travel-order-application.model";
import { useCreateTravelOrderBatch } from "../../hooks/use-travel-order-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import {
  TRAVEL_ORDER_LABEL,
  TRAVEL_CLASSIFICATION_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const MODE_OPTIONS = [
  { label: "Time Range", value: "timerange" },
  { label: "Hours", value: "hours" },
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

const defaultEntry = () => ({
  employeeId: "",
  applicationRemarks: "",
});

export default function TravelOrderBatch() {
  const navigate = useNavigate();
  const { mutateAsync: createBatch, isPending } = useCreateTravelOrderBatch();
  const { data: employees = [] } = useEmployeeFilter();
  const { data: timeShifts = [] } = useFixedTimeShifts();

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const timeShiftOptions = timeShifts.map((s) => ({
    value: s.id,
    label: s.shiftName,
    startTime: s.startTime,
    endTime: s.endTime,
  }));

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BatchTravelOrderFormValues>({
    resolver: zodResolver(batchTravelOrderFormSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      mode: "timerange",
      timeShiftId: undefined,
      startTime: "",
      endTime: "",
      totalHours: undefined,
      destination: "",
      classification: "",
      purpose: "",
      entries: [defaultEntry()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const mode = watch("mode");
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  const crossMidnight =
    mode === "timerange" && isCrossMidnight(startTime ?? "", endTime ?? "");

  const onSubmit = async (values: BatchTravelOrderFormValues) => {
    const timePayload =
      values.mode === "timerange"
        ? {
            isManualEntry: false,
            startTime: buildStartDateTime(
              values.startDate,
              values.startTime ?? "",
            ),
            endTime: buildEndDateTime(
              values.startDate,
              values.endDate,
              values.startTime ?? "",
              values.endTime ?? "",
            ),
            totalMinutes: 0,
          }
        : {
            isManualEntry: true,
            startTime: null,
            endTime: null,
            totalMinutes: Math.round((values.totalHours ?? 0) * 60),
          };

    const payload: CreateTravelOrderApplication[] = values.entries.map(
      (entry) => ({
        employeeId: entry.employeeId,
        startDate: values.startDate,
        endDate: values.endDate,
        destination: values.destination,
        classification: values.classification,
        purpose: values.purpose,
        cost: 0,
        applicationRemarks: entry.applicationRemarks,
        ...timePayload,
      }),
    );

    await createBatch(payload);
    navigate({ to: "/applications/official-business" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              File OB / Travel Order
            </Title>
            <p className="page-toolbar-subtitle">
              File a travel order for multiple employees on the same trip.
            </p>
          </div>
          <Space>
            <Button
              onClick={() =>
                navigate({ to: "/applications/official-business" })
              }
            >
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* Row 1: Travel Period | Entry Mode — mirrors OT / single-entry layout */}
          <div className="form-grid-3">
            <Form.Item
              label="Travel Period"
              className="col-span-2"
              validateStatus={errors.startDate || errors.endDate ? "error" : ""}
              help={errors.startDate?.message ?? errors.endDate?.message}
            >
              <RangePicker
                style={{ width: "100%" }}
                value={[
                  startDate ? dayjs(startDate) : null,
                  endDate ? dayjs(endDate) : null,
                ]}
                onChange={(dates) => {
                  setValue("startDate", dates?.[0]?.format("YYYY-MM-DD") ?? "");
                  setValue("endDate", dates?.[1]?.format("YYYY-MM-DD") ?? "");
                }}
              />
            </Form.Item>

            <Form.Item label="Entry Mode">
              <Controller
                name="mode"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={MODE_OPTIONS}
                    onChange={(val) => {
                      field.onChange(val);
                      setValue("startTime", "");
                      setValue("endTime", "");
                      setValue("totalHours", undefined);
                      setValue("timeShiftId", undefined);
                    }}
                  />
                )}
              />
            </Form.Item>
          </div>

          {/* Time entry group */}
          <div className="rounded-lg border border-(--ant-color-primary-border) bg-(--ant-color-primary-bg) px-4 pt-4 pb-1 mb-6">
            {mode === "timerange" ? (
              <>
                <Form.Item
                  label={TRAVEL_ORDER_LABEL.TIME_SHIFT}
                  style={{ maxWidth: 400 }}
                >
                  <Controller
                    name="timeShiftId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        allowClear
                        showSearch
                        placeholder="Select shift to pre-fill times (optional)"
                        options={timeShiftOptions}
                        filterOption={filterOption}
                        value={field.value || undefined}
                        onChange={(val) => {
                          field.onChange(val);
                          const shift = timeShiftOptions.find(
                            (s) => s.value === val,
                          );
                          if (shift) {
                            const fmt = (t: string) =>
                              dayjs(t, ["HH:mm:ss", "HH:mm"]).format(
                                "HH:mm:ss",
                              );
                            setValue("startTime", fmt(shift.startTime));
                            setValue("endTime", fmt(shift.endTime));
                          } else {
                            setValue("startTime", "");
                            setValue("endTime", "");
                          }
                        }}
                      />
                    )}
                  />
                </Form.Item>

                <div className="form-grid-2">
                  <Form.Item
                    label={TRAVEL_ORDER_LABEL.START_TIME}
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
                        {TRAVEL_ORDER_LABEL.END_TIME}
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
              </>
            ) : (
              <Form.Item
                label={TRAVEL_ORDER_LABEL.TOTAL_HOURS}
                validateStatus={errors.totalHours ? "error" : ""}
                help={
                  errors.totalHours?.message ??
                  "Enter total hours for this travel (e.g. 4, 1.5 for 1 hr 30 min)."
                }
              >
                <Controller
                  name="totalHours"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: 200 }}
                      min={0.25}
                      max={999}
                      step={0.25}
                      precision={2}
                      addonAfter="hrs"
                      placeholder="e.g. 8"
                      onChange={(val) => field.onChange(val ?? undefined)}
                    />
                  )}
                />
              </Form.Item>
            )}
          </div>

          {/* Destination | Classification */}
          <div className="form-grid-2">
            <Form.Item
              label={TRAVEL_ORDER_LABEL.DESTINATION}
              validateStatus={errors.destination ? "error" : ""}
              help={errors.destination?.message}
            >
              <Controller
                name="destination"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="e.g. Makati City" />
                )}
              />
            </Form.Item>

            <Form.Item
              label={TRAVEL_ORDER_LABEL.CLASSIFICATION}
              validateStatus={errors.classification ? "error" : ""}
              help={errors.classification?.message}
            >
              <Controller
                name="classification"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={TRAVEL_CLASSIFICATION_OPTIONS}
                    placeholder="Select"
                    value={field.value || undefined}
                  />
                )}
              />
            </Form.Item>
          </div>

          {/* Purpose */}
          <Form.Item
            label={TRAVEL_ORDER_LABEL.PURPOSE}
            validateStatus={errors.purpose ? "error" : ""}
            help={errors.purpose?.message}
          >
            <Controller
              name="purpose"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  rows={2}
                  placeholder="State the purpose of travel"
                />
              )}
            />
          </Form.Item>

          {/* Per-employee rows */}
          <div className="rounded-lg border border-(--ant-color-border) overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_1fr_36px] gap-2 px-3 py-2 bg-(--ant-color-fill-quaternary) text-xs font-medium text-(--ant-color-text-secondary) border-b border-(--ant-color-border)">
              <span>Employee</span>
              <span>Remarks</span>
              <span />
            </div>

            <div className="divide-y divide-(--ant-color-border-secondary)">
              {fields.map((field, index) => {
                const entryErrors = errors.entries?.[index];
                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 gap-3 px-3 py-3 sm:grid-cols-[1fr_1fr_36px] sm:gap-2 sm:py-2 sm:items-start"
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
                            placeholder="Remarks (optional)"
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
            Add Row
          </Button>

          <div className="form-action-footer mt-4">
            <Space className="form-action-footer-row">
              <Button
                onClick={() =>
                  navigate({ to: "/applications/official-business" })
                }
              >
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
