import { useEffect } from "react";
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
  Card,
  Descriptions,
  Alert,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  overtimeApplicationFormSchema,
  type OvertimeApplicationFormValues,
} from "../../models/forms/overtime-application-form.schema";
import {
  useOvertimeApplication,
  useCreateOvertimeApplication,
  useUpdateOvertimeApplication,
} from "../../hooks/use-overtime-application-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { OVERTIME_APPLICATION_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalTimeline } from "@/shared/components/approval-timeline/approval-timeline";

const { Title } = Typography;
const { TextArea } = Input;

const APPROVAL_STATUS_OPTIONS = [
  { value: "ForApproval", label: "For Approval" },
  { value: "Approved", label: "Approved" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Declined", label: "Declined" },
  { value: "Withdrawn", label: "Withdrawn" },
];

const STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Cancelled: "default",
  Declined: "error",
  Withdrawn: "default",
};

const MODE_OPTIONS = [
  { label: "Time Range", value: "datetime" },
  { label: "Hours", value: "hours" },
];

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

function buildStartDateTime(date: string, time: string): string {
  if (!date || !time) return "";
  return dayjs(`${date}T${time}`).format("YYYY-MM-DDTHH:mm:ss");
}

function buildEndDateTime(
  date: string,
  startTime: string,
  endTime: string,
): string {
  if (!date || !endTime) return "";
  const end = dayjs(`${date}T${endTime}`);
  return (endTime < startTime ? end.add(1, "day") : end).format(
    "YYYY-MM-DDTHH:mm:ss",
  );
}

function isCrossMidnight(startTime: string, endTime: string): boolean {
  return !!startTime && !!endTime && endTime < startTime;
}

function detectMode(isManualEntry?: boolean): "datetime" | "hours" {
  return isManualEntry ? "hours" : "datetime";
}

