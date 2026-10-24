import { useEffect } from "react";
import { Form, Input, Button, Select, Typography, Space, Tag } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  departmentFormSchema,
  type DepartmentFormValues,
} from "../../models/forms/department-form.schema";
import {
  useDepartment,
  useCreateDepartment,
  useUpdateDepartment,
  useDepartments,
} from "../../hooks/use-department-queries";
import { DEPARTMENT_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { EmployeeSelect } from "@/shared/components/employee-select/employee-select";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function DepartmentDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useDepartment(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateDepartment();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateDepartment();
  const { data: departments = [] } = useDepartments();

  // A department can't sit under itself; the server also rejects loops through its sub-departments.
  const parentOptions = departments
    .filter((d) => d.id !== id)
    .map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      code: "",
      name: "",
      parentDepartmentId: null,
      headId: null,
      status: "Active",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        name: selected.name,
        parentDepartmentId: selected.parentDepartmentId ?? null,
        headId: selected.headId ?? null,
        status: selected.status,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: DepartmentFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/setup/department" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? DEPARTMENT_LABEL.EDIT_TITLE
                : DEPARTMENT_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Maintain department master records for organizational structure.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/department" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={DEPARTMENT_LABEL.CODE}
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
            label={DEPARTMENT_LABEL.NAME}
            validateStatus={errors.name ? "error" : ""}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
          <Form.Item label={DEPARTMENT_LABEL.PARENT}>
            <Controller
              name="parentDepartmentId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? undefined}
                  onChange={(v) => field.onChange(v ?? null)}
                  options={parentOptions}
                  allowClear
                  showSearch={{
                    filterOption: (input, option) =>
                      String(option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase()),
                  }}
                  placeholder="None (top-level department)"
                />
              )}
            />
          </Form.Item>
          <Form.Item label={DEPARTMENT_LABEL.HEAD}>
            <Controller
              name="headId"
              control={control}
              render={({ field }) => (
                <EmployeeSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select who leads this department"
                />
              )}
            />
          </Form.Item>
          <Form.Item
            label={DEPARTMENT_LABEL.STATUS}
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
              <Button onClick={() => navigate({ to: "/setup/department" })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <PermissionGate
                permission={
                  isEdit
                    ? "Organization Setup:Edit"
                    : "Organization Setup:Create"
                }
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isUpdating || isCreating}
                >
                  {NAVIGATION_BUTTON_LABEL.SAVE}
                </Button>
              </PermissionGate>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}
