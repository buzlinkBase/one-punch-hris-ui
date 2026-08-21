import { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  DatePicker,
  Typography,
  Space,
  Tag,
  Alert,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  undertimeApplicationFormSchema,
  type UndertimeApplicationFormValues,
} from "../../models/forms/undertime-application-form.schema";
import {
  useUndertimeApplication,
  useCreateUndertimeApplication,
  useUpdateUndertimeApplication,
} from "../../hooks/use-undertime-application-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { UNDERTIME_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;
const { TextArea } = Input;

const APPROVAL_STATUS_OPTIONS = [
  { value: "ForApproval", label: "For Approval" },
  { value: "Approved", label: "Approved" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Declined", label: "Declined" },
];

const STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Cancelled: "default",
  Declined: "error",
};

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

export default function UndertimeDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = useUndertimeApplication(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } =
    useCreateUndertimeApplication();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateUndertimeApplication();
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
  } = useForm<UndertimeApplicationFormValues>({
    resolver: zodResolver(undertimeApplicationFormSchema),
    defaultValues: {
      employeeId: "",
      payrollDate: "",
      utMinutes: 0,
      remarks: "",
      approvalStatus: "Approved",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const payrollDate = watch("payrollDate");

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        employeeId: selected.employeeId,
        payrollDate: selected.payrollDate,
        utMinutes: selected.utMinutes,
        remarks: selected.remarks,
        approvalStatus: selected.approvalStatus,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: UndertimeApplicationFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/applications/undertime" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? UNDERTIME_LABEL.EDIT_TITLE
                : UNDERTIME_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Request to excuse an early time-out from biometric records.
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
            <Button onClick={() => navigate({ to: "/applications/undertime" })}>
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
          message="When approved, the DTR processor will excuse the undertime for the selected date and will not deduct it from the employee's record."
        />

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <div className="form-grid-2">
            <Form.Item
              label={UNDERTIME_LABEL.EMPLOYEE}
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
              label={UNDERTIME_LABEL.DATE}
              validateStatus={errors.payrollDate ? "error" : ""}
              help={errors.payrollDate?.message}
            >
              <DatePicker
                style={{ width: "100%" }}
                value={payrollDate ? dayjs(payrollDate) : null}
                onChange={(date) =>
                  setValue("payrollDate", date?.format("YYYY-MM-DD") ?? "")
                }
              />
            </Form.Item>
          </div>

          <Form.Item
            label={UNDERTIME_LABEL.UT_MINUTES}
            validateStatus={errors.utMinutes ? "error" : ""}
            help={
              errors.utMinutes?.message ??
              "Overrides the biometric undertime for this date. Set to 0 to excuse all (no deduction)."
            }
          >
            <Controller
              name="utMinutes"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  style={{ width: 200 }}
                  min={0}
                  max={1440}
                  precision={0}
                  addonAfter="min"
                  placeholder="0 = no deduction"
                />
              )}
            />
          </Form.Item>

          <Form.Item label={UNDERTIME_LABEL.STATUS}>
            <Controller
              name="approvalStatus"
              control={control}
              render={({ field }) => (
                <Select {...field} options={APPROVAL_STATUS_OPTIONS} />
              )}
            />
          </Form.Item>

          <Form.Item
            label={UNDERTIME_LABEL.REMARKS}
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
                  placeholder="State the reason for leaving early (e.g. medical appointment, family emergency)"
                />
              )}
            />
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button
                onClick={() => navigate({ to: "/applications/undertime" })}
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