export default function OvertimeApplicationDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = useOvertimeApplication(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } =
    useCreateOvertimeApplication();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateOvertimeApplication();
  const { data: rawEmployees = [] } = useEmployees();

  const employeeOptions = rawEmployees.map((e) => ({
    value: e.id,
    label: e.fullName ?? `${e.firstName} ${e.lastName}`,
  }));
  const employeeMap = new Map(
    rawEmployees.map((e) => [
      e.id,
      e.fullName ?? `${e.firstName} ${e.lastName}`,
    ]),
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OvertimeApplicationFormValues>({
    resolver: zodResolver(overtimeApplicationFormSchema),
    defaultValues: {
      mode: "hours",
      employeeId: "",
      otDate: "",
      startTime: "",
      endTime: "",
      manualOTMinutes: undefined,
      remarks: "",
      approvalStatus: "Approved",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const mode = watch("mode");
  const otDate = watch("otDate");
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  useEffect(() => {
    if (isEdit && selected) {
      const editMode = detectMode(selected.isManualEntry);
      reset({
        mode: editMode,
        employeeId: selected.employeeId,
        otDate: dayjs(selected.otDate).format("YYYY-MM-DD"),
        startTime:
          editMode === "datetime" && selected.startTime
            ? dayjs(selected.startTime).format("HH:mm:ss")
            : "",
        endTime:
          editMode === "datetime" && selected.endTime
            ? dayjs(selected.endTime).format("HH:mm:ss")
            : "",
        manualOTMinutes:
          editMode === "hours" && selected.manualOTMinutes
            ? selected.manualOTMinutes / 60
            : undefined,
        remarks: selected.remarks ?? "",
        approvalStatus: selected.approvalStatus,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: OvertimeApplicationFormValues) => {
    const payload =
      values.mode === "datetime"
        ? {
            employeeId: values.employeeId,
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
            employeeId: values.employeeId,
            otDate: values.otDate,
            startTime: null,
            endTime: null,
            manualOtMinutes: Math.round((values.manualOTMinutes ?? 0) * 60),
            isManualEntry: true,
            remarks: values.remarks,
          };

    if (isEdit && id) {
      await update({
        id,
        approvalStatus: values.approvalStatus,
        ...payload,
      });
    } else {
      await add({ ...payload, approvalStatus: values.approvalStatus });
    }
    navigate({ to: "/applications/overtime" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? OVERTIME_APPLICATION_LABEL.EDIT_TITLE
                : OVERTIME_APPLICATION_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              File an overtime request for pre-approval.
            </p>
          </div>
          <Space>
            {isEdit && selected ? (
              <Tag color={STATUS_COLOR[selected.approvalStatus] ?? "default"}>
                {selected.approvalStatus === "ForApproval"
                  ? "For Approval"
                  : selected.approvalStatus}
              </Tag>
            ) : (
              <Tag color="success">New Record</Tag>
            )}
            <Button onClick={() => navigate({ to: "/applications/overtime" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message="OT applications are capped to the employee's actual overtime rendered — any excess entered here will not be paid out."
        />

        {isEdit && selected && (
          <Card size="small" className="mb-4">
            <Descriptions size="small" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label={OVERTIME_APPLICATION_LABEL.STATUS}>
                <Tag color={STATUS_COLOR[selected.approvalStatus] ?? "default"}>
                  {selected.approvalStatus === "ForApproval"
                    ? "For Approval"
                    : selected.approvalStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={OVERTIME_APPLICATION_LABEL.OT_MINUTES}>
                {selected.manualOTMinutes != null
                  ? `${(selected.manualOTMinutes / 60).toFixed(2)} hrs`
                  : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <div className="form-grid-3">
            <Form.Item
              label={OVERTIME_APPLICATION_LABEL.EMPLOYEE}
              validateStatus={errors.employeeId ? "error" : ""}
              help={errors.employeeId?.message}
            >
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder="Select employee"
                    options={employeeOptions}
                    filterOption={filterOption}
                    value={field.value || undefined}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={OVERTIME_APPLICATION_LABEL.OT_DATE}
              validateStatus={errors.otDate ? "error" : ""}
              help={errors.otDate?.message}
            >
              <DatePicker
                style={{ width: "100%" }}
                value={otDate ? dayjs(otDate) : null}
                onChange={(date) =>
                  setValue("otDate", date?.format("YYYY-MM-DD") ?? "")
                }
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
                      setValue("manualOTMinutes", undefined);
                    }}
                  />
                )}
              />
            </Form.Item>
          </div>

          {mode === "datetime" ? (
            <div className="form-grid-2">
              <Form.Item
                label={OVERTIME_APPLICATION_LABEL.START_TIME}
                validateStatus={errors.startTime ? "error" : ""}
                help={errors.startTime?.message}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  use12Hours
                  format="hh:mm A"
                  value={startTime ? dayjs(startTime, "HH:mm:ss") : null}
                  onChange={(time) =>
                    setValue("startTime", time?.format("HH:mm:ss") ?? "")
                  }
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="flex items-center gap-2">
                    {OVERTIME_APPLICATION_LABEL.END_TIME}
                    {isCrossMidnight(startTime ?? "", endTime ?? "") && (
                      <Tag color="blue" className="text-[11px] leading-none">
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
                  onChange={(time) =>
                    setValue("endTime", time?.format("HH:mm:ss") ?? "")
                  }
                />
              </Form.Item>
            </div>
          ) : (
            <Form.Item
              label="OT Hours"
              validateStatus={errors.manualOTMinutes ? "error" : ""}
              help={
                errors.manualOTMinutes?.message ?? "Enter the total approved OT"
              }
            >
              <Controller
                name="manualOTMinutes"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: "100%", maxWidth: 240 }}
                    min={0.25}
                    max={24}
                    step={0.25}
                    precision={2}
                    addonAfter="hrs"
                    placeholder="e.g. 2"
                    onChange={(val) => field.onChange(val ?? undefined)}
                  />
                )}
              />
            </Form.Item>
          )}

          <PermissionGate permission="Overtime:Approve">
            <Form.Item label={OVERTIME_APPLICATION_LABEL.STATUS}>
              <Controller
                name="approvalStatus"
                control={control}
                render={({ field }) => (
                  <Select {...field} options={APPROVAL_STATUS_OPTIONS} />
                )}
              />
            </Form.Item>
          </PermissionGate>

          <Form.Item
            label={OVERTIME_APPLICATION_LABEL.REMARKS}
            validateStatus={errors.remarks ? "error" : ""}
            help={errors.remarks?.message}
          >
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  rows={3}
                  placeholder="State the reason for overtime (e.g. project deadline, client requirement)"
                />
              )}
            />
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button
                onClick={() => navigate({ to: "/applications/overtime" })}
              >
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <PermissionGate
                permission={["Overtime:Edit", "Overtime:Approve"]}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreating || isUpdating}
                >
                  {NAVIGATION_BUTTON_LABEL.SAVE}
                </Button>
              </PermissionGate>
            </Space>
          </div>
        </Form>

        {isEdit && selected && (
          <Card size="small" title="Approval Progress" className="mt-4">
            <ApprovalTimeline
              applicationType="Overtime"
              applicationId={selected.id}
              resolveEmployeeName={(empId) => employeeMap.get(empId)}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
