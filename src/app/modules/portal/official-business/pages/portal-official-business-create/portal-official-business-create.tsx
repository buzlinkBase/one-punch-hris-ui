import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Space,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import { useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyEmployee,
  useCreateMyTravelOrderApplication,
} from "../../../shared/hooks/use-my-employee-queries";
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

const { Title } = Typography;
const { TextArea } = Input;

const MODE_OPTIONS = [
  { label: "Time Range", value: "timerange" },
  { label: "Hours", value: "hours" },
];

export default function PortalOfficialBusinessCreate() {
  const navigate = useNavigate();
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { mutateAsync: create, isPending } =
    useCreateMyTravelOrderApplication();
  const { data: timeShifts = [] } = useFixedTimeShifts();

  const timeShiftOptions = timeShifts.map((s) => ({
    value: s.id,
    label: s.shiftName,
    startTime: s.startTime,
    endTime: s.endTime,
  }));

  const {
    control,
    handleSubmit,
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
      approvalStatus: "ForApproval",
    },
  });

  // employeeId isn't a visible field here -- useMyEmployee() resolves after this form's
  // defaultValues are already fixed at first render, so without this it stays "" forever and
  // blocks submission with no visible error.
  useEffect(() => {
    if (employee) setValue("employeeId", employee.id);
  }, [employee, setValue]);

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

    await create({
      employeeId: employee!.id,
      startDate: values.startDate,
      endDate: values.endDate,
      destination: values.destination,
      classification: values.classification,
      purpose: values.purpose,
      cost: 0,
      applicationRemarks: values.applicationRemarks,
      approvalStatus: "ForApproval",
      ...timePayload,
    });
    navigate({ to: "/portal/official-business" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              File Official Business
            </Title>
            <p className="page-toolbar-subtitle">
              Submit an official business / travel application for approval.
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
        {employeeLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : !employee ? (
          <Empty description="No employee profile is linked to your account yet. Contact HR if you believe this is a mistake." />
        ) : (
          <Card>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
              {/* Date Range | Entry Mode -- mirrors admin's top row (minus Employee, auto-scoped) */}
              <div className="form-grid-2">
                <Form.Item
                  label="Travel Date Range"
                  validateStatus={
                    errors.startDate || errors.endDate ? "error" : ""
                  }
                  help={errors.startDate?.message || errors.endDate?.message}
                >
                  <MobileRangePicker
                    style={{ width: "100%" }}
                    value={[
                      startDate ? dayjs(startDate) : null,
                      endDate ? dayjs(endDate) : null,
                    ]}
                    onChange={(dates) => {
                      setValue(
                        "startDate",
                        dates?.[0]?.format("YYYY-MM-DD") ?? "",
                      );
                      setValue(
                        "endDate",
                        dates?.[1]?.format("YYYY-MM-DD") ?? "",
                      );
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
                                  dayjs(t, ["HH:mm:ss", "HH:mm"]).format(
                                    "HH:mm",
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
                        <Controller
                          name="startTime"
                          control={control}
                          render={({ field }) => (
                            <TimePicker
                              style={{ width: "100%" }}
                              use12Hours
                              format="hh:mm A"
                              value={
                                field.value ? dayjs(field.value, "HH:mm") : null
                              }
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
                        <Controller
                          name="endTime"
                          control={control}
                          render={({ field }) => (
                            <TimePicker
                              style={{ width: "100%" }}
                              use12Hours
                              format="hh:mm A"
                              value={
                                field.value ? dayjs(field.value, "HH:mm") : null
                              }
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
                      <Input
                        {...field}
                        placeholder="City, Province or Address"
                      />
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

              <Space>
                <Button type="primary" htmlType="submit" loading={isPending}>
                  Submit Application
                </Button>
                <Button
                  onClick={() => navigate({ to: "/portal/official-business" })}
                >
                  Cancel
                </Button>
              </Space>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
}
