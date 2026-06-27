import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  notification,
} from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { loginFormSchema, type LoginFormValues } from "./login-form.schema";
import { authApi } from "./services/auth.api";
import { getNotify } from "@/shared/utils/notify";
import type { ApiResponse } from "@/shared/types/api-response.model";
import { authStorage } from "@/core/auth/auth-storage";
import { useGoogleLogin } from "@react-oauth/google";

const { Title, Text } = Typography;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{ display: "block" }}>
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

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
      authStorage.save(
        result.accessToken,
        result.refreshToken,
        { email: values.email },
        result.expiry,
      );
      navigate({ to: "/setup/department" });
    } catch (err) {
      const description = axios.isAxiosError(err)
        ? ((err.response?.data as ApiResponse<{ errorMessage: string }>)?.data
            ?.errorMessage ?? "Invalid email or password.")
        : "An unexpected error occurred.";
      getNotify().error({
        message: "Login failed",
        description,
        placement: "topRight",
      });
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      try {
        const result = await authApi.loginWithGoogle(code);
        localStorage.setItem("auth_token", result.accessToken);
        localStorage.setItem("auth_refresh_token", result.refreshToken);
        localStorage.setItem("auth_user", JSON.stringify({ email: "" }));
        navigate({ to: "/setup/department" });
      } catch (err) {
        const description = axios.isAxiosError(err)
          ? ((err.response?.data as ApiResponse<unknown>)?.message ??
            "Google login failed.")
          : "An unexpected error occurred.";
        notification.error({ message: "Login failed", description });
      }
    },
    onError: () =>
      notification.error({
        message: "Login failed",
        description: "Google authentication was unsuccessful.",
      }),
  });

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
          label={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>Password</span>
              <Link
                to="/forgot-password"
                style={{
                  fontWeight: "normal",
                  fontSize: 13,
                  marginLeft: "5px",
                }}
              >
                <span>Forgot password?</span>
              </Link>
            </div>
          }
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

        <Divider plain>or</Divider>

        <Button
          block
          size="large"
          icon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          Continue with Google
        </Button>
      </Form>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Text type="secondary">Don't have an account? </Text>
        <Link to="/register">Create account</Link>
      </div>
    </Card>
  );
}
