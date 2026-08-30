import { useEffect, type ReactNode } from "react";
import {
  Form,
  Input,
  Button,
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
  flexiTimeShiftFormSchema,
  type FlexiTimeShiftFormValues,
} from "../../models/forms/flexi-time-shift-form.schema";
import {
  useFlexiTimeShift,
  useCreateFlexiTimeShift,
  useUpdateFlexiTimeShift,
} from "../../hooks/use-flexi-time-shift-queries";
import { FLEXI_TIME_SHIFT_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import type { CreateFlexiTimeShift } from "../../models/api/request/create-flexi-time-shift.model";

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

export default function FlexiTimeShiftDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useFlexiTimeShift(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateFlexiTimeShift();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateFlexiTimeShift();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FlexiTimeShiftFormValues>({
    resolver: zodResolver(flexiTimeShiftFormSchema),
    defaultValues: {
      shiftName: "",
      startTime: "06:00:00",
      endTime: "22:00:00",
      unpaidLunchBreak: false,
      lunchStartTime: null,
      lunchEndTime: null,
      breakDurationMinutes: 0,
      minimumWorkMinutes: 0,
      maxWorkingMinutes: 480,
      withOT: false,
      overTimeThreshold: 60,
      maxOvertimeHours: null,
    },
  });

  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });
  const lunchStartTime = useWatch({ control, name: "lunchStartTime" });
  const lunchEndTime = useWatch({ control, name: "lunchEndTime" });
  const unpaidLunchBreak = useWatch({ control, name: "unpaidLunchBreak" });
  const withOT = useWatch({ control, name: "withOT" });

  const shiftStartSec = timeSpanToSeconds(startTime);
  const shiftEndSec = timeSpanToSeconds(endTime);
  const shiftDefined = !!startTime && !!endTime && shiftEndSec > shiftStartSec;

  const endBeforeStart = !!endTime && shiftEndSec <= shiftStartSec;

  const lunchStartSec = timeSpanToSeconds(lunchStartTime);
  const lunchEndSec = timeSpanToSeconds(lunchEndTime);
  const lunchStartOOB =
    unpaidLunchBreak &&
    shiftDefined &&
    !!lunchStartTime &&
    (lunchStartSec < shiftStartSec || lunchStartSec > shiftEndSec);
  const lunchEndOOB =
    unpaidLunchBreak &&
    shiftDefined &&
    !!lunchEndTime &&
    lunchEndSec > shiftEndSec;
  const lunchEndBeforeStart =
    unpaidLunchBreak &&
    !!lunchEndTime &&
    !!lunchStartTime &&
    lunchEndSec <= lunchStartSec;

  useEffect(() => {
    if (isEdit || !startTime) return;
    setValue("endTime", addHoursToTimeSpan(startTime, 16));
  }, [startTime, isEdit, setValue]);

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        shiftName: selected.shiftName,
        startTime: selected.startTime,
        endTime: selected.endTime,
        unpaidLunchBreak: selected.withLunchBreak === "UNPAID_BREAK",
        lunchStartTime: selected.lunchStartTime,
        lunchEndTime: selected.lunchEndTime,
        breakDurationMinutes: selected.breakDurationMinutes,
        minimumWorkMinutes: selected.minimumWorkMinutes,
        maxWorkingMinutes: selected.maxWorkingMinutes,
        withOT: selected.withOT,
        overTimeThreshold: selected.overTimeThreshold,
        maxOvertimeHours: selected.maxOvertimeHours,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: FlexiTimeShiftFormValues) => {
    const payload: CreateFlexiTimeShift = {
      shiftName: values.shiftName,
      shiftType: "FLEXI",
      startTime: values.startTime,
      endTime: values.endTime,
      withAMBreak: "UNPAID_BREAK",
      amStartTime: null,
      amEndTime: null,
      withLunchBreak: values.unpaidLunchBreak ? "UNPAID_BREAK" : "PAID_BREAK",
      lunchStartTime: values.unpaidLunchBreak
        ? (values.lunchStartTime ?? null)
        : null,
      lunchEndTime: values.unpaidLunchBreak
        ? (values.lunchEndTime ?? null)
        : null,
      withPMBreak: "UNPAID_BREAK",
      pmStartTime: null,
      pmEndTime: null,
      gracePeriodMinutes: 0,
      breakDurationMinutes: values.breakDurationMinutes,
      withOT: values.withOT,
      otRequireTimeIn: false,
      otStart: "00:00:00",
      overTimeThreshold: values.withOT ? values.overTimeThreshold : 0,
      maxOvertimeHours: values.withOT
        ? (values.maxOvertimeHours ?? null)
        : null,
      minimumWorkMinutes: values.minimumWorkMinutes,
      maxWorkingMinutes: values.maxWorkingMinutes,
    };

    if (isEdit && id) await update({ id, ...payload });
    else await add(payload);
    navigate({ to: "/setup/time-shift/flexi" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? FLEXI_TIME_SHIFT_LABEL.EDIT_TITLE
                : FLEXI_TIME_SHIFT_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure flexible shift windows and required working hours.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/time-shift/flexi" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={FLEXI_TIME_SHIFT_LABEL.SHIFT_NAME}
            validateStatus={errors.shiftName ? "error" : ""}
            help={errors.shiftName?.message}
          >
            <Controller
              name="shiftName"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g. Flexi Day Shift" />
              )}
            />
          </Form.Item>

          <SectionHeader>Flexible Window</SectionHeader>
          <div className="form-grid-2">
            <Form.Item
              label={FLEXI_TIME_SHIFT_LABEL.START_TIME}
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
              label={FLEXI_TIME_SHIFT_LABEL.END_TIME}
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
              label={FLEXI_TIME_SHIFT_LABEL.MIN_WORKING}
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
            <Form.Item
              label={FLEXI_TIME_SHIFT_LABEL.MAX_WORKING}
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
          </div>

          <SectionHeader>Break</SectionHeader>
          <Form.Item
            label={FLEXI_TIME_SHIFT_LABEL.UNPAID_LUNCH_BREAK}
            extra={
              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                Off = No break window · On = Enforce allowable break period
              </span>
            }
          >
            <Controller
              name="unpaidLunchBreak"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </Form.Item>
          {unpaidLunchBreak && (
            <div className="form-grid-2">
              <Form.Item
                label={FLEXI_TIME_SHIFT_LABEL.BREAK_PERIOD_START}
                validateStatus={lunchStartOOB ? "error" : ""}
                help={
                  lunchStartOOB
                    ? "Break start must be within the shift hours"
                    : undefined
                }
                extra={
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>
                    Breaks taken outside this window are unauthorized and will
                    be deducted from working hours.
                  </span>
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
                label={FLEXI_TIME_SHIFT_LABEL.BREAK_PERIOD_END}
                validateStatus={
                  lunchEndBeforeStart || lunchEndOOB ? "error" : ""
                }
                help={
                  lunchEndBeforeStart
                    ? "Break end must be after break start"
                    : lunchEndOOB
                      ? "Break end exceeds shift end time"
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
                label={FLEXI_TIME_SHIFT_LABEL.BREAK_DURATION}
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

          <SectionHeader>Overtime</SectionHeader>
          <Form.Item label={FLEXI_TIME_SHIFT_LABEL.ALLOW_OT}>
            <Controller
              name="withOT"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </Form.Item>
          {withOT && (
            <div className="form-grid-2">
              <Form.Item
                label={FLEXI_TIME_SHIFT_LABEL.OT_THRESHOLD}
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
              <Form.Item
                label={FLEXI_TIME_SHIFT_LABEL.MAX_OT_HOURS}
                validateStatus={errors.maxOvertimeHours ? "error" : ""}
                help={
                  errors.maxOvertimeHours?.message ??
                  "Leave blank or 0 for no limit"
                }
              >
                <Controller
                  name="maxOvertimeHours"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      className="w-full"
                      value={field.value ?? undefined}
                      onChange={(v) => field.onChange(v ?? null)}
                      min={0}
                      suffix="hrs"
                      placeholder="No limit"
                    />
                  )}
                />
              </Form.Item>
            </div>
          )}

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button
                onClick={() => navigate({ to: "/setup/time-shift/flexi" })}
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
