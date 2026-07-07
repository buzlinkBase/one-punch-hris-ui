import { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Checkbox,
  Typography,
  Space,
  Tag,
  Card,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import {
  useForm,
  Controller,
  useFieldArray,
  type Resolver,
} from "react-hook-form";
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
      cutoffDays: [],
      status: "ACTIVE",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "cutoffDays",
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        name: selected.name,
        payrollFrequency: selected.payrollFrequency,
        cutoffDays: selected.cutoffDays ?? [],
        status: selected.status,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: PayrollGroupFormValues) => {
    if (isEdit && id) await update({ id, ...values });
    else await add(values);
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

          {/* Cutoff Days */}
          <Card
            className="mt-4"
            title={PAYROLL_GROUP_LABEL.CUTOFF_DAYS}
            extra={
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={() =>
                  append({ day: 15, isEndOfMonth: false, label: "" })
                }
              >
                Add Cutoff
              </Button>
            }
          >
            {fields.length === 0 && (
              <p className="text-gray-400 text-sm">
                No cutoff days configured.
              </p>
            )}
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3 mb-3">
                <Form.Item
                  label="Day"
                  className="mb-0 w-24"
                  validateStatus={
                    errors.cutoffDays?.[index]?.day ? "error" : ""
                  }
                  help={errors.cutoffDays?.[index]?.day?.message}
                >
                  <Controller
                    name={`cutoffDays.${index}.day`}
                    control={control}
                    render={({ field: f }) => (
                      <InputNumber {...f} className="w-full" min={1} max={31} />
                    )}
                  />
                </Form.Item>

                <Form.Item label="Label" className="mb-0 flex-1">
                  <Controller
                    name={`cutoffDays.${index}.label`}
                    control={control}
                    render={({ field: f }) => (
                      <Input {...f} placeholder="e.g. First Cutoff" />
                    )}
                  />
                </Form.Item>

                <Form.Item label="End of Month" className="mb-0">
                  <Controller
                    name={`cutoffDays.${index}.isEndOfMonth`}
                    control={control}
                    render={({ field: f }) => (
                      <Checkbox
                        checked={f.value}
                        onChange={(e) => f.onChange(e.target.checked)}
                      />
                    )}
                  />
                </Form.Item>

                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  className="mt-6"
                  onClick={() => remove(index)}
                />
              </div>
            ))}
          </Card>

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
