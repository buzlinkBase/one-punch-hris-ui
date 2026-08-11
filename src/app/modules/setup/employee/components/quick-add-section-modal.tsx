import { useEffect } from "react";
import { Form, Input, Modal, Select } from "antd";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  sectionFormSchema,
  type SectionFormValues,
} from "@/app/modules/setup/section/models/forms/section-form.schema";
import { useCreateSection } from "@/app/modules/setup/section/hooks/use-section-queries";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
  defaultDepartmentId?: string | null;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

export default function QuickAddSectionModal({
  open,
  onClose,
  onCreated,
  defaultDepartmentId,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema) as Resolver<SectionFormValues>,
    defaultValues: {
      departmentId: defaultDepartmentId ?? null,
      code: "",
      name: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        departmentId: defaultDepartmentId ?? null,
        code: "",
        name: "",
        status: "ACTIVE",
      });
    }
  }, [open, defaultDepartmentId, reset]);

  const { mutateAsync: create, isPending } = useCreateSection();
  const { data: departments = [], isLoading: isDeptLoading } = useDepartments();

  const deptOptions = departments.map((d) => ({
    value: d.id,
    label: `${d.code} - ${d.name}`,
  }));

  const onSubmit = async (values: SectionFormValues) => {
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
      title="Add Section"
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
        <Form.Item label="Department">
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? undefined}
                onChange={(v) => field.onChange(v ?? null)}
                options={deptOptions}
                loading={isDeptLoading}
                allowClear
                showSearch
                filterOption={filterByLabel}
                placeholder="Select department"
              />
            )}
          />
        </Form.Item>
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
