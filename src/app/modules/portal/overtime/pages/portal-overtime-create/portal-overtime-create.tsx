import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Space,
  TimePicker,
} from "antd";
import { useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyEmployee,
  useMyOvertimeApplications,
  useCreateMyOvertimeApplication,
  useUpdateMyOvertimeApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import { usePortalFormMode } from "../../../shared/hooks/use-portal-form-mode";
import { PortalApplicationShell } from "../../../shared/components/portal-application-shell";
import {
  overtimeApplicationFormSchema,
  type OvertimeApplicationFormValues,
} from "@/app/modules/applications/overtime-application/models/forms/overtime-application-form.schema";
import {
  buildStartDateTime,
  buildEndDateTime,
  isCrossMidnight,
} from "@/shared/utils/duration.util";

const { TextArea } = Input;

const MODE_OPTIONS = [
  { label: "Time Range", value: "datetime" },
  { label: "Manual Minutes", value: "hours" },
];

const BACK_TO = "/portal/overtime";

/** File (create), edit (own pending) or view (read-only) an overtime application. */
export default function PortalOvertimeCreate() {
  const navigate = useNavigate();
  const { id, mode } = usePortalFormMode();
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { data: applications = [], isLoading: applicationsLoading } =
    useMyOvertimeApplications();
  const { mutateAsync: create, isPending: isCreating } =
    useCreateMyOvertimeApplication();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateMyOvertimeApplication();

  const record = id ? applications.find((a) => a.id === id) : undefined;
  // Only a still-pending application is editable; anything else opens as a view.
  const readOnly =
    mode === "view" || (!!record && record.approvalStatus !== "ForApproval");

  const {
    control,
    handleSubmit,
    reset,
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
    const isHours = record.isManualEntry;
    reset({
      mode: isHours ? "hours" : "datetime",
      employeeId: record.employeeId,
      otDate: dayjs(record.otDate).format("YYYY-MM-DD"),
      startTime:
        !isHours && record.startTime
          ? dayjs(record.startTime).format("HH:mm")
          : "",
      endTime:
        !isHours && record.endTime ? dayjs(record.endTime).format("HH:mm") : "",
      manualOTMinutes:
        isHours && record.manualOTMinutes
          ? record.manualOTMinutes / 60
          : undefined,
      remarks: record.remarks ?? "",
    });
  }, [record, reset]);

  const formMode = useWatch({ control, name: "mode" });
  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });

  const crossMidnight =
    formMode === "datetime" && isCrossMidnight(startTime ?? "", endTime ?? "");

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

    if (id) await update({ id, data: payload });
    else await create(payload);
    navigate({ to: BACK_TO });
  };

  return (
    <PortalApplicationShell
      mode={mode}
      titles={{
        create: "New Overtime Request",
        edit: "Edit Overtime Application",
        view: "View Overtime Application",
      }}
      subtitle="Submit an overtime request for approval."
      backTo={BACK_TO}
      applicationType="Overtime"
      record={record}
      loading={employeeLoading || (!!id && applicationsLoading)}
      noEmployee={!employee}
      readOnly={readOnly}
    >
      <Alert
        type="info"
        showIcon
        className="mb-4"
        message="OT applications are capped to the employee's actual overtime rendered — any excess entered here will not be paid out."
      />
      <Form
        layout="vertical"
        disabled={readOnly}
        onFinish={handleSubmit(onSubmit)}
      >
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

        {formMode === "datetime" ? (
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
                    value={field.value ? dayjs(field.value, "HH:mm") : null}
                    format="HH:mm"
                    onChange={(t) => field.onChange(t ? t.format("HH:mm") : "")}
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
                    value={field.value ? dayjs(field.value, "HH:mm") : null}
                    format="HH:mm"
                    onChange={(t) => field.onChange(t ? t.format("HH:mm") : "")}
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
