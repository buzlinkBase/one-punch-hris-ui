import { useEffect } from "react";
import { Form, Input, Button, Select, Typography, Space, Tag } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/useRouteParams";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  clientFormSchema,
  type ClientFormValues,
} from "../../models/forms/client-form.schema";
import {
  useClient,
  useCreateClient,
  useUpdateClient,
} from "../../hooks/useClientQueries";
import { CLIENT_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function ClientDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useClient(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateClient();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: { code: "", name: "", status: "ACTIVE" },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({ code: selected.code, name: selected.name, status: selected.status });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: ClientFormValues) => {
    if (isEdit && id) await update({ id, ...values });
    else await add(values);
    navigate({ to: "/setup/client" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit ? CLIENT_LABEL.EDIT_TITLE : CLIENT_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure client account details for assignment and billing.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/client" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={CLIENT_LABEL.CODE}
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
            label={CLIENT_LABEL.NAME}
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
            label={CLIENT_LABEL.STATUS}
            validateStatus={errors.status ? "error" : ""}
            help={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => <Select {...field} options={STATUS_OPTIONS} placeholder="Select status" />}
            />
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/client" })}>
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
