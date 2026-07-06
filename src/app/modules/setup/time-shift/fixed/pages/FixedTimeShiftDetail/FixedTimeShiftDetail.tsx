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
import { useRouteParams } from "@/shared/hooks/useRouteParams";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fromTimeSpan, toTimeSpan } from "@/shared/utils/time-span.util";
import { TimeSpanPicker } from "@/shared/components/TimeSpanPicker";
import {
  fixedTimeShiftFormSchema,
  type FixedTimeShiftFormValues,
} from "../../models/forms/fixed-time-shift-form.schema";
import {
  useFixedTimeShift,
  useCreateFixedTimeShift,
  useUpdateFixedTimeShift,
} from "../../hooks/useFixedTimeShiftQueries";
import { FIXED_TIME_SHIFT_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import type { CreateFixedTimeShift } from "../../models/api/request/create-fixed-time-shift.model";

const { Title } = Typography;

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 12px" }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
  const { mutateAsync: update, isPending: isUpdating } = useUpdateFixedTimeShift();

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
  const withLunchBreak = useWatch({ control, name: "withLunchBreak" });
  const withAMBreak = useWatch({ control, name: "withAMBreak" });
  const withPMBreak = useWatch({ control, name: "withPMBreak" });
  const withOT = useWatch({ control, name: "withOT" });

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
      lunchStartTime: values.withLunchBreak !== "NONE" ? (values.lunchStartTime ?? null) : null,
      lunchEndTime: values.withLunchBreak !== "NONE" ? (values.lunchEndTime ?? null) : null,
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
              {isEdit ? FIXED_TIME_SHIFT_LABEL.EDIT_TITLE : FIXED_TIME_SHIFT_LABEL.CREATE_TITLE}
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
              validateStatus={errors.endTime ? "error" : ""}
              help={errors.endTime?.message}
            >
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <TimeSpanPicker value={field.value} onChange={field.onChange} />
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
                  <InputNumber className="w-full" {...field} min={0} suffix="min" />
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
                  <InputNumber className="w-full" {...field} min={0} suffix="min" />
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
                  <InputNumber className="w-full" {...field} min={0} suffix="min" />
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
                <Select {...field} options={BREAK_MODE_OPTIONS} style={{ maxWidth: 280 }} />
              )}
            />
          </Form.Item>
          {withLunchBreak !== "NONE" && (
            <div className="form-grid-2">
              <Form.Item label={FIXED_TIME_SHIFT_LABEL.LUNCH_START}>
                <Controller
                  name="lunchStartTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSpanPicker value={field.value} onChange={field.onChange} nullable />
                  )}
                />
              </Form.Item>
              <Form.Item label={FIXED_TIME_SHIFT_LABEL.LUNCH_END}>
                <Controller
                  name="lunchEndTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSpanPicker value={field.value} onChange={field.onChange} nullable />
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
                      readOnly={withLunchBreak === "PAID_BREAK"}
                    />
                  )}
                />
              </Form.Item>
            </div>
          )}

          <SectionHeader>
            AM Break
            {amPmBreakDisabled && (
              <span style={{ fontSize: 11, fontWeight: 400, color: "#9ca3af", marginLeft: 8, textTransform: "none", letterSpacing: "normal" }}>
                (disabled when lunch is Paid Break)
              </span>
            )}
          </SectionHeader>
          <Form.Item
            label={FIXED_TIME_SHIFT_LABEL.AM_BREAK}
            extra={<span style={{ fontSize: 11, color: "#9ca3af" }}>Off = No break · On = Paid break</span>}
          >
            <Controller
              name="withAMBreak"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} disabled={amPmBreakDisabled} />
              )}
            />
          </Form.Item>
          {withAMBreak && (
            <div className="form-grid-2">
              <Form.Item label={FIXED_TIME_SHIFT_LABEL.AM_START}>
                <Controller
                  name="amStartTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSpanPicker value={field.value} onChange={field.onChange} nullable />
                  )}
                />
              </Form.Item>
              <Form.Item label={FIXED_TIME_SHIFT_LABEL.AM_END}>
                <Controller
                  name="amEndTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSpanPicker value={field.value} onChange={field.onChange} nullable />
                  )}
                />
              </Form.Item>
            </div>
          )}

          <SectionHeader>
            PM Break
            {amPmBreakDisabled && (
              <span style={{ fontSize: 11, fontWeight: 400, color: "#9ca3af", marginLeft: 8, textTransform: "none", letterSpacing: "normal" }}>
                (disabled when lunch is Paid Break)
              </span>
            )}
          </SectionHeader>
          <Form.Item
            label={FIXED_TIME_SHIFT_LABEL.PM_BREAK}
            extra={<span style={{ fontSize: 11, color: "#9ca3af" }}>Off = No break · On = Paid break</span>}
          >
            <Controller
              name="withPMBreak"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} disabled={amPmBreakDisabled} />
              )}
            />
          </Form.Item>
          {withPMBreak && (
            <div className="form-grid-2">
              <Form.Item label={FIXED_TIME_SHIFT_LABEL.PM_START}>
                <Controller
                  name="pmStartTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSpanPicker value={field.value} onChange={field.onChange} nullable />
                  )}
                />
              </Form.Item>
              <Form.Item label={FIXED_TIME_SHIFT_LABEL.PM_END}>
                <Controller
                  name="pmEndTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSpanPicker value={field.value} onChange={field.onChange} nullable />
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
                  validateStatus={errors.otStart ? "error" : ""}
                  help={errors.otStart?.message}
                >
                  <Controller
                    name="otStart"
                    control={control}
                    render={({ field }) => (
                      <TimeSpanPicker value={field.value} onChange={field.onChange} />
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
                      <InputNumber className="w-full" {...field} min={0} suffix="min" />
                    )}
                  />
                </Form.Item>
              </div>
            </>
          )}

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/time-shift/fixed" })}>
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
