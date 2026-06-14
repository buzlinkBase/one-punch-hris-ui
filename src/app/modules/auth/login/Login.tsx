import { Card, Form, Input, Button, Typography, notification } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { loginFormSchema, type LoginFormValues } from "./login-form.schema";
import { authApi } from "./services/auth.api";
import type { ApiResponse } from "@/shared/types/api-response.model";

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await authApi.login(values);
      localStorage.setItem("auth_token", result.accessToken);
      localStorage.setItem("auth_refresh_token", result.refreshToken);
      localStorage.setItem(
        "auth_user",
        JSON.stringify({ email: values.email }),
      );
      navigate({ to: "/setup/department" });
    } catch (err) {
      const description =
        axios.isAxiosError(err)
          ? ((err.response?.data as ApiResponse<unknown>)?.message ?? "Invalid email or password.")
          : "An unexpected error occurred.";
      notification.error({ message: "Login failed", description });
    }
  };

  return (
    <Card className="auth-card login-card border-0">
      <div className="login-header">
        <div
          className="login-icon-placeholder"
          aria-label="App icon placeholder"
        >
          <SafetyCertificateOutlined />
        </div>
        <Text className="login-kicker">One Punch HRIS</Text>
        <Title level={3} className="login-title">
          Welcome Back
        </Title>
        <Text className="login-subtitle">
          Sign in to continue managing your HR operations.
        </Text>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
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
                placeholder="Enter password"
                size="large"
              />
            )}
          />
        </Form.Item>

        <Form.Item className="!mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            block
            size="large"
          >
            Sign In
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
