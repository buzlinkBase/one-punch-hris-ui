import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  notification,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  MailOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "@tanstack/react-router";
import { useForm, Controller, useWatch } from "react-hook-form";
import { PasswordRequirements } from "@/shared/components/password-requirements";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  acceptInvitationFormSchema,
  type AcceptInvitationFormValues,
} from "./models/forms/accept-invitation-form.schema";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import { authStorage } from "@/core/auth/auth-storage";
import type { InvitationPreviewResponse } from "@/app/modules/auth/login/models/api/response/invitation-preview-response.model";
import type { ApiResponse } from "@/shared/types/api-response.model";

const { Title, Text } = Typography;

const PENDING_INVITE_KEY = "pending_invite_token";

type LoadState =
  | { status: "loading" }
  | { status: "invalid" }
  | { status: "ready"; preview: InvitationPreviewResponse };

export default function AcceptInvitation() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") ?? "";
  const [state, setState] = useState<LoadState>(() =>
    token ? { status: "loading" } : { status: "invalid" },
  );
  const [submitting, setSubmitting] = useState(false);
  const [autoAccepting, setAutoAccepting] = useState(true);
  const [autoAcceptError, setAutoAcceptError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    authApi
      .getInvitationPreview(token)
      .then((preview) => {
        setState(
          preview.valid ? { status: "ready", preview } : { status: "invalid" },
        );
      })
      .catch(() => setState({ status: "invalid" }));
  }, [token]);

  // Auto-accept: fires once when preview loads and the user is already authenticated.
  useEffect(() => {
    if (state.status !== "ready") return;
    const { preview } = state;
    if (!preview.accountExists) return;

    const isAuthenticated =
      !!authStorage.getToken() && !authStorage.isAccessTokenExpired();
    if (!isAuthenticated) return;

    // User is already logged in — accept immediately without redirecting to login.
    authApi
      .acceptInvitation({ token })
      .then((result) => {
        const claims = authStorage.getTenantClaims(result.accessToken);
        const user = authStorage.getUser();
        const resultIds = new Set(result.tenants.map((t) => t.tenantId));
        const preserved = (user?.tenants ?? []).filter(
          (t) => !resultIds.has(t.tenantId),
        );
        authStorage.save(result.accessToken, {
          ...user!,
          tenants: [...result.tenants, ...preserved],
          tenantId: claims.tenantId ?? result.tenants[0]?.tenantId ?? null,
          tenantName: claims.tenantName,
        });
        // Full reload so React Query cache and Zustand stores reset cleanly.
        window.location.assign("/dashboard");
      })
      .catch((err) => {
        const description = axios.isAxiosError(err)
          ? ((err.response?.data as ApiResponse<{ errorMessage?: string }>)
              ?.data?.errorMessage ?? "Failed to accept invitation.")
          : "An unexpected error occurred.";
        setAutoAcceptError(description);
        setAutoAccepting(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(acceptInvitationFormSchema),
    defaultValues: { name: "", password: "", confirmPassword: "" },
  });

  const password = useWatch({ control, name: "password" });

  const onSubmit = async ({
    confirmPassword: _,
    ...values
  }: AcceptInvitationFormValues) => {
    setSubmitting(true);
    try {
      const result = await authApi.acceptInvitationByToken({
        token,
        ...values,
      });
      const claims = authStorage.getTenantClaims(result.accessToken);
      authStorage.save(result.accessToken, {
        email: result.email,
        name: result.name,
        roles: result.roles,
        tenants: result.tenants,
        tenantId: claims.tenantId ?? result.tenants[0]?.tenantId ?? null,
        tenantName: claims.tenantName,
      });
      window.location.assign("/dashboard");
    } catch (err) {
      setSubmitting(false);
      const description = axios.isAxiosError(err)
        ? ((err.response?.data as ApiResponse<{ errorMessage?: string }>)?.data
            ?.errorMessage ?? "Failed to accept invitation.")
        : "An unexpected error occurred.";
      notification.error({
        message: "Couldn't accept invitation",
        description,
        placement: "topRight",
      });
    }
  };

  if (state.status === "loading") {
    return (
      <Card className="auth-card login-card border-0">
        <div className="login-header">
          <Text className="login-kicker">One Punch HRIS</Text>
          <Title level={3} className="login-title">
            Checking your invitation…
          </Title>
        </div>
      </Card>
    );
  }

  if (state.status === "invalid") {
    return (
      <Card className="auth-card login-card border-0">
        <div className="login-header">
          <div
            className="login-icon-placeholder"
            aria-label="App icon placeholder"
          >
            <WarningOutlined />
          </div>
          <Text className="login-kicker">One Punch HRIS</Text>
          <Title level={3} className="login-title">
            Invitation expired or invalid
          </Title>
          <Text className="login-subtitle">
            This invite link is no longer valid. Ask whoever invited you to send
            a new one.
          </Text>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link to="/login">Back to sign in</Link>
        </div>
      </Card>
    );
  }

  const { preview } = state;

  if (preview.accountExists) {
    const isAuthenticated =
      !!authStorage.getToken() && !authStorage.isAccessTokenExpired();

    // Already logged in — show auto-accept progress.
    if (isAuthenticated) {
      return (
        <Card className="auth-card login-card border-0">
          <div className="login-header">
            <div
              className="login-icon-placeholder"
              aria-label="App icon placeholder"
            >
              {autoAcceptError ? <WarningOutlined /> : <CheckCircleOutlined />}
            </div>
            <Text className="login-kicker">One Punch HRIS</Text>
            <Title level={3} className="login-title">
              {autoAcceptError
                ? "Couldn't accept invitation"
                : autoAccepting
                  ? `Joining ${preview.tenantName}…`
                  : "Joined!"}
            </Title>
            {autoAcceptError ? (
              <Text className="login-subtitle" type="danger">
                {autoAcceptError}
              </Text>
            ) : (
              <Text className="login-subtitle">
                {autoAccepting
                  ? "Accepting your invitation — this only takes a moment."
                  : "Redirecting you to the dashboard…"}
              </Text>
            )}
          </div>
          {autoAccepting && (
            <Spin style={{ display: "block", margin: "0 auto" }} />
          )}
          {autoAcceptError && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <Link to="/dashboard">Go to dashboard</Link>
            </div>
          )}
        </Card>
      );
    }

    // Not logged in — store token so login can pick it up, then go sign in.
    sessionStorage.setItem(PENDING_INVITE_KEY, token);
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
            You&apos;re invited to {preview.tenantName}
          </Title>
          <Text className="login-subtitle">
            An account already exists for {preview.email}. Sign in and your
            invitation will be accepted automatically.
          </Text>
        </div>
        <Link to="/login">
          <Button type="primary" block size="large">
            Sign in to accept
          </Button>
        </Link>
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
          <TeamOutlined />
        </div>
        <Text className="login-kicker">One Punch HRIS</Text>
        <Title level={3} className="login-title">
          Join {preview.tenantName}
        </Title>
        <Text className="login-subtitle">
          You&apos;ve been invited as{" "}
          {(preview.roles ?? [preview.role]).join(", ")}. Set up your account to
          get started — no separate email confirmation needed.
        </Text>
      </div>

      <Alert
        type="info"
        showIcon
        className="mb-4"
        message={preview.email}
        description="This invite is tied to this email address."
      />

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="Full Name"
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
          className="login-form-item"
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter your name" size="large" />
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
            loading={submitting}
            block
            size="large"
          >
            Join workspace
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
