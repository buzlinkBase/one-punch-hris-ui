import { useEffect, type ReactNode } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Switch,
  TimePicker,
  Typography,
  Space,
  Tag,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fromTimeSpan,
  toTimeSpan,
  timeSpanToSeconds,
} from "@/shared/utils/time-span.util";
import { TimeSpanPicker } from "@/shared/components/time-span-picker";
import {
  fixedTimeShiftFormSchema,
  type FixedTimeShiftFormValues,
} from "../../models/forms/fixed-time-shift-form.schema";
import {
  useFixedTimeShift,
  useCreateFixedTimeShift,
  useUpdateFixedTimeShift,
} from "../../hooks/use-fixed-time-shift-queries";
import { FIXED_TIME_SHIFT_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import type { CreateFixedTimeShift } from "../../models/api/request/create-fixed-time-shift.model";

const { Title } = Typography;

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "20px 0 12px",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#6b7280",
          whiteSpace: "nowrap",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {children}
      </span>
      <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
    </div>
  );
}

const BREAK_MODE_OPTIONS = [
  { value: "NONE", label: "No Break" },
  { value: "UNPAID_BREAK", label: "Unpaid Break" },
  { value: "PAID_BREAK", label: "Paid Break" },
];

function addHoursToTimeSpan(timeSpan: string, hours: number): string {
  const [h, m, s] = timeSpan.split(":").map(Number);
  const totalSeconds = h * 3600 + m * 60 + (s || 0) + hours * 3600;
  const dayOffset = Math.floor(totalSeconds / 86400);
  const rem = totalSeconds % 86400;
  const rh = String(Math.floor(rem / 3600)).padStart(2, "0");
  const rm = String(Math.floor((rem % 3600) / 60)).padStart(2, "0");
  const rs = String(rem % 60).padStart(2, "0");
  const time = `${rh}:${rm}:${rs}`;
  return dayOffset > 0 ? `${dayOffset}.${time}` : time;
}

