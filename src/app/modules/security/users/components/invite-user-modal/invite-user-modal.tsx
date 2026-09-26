import { useEffect } from "react";
import { Form, Input, Modal, Select, notification, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  buildInviteUserFormSchema,
  type InviteUserFormValues,
} from "../../models/forms/invite-user-form.schema";
import { useSendInvitation, useUsers } from "../../hooks/use-user-queries";
import { useAssignableRoles } from "@/app/modules/security/roles/hooks/use-role-queries";
import type { ProblemDetails } from "@/shared/types/api-response.model";

const { Text } = Typography;

// Surfaces the backend's actual GuardException message (e.g. "already a member, change their
// role instead") instead of a generic toast. Same ResponseModel<ProblemDetails> envelope
// error.interceptor.ts reads (AuthApi's GlobalExceptionHandler) -- this request sets
// _skipErrorNotification so that global toast doesn't ALSO fire alongside this one.
function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const problemDetails = err.response?.data?.data as
      ProblemDetails | string | undefined;
    if (typeof problemDetails === "string") return problemDetails;
    if (problemDetails?.detail) return problemDetails.detail;
  }
  return fallback;
}

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId?: string;
  employeeName?: string;
  /** Pre-existing email on the employee record — pre-fills the email field. */
  employeeEmail?: string;
}

export default function InviteUserModal({
  open,
  onClose,
  employeeId,
  employeeName,
  employeeEmail,
}: Props) {
  const { mutate: sendInvitation, isPending } = useSendInvitation();
  const { data: roles = [], isLoading: loadingRoles } = useAssignableRoles();
  const { data: members = [] } = useUsers();
  const schema = buildInviteUserFormSchema(members);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", roles: [] },
  });

  useEffect(() => {
    if (open) {
      reset({ email: employeeEmail ?? "", roles: [] });
    } else {
      reset();
    }
  }, [open, employeeEmail, reset]);

  const onSubmit = (values: InviteUserFormValues) => {
    sendInvitation(
      {
        email: values.email,
        roles: values.roles,
        employeeId,
        name: employeeName,
      },
      {
        onSuccess: () => {
          notification.success({
            message: "Invitation sent",
            description: `An invitation email has been sent to ${values.email}.`,
            placement: "topRight",
          });
          onClose();
        },
        onError: (err) => {
          notification.error({
            message: "Failed to send invitation",
            description: extractErrorMessage(
              err,
              "Could not send the invitation. Please try again.",
            ),
            placement: "topRight",
          });
        },
      },
    );
  };

  const roleOptions = roles.map((r) => ({ label: r, value: r }));

  return (
    <Modal
      title={employeeName ? `Invite ${employeeName}` : "Invite User"}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit(onSubmit)}
      okText="Send Invitation"
      confirmLoading={isPending}
      destroyOnClose
    >
      {employeeName && (
        <div className="flex items-center gap-2 mb-4 mt-2 px-3 py-2 rounded bg-gray-50 dark:bg-gray-800">
          <UserOutlined className="text-gray-400" />
          <Text type="secondary" className="text-sm">
            Inviting employee:{" "}
          </Text>
          <Text strong className="text-sm">
            {employeeName}
          </Text>
        </div>
      )}

      <Form layout="vertical" className="mt-4">
        <Form.Item
          label="Email Address"
          validateStatus={errors.email ? "error" : ""}
          help={errors.email?.message}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="email"
                placeholder="user@example.com"
                autoComplete="off"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Roles"
          validateStatus={errors.roles ? "error" : ""}
          help={errors.roles?.message}
        >
          <Controller
            name="roles"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                mode="multiple"
                placeholder="Select one or more roles"
                options={roleOptions}
                loading={loadingRoles}
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
