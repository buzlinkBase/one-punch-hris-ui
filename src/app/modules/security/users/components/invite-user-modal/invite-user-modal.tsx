import { useEffect } from "react";
import { Form, Input, Modal, Select, notification } from "antd";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  inviteUserFormSchema,
  type InviteUserFormValues,
} from "../../models/forms/invite-user-form.schema";
import { useSendInvitation } from "../../hooks/use-user-queries";

const ROLE_OPTIONS = [
  { label: "Administrator", value: "Admin" },
  { label: "HR", value: "HR" },
  { label: "Employee", value: "Employee" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InviteUserModal({ open, onClose }: Props) {
  const { mutate: sendInvitation, isPending } = useSendInvitation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserFormSchema),
    defaultValues: { email: "", role: "" },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = (values: InviteUserFormValues) => {
    sendInvitation(values, {
      onSuccess: () => {
        notification.success({
          message: "Invitation sent",
          description: `An invitation email has been sent to ${values.email}.`,
          placement: "topRight",
        });
        onClose();
      },
      onError: () => {
        notification.error({
          message: "Failed to send invitation",
          description: "Could not send the invitation. Please try again.",
          placement: "topRight",
        });
      },
    });
  };

  return (
    <Modal
      title="Invite User"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit(onSubmit)}
      okText="Send Invitation"
      confirmLoading={isPending}
      destroyOnClose
    >
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
                placeholder="user@example.com"
                autoComplete="off"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Role"
          validateStatus={errors.role ? "error" : ""}
          help={errors.role?.message}
        >
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select a role"
                options={ROLE_OPTIONS}
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
