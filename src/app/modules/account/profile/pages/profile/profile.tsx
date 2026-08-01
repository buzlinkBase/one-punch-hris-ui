import { useEffect, useState } from "react";
import { Card, Form, Input, Button, Typography, Tag, notification } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useSetPasswordMutation,
} from "../../hooks/use-profile-queries";
import {
  updateProfileFormSchema,
  type UpdateProfileFormValues,
} from "../../models/forms/update-profile-form.schema";
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from "../../models/forms/change-password-form.schema";
import {
  setPasswordFormSchema,
  type SetPasswordFormValues,
} from "../../models/forms/set-password-form.schema";
import type { ApiResponse } from "@/shared/types/api-response.model";

const { Title } = Typography;

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const payload = err.response?.data as
      ApiResponse<{ errors?: string[] }> | undefined;
    const errors = payload?.data?.errors;
    if (errors?.length) return errors.join(" ");
  }
  return fallback;
}

function ProfileDetailsCard() {
  const { data: profile, isLoading } = useProfileQuery();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfileMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileFormSchema),
    defaultValues: { fullName: "", phoneNumber: "" },
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      fullName: profile.fullName ?? "",
      phoneNumber: profile.phoneNumber ?? "",
    });
  }, [profile, reset]);

  const onSubmit = async (values: UpdateProfileFormValues) => {
    try {
      await updateProfile(values);
      notification.success({
        message: "Profile updated",
        placement: "topRight",
      });
    } catch (err) {
      notification.error({
        message: "Update failed",
        description: extractErrorMessage(
          err,
          "Failed to update profile. Please try again.",
        ),
        placement: "topRight",
      });
    }
  };

  return (
    <Card title="Profile details" loading={isLoading}>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item label="Email">
          <Input value={profile?.email ?? ""} disabled />
        </Form.Item>

        <Form.Item label="Default Workspace">
          <Input
            value={profile?.defaultTenantName ?? "—"}
            disabled
            suffix={
              profile?.status ? (
                <Tag color="green" style={{ margin: 0 }}>
                  {profile.status}
                </Tag>
              ) : undefined
            }
          />
        </Form.Item>

        <Form.Item
          label="Full Name"
          validateStatus={errors.fullName ? "error" : ""}
          help={errors.fullName?.message}
        >
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter your full name" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          validateStatus={errors.phoneNumber ? "error" : ""}
          help={errors.phoneNumber?.message}
        >
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter your phone number" />
            )}
          />
        </Form.Item>

        <Form.Item className="mb-0!">
          <Button type="primary" htmlType="submit" loading={isPending}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

function ChangePasswordForm({ email }: { email: string }) {
  const { mutateAsync: changePassword, isPending } =
    useChangePasswordMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await changePassword({ email, ...values });
      notification.success({
        message: "Password changed",
        placement: "topRight",
      });
      reset();
    } catch (err) {
      notification.error({
        message: "Change failed",
        description: extractErrorMessage(
          err,
          "Failed to change password. Please check your current password and try again.",
        ),
        placement: "topRight",
      });
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item
        label="Current Password"
        validateStatus={errors.oldPassword ? "error" : ""}
        help={errors.oldPassword?.message}
      >
        <Controller
          name="oldPassword"
          control={control}
          render={({ field }) => <Input.Password {...field} />}
        />
      </Form.Item>

      <Form.Item
        label="New Password"
        validateStatus={errors.newPassword ? "error" : ""}
        help={errors.newPassword?.message}
      >
        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <Input.Password {...field} placeholder="Min. 8 characters" />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Confirm New Password"
        validateStatus={errors.confirmPassword ? "error" : ""}
        help={errors.confirmPassword?.message}
      >
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => <Input.Password {...field} />}
        />
      </Form.Item>

      <Form.Item className="mb-0!">
        <Button type="primary" htmlType="submit" loading={isPending}>
          Change Password
        </Button>
      </Form.Item>
    </Form>
  );
}

function SetPasswordForm() {
  const { mutateAsync: setPassword, isPending } = useSetPasswordMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: SetPasswordFormValues) => {
    try {
      await setPassword(values);
      notification.success({ message: "Password set", placement: "topRight" });
      reset();
    } catch (err) {
      notification.error({
        message: "Setup failed",
        description: extractErrorMessage(
          err,
          "Failed to set a password. Please try again.",
        ),
        placement: "topRight",
      });
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item
        label="Password"
        validateStatus={errors.password ? "error" : ""}
        help={errors.password?.message}
      >
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input.Password {...field} placeholder="Min. 8 characters" />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Confirm Password"
        validateStatus={errors.confirmPassword ? "error" : ""}
        help={errors.confirmPassword?.message}
      >
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => <Input.Password {...field} />}
        />
      </Form.Item>

      <Form.Item className="mb-0!">
        <Button type="primary" htmlType="submit" loading={isPending}>
          Set Password
        </Button>
      </Form.Item>
    </Form>
  );
}

function PasswordCard() {
  const { data: profile } = useProfileQuery();
  const [mode, setMode] = useState<"change" | "set">("change");

  return (
    <Card
      title={mode === "change" ? "Change Password" : "Set Password"}
      extra={
        <Button
          type="link"
          className="px-0!"
          onClick={() => setMode((m) => (m === "change" ? "set" : "change"))}
        >
          {mode === "change"
            ? "Don't have a password yet?"
            : "Have a password already?"}
        </Button>
      }
    >
      {mode === "change" ? (
        <ChangePasswordForm email={profile?.email ?? ""} />
      ) : (
        <SetPasswordForm />
      )}
    </Card>
  );
}

export default function Profile() {
  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              My Profile
            </Title>
            <p className="page-toolbar-subtitle">
              Manage your personal details and password.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileDetailsCard />
        <PasswordCard />
      </div>
    </div>
  );
}
