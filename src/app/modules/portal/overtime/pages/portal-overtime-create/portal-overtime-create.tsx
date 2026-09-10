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
  useCreateMyOvertimeApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import {
  overtimeApplicationFormSchema,
  type OvertimeApplicationFormValues,
} from "@/app/modules/applications/overtime-application/models/forms/overtime-application-form.schema";
import {
  buildStartDateTime,
  buildEndDateTime,
  isCrossMidnight,
} from "@/shared/utils/duration.util";

const { Title } = Typography;
const { TextArea } = Input;

const MODE_OPTIONS = [
  { label: "Time Range", value: "datetime" },
  { label: "Manual Minutes", value: "hours" },
];

export default function PortalOvertimeCreate() {
  const navigate = useNavigate();
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { mutateAsync: create, isPending } = useCreateMyOvertimeApplication();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OvertimeApplicationFormValues>({
    resolver: zodResolver(overtimeApplicationFormSchema),
    defaultValues: {
      mode: "datetime",
      employeeId: employee?.id ?? "",
      otDate: "",
      startTime: "",
      endTime: "",
      manualOTMinutes: undefined,
      remarks: "",
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
  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });

  const crossMidnight =
    mode === "datetime" && isCrossMidnight(startTime ?? "", endTime ?? "");

  const onSubmit = async (values: OvertimeApplicationFormValues) => {
    const payload =
      values.mode === "datetime"
        ? {
            employeeId: employee!.id,
            otDate: values.otDate,
            startTime: buildStartDateTime(
              values.otDate,
              values.startTime ?? "",
            ),
            endTime: buildEndDateTime(
              values.otDate,
              values.startTime ?? "",
              values.endTime ?? "",
            ),
            manualOtMinutes: 0,
            isManualEntry: false,
            remarks: values.remarks,
          }
        : {
            employeeId: employee!.id,
            otDate: values.otDate,
            startTime: null,
            endTime: null,
            manualOtMinutes: Math.round((values.manualOTMinutes ?? 0) * 60),
            isManualEntry: true,
            remarks: values.remarks,
          };

    await create(payload);
    navigate({ to: "/portal/overtime" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              File Overtime Application
            </Title>
            <p className="page-toolbar-subtitle">
              Submit an overtime request for approval.
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
        {employeeLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : !employee ? (
          <Empty description="No employee profile is linked to your account yet. Contact HR if you believe this is a mistake." />
        ) : (
          <Card>
            <Alert
              type="info"
              showIcon
              className="mb-4"
              message="OT applications are capped to the employee's actual overtime rendered — any excess entered here will not be paid out."
            />
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
              <Form.Item
                label="OT Date"
                validateStatus={errors.otDate ? "error" : ""}
                help={errors.otDate?.message}
              >
                <Controller
                  name="otDate"
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

              <Form.Item label="How will this OT be recorded?">
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

              {mode === "datetime" ? (
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
                    <Form.Item label=" ">
                      <span className="text-(--ant-color-text-tertiary)">
                        Ends the next day
                      </span>
                    </Form.Item>
                  )}
                </Space>
              ) : (
                <Form.Item
                  label="OT Minutes (in hours)"
                  validateStatus={errors.manualOTMinutes ? "error" : ""}
                  help={errors.manualOTMinutes?.message}
                >
                  <Controller
                    name="manualOTMinutes"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        min={0.25}
                        step={0.25}
                        onChange={(v) => field.onChange(v ?? undefined)}
                      />
                    )}
                  />
                </Form.Item>
              )}

              <Form.Item label="Remarks">
                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      rows={3}
                      placeholder="Reason for this overtime"
                    />
                  )}
                />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" loading={isPending}>
                  Submit Application
                </Button>
                <Button onClick={() => navigate({ to: "/portal/overtime" })}>
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
