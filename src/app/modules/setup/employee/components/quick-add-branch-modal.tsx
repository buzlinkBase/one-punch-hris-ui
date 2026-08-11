import { Form, Input, Modal, Select } from "antd";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  branchFormSchema,
  type BranchFormValues,
} from "@/app/modules/setup/branch/models/forms/branch-form.schema";
import { useCreateBranch } from "@/app/modules/setup/branch/hooks/use-branch-queries";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function QuickAddBranchModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema) as Resolver<BranchFormValues>,
    defaultValues: {
      code: "",
      name: "",
      address: null,
      boundary: null,
      status: "ACTIVE",
    },
  });

  const { mutateAsync: create, isPending } = useCreateBranch();

  const onSubmit = async (values: BranchFormValues) => {
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
      title="Add Branch"
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
        <Form.Item label="Address">
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
              />
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
