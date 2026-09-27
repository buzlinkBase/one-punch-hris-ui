import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  TimePicker,
} from "antd";
import { useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyEmployee,
  useMyTravelOrderApplications,
  useCreateMyTravelOrderApplication,
  useUpdateMyTravelOrderApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import { usePortalFormMode } from "../../../shared/hooks/use-portal-form-mode";
import { PortalApplicationShell } from "../../../shared/components/portal-application-shell";
import {
  travelOrderFormSchema,
  type TravelOrderFormValues,
} from "@/app/modules/applications/travel-order-application/models/forms/travel-order-application-form.schema";
import {
  TRAVEL_CLASSIFICATION_OPTIONS,
  TRAVEL_ORDER_LABEL,
} from "@/app/modules/applications/travel-order-application/constants/label.const";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import {
  buildStartDateTime,
  buildEndDateTime,
  isCrossMidnight,
} from "@/shared/utils/duration.util";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const { TextArea } = Input;

const MODE_OPTIONS = [
  { label: "Time Range", value: "timerange" },
  { label: "Hours", value: "hours" },
];

const BACK_TO = "/portal/official-business";

/** File (create), edit (own pending) or view (read-only) an official business application. */
export default function PortalOfficialBusinessCreate() {
  const navigate = useNavigate();
  const { id, mode: pageMode } = usePortalFormMode();
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { data: applications = [], isLoading: applicationsLoading } =
    useMyTravelOrderApplications();
  const { mutateAsync: create, isPending: isCreating } =
    useCreateMyTravelOrderApplication();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateMyTravelOrderApplication();
  const { data: timeShifts = [] } = useFixedTimeShifts();

  const record = id ? applications.find((a) => a.id === id) : undefined;
  // Only a still-pending application is editable; anything else opens as a view.
  const readOnly =
    pageMode === "view" ||
    (!!record && record.approvalStatus !== "ForApproval");

  const timeShiftOptions = timeShifts.map((s) => ({
    value: s.id,
    label: s.shiftName,
    startTime: s.startTime,
    endTime: s.endTime,
  }));

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TravelOrderFormValues>({
    resolver: zodResolver(travelOrderFormSchema),
    defaultValues: {
      employeeId: employee?.id ?? "",
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
      cost: 0,
      applicationRemarks: "",
    },
  });

  // employeeId isn't a visible field here -- useMyEmployee() resolves after this form's
  // defaultValues are already fixed at first render, so without this it stays "" forever and
  // blocks submission with no visible error.
  useEffect(() => {
    if (employee) setValue("employeeId", employee.id);
  }, [employee, setValue]);

  useEffect(() => {
    if (!record) return;
    const isHours = !!record.isManualEntry;
    reset({
      employeeId: record.employeeId,
      startDate: record.startDate,
      endDate: record.endDate,
      mode: isHours ? "hours" : "timerange",
      timeShiftId: undefined,
      startTime:
        !isHours && record.startTime
          ? dayjs(record.startTime).format("HH:mm")
          : "",
      endTime:
        !isHours && record.endTime ? dayjs(record.endTime).format("HH:mm") : "",
      totalHours:
        isHours && record.totalMinutes != null
          ? record.totalMinutes / 60
          : undefined,
      destination: record.destination,
      classification: record.classification,
      purpose: record.purpose,
      cost: 0,
      applicationRemarks: record.applicationRemarks ?? "",
    });
  }, [record, reset]);

  const mode = useWatch({ control, name: "mode" });
  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });
  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });

  const crossMidnight =
    mode === "timerange" && isCrossMidnight(startTime ?? "", endTime ?? "");

  const onSubmit = async (values: TravelOrderFormValues) => {
    const timePayload =
      values.mode === "timerange"
        ? {
            isManualEntry: false,
            startTime: buildStartDateTime(
              values.startDate,
              values.startTime ?? "",
            ),
            endTime: buildEndDateTime(
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

    const payload = {
      employeeId: employee!.id,
      startDate: values.startDate,
      endDate: values.endDate,
      destination: values.destination,
      classification: values.classification,
      purpose: values.purpose,
      cost: 0,
      applicationRemarks: values.applicationRemarks,
      ...timePayload,
    };
    if (id) await update({ id, data: payload });
    else await create(payload);
    navigate({ to: BACK_TO });
  };

  return (
    <PortalApplicationShell
      mode={pageMode}
      titles={{
        create: "File Official Business",
        edit: "Edit Official Business",
        view: "View Official Business",
      }}
      subtitle="Submit an official business / travel application for approval."
      backTo={BACK_TO}
      applicationType="OfficialBusiness"
      record={record}
      loading={employeeLoading || (!!id && applicationsLoading)}
      noEmployee={!employee}
      readOnly={readOnly}
    >
      <Form
        layout="vertical"
        disabled={readOnly}
        onFinish={handleSubmit(onSubmit)}
      >
        {/* Date Range | Entry Mode -- mirrors admin's top row (minus Employee, auto-scoped) */}
        <div className="form-grid-2">
          <Form.Item
            label="Travel Date Range"
            validateStatus={errors.startDate || errors.endDate ? "error" : ""}
            help={errors.startDate?.message || errors.endDate?.message}
          >
            <MobileRangePicker
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
        <div className="rounded-lg border border-(--ant-color-border) bg-(--ant-color-fill-quaternary) px-4 pt-4 pb-1 mb-6">
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
                      filterOption={(input, option) =>
                        String(option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={field.value || undefined}
                      onChange={(val) => {
                        field.onChange(val);
                        const shift = timeShiftOptions.find(
                          (s) => s.value === val,
                        );
                        if (shift) {
                          const fmt = (t: string) =>
                            dayjs(t, ["HH:mm:ss", "HH:mm"]).format("HH:mm");
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
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        style={{ width: "100%" }}
                        use12Hours
                        format="hh:mm A"
                        value={field.value ? dayjs(field.value, "HH:mm") : null}
                        onChange={(t) =>
                          field.onChange(t ? t.format("HH:mm") : "")
                        }
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="flex items-center gap-2">
                      {TRAVEL_ORDER_LABEL.END_TIME}
                      {crossMidnight && (
                        <Tag color="blue" className="text-[11px] leading-none">
                          +1 day
                        </Tag>
                      )}
                    </span>
                  }
                  validateStatus={errors.endTime ? "error" : ""}
                  help={errors.endTime?.message}
                >
                  <Controller
                    name="endTime"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        style={{ width: "100%" }}
                        use12Hours
                        format="hh:mm A"
                        value={field.value ? dayjs(field.value, "HH:mm") : null}
                        onChange={(t) =>
                          field.onChange(t ? t.format("HH:mm") : "")
                        }
                      />
                    )}
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
                "Enter the total hours for this travel (e.g. 4, 1.5 for 1 hr 30 min)."
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
                    onChange={(v) => field.onChange(v ?? undefined)}
                  />
                )}
              />
            </Form.Item>
          )}
        </div>

        {/* Destination | Classification */}
        <div className="form-grid-2">
          <Form.Item
            label="Destination"
            validateStatus={errors.destination ? "error" : ""}
            help={errors.destination?.message}
          >
            <Controller
              name="destination"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="City, Province or Address" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Classification"
            validateStatus={errors.classification ? "error" : ""}
            help={errors.classification?.message}
          >
            <Controller
              name="classification"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select classification"
                  options={TRAVEL_CLASSIFICATION_OPTIONS}
                  value={field.value || undefined}
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Purpose"
          validateStatus={errors.purpose ? "error" : ""}
          help={errors.purpose?.message}
        >
          <Controller
            name="purpose"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                rows={3}
                placeholder="Describe the purpose of this official business"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Remarks"
          validateStatus={errors.applicationRemarks ? "error" : ""}
          help={errors.applicationRemarks?.message}
        >
          <Controller
            name="applicationRemarks"
            control={control}
            render={({ field }) => <TextArea {...field} rows={2} />}
          />
        </Form.Item>

        {!readOnly && (
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreating || isUpdating}
            >
              {id ? "Save Changes" : "Submit Application"}
            </Button>
            <Button onClick={() => navigate({ to: BACK_TO })}>Cancel</Button>
          </Space>
        )}
      </Form>
    </PortalApplicationShell>
  );
}
