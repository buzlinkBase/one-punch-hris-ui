import { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  TimePicker,
  Typography,
  Space,
  Tag,
  Card,
  Descriptions,
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
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { OVERTIME_APPLICATION_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;
const { TextArea } = Input;

const APPROVAL_STATUS_OPTIONS = [
  { value: "ForApproval", label: "For Approval" },
  { value: "Approved", label: "Approved" },
  { value: "Declined", label: "Declined" },
  { value: "Cancelled", label: "Cancelled" },
];

const STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Declined: "error",
  Cancelled: "default",
};

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

function buildDateTime(date: string, time: string): string {
  if (!date || !time) return "";
  return dayjs(`${date}T${time}`).toISOString();
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
  const { data: employees = [] } = useEmployeeFilter();

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

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
      employeeId: "",
      otDate: "",
      startTime: "",
      endTime: "",
      remarks: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const otDate = watch("otDate");
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        employeeId: selected.employeeId,
        otDate: selected.otDate,
        startTime: selected.startTime
          ? dayjs(selected.startTime).format("HH:mm:ss")
          : "",
        endTime: selected.endTime
          ? dayjs(selected.endTime).format("HH:mm:ss")
          : "",
        remarks: selected.remarks ?? "",
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: OvertimeApplicationFormValues) => {
    const payload = {
      employeeId: values.employeeId,
      otDate: values.otDate,
      startTime: buildDateTime(values.otDate, values.startTime),
      endTime: buildDateTime(values.otDate, values.endTime),
      remarks: values.remarks,
    };

    if (isEdit && id) {
      await update({
        id,
        otStatus: selected?.otStatus ?? "ForApproval",
        ...payload,
      });
    } else {
      await add(payload);
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
              <Tag color={STATUS_COLOR[selected.otStatus] ?? "default"}>
                {selected.otStatus === "ForApproval"
                  ? "For Approval"
                  : selected.otStatus}
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
        {isEdit && selected && (
          <Card size="small" className="mb-4">
            <Descriptions size="small" column={2}>
              <Descriptions.Item label={OVERTIME_APPLICATION_LABEL.STATUS}>
                <Tag color={STATUS_COLOR[selected.otStatus] ?? "default"}>
                  {selected.otStatus === "ForApproval"
                    ? "For Approval"
                    : selected.otStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={OVERTIME_APPLICATION_LABEL.OT_MINUTES}>
                {selected.otMinutes != null
                  ? `${(selected.otMinutes / 60).toFixed(2)} hrs`
                  : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-x-6">
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
          </div>

          <div className="grid grid-cols-2 gap-x-6">
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
              label={OVERTIME_APPLICATION_LABEL.END_TIME}
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

          {isEdit && selected && (
            <Form.Item label={OVERTIME_APPLICATION_LABEL.STATUS}>
              <Select
                disabled
                value={selected.otStatus}
                options={APPROVAL_STATUS_OPTIONS}
              />
            </Form.Item>
          )}

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
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreating || isUpdating}
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
