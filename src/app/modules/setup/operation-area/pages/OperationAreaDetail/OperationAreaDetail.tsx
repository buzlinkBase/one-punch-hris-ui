import { useEffect } from "react";
import { Form, Input, Button, Select, Typography, Space, Tag } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/useRouteParams";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  operationAreaFormSchema,
  type OperationAreaFormValues,
} from "../../models/forms/operation-area-form.schema";
import {
  useOperationArea,
  useCreateOperationArea,
  useUpdateOperationArea,
} from "../../hooks/useOperationAreaQueries";
import { OPERATION_AREA_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function OperationAreaDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useOperationArea(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateOperationArea();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateOperationArea();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OperationAreaFormValues>({
    resolver: zodResolver(operationAreaFormSchema),
    defaultValues: { code: "", name: "", status: "" },
  });

  useEffect(() => {
    if (isEdit && selected)
      reset({
        code: selected.code,
        name: selected.name,
        status: selected.status,
      });
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: OperationAreaFormValues) => {
    if (isEdit && id) await update({ id, ...values });
    else await add(values);
    navigate({ to: "/setup/operation-area" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? OPERATION_AREA_LABEL.EDIT_TITLE
                : OPERATION_AREA_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Maintain operation areas used for employee and scheduling setup.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/operation-area" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={OPERATION_AREA_LABEL.CODE}
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
            label={OPERATION_AREA_LABEL.NAME}
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
            label={OPERATION_AREA_LABEL.STATUS}
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

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/operation-area" })}>
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
