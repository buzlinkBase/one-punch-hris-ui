import { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
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
  leaveApplicationFormSchema,
  type LeaveApplicationFormValues,
} from "../../models/forms/leave-application-form.schema";
import {
  useLeaveApplication,
  useCreateLeaveApplication,
  useUpdateLeaveApplication,
} from "../../hooks/use-leave-application-queries";
import { useLeaveTypes } from "@/app/modules/setup/leave-type/hooks/use-leave-type-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { LEAVE_APPLICATION_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;
const { TextArea } = Input;

const DAY_TYPE_OPTIONS = [
  { value: "WholeDay", label: "Whole Day" },
  { value: "HalfDay", label: "Half Day" },
];

const PAY_TYPE_OPTIONS = [
  { value: "WithPay", label: "With Pay" },
  { value: "WithoutPay", label: "Without Pay" },
];

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

export default function LeaveApplicationDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = useLeaveApplication(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } =
    useCreateLeaveApplication();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateLeaveApplication();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const { data: employees = [] } = useEmployeeFilter();

  const leaveTypeOptions = leaveTypes.map((l) => ({
    value: l.id,
    label: `${l.code} - ${l.description}`,
  }));

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
  } = useForm<LeaveApplicationFormValues>({
    resolver: zodResolver(leaveApplicationFormSchema),
    defaultValues: {
      employeeId: "",
      leaveId: "",
      leaveDateFrom: "",
      leaveDateTo: "",
      dayType: "WholeDay",
      payType: "WithPay",
      applicationRemarks: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const dateFrom = watch("leaveDateFrom");
  const dateTo = watch("leaveDateTo");

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        employeeId: selected.employeeId,
        leaveId: selected.leaveId,
        leaveDateFrom: selected.leaveDateFrom,
        leaveDateTo: selected.leaveDateTo,
        dayType: selected.dayType,
        payType: selected.payType ?? "WithPay",
        applicationRemarks: selected.applicationRemarks ?? "",
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: LeaveApplicationFormValues) => {
    if (isEdit && id) {
      await update({
        id,
        approvalStatus: selected?.approvalStatus ?? "ForApproval",
        ...values,
      });
    } else {
      await add(values);
    }
    navigate({ to: "/applications/leave" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? LEAVE_APPLICATION_LABEL.EDIT_TITLE
                : LEAVE_APPLICATION_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              File a leave request against an approved leave type.
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
            <Button onClick={() => navigate({ to: "/applications/leave" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        {isEdit && selected && (
          <Card size="small" className="mb-4">
            <Descriptions size="small" column={3}>
              <Descriptions.Item label="Status">
                <Tag color={STATUS_COLOR[selected.approvalStatus] ?? "default"}>
                  {selected.approvalStatus === "ForApproval"
                    ? "For Approval"
                    : selected.approvalStatus}
                </Tag>
              </Descriptions.Item>
              {selected.reviewedOn && (
                <Descriptions.Item label={LEAVE_APPLICATION_LABEL.REVIEWED_ON}>
                  {dayjs(selected.reviewedOn).format("MMM DD, YYYY")}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-x-6">
            <Form.Item
              label={LEAVE_APPLICATION_LABEL.EMPLOYEE}
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
              label={LEAVE_APPLICATION_LABEL.LEAVE_TYPE}
              validateStatus={errors.leaveId ? "error" : ""}
              help={errors.leaveId?.message}
            >
              <Controller
                name="leaveId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder="Select leave type"
                    options={leaveTypeOptions}
                    filterOption={filterOption}
                    value={field.value || undefined}
                  />
                )}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-4 gap-x-6">
            <Form.Item
              label="Leave Date Range"
              className="col-span-2"
              validateStatus={
                errors.leaveDateFrom || errors.leaveDateTo ? "error" : ""
              }
              help={
                errors.leaveDateFrom?.message ?? errors.leaveDateTo?.message
              }
            >
              <DatePicker.RangePicker
                style={{ width: "100%" }}
                value={
                  dateFrom && dateTo ? [dayjs(dateFrom), dayjs(dateTo)] : null
                }
                onChange={(dates) => {
                  setValue(
                    "leaveDateFrom",
                    dates?.[0]?.format("YYYY-MM-DD") ?? "",
                  );
                  setValue(
                    "leaveDateTo",
                    dates?.[1]?.format("YYYY-MM-DD") ?? "",
                  );
                }}
              />
            </Form.Item>

            <Form.Item
              label={LEAVE_APPLICATION_LABEL.DAY_TYPE}
              validateStatus={errors.dayType ? "error" : ""}
              help={errors.dayType?.message}
            >
              <Controller
                name="dayType"
                control={control}
                render={({ field }) => (
                  <Select {...field} options={DAY_TYPE_OPTIONS} />
                )}
              />
            </Form.Item>

            <Form.Item
              label={LEAVE_APPLICATION_LABEL.PAY_TYPE}
              validateStatus={errors.payType ? "error" : ""}
              help={errors.payType?.message}
            >
              <Controller
                name="payType"
                control={control}
                render={({ field }) => (
                  <Select {...field} options={PAY_TYPE_OPTIONS} />
                )}
              />
            </Form.Item>
          </div>

          {isEdit && selected && (
            <Form.Item label={LEAVE_APPLICATION_LABEL.STATUS}>
              <Select
                disabled
                value={selected.approvalStatus}
                options={APPROVAL_STATUS_OPTIONS}
              />
            </Form.Item>
          )}

          <Form.Item
            label={LEAVE_APPLICATION_LABEL.REMARKS}
            validateStatus={errors.applicationRemarks ? "error" : ""}
            help={errors.applicationRemarks?.message}
          >
            <Controller
              name="applicationRemarks"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  rows={3}
                  placeholder="State the reason for your leave (e.g. medical, vacation, family)"
                />
              )}
            />
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/applications/leave" })}>
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
