import { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Checkbox,
  Button,
  Select,
  Typography,
  Space,
  Tag,
  Tooltip,
} from "antd";
import { DeleteOutlined, PlusOutlined, UndoOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import {
  useForm,
  useFieldArray,
  Controller,
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
  STATUTORY_DEDUCTION_SCHEDULE_OPTIONS,
  CUTOFF_DAY_PRESETS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title, Text } = Typography;

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
    watch,
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
      cutoffDays: CUTOFF_DAY_PRESETS.SEMI_MONTHLY,
      status: "ACTIVE",
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "cutoffDays",
  });

  const payrollFrequency = watch("payrollFrequency");

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        name: selected.name,
        payrollFrequency: selected.payrollFrequency,
        statutoryDeductionSchedule:
          selected.statutoryDeductionSchedule ?? "PerPayroll",
        // Cutoff days are genuinely editable now — pre-fill with whatever was saved,
        // falling back to the frequency's recommended preset only for a record that
        // somehow has none yet.
        cutoffDays:
          selected.cutoffDays && selected.cutoffDays.length > 0
            ? selected.cutoffDays
            : CUTOFF_DAY_PRESETS[selected.payrollFrequency],
        status: selected.status,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: PayrollGroupFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
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
            label={
              <Space>
                {PAYROLL_GROUP_LABEL.CUTOFF_DAYS}
                <Tooltip title="The day(s) of the month payroll is cut off — e.g. Semi-Monthly is usually the 10th & 25th, or the 15th & End of Month. Determines how statutory deductions are split across cutoffs.">
                  <Text type="secondary">(?)</Text>
                </Tooltip>
              </Space>
            }
            validateStatus={errors.cutoffDays ? "error" : ""}
            help={
              errors.cutoffDays?.message ?? errors.cutoffDays?.root?.message
            }
          >
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => {
                const rowErrors = errors.cutoffDays?.[index];
                // eslint-disable-next-line react-hooks/incompatible-library
                const isEom = watch(`cutoffDays.${index}.isEndOfMonth`);
                return (
                  <Space key={field.id} align="start" wrap>
                    <Controller
                      name={`cutoffDays.${index}.label`}
                      control={control}
                      render={({ field: f }) => (
                        <Input
                          {...f}
                          placeholder="Label (e.g. 1st Cutoff)"
                          style={{ width: 180 }}
                        />
                      )}
                    />
                    <Controller
                      name={`cutoffDays.${index}.day`}
                      control={control}
                      render={({ field: f }) => (
                        <InputNumber
                          {...f}
                          min={1}
                          max={31}
                          disabled={isEom}
                          addonBefore="Day"
                          status={rowErrors?.day ? "error" : undefined}
                          style={{ width: 130 }}
                        />
                      )}
                    />
                    <Controller
                      name={`cutoffDays.${index}.isEndOfMonth`}
                      control={control}
                      render={({ field: f }) => (
                        <Checkbox
                          checked={f.value}
                          onChange={(e) => f.onChange(e.target.checked)}
                        >
                          End of Month
                        </Checkbox>
                      )}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      disabled={fields.length <= 1}
                      onClick={() => remove(index)}
                    />
                  </Space>
                );
              })}
              <Space>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    append({ day: 1, isEndOfMonth: false, label: "" })
                  }
                >
                  Add Cutoff
                </Button>
                <Tooltip title="Replace the list above with the recommended cutoffs for the selected Payroll Frequency">
                  <Button
                    size="small"
                    icon={<UndoOutlined />}
                    onClick={() =>
                      replace(CUTOFF_DAY_PRESETS[payrollFrequency])
                    }
                  >
                    Use Recommended
                  </Button>
                </Tooltip>
              </Space>
            </div>
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
