import { useEffect } from "react";
import { Form, Input, Button, Select, Typography, Space, Tag } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  payrollGroupFormSchema,
  type PayrollGroupFormValues,
} from "../../models/forms/payroll-group-form.schema";
import {
  usePayrollGroup,
  useCreatePayrollGroup,
  useUpdatePayrollGroup,
} from "../../hooks/use-payroll-group-queries";
import {
  PAYROLL_GROUP_LABEL,
  PAYROLL_FREQUENCY_OPTIONS,
  STATUTORY_DEDUCTION_SCHEDULE_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function PayrollGroupDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = usePayrollGroup(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreatePayrollGroup();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdatePayrollGroup();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PayrollGroupFormValues>({
    resolver: zodResolver(
      payrollGroupFormSchema,
    ) as Resolver<PayrollGroupFormValues>,
    defaultValues: {
      code: "",
      name: "",
      payrollFrequency: "SEMI_MONTHLY",
      statutoryDeductionSchedule: "PerPayroll",
      cutoffDays: [],
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        name: selected.name,
        payrollFrequency: selected.payrollFrequency,
        statutoryDeductionSchedule:
          selected.statutoryDeductionSchedule ?? "PerPayroll",
        cutoffDays: [],
        status: selected.status,
      });
    }
  }, [selected, isEdit, reset]);

  const DEFAULT_CUTOFF_DAYS = [
    { day: 10, isEndOfMonth: false, label: "1st Cutoff" },
    { day: 25, isEndOfMonth: false, label: "2nd Cutoff" },
  ];

  const onSubmit = async (values: PayrollGroupFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values, cutoffDays: selected?.cutoffDays ?? [] });
    } else {
      await add({ ...values, cutoffDays: DEFAULT_CUTOFF_DAYS });
    }
    navigate({ to: "/setup/payroll-group" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? PAYROLL_GROUP_LABEL.EDIT_TITLE
                : PAYROLL_GROUP_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure payroll grouping to streamline compensation processing.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/payroll-group" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={PAYROLL_GROUP_LABEL.CODE}
            validateStatus={errors.code ? "error" : ""}
            help={errors.code?.message}
          >
            <Controller
              name="code"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label={PAYROLL_GROUP_LABEL.NAME}
            validateStatus={errors.name ? "error" : ""}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label={PAYROLL_GROUP_LABEL.PAYROLL_FREQUENCY}
            validateStatus={errors.payrollFrequency ? "error" : ""}
            help={errors.payrollFrequency?.message}
          >
            <Controller
              name="payrollFrequency"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={PAYROLL_FREQUENCY_OPTIONS}
                  placeholder="Select frequency"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={PAYROLL_GROUP_LABEL.STATUTORY_DEDUCTION_SCHEDULE}
            validateStatus={errors.statutoryDeductionSchedule ? "error" : ""}
            help={errors.statutoryDeductionSchedule?.message}
          >
            <Controller
              name="statutoryDeductionSchedule"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={STATUTORY_DEDUCTION_SCHEDULE_OPTIONS}
                  placeholder="Select release schedule"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={PAYROLL_GROUP_LABEL.STATUS}
            validateStatus={errors.status ? "error" : ""}
            help={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={STATUS_OPTIONS}
                  placeholder="Select status"
                />
              )}
            />
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/payroll-group" })}>
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
