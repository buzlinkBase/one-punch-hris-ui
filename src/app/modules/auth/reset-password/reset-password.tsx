import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  notification,
  Result,
  Alert,
} from "antd";
import { KeyOutlined } from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useForm, Controller, useWatch } from "react-hook-form";
import { PasswordRequirements } from "@/shared/components/password-requirements";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from "./models/forms/reset-password-form.schema";
import { useResetPasswordMutation } from "./hooks/use-reset-password-mutation";
import type { ApiResponse } from "@/shared/types/api-response.model";

const { Title, Text } = Typography;

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [done, setDone] = useState(false);
  const token = new URLSearchParams(location.search).get("token") ?? "";
  const { mutateAsync: resetPassword, isPending } = useResetPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const newPassword = useWatch({ control, name: "newPassword" });

  const onSubmit = async ({ newPassword }: ResetPasswordFormValues) => {
    try {
      await resetPassword({ token, newPassword });
      setDone(true);
    } catch (err) {
      const description = axios.isAxiosError(err)
        ? ((err.response?.data as ApiResponse<{ errorMessage: string }>)?.data
            ?.errorMessage ?? "Failed to reset password. Please try again.")
        : "An unexpected error occurred.";
      notification.error({
        message: "Reset failed",
        description,
        placement: "topRight",
      });
    }
  };

  if (done) {
    return (
      <Card className="auth-card login-card border-0">
        <Result
          status="success"
          title="Password reset"
          subTitle="Your password has been updated. You can now sign in with your new password."
          extra={
            <Button
              type="primary"
              block
              size="large"
              onClick={() => navigate({ to: "/login" })}
            >
              Sign In
            </Button>
          }
        />
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
          <KeyOutlined />
        </div>
        <Text className="login-kicker">One Punch HRIS</Text>
        <Title level={3} className="login-title">
          Reset Password
        </Title>
        <Text className="login-subtitle">
          Enter a new password for your account.
        </Text>
      </div>

      {!token && (
        <Alert
          type="warning"
          message="Invalid or missing reset token"
          description="Please use the link sent to your email to reset your password."
          showIcon
          className="mb-4"
        />
      )}

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="New Password"
          validateStatus={errors.newPassword ? "error" : ""}
          help={errors.newPassword?.message}
          className="login-form-item"
        >
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <Input.Password
                {...field}
                placeholder="Min. 8 characters"
                size="large"
                disabled={!token}
              />
            )}
          />
          <PasswordRequirements value={newPassword} />
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
                placeholder="Re-enter new password"
                size="large"
                disabled={!token}
              />
            )}
          />
        </Form.Item>

        <Form.Item className="!mb-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            disabled={!token}
            block
            size="large"
          >
            Reset Password
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center">
        <Link to="/login">Back to Sign In</Link>
      </div>
    </Card>
  );
}
