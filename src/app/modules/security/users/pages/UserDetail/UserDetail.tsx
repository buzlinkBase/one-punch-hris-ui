import { useEffect } from "react";
import { Form, Input, Button, Select, Typography, Space, Tag } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/useRouteParams";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  userFormSchema,
  type UserFormValues,
} from "../../models/forms/user-form.schema";
import {
  useUser,
  useCreateUser,
  useUpdateUser,
} from "../../hooks/useUserQueries";
import { USER_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import type { UpdateUser } from "../../models/api/request/update-user.model";

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const USER_TYPE_OPTIONS = [
  { value: "Administrator", label: "Administrator" },
  { value: "HR", label: "HR" },
  { value: "Employee", label: "Employee" },
];

export default function UserDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useUser(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateUser();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateUser();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: "",
      username: "",
      password: "",
      confirmPassword: "",
      userType: "Employee",
      status: "",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        fullName: selected.fullName,
        username: selected.username,
        password: "",
        confirmPassword: "",
        userType: selected.userType,
        status: selected.status,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: UserFormValues) => {
    if (isEdit && id) {
      const payload: UpdateUser = {
        id,
        fullName: values.fullName,
        username: values.username,
        userType: values.userType,
        status: values.status,
      };

      if (values.password?.trim()) {
        payload.password = values.password;
      }

      await update(payload);
    } else {
      await add({
        fullName: values.fullName,
        username: values.username,
        password: values.password ?? "",
        userType: values.userType,
        status: values.status,
      });
    }

    navigate({ to: "/security/users" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit ? USER_LABEL.EDIT_TITLE : USER_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure profile information, login credentials, and account
              type.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/security/users" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <div className="form-grid-2">
            <Form.Item
              label={USER_LABEL.FULL_NAME}
              validateStatus={errors.fullName ? "error" : ""}
              help={errors.fullName?.message}
            >
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>

            <Form.Item
              label={USER_LABEL.USERNAME}
              validateStatus={errors.username ? "error" : ""}
              help={errors.username?.message}
            >
              <Controller
                name="username"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>

            <Form.Item
              label={USER_LABEL.PASSWORD}
              validateStatus={errors.password ? "error" : ""}
              help={errors.password?.message}
            >
              <Controller
                name="password"
                control={control}
                render={({ field }) => <Input.Password {...field} />}
              />
            </Form.Item>

            <Form.Item
              label={USER_LABEL.CONFIRM_PASSWORD}
              validateStatus={errors.confirmPassword ? "error" : ""}
              help={errors.confirmPassword?.message}
            >
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => <Input.Password {...field} />}
              />
            </Form.Item>

            <Form.Item
              label={USER_LABEL.USER_TYPE}
              validateStatus={errors.userType ? "error" : ""}
              help={errors.userType?.message}
            >
              <Controller
                name="userType"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={USER_TYPE_OPTIONS}
                    placeholder="Select user type"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={USER_LABEL.STATUS}
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
          </div>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/security/users" })}>
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
