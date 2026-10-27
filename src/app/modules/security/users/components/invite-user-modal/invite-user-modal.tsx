import { useEffect } from "react";
import { Form, Input, Modal, Select, notification, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiErrorMessage } from "@/core/http/api-error";
import {
  buildInviteUserFormSchema,
  type InviteUserFormValues,
} from "../../models/forms/invite-user-form.schema";
import { useSendInvitation, useUsers } from "../../hooks/use-user-queries";
import { useGrantableRoles } from "@/app/modules/security/roles/hooks/use-role-queries";
import { useHasPermission } from "@/shared/hooks/use-has-permission";

const { Text } = Typography;

// Invites from here are for employees, so they get the Employee role unless the inviter may
// choose another (Users:AssignRole) -- and even then only one they could grant themselves.
const DEFAULT_ROLES = ["Employee"];

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
  const canAssignRole = useHasPermission("Users:AssignRole");
  const { data: roles = [], isLoading: loadingRoles } = useGrantableRoles();
  const { data: members = [] } = useUsers();
  const schema = buildInviteUserFormSchema(members);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", roles: DEFAULT_ROLES },
  });

  useEffect(() => {
    if (open) {
      reset({ email: employeeEmail ?? "", roles: DEFAULT_ROLES });
    } else {
      reset();
    }
  }, [open, employeeEmail, reset]);

  const onSubmit = (values: InviteUserFormValues) => {
    sendInvitation(
      {
        email: values.email,
        roles: canAssignRole ? values.roles : DEFAULT_ROLES,
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
            description: apiErrorMessage(
              err,
              "Could not send the invitation. Please try again.",
            ),
            placement: "topRight",
          });
        },
      },
    );
  };

  // An employee is invited at the email on their record, so it can't be changed here, and an
  // employee without one has to get it on their record first.
  const emailLocked = Boolean(employeeId);
  const missingEmail = emailLocked && !employeeEmail?.trim();

  const roleOptions = (
    canAssignRole ? [...new Set([...DEFAULT_ROLES, ...roles])] : DEFAULT_ROLES
  ).map((r) => ({ label: r, value: r }));

  return (
    <Modal
      title={employeeName ? `Invite ${employeeName}` : "Invite User"}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit(onSubmit)}
      okText="Send Invitation"
      confirmLoading={isPending}
      okButtonProps={{ disabled: missingEmail }}
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
          validateStatus={errors.email || missingEmail ? "error" : ""}
          help={
            missingEmail
              ? "This employee has no email on their record. Add one on the employee first."
              : (errors.email?.message ??
                (emailLocked
                  ? "The invitation goes to the email on the employee's record."
                  : undefined))
          }
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
                readOnly={emailLocked}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Roles"
          validateStatus={errors.roles ? "error" : ""}
          help={errors.roles?.message}
          extra={
            canAssignRole
              ? undefined
              : "Invitations use the default role (Employee). Roles can be changed later from the Users page by someone allowed to."
          }
        >
          <Controller
            name="roles"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                value={canAssignRole ? field.value : DEFAULT_ROLES}
                mode="multiple"
                placeholder="Select one or more roles"
                options={roleOptions}
                loading={canAssignRole && loadingRoles}
                disabled={!canAssignRole}
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
