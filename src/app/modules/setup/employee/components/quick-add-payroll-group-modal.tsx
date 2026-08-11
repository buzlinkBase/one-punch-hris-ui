import { Form, Input, Modal, Select } from "antd";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  payrollGroupFormSchema,
  type PayrollGroupFormValues,
} from "@/app/modules/setup/payroll-group/models/forms/payroll-group-form.schema";
import { useCreatePayrollGroup } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

const FREQUENCY_OPTIONS = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "SEMI_MONTHLY", label: "Semi-Monthly" },
  { value: "MONTHLY", label: "Monthly" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function QuickAddPayrollGroupModal({
  open,
  onClose,
  onCreated,
}: Props) {
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
      payrollFrequency: "MONTHLY",
      status: "ACTIVE",
    },
  });

  const { mutateAsync: create, isPending } = useCreatePayrollGroup();

  const onSubmit = async (values: PayrollGroupFormValues) => {
    try {
      const created = await create(values);
      reset();
      onCreated(created.id);
    } catch {
      // handled by global interceptor
    }
  };

  return (
    <Modal
      title="Add Payroll Group"
      open={open}
      onCancel={() => {
        reset();
        onClose();
      }}
      onOk={handleSubmit(onSubmit)}
      okText="Save"
      confirmLoading={isPending}
      destroyOnClose
    >
      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          label="Code"
          required
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
          label="Name"
          required
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
          label="Payroll Frequency"
          required
          validateStatus={errors.payrollFrequency ? "error" : ""}
          help={errors.payrollFrequency?.message}
        >
          <Controller
            name="payrollFrequency"
            control={control}
            render={({ field }) => (
              <Select {...field} options={FREQUENCY_OPTIONS} />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Status"
          required
          validateStatus={errors.status ? "error" : ""}
          help={errors.status?.message}
        >
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select {...field} options={STATUS_OPTIONS} />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
