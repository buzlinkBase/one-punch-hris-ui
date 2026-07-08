import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  notification,
  Result,
} from "antd";
import { LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from "./models/forms/forgot-password-form.schema";
import { useForgotPasswordMutation } from "./hooks/use-forgot-password-mutation";
import type { ApiResponse } from "@/shared/types/api-response.model";

const { Title, Text } = Typography;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const { mutateAsync: forgotPassword, isPending } =
    useForgotPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(values);
      setSent(true);
    } catch (err) {
      const description = axios.isAxiosError(err)
        ? ((err.response?.data as ApiResponse<{ errorMessage: string }>)?.data
            ?.errorMessage ?? "Failed to send reset email. Please try again.")
        : "An unexpected error occurred.";
      notification.error({
        message: "Request failed",
        description,
        placement: "topRight",
      });
    }
  };

  if (sent) {
    return (
      <Card className="auth-card login-card border-0">
        <Result
          status="success"
          title="Check your email"
          subTitle="If an account exists for that email, we've sent password reset instructions."
          extra={
            <Button
              type="primary"
              block
              size="large"
              onClick={() => navigate({ to: "/login" })}
            >
              Back to Sign In
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
          <LockOutlined />
        </div>
        <Text className="login-kicker">One Punch HRIS</Text>
        <Title level={3} className="login-title">
          Forgot Password
        </Title>
        <Text className="login-subtitle">
          Enter your email and we'll send you reset instructions.
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
              <Input {...field} placeholder="Enter your email" size="large" />
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
            Send Reset Instructions
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "center" }}>
        <Link to="/login">Back to Sign In</Link>
      </div>
    </Card>
  );
}
