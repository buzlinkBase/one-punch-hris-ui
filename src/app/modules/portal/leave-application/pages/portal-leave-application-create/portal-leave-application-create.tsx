import {
  Alert,
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Skeleton,
  Space,
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
  useCreateMyLeaveApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import { useLeaveTypes } from "@/app/modules/setup/leave-type/hooks/use-leave-type-queries";
import {
  leaveApplicationFormSchema,
  type LeaveApplicationFormValues,
} from "@/app/modules/applications/leave-application/models/forms/leave-application-form.schema";
import type { CreateLeaveApplication } from "@/app/modules/applications/leave-application/models/api/request/create-leave-application.model";
import {
  buildStartDateTime,
  buildEndDateTime,
  isCrossMidnight,
} from "@/shared/utils/duration.util";

const { Title } = Typography;
const { TextArea } = Input;

const MODE_OPTIONS = [
  { label: "Single Day", value: "singleday" },
  { label: "Multiple Days", value: "multiday" },
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
  { value: "WithPay", label: "With Pay" },
  { value: "WithoutPay", label: "Without Pay" },
];

export default function PortalLeaveApplicationCreate() {
  const navigate = useNavigate();
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const { mutateAsync: create, isPending } = useCreateMyLeaveApplication();

  const leaveTypeOptions = leaveTypes.map((l) => ({
    value: l.id,
    label: `${l.code} - ${l.description}`,
  }));

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LeaveApplicationFormValues>({
    resolver: zodResolver(leaveApplicationFormSchema),
    defaultValues: {
      employeeId: employee?.id ?? "",
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
      payoutMode: "perday",
      applicationRemarks: "",
      supportingDocumentUrl: "",
      approvalStatus: "ForApproval",
    },
  });

  // employeeId isn't a visible field here (unlike the admin leave-application form that shares
  // this schema) -- it's only present to satisfy the schema's required-employee validation, and
  // useMyEmployee() resolves after this form's defaultValues are already fixed at first render.
  // Without this, employeeId stays "" forever and blocks submission with no visible error.
  useEffect(() => {
    if (employee) setValue("employeeId", employee.id);
  }, [employee, setValue]);

  const mode = useWatch({ control, name: "mode" });
  const partialMode = useWatch({ control, name: "partialMode" });
  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });

  const crossMidnight =
    mode === "partial" &&
    (partialMode ?? "timerange") === "timerange" &&
    isCrossMidnight(startTime ?? "", endTime ?? "");

  const onSubmit = async (values: LeaveApplicationFormValues) => {
    const isMultiDay = values.mode === "multiday";
    const dateFrom = isMultiDay ? values.leaveDateFrom! : values.leaveDate!;
    const dateTo = isMultiDay ? values.leaveDateTo! : values.leaveDate!;

    const durationType: CreateLeaveApplication["durationType"] =
      values.mode === "multiday"
        ? "MultiDay"
        : values.mode === "partial"
          ? "Partial"
          : "SingleDay";

    let dayFraction: CreateLeaveApplication["dayFraction"] = "FullDay";
    if (values.mode === "singleday") {
      if (values.dayFraction === "am") dayFraction = "AM";
      else if (values.dayFraction === "pm") dayFraction = "PM";
    }

    const pMode = values.partialMode ?? "timerange";
    let timePayload: Pick<
      CreateLeaveApplication,
      "isManualEntry" | "startTime" | "endTime" | "totalMinutes"
    >;
    if (values.mode === "partial" && pMode === "timerange") {
      timePayload = {
        isManualEntry: false,
        startTime: buildStartDateTime(dateFrom, values.startTime ?? ""),
        endTime: buildEndDateTime(
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

    await create({
      employeeId: employee!.id,
      leaveId: values.leaveId,
      durationType,
      leaveDateFrom: dateFrom,
      leaveDateTo: dateTo,
      dayFraction,
      payType: values.payType,
      payoutMode: "PerDay",
      applicationRemarks: values.applicationRemarks,
      supportingDocumentUrl: values.supportingDocumentUrl || undefined,
      approvalStatus: "ForApproval",
      ...timePayload,
    });
    navigate({ to: "/portal/leave-applications" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              File Leave Application
            </Title>
            <p className="page-toolbar-subtitle">
              Submit a leave request for approval.
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
              <Form.Item
                label="Leave Type"
                validateStatus={errors.leaveId ? "error" : ""}
                help={errors.leaveId?.message}
              >
                <Controller
                  name="leaveId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={leaveTypeOptions}
                      showSearch
                      optionFilterProp="label"
                      placeholder="Select a leave type"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item label="Duration">
                <Controller
                  name="mode"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group
                      {...field}
                      options={MODE_OPTIONS}
                      optionType="button"
                    />
                  )}
                />
              </Form.Item>

              {mode === "singleday" && (
                <Space size="large" wrap>
                  <Form.Item
                    label="Date"
                    validateStatus={errors.leaveDate ? "error" : ""}
                    help={errors.leaveDate?.message}
                  >
                    <Controller
                      name="leaveDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(d) =>
                            field.onChange(d ? d.format("YYYY-MM-DD") : "")
                          }
                        />
                      )}
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
                        <Select
                          {...field}
                          options={DAY_FRACTION_OPTIONS}
                          style={{ width: 160 }}
                        />
                      )}
                    />
                  </Form.Item>
                </Space>
              )}

              {mode === "multiday" && (
                <Space size="large" wrap>
                  <Form.Item
                    label="From"
                    validateStatus={errors.leaveDateFrom ? "error" : ""}
                    help={errors.leaveDateFrom?.message}
                  >
                    <Controller
                      name="leaveDateFrom"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(d) =>
                            field.onChange(d ? d.format("YYYY-MM-DD") : "")
                          }
                        />
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    label="To"
                    validateStatus={errors.leaveDateTo ? "error" : ""}
                    help={errors.leaveDateTo?.message}
                  >
                    <Controller
                      name="leaveDateTo"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(d) =>
                            field.onChange(d ? d.format("YYYY-MM-DD") : "")
                          }
                        />
                      )}
                    />
                  </Form.Item>
                </Space>
              )}

              {mode === "partial" && (
                <>
                  <Form.Item
                    label="Date"
                    validateStatus={errors.leaveDate ? "error" : ""}
                    help={errors.leaveDate?.message}
                  >
                    <Controller
                      name="leaveDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(d) =>
                            field.onChange(d ? d.format("YYYY-MM-DD") : "")
                          }
                        />
                      )}
                    />
                  </Form.Item>
                  <Form.Item label="Partial Filing Mode">
                    <Controller
                      name="partialMode"
                      control={control}
                      render={({ field }) => (
                        <Radio.Group
                          {...field}
                          options={PARTIAL_MODE_OPTIONS}
                          optionType="button"
                        />
                      )}
                    />
                  </Form.Item>
                  {(partialMode ?? "timerange") === "timerange" ? (
                    <Space size="large" wrap align="start">
                      <Form.Item
                        label="Start Time"
                        validateStatus={errors.startTime ? "error" : ""}
                        help={errors.startTime?.message}
                      >
                        <Controller
                          name="startTime"
                          control={control}
                          render={({ field }) => (
                            <TimePicker
                              value={
                                field.value ? dayjs(field.value, "HH:mm") : null
                              }
                              format="HH:mm"
                              onChange={(t) =>
                                field.onChange(t ? t.format("HH:mm") : "")
                              }
                            />
                          )}
                        />
                      </Form.Item>
                      <Form.Item
                        label="End Time"
                        validateStatus={errors.endTime ? "error" : ""}
                        help={errors.endTime?.message}
                      >
                        <Controller
                          name="endTime"
                          control={control}
                          render={({ field }) => (
                            <TimePicker
                              value={
                                field.value ? dayjs(field.value, "HH:mm") : null
                              }
                              format="HH:mm"
                              onChange={(t) =>
                                field.onChange(t ? t.format("HH:mm") : "")
                              }
                            />
                          )}
                        />
                      </Form.Item>
                      {crossMidnight && (
                        <Alert
                          type="info"
                          showIcon
                          message="Ends the next day"
                          className="self-center"
                        />
                      )}
                    </Space>
                  ) : (
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
                            min={0}
                            step={0.5}
                            onChange={(v) => field.onChange(v ?? undefined)}
                          />
                        )}
                      />
                    </Form.Item>
                  )}
                </>
              )}

              <Form.Item label="Pay Type">
                <Controller
                  name="payType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={PAY_TYPE_OPTIONS}
                      style={{ width: 200 }}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item label="Remarks">
                <Controller
                  name="applicationRemarks"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      rows={3}
                      placeholder="Reason for your leave application"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item label="Supporting Document URL (optional)">
                <Controller
                  name="supportingDocumentUrl"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="https://..." />
                  )}
                />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" loading={isPending}>
                  Submit Application
                </Button>
                <Button
                  onClick={() => navigate({ to: "/portal/leave-applications" })}
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