export default function FixedTimeShiftDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useFixedTimeShift(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateFixedTimeShift();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateFixedTimeShift();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FixedTimeShiftFormValues>({
    resolver: zodResolver(fixedTimeShiftFormSchema),
    defaultValues: {
      shiftName: "",
      startTime: "08:00:00",
      endTime: "17:00:00",
      gracePeriodMinutes: 0,
      withLunchBreak: "UNPAID_BREAK",
      lunchStartTime: "12:00:00",
      lunchEndTime: "13:00:00",
      breakDurationMinutes: 60,
      withAMBreak: false,
      amStartTime: null,
      amEndTime: null,
      withPMBreak: false,
      pmStartTime: null,
      pmEndTime: null,
      maxWorkingMinutes: 480,
      minimumWorkMinutes: 0,
      withOT: false,
      otRequireTimeIn: false,
      otStart: "17:00:00",
      overTimeThreshold: 60,
    },
  });

  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });
  const withLunchBreak = useWatch({ control, name: "withLunchBreak" });
  const lunchStartTime = useWatch({ control, name: "lunchStartTime" });
  const lunchEndTime = useWatch({ control, name: "lunchEndTime" });
  const withAMBreak = useWatch({ control, name: "withAMBreak" });
  const amStartTime = useWatch({ control, name: "amStartTime" });
  const amEndTime = useWatch({ control, name: "amEndTime" });
  const withPMBreak = useWatch({ control, name: "withPMBreak" });
  const pmStartTime = useWatch({ control, name: "pmStartTime" });
  const pmEndTime = useWatch({ control, name: "pmEndTime" });
  const withOT = useWatch({ control, name: "withOT" });
  const otRequireTimeIn = useWatch({ control, name: "otRequireTimeIn" });
  const otStart = useWatch({ control, name: "otStart" });

  const shiftStartSec = timeSpanToSeconds(startTime);
  const shiftEndSec = timeSpanToSeconds(endTime);
  const shiftDefined = !!startTime && !!endTime && shiftEndSec > shiftStartSec;

  const endBeforeStart = !!endTime && shiftEndSec <= shiftStartSec;

  // Lunch
  const lunchStartSec = timeSpanToSeconds(lunchStartTime);
  const lunchEndSec = timeSpanToSeconds(lunchEndTime);
  const lunchStartOOB =
    shiftDefined &&
    !!lunchStartTime &&
    (lunchStartSec < shiftStartSec || lunchStartSec > shiftEndSec);
  const lunchEndOOB =
    shiftDefined && !!lunchEndTime && lunchEndSec > shiftEndSec;
  const lunchEndBeforeStart =
    !!lunchEndTime && !!lunchStartTime && lunchEndSec <= lunchStartSec;

  // AM break
  const amStartSec = timeSpanToSeconds(amStartTime);
  const amEndSec = timeSpanToSeconds(amEndTime);
  const amStartOOB =
    withAMBreak &&
    shiftDefined &&
    !!amStartTime &&
    (amStartSec < shiftStartSec || amStartSec > shiftEndSec);
  const amEndOOB =
    withAMBreak && shiftDefined && !!amEndTime && amEndSec > shiftEndSec;
  const amEndBeforeStart =
    withAMBreak && !!amEndTime && !!amStartTime && amEndSec <= amStartSec;

  // PM break
  const pmStartSec = timeSpanToSeconds(pmStartTime);
  const pmEndSec = timeSpanToSeconds(pmEndTime);
  const pmStartOOB =
    withPMBreak &&
    shiftDefined &&
    !!pmStartTime &&
    (pmStartSec < shiftStartSec || pmStartSec > shiftEndSec);
  const pmEndOOB =
    withPMBreak && shiftDefined && !!pmEndTime && pmEndSec > shiftEndSec;
  const pmEndBeforeStart =
    withPMBreak && !!pmEndTime && !!pmStartTime && pmEndSec <= pmStartSec;

  const otBeforeEnd =
    withOT &&
    otRequireTimeIn &&
    !!otStart &&
    timeSpanToSeconds(otStart) < shiftEndSec;

  useEffect(() => {
    if (isEdit || !startTime) return;
    setValue("endTime", addHoursToTimeSpan(startTime, 9));
    setValue("otStart", addHoursToTimeSpan(startTime, 9));
  }, [startTime, isEdit, setValue]);

  useEffect(() => {
    if (withLunchBreak === "PAID_BREAK") {
      setValue("withAMBreak", false);
      setValue("withPMBreak", false);
      setValue("amStartTime", null);
      setValue("amEndTime", null);
      setValue("pmStartTime", null);
      setValue("pmEndTime", null);
      setValue("breakDurationMinutes", 30);
    } else if (withLunchBreak === "NONE") {
      setValue("breakDurationMinutes", 0);
    }
  }, [withLunchBreak, setValue]);

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        shiftName: selected.shiftName,
        startTime: selected.startTime,
        endTime: selected.endTime,
        gracePeriodMinutes: selected.gracePeriodMinutes,
        withLunchBreak: selected.withLunchBreak,
        lunchStartTime: selected.lunchStartTime,
        lunchEndTime: selected.lunchEndTime,
        breakDurationMinutes: selected.breakDurationMinutes,
        withAMBreak: selected.withAMBreak === "PAID_BREAK",
        amStartTime: selected.amStartTime,
        amEndTime: selected.amEndTime,
        withPMBreak: selected.withPMBreak === "PAID_BREAK",
        pmStartTime: selected.pmStartTime,
        pmEndTime: selected.pmEndTime,
        maxWorkingMinutes: selected.maxWorkingMinutes,
        minimumWorkMinutes: selected.minimumWorkMinutes,
        withOT: selected.withOT,
        otRequireTimeIn: selected.otRequireTimeIn,
        otStart: selected.otStart,
        overTimeThreshold: selected.overTimeThreshold,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: FixedTimeShiftFormValues) => {
    // TimeSpanPicker values are already in "HH:mm:ss" or "d.HH:mm:ss" format — pass through directly.
    const payload: CreateFixedTimeShift = {
      shiftName: values.shiftName,
      shiftType: "FIXED",
      startTime: values.startTime,
      endTime: values.endTime,
      gracePeriodMinutes: values.gracePeriodMinutes,
      withLunchBreak: values.withLunchBreak,
      lunchStartTime:
        values.withLunchBreak !== "NONE"
          ? (values.lunchStartTime ?? null)
          : null,
      lunchEndTime:
        values.withLunchBreak !== "NONE" ? (values.lunchEndTime ?? null) : null,
      breakDurationMinutes: values.breakDurationMinutes,
      withAMBreak: values.withAMBreak ? "PAID_BREAK" : "NONE",
      amStartTime: values.withAMBreak ? (values.amStartTime ?? null) : null,
      amEndTime: values.withAMBreak ? (values.amEndTime ?? null) : null,
      withPMBreak: values.withPMBreak ? "PAID_BREAK" : "NONE",
      pmStartTime: values.withPMBreak ? (values.pmStartTime ?? null) : null,
      pmEndTime: values.withPMBreak ? (values.pmEndTime ?? null) : null,
      maxWorkingMinutes: values.maxWorkingMinutes,
      minimumWorkMinutes: values.minimumWorkMinutes,
      withOT: values.withOT,
      otRequireTimeIn: values.withOT ? values.otRequireTimeIn : false,
      otStart: values.withOT ? values.otStart : "00:00:00",
      overTimeThreshold: values.withOT ? values.overTimeThreshold : 0,
    };

    if (isEdit && id) await update({ id, ...payload });
    else await add(payload);
    navigate({ to: "/setup/time-shift/fixed" });
  };

  const amPmBreakDisabled = withLunchBreak === "PAID_BREAK";

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? FIXED_TIME_SHIFT_LABEL.EDIT_TITLE
                : FIXED_TIME_SHIFT_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Maintain fixed shift templates with consistent start and end time.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/time-shift/fixed" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={FIXED_TIME_SHIFT_LABEL.SHIFT_NAME}
            validateStatus={errors.shiftName ? "error" : ""}
            help={errors.shiftName?.message}
          >
            <Controller
              name="shiftName"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g. Regular Day Shift" />
              )}
            />
          </Form.Item>

          <SectionHeader>Schedule</SectionHeader>
          <div className="form-grid-2">
            {/* startTime is the day-0 anchor — no +1 day needed */}
            <Form.Item
              label={FIXED_TIME_SHIFT_LABEL.START_TIME}
              validateStatus={errors.startTime ? "error" : ""}
              help={errors.startTime?.message}
            >
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    className="w-full"
                    value={fromTimeSpan(field.value)}
                    onChange={(val) => field.onChange(toTimeSpan(val))}
                    format="HH:mm"
                  />
                )}
              />
            </Form.Item>
            <Form.Item
              label={FIXED_TIME_SHIFT_LABEL.END_TIME}
              validateStatus={errors.endTime || endBeforeStart ? "error" : ""}
              help={
                errors.endTime?.message ??
                (endBeforeStart
                  ? "End time must be after start time"
                  : undefined)
              }
            >
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <TimeSpanPicker
                    value={field.value}
                    onChange={field.onChange}
                    referenceTime={startTime}
                  />
                )}
              />
            </Form.Item>
            <Form.Item
              label={FIXED_TIME_SHIFT_LABEL.GRACE_PERIOD}
              validateStatus={errors.gracePeriodMinutes ? "error" : ""}
              help={errors.gracePeriodMinutes?.message}
            >
              <Controller
                name="gracePeriodMinutes"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    className="w-full"
                    {...field}
                    min={0}
                    suffix="min"
                  />
                )}
              />
            </Form.Item>
            <Form.Item
              label={FIXED_TIME_SHIFT_LABEL.MAX_WORKING}
              validateStatus={errors.maxWorkingMinutes ? "error" : ""}
              help={errors.maxWorkingMinutes?.message}
            >
              <Controller
                name="maxWorkingMinutes"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    className="w-full"
                    {...field}
                    min={0}
                    suffix="min"
                  />
                )}
              />
            </Form.Item>
            <Form.Item
              label={FIXED_TIME_SHIFT_LABEL.MIN_WORKING}
              validateStatus={errors.minimumWorkMinutes ? "error" : ""}
              help={errors.minimumWorkMinutes?.message}
            >
              <Controller
                name="minimumWorkMinutes"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    className="w-full"
                    {...field}
                    min={0}
                    suffix="min"
                  />
                )}
              />
            </Form.Item>
          </div>

          <SectionHeader>Lunch Break</SectionHeader>
          <Form.Item
            label={FIXED_TIME_SHIFT_LABEL.LUNCH_BREAK_MODE}
            validateStatus={errors.withLunchBreak ? "error" : ""}
            help={errors.withLunchBreak?.message}
          >
            <Controller
              name="withLunchBreak"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={BREAK_MODE_OPTIONS}
                  style={{ maxWidth: 280 }}
                />
              )}
            />
          </Form.Item>
          {withLunchBreak !== "NONE" && (
            <div className="form-grid-2">
              <Form.Item
                label={FIXED_TIME_SHIFT_LABEL.LUNCH_START}
                validateStatus={lunchStartOOB ? "error" : ""}
                help={
                  lunchStartOOB
                    ? "Lunch start must be within the shift hours"
                    : undefined
                }
              >
                <Controller
                  name="lunchStartTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSpanPicker
                      value={field.value}
                      onChange={field.onChange}
                      nullable
                      referenceTime={startTime}
                    />
                  )}
                />
              </Form.Item>
              <Form.Item
                label={FIXED_TIME_SHIFT_LABEL.LUNCH_END}
                validateStatus={
                  lunchEndBeforeStart || lunchEndOOB ? "error" : ""
                }
                help={
                  lunchEndBeforeStart
                    ? "Lunch end must be after lunch start"
                    : lunchEndOOB
                      ? "Lunch end exceeds shift end time"
                      : undefined
                }
              >
                <Controller
                  name="lunchEndTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSpanPicker
                      value={field.value}
                      onChange={field.onChange}
                      nullable
                      referenceTime={lunchStartTime}
                    />
                  )}
                />
              </Form.Item>
              <Form.Item
                label={FIXED_TIME_SHIFT_LABEL.BREAK_DURATION}
                validateStatus={errors.breakDurationMinutes ? "error" : ""}
                help={errors.breakDurationMinutes?.message}
              >
                <Controller
                  name="breakDurationMinutes"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      className="w-full"
                      {...field}
                      min={0}
                      suffix="min"
                    />
                  )}
                />
              </Form.Item>
            </div>
          )}

          <SectionHeader>
            AM Break
            {amPmBreakDisabled && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 400,
                  color: "#9ca3af",
                  marginLeft: 8,
                  textTransform: "none",
                  letterSpacing: "normal",
                }}
              >
                (disabled when lunch is Paid Break)
              </span>
            )}
          </SectionHeader>
          <Form.Item
            label={FIXED_TIME_SHIFT_LABEL.AM_BREAK}
            extra={
              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                Off = No break · On = Paid break
              </span>
            }
          >
            <Controller
              name="withAMBreak"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={amPmBreakDisabled}
                />
              )}
            />
          </Form.Item>
          {withAMBreak && (
            <div className="form-grid-2">
              <Form.Item
                label={FIXED_TIME_SHIFT_LABEL.AM_START}
                validateStatus={amStartOOB ? "error" : ""}
                help={
                  amStartOOB
                    ? "AM break start must be within the shift hours"
                    : undefined
                }
              >
                <Controller
                  name="amStartTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSpanPicker
                      value={field.value}
                      onChange={field.onChange}
                      nullable
                      referenceTime={startTime}
                    />
                  )}
                />
              </Form.Item>
              <Form.Item
                label={FIXED_TIME_SHIFT_LABEL.AM_END}
                validateStatus={amEndBeforeStart || amEndOOB ? "error" : ""}
                help={
                  amEndBeforeStart
                    ? "AM break end must be after AM break start"
                    : amEndOOB
                      ? "AM break end exceeds shift end time"
                      : undefined
                }
              >
                <Controller
                  name="amEndTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSpanPicker
                      value={field.value}
                      onChange={field.onChange}
                      nullable
                      referenceTime={amStartTime}
                    />
                  )}
                />
              </Form.Item>
            </div>
          )}

          <SectionHeader>
            PM Break
            {amPmBreakDisabled && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 400,
                  color: "#9ca3af",
                  marginLeft: 8,
                  textTransform: "none",
                  letterSpacing: "normal",
                }}
              >
                (disabled when lunch is Paid Break)
              </span>
            )}
          </SectionHeader>
          <Form.Item
            label={FIXED_TIME_SHIFT_LABEL.PM_BREAK}
            extra={
              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                Off = No break · On = Paid break
              </span>
            }
          >
            <Controller
              name="withPMBreak"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={amPmBreakDisabled}
                />
              )}
            />
          </Form.Item>
          {withPMBreak && (
            <div className="form-grid-2">
              <Form.Item
                label={FIXED_TIME_SHIFT_LABEL.PM_START}
                validateStatus={pmStartOOB ? "error" : ""}
                help={
                  pmStartOOB
                    ? "PM break start must be within the shift hours"
                    : undefined
                }
              >
                <Controller
                  name="pmStartTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSpanPicker
                      value={field.value}
                      onChange={field.onChange}
                      nullable
                      referenceTime={startTime}
                    />
                  )}
                />
              </Form.Item>
              <Form.Item
                label={FIXED_TIME_SHIFT_LABEL.PM_END}
                validateStatus={pmEndBeforeStart || pmEndOOB ? "error" : ""}
                help={
                  pmEndBeforeStart
                    ? "PM break end must be after PM break start"
                    : pmEndOOB
                      ? "PM break end exceeds shift end time"
                      : undefined
                }
              >
                <Controller
                  name="pmEndTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSpanPicker
                      value={field.value}
                      onChange={field.onChange}
                      nullable
                      referenceTime={pmStartTime}
                    />
                  )}
                />
              </Form.Item>
            </div>
          )}

          <SectionHeader>Overtime</SectionHeader>
          <Form.Item label={FIXED_TIME_SHIFT_LABEL.ALLOW_OT}>
            <Controller
              name="withOT"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </Form.Item>
          {withOT && (
            <>
              <Form.Item label={FIXED_TIME_SHIFT_LABEL.OT_REQUIRE_TIME_IN}>
                <Controller
                  name="otRequireTimeIn"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onChange={field.onChange} />
                  )}
                />
              </Form.Item>
              <div className="form-grid-2">
                <Form.Item
                  label={FIXED_TIME_SHIFT_LABEL.OT_START}
                  validateStatus={errors.otStart || otBeforeEnd ? "error" : ""}
                  help={
                    errors.otStart?.message ??
                    (otBeforeEnd
                      ? "OT start must be at or after shift end time"
                      : undefined)
                  }
                >
                  <Controller
                    name="otStart"
                    control={control}
                    render={({ field }) => (
                      <TimeSpanPicker
                        value={field.value}
                        onChange={field.onChange}
                        referenceTime={startTime}
                      />
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={FIXED_TIME_SHIFT_LABEL.OT_THRESHOLD}
                  validateStatus={errors.overTimeThreshold ? "error" : ""}
                  help={errors.overTimeThreshold?.message}
                >
                  <Controller
                    name="overTimeThreshold"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        className="w-full"
                        {...field}
                        min={0}
                        suffix="min"
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </>
          )}

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button
                onClick={() => navigate({ to: "/setup/time-shift/fixed" })}
              >
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdating || isCreating}
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
