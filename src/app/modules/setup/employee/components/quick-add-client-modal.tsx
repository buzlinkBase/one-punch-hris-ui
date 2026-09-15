import { Form, Input, Modal, Select } from "antd";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  clientFormSchema,
  type ClientFormValues,
} from "@/app/modules/setup/client/models/forms/client-form.schema";
import { useCreateClient } from "@/app/modules/setup/client/hooks/use-client-queries";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function QuickAddClientModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema) as Resolver<ClientFormValues>,
    defaultValues: { code: "", name: "", status: "ACTIVE" },
  });

  const { mutateAsync: create, isPending } = useCreateClient();

  const onSubmit = async (values: ClientFormValues) => {
    try {
      // Allowances (retirement/uniform) aren't configured here -- new clients start with
      // neither set, same as the full Client Detail create form; edited later via Client
      // Settings > Allowances.
      const created = await create({
        ...values,
        retirementDaysPerYear: null,
        uniformAllowance: null,
        uniformAllowanceBasis: "TenureMonths",
      });
      reset();
      onCreated(created.id);
    } catch {
      // handled by global interceptor
    }
  };

  return (
    <Modal
      title="Add Client"
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
