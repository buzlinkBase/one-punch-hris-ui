import { Card, Form, Input, Button, Typography, notification } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  registerFormSchema,
  type RegisterFormValues,
} from "./models/forms/register-form.schema";
import { useRegisterMutation } from "./hooks/useRegisterMutation";
import type { ApiResponse } from "@/shared/types/api-response.model";

const { Title, Text } = Typography;

export default function Register() {
  const navigate = useNavigate();
  const { mutateAsync: register, isPending } = useRegisterMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async ({
    confirmPassword: _,
    ...values
  }: RegisterFormValues) => {
    try {
      await register(values);
      notification.success({
        message: "Account created",
        description: "Your account has been created. You can now sign in.",
        placement: "topRight",
      });
      navigate({ to: "/login" });
    } catch (err) {
      const description = axios.isAxiosError(err)
        ? ((err.response?.data as ApiResponse<{ errorMessage: string }>)?.data
            ?.errorMessage ?? "Registration failed. Please try again.")
        : "An unexpected error occurred.";
      notification.error({
        message: "Registration failed",
        description,
        placement: "topRight",
      });
    }
  };

  return (
    <Card className="auth-card login-card border-0">
      <div className="login-header">
        <div
          className="login-icon-placeholder"
          aria-label="App icon placeholder"
        >
          <UserAddOutlined />
        </div>
        <Text className="login-kicker">One Punch HRIS</Text>
        <Title level={3} className="login-title">
          Create Account
        </Title>
        <Text className="login-subtitle">
          Fill in your details to create a new account.
        </Text>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0 16px" }}
        >
          <Form.Item
            label="First Name"
            validateStatus={errors.name ? "error" : ""}
            help={errors.name?.message}
            className="login-form-item"
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Name" size="large" />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Email"
          validateStatus={errors.email ? "error" : ""}
          help={errors.email?.message}
          className="login-form-item"
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter email" size="large" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Password"
          validateStatus={errors.password ? "error" : ""}
          help={errors.password?.message}
          className="login-form-item"
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password
                {...field}
                placeholder="Min. 8 characters"
                size="large"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          validateStatus={errors.confirmPassword ? "error" : ""}
          help={errors.confirmPassword?.message}
          className="login-form-item"
        >
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Input.Password
                {...field}
                placeholder="Re-enter password"
                size="large"
              />
            )}
          />
        </Form.Item>

        <Form.Item className="!mb-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            block
            size="large"
          >
            Create Account
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "center" }}>
        <Text type="secondary">Already have an account? </Text>
        <Link to="/login">Sign in</Link>
      </div>
    </Card>
  );
}
