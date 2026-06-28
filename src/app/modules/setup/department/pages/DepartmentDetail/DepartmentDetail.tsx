import { useEffect } from "react";
import { Form, Input, Button, Select, Typography, Space, Tag } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/useRouteParams";
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
} from "../../hooks/useDepartmentQueries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/useEmployeeQueries";
import { DEPARTMENT_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

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
  const { data: employees = [] } = useEmployees();
  const { mutateAsync: add, isPending: isCreating } = useCreateDepartment();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateDepartment();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: { code: "", name: "", headId:  null, status: "Active" },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        name: selected.name,
        headId: selected.headId,
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
            label={DEPARTMENT_LABEL.HEAD}
            validateStatus={errors.headId ? "error" : ""}
            help={errors.headId?.message}
          >
            <Controller
              name="headId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value ?? null}
                  onChange={(val) => field.onChange(val ?? null)}
                  showSearch
                  allowClear
                  placeholder="Select department head"
                  optionFilterProp="label"
                  options={employees.map((e) => ({
                    value: e.id,
                    label: `${e.firstName} ${e.lastName}`,
                  }))}
                />
              )}
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
