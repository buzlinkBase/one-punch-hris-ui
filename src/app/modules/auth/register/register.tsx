import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  notification,
} from "antd";
import { MailOutlined, UserAddOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useGoogleLogin } from "@react-oauth/google";
import { PasswordRequirements } from "@/shared/components/password-requirements";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  registerFormSchema,
  type RegisterFormValues,
} from "./models/forms/register-form.schema";
import { useRegisterMutation } from "./hooks/use-register-mutation";
import type { ApiResponse } from "@/shared/types/api-response.model";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import { authStorage } from "@/core/auth/auth-storage";
import { resolveTenantDestination } from "@/core/auth/tenant-routing";

const { Title, Text } = Typography;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" className="block">
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

export default function Register() {
  const navigate = useNavigate();
  const { mutateAsync: register, isPending } = useRegisterMutation();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [googleSigningUp, setGoogleSigningUp] = useState(false);

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

  const password = useWatch({ control, name: "password" });

  const onSubmit = async ({
    confirmPassword: _,
    ...values
  }: RegisterFormValues) => {
    try {
      const result = await register(values);
      setSubmittedEmail(result.email ?? values.email);
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

  const handleGoogleSignUp = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      setGoogleSigningUp(true);
      try {
        const result = await authApi.signUpWithGoogle(code);
        const claims = authStorage.getTenantClaims(result.accessToken);
        authStorage.save(result.accessToken, {
          email: result.email,
          name: result.name,
          roles: result.roles,
          permissions: result.permissions,
          tenants: result.tenants,
          tenantId: claims.tenantId || undefined,
          tenantName: claims.tenantName || undefined,
        });
        const destination = await resolveTenantDestination();
        navigate({ to: destination ?? "/dashboard" });
      } catch (err) {
        const description = axios.isAxiosError(err)
          ? ((err.response?.data as ApiResponse<{ errorMessage: string }>)?.data
              ?.errorMessage ?? "Google sign-up failed.")
          : "An unexpected error occurred.";
        notification.error({ message: "Sign up failed", description });
      } finally {
        setGoogleSigningUp(false);
      }
    },
    onError: () =>
      notification.error({
        message: "Sign up failed",
        description: "Google authentication was unsuccessful.",
      }),
  });

  if (submittedEmail) {
    return (
      <Card className="auth-card login-card border-0">
        <div className="login-header">
          <div
            className="login-icon-placeholder"
            aria-label="App icon placeholder"
          >
            <MailOutlined />
          </div>
          <Text className="login-kicker">One Punch HRIS</Text>
          <Title level={3} className="login-title">
            Check your email
          </Title>
          <Text className="login-subtitle">
            We sent a confirmation link to <strong>{submittedEmail}</strong>.
            Open it to activate your account before signing in.
          </Text>
        </div>
        <div className="text-center">
          <Link to="/login">Back to sign in</Link>
        </div>
      </Card>
    );
  }

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
        <div className="grid grid-cols-1">
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
          <PasswordRequirements value={password} />
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

        <Form.Item className="mb-0!">
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

        <Divider plain>or</Divider>

        <Button
          block
          size="large"
          icon={<GoogleIcon />}
          loading={googleSigningUp}
          onClick={handleGoogleSignUp}
          className="flex items-center justify-center gap-2 mb-4!"
        >
          Sign up with Google
        </Button>
      </Form>

      <div style={{ textAlign: "center" }}>
        <Text type="secondary">Already have an account? </Text>
        <Link to="/login">Sign in</Link>
      </div>
    </Card>
  );
}
