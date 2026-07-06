import { useEffect } from "react";
import { Form, Input, Button, Select, Typography, Space, Tag } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/useRouteParams";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  sectionFormSchema,
  type SectionFormValues,
} from "../../models/forms/section-form.schema";
import {
  useSection,
  useCreateSection,
  useUpdateSection,
} from "../../hooks/useSectionQueries";
import { useDepartments } from "@/app/modules/setup/department/hooks/useDepartmentQueries";
import { SECTION_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;

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

export default function SectionDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useSection(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateSection();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateSection();
  const { data: departments = [], isLoading: isDepartmentsLoading } =
    useDepartments();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: { departmentId: null, code: "", name: "", status: "ACTIVE" },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        departmentId: selected.departmentId ?? null,
        code: selected.code,
        name: selected.name,
        status: selected.status,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: SectionFormValues) => {
    if (isEdit && id) await update({ id, ...values });
    else await add(values);
    navigate({ to: "/setup/section" });
  };

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: `${d.code} - ${d.name}`,
  }));

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit ? SECTION_LABEL.EDIT_TITLE : SECTION_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Define an organizational section and assign it to a department.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/section" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={SECTION_LABEL.DEPARTMENT}
            validateStatus={errors.departmentId ? "error" : ""}
            help={errors.departmentId?.message}
          >
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value ?? undefined}
                  onChange={(v) => field.onChange(v ?? null)}
                  options={departmentOptions}
                  loading={isDepartmentsLoading}
                  allowClear
                  showSearch
                  filterOption={filterByLabel}
                  placeholder="Select department"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={SECTION_LABEL.CODE}
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
            label={SECTION_LABEL.NAME}
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
            label={SECTION_LABEL.STATUS}
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
              <Button onClick={() => navigate({ to: "/setup/section" })}>
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
