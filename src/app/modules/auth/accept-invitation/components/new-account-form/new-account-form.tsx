import { Alert, Button, Divider, Form, Input, notification } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGoogleLogin } from "@react-oauth/google";
import { PasswordRequirements } from "@/shared/components/password-requirements";
import { problemDetail } from "@/core/auth/guard-error";
import type { InvitationPreviewResponse } from "@/app/modules/auth/login/models/api/response/invitation-preview-response.model";
import {
  acceptInvitationFormSchema,
  type AcceptInvitationFormValues,
} from "../../models/forms/accept-invitation-form.schema";
import {
  useAcceptInvitationByTokenMutation,
  useGoogleJoinMutation,
} from "../../hooks/use-accept-invitation-queries";
import InvitationStatusCard from "../invitation-status-card";

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

interface NewAccountFormProps {
  token: string;
  preview: InvitationPreviewResponse;
}

/** Invitee has no account yet: set a name/password, or continue with Google. */
export default function NewAccountForm({
  token,
  preview,
}: NewAccountFormProps) {
  const acceptByToken = useAcceptInvitationByTokenMutation();
  const googleJoin = useGoogleJoinMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(acceptInvitationFormSchema),
    // Rendered only once the preview has loaded, so the inviter-supplied name can seed the
    // form directly instead of being patched in afterwards.
    defaultValues: {
      name: preview.name ?? "",
      password: "",
      confirmPassword: "",
    },
  });
  const password = useWatch({ control, name: "password" });

  // isSuccess too: onSuccess starts a full-page navigation, and the button must keep spinning
  // until the page actually unloads instead of flashing back to clickable.
  const submitting = acceptByToken.isPending || acceptByToken.isSuccess;
  const googleJoining = googleJoin.isPending || googleJoin.isSuccess;

  const onSubmit = ({
    confirmPassword: _,
    ...values
  }: AcceptInvitationFormValues) =>
    acceptByToken.mutate(
      { token, ...values },
      {
        onError: (err) =>
          notification.error({
            message: "Couldn't accept invitation",
            description: problemDetail(err, "Failed to accept invitation."),
            placement: "topRight",
          }),
      },
    );

  const handleGoogleJoin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: ({ code }) =>
      googleJoin.mutate(
        { code, token },
        {
          onError: (err) =>
            notification.error({
              message: "Couldn't join company",
              description: problemDetail(err, "Google sign-up failed."),
            }),
        },
      ),
    onError: () =>
      notification.error({
        message: "Couldn't join company",
        description: "Google authentication was unsuccessful.",
      }),
  });

  return (
    <InvitationStatusCard
      icon={<TeamOutlined />}
      title={`Join ${preview.tenantName}`}
      subtitle={`You've been invited as ${(preview.roles ?? [preview.role]).join(", ")}. Set up your account to get started — no separate email confirmation needed.`}
    >
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
            disabled={googleJoining}
            block
            size="large"
          >
            Join company
          </Button>
        </Form.Item>

        <Divider plain>or</Divider>

        <Button
          block
          size="large"
          icon={<GoogleIcon />}
          loading={googleJoining}
          disabled={submitting}
          onClick={() => handleGoogleJoin()}
          className="flex items-center justify-center gap-2"
        >
          Continue with Google
        </Button>
      </Form>
    </InvitationStatusCard>
  );
}
