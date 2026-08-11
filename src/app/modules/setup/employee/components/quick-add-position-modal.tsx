import { Form, Input, Modal, Select } from "antd";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  positionFormSchema,
  type PositionFormValues,
} from "@/app/modules/setup/position/models/forms/position-form.schema";
import { useCreatePosition } from "@/app/modules/setup/position/hooks/use-position-queries";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function QuickAddPositionModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema) as Resolver<PositionFormValues>,
    defaultValues: { code: "", name: "", rate: 0, status: "ACTIVE" },
  });

  const { mutateAsync: create, isPending } = useCreatePosition();

  const onSubmit = async (values: PositionFormValues) => {
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
      title="Add Position"
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
