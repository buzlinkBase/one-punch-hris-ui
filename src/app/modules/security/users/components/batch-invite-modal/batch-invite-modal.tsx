import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Form,
  Modal,
  Result,
  Segmented,
  Select,
  Typography,
  notification,
} from "antd";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { EmailChipInput } from "@/shared/components/email-chip-input/email-chip-input";
import { isValidEmail } from "@/shared/components/email-chip-input/parse-email-list";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { useAssignableRoles } from "@/app/modules/security/roles/hooks/use-role-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import type { ProblemDetails } from "@/shared/types/api-response.model";
import {
  useBatchInviteLookup,
  useSendBatchInvitations,
} from "../../hooks/use-user-queries";
import {
  batchInviteFormSchema,
  type BatchInviteFormValues,
} from "../../models/forms/batch-invite-form.schema";
import type { InviteEntityType } from "../../models/api/request/batch-invitation-request.model";
import type { BatchInvitationResult } from "../../models/api/response/batch-invitation-response.model";
import { resolveInviteChipStatus } from "./invite-chip-status";

const { Text } = Typography;

const DEFAULT_ROLE: Record<InviteEntityType, string> = {
  Employee: "Employee",
  Client: "Client",
};

const DEFAULT_VALUES: BatchInviteFormValues = {
  entityType: "Employee",
  role: DEFAULT_ROLE.Employee,
  clientId: undefined,
};

function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 429)
      return "Too many invitation requests. Please wait a minute and try again.";
    if (err.response?.status === 403)
      return "You don't have permission to invite users.";
    const problem = err.response?.data?.data as
      ProblemDetails | string | undefined;
    if (typeof problem === "string") return problem;
    if (problem?.detail) return problem.detail;
  }
  return "The invitations could not be sent. Please try again.";
}

interface BatchInviteModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Invites up to 100 employees, or logins for one client, at once. Each pasted or typed email
 * becomes a chip that shows, as soon as it's checked, whether it can be invited.
 */
export default function BatchInviteModal({
  open,
  onClose,
}: BatchInviteModalProps) {
  const [modal, contextHolder] = Modal.useModal();
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [summary, setSummary] = useState<BatchInvitationResult | null>(null);
  const idempotencyKey = useRef<string | null>(null);
  const firstControl = useRef<HTMLDivElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BatchInviteFormValues>({
    resolver: zodResolver(batchInviteFormSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const entityType = useWatch({ control, name: "entityType" });
  const role = useWatch({ control, name: "role" });
  const clientId = useWatch({ control, name: "clientId" });

  const { data: roles = [], isLoading: loadingRoles } = useAssignableRoles();
  const { data: clients = [], isLoading: loadingClients } = useClients();
  const { mutate: sendBatch, isPending: sending } = useSendBatchInvitations();

  const debouncedEmails = useDebouncedValue(emails, 300);
  const { data: lookup } = useBatchInviteLookup(
    debouncedEmails.filter(isValidEmail),
    entityType,
    clientId,
  );

  const statuses = useMemo(
    () =>
      new Map(
        emails.map((email) => [
          email,
          resolveInviteChipStatus(email, entityType, lookup),
        ]),
      ),
    [emails, entityType, lookup],
  );
  const ready = emails.filter((email) => !statuses.get(email)?.blocked);
  const blockedCount = emails.length - ready.length;
  const canSend =
    ready.length > 0 &&
    blockedCount === 0 &&
    Boolean(role) &&
    (entityType === "Employee" || Boolean(clientId)) &&
    !sending;

  // A changed batch is a new submission: only a retry of the exact same one reuses its key.
  useEffect(() => {
    idempotencyKey.current = null;
  }, [emails, entityType, role, clientId]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const resetAll = () => {
    setEmails([]);
    setDraft("");
    setNotice(null);
    setSummary(null);
    idempotencyKey.current = null;
    reset(DEFAULT_VALUES);
  };

  const close = () => {
    resetAll();
    onClose();
  };

  const requestClose = () => {
    if (sending) return;
    if (!summary && (emails.length > 0 || draft.trim())) {
      modal.confirm({
        title: "Discard invitations?",
        content:
          "You have unsaved email addresses. Are you sure you want to exit?",
        okText: "Discard",
        okButtonProps: { danger: true },
        cancelText: "Keep editing",
        onOk: close,
      });
      return;
    }
    close();
  };

  const changeEntityType = (next: InviteEntityType) => {
    setValue("entityType", next);
    setValue("clientId", undefined);
    if (!role || role === DEFAULT_ROLE[entityType]) {
      setValue(
        "role",
        roles.includes(DEFAULT_ROLE[next]) ? DEFAULT_ROLE[next] : "",
      );
    }
  };

  const sendInvitations = (values: BatchInviteFormValues) => {
    const recipients = ready.map((email) => {
      const status = statuses.get(email);
      return {
        email,
        entityId:
          values.entityType === "Employee" ? status?.employeeId : undefined,
        name: status?.name,
      };
    });
    idempotencyKey.current ??= crypto.randomUUID();
    sendBatch(
      {
        payload: {
          entityType: values.entityType,
          clientId:
            values.entityType === "Client" ? values.clientId : undefined,
          role: values.role,
          recipients,
        },
        idempotencyKey: idempotencyKey.current,
      },
      {
        onSuccess: (result) => {
          if (result.failed.length === 0) {
            notification.success({
              message: `Successfully sent ${result.sent} invitation(s).`,
              placement: "topRight",
            });
            close();
          } else {
            setSummary(result);
          }
        },
        onError: (err) =>
          notification.error({
            message: "Invitations not sent",
            description: errorMessage(err),
            placement: "topRight",
          }),
      },
    );
  };

  // handleSubmit is invoked on click, not during render, since sendInvitations touches a ref.
  const submit = () => void handleSubmit(sendInvitations)();

  // Back to the form with only the failed addresses, re-checked, ready to send again.
  const retryFailed = () => {
    if (!summary) return;
    setEmails(summary.failed.map((f) => f.email));
    setSummary(null);
  };

  const liveMessage =
    emails.length === 0
      ? ""
      : `${ready.length} ready to invite, ${blockedCount} need attention.`;

  const roleOptions = roles.map((r) => ({ label: r, value: r }));
  const clientOptions = clients.map((c) => ({
    label: `${c.code} - ${c.name}`,
    value: c.id,
  }));

  const footer = summary
    ? [
        <Button key="close" onClick={close}>
          Close
        </Button>,
        <Button key="retry" type="primary" onClick={retryFailed}>
          Retry Failed
        </Button>,
      ]
    : [
        <Button key="cancel" onClick={requestClose} disabled={sending}>
          Cancel
        </Button>,
        <Button
          key="send"
          type="primary"
          loading={sending}
          disabled={!canSend}
          onClick={submit}
        >
          Send Invitations
        </Button>,
      ];

  return (
    <>
      {contextHolder}
      <Modal
        title="Invite Users"
        open={open}
        width={680}
        onCancel={requestClose}
        footer={footer}
        afterOpenChange={(visible) => {
          if (visible)
            firstControl.current
              ?.querySelector<HTMLElement>("input, [tabindex='0']")
              ?.focus();
        }}
      >
        {summary ? (
          <Result
            status="warning"
            title={`Sent ${summary.sent} invitations. Failed to send ${summary.failed.length} invitations.`}
            extra={
              <ul className="m-0 list-none p-0 text-left">
                {summary.failed.map((f) => (
                  <li
                    key={f.email}
                    className="border-b border-(--ant-color-border-secondary) py-2 last:border-b-0"
                  >
                    <Text strong>{f.email}</Text>
                    <br />
                    <Text type="secondary">{f.reason}</Text>
                  </li>
                ))}
              </ul>
            }
          />
        ) : (
          <Form layout="vertical" className="mt-4" disabled={sending}>
            <div ref={firstControl}>
              <Form.Item label="Invite as" required>
                <Controller
                  name="entityType"
                  control={control}
                  render={({ field }) => (
                    <Segmented<InviteEntityType>
                      options={[
                        { label: "Employee", value: "Employee" },
                        { label: "Client", value: "Client" },
                      ]}
                      value={field.value}
                      onChange={changeEntityType}
                      disabled={sending}
                    />
                  )}
                />
              </Form.Item>
            </div>

            {entityType === "Client" && (
              <Form.Item
                label="Client"
                required
                validateStatus={errors.clientId ? "error" : ""}
                help={errors.clientId?.message}
              >
                <Controller
                  name="clientId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      showSearch
                      optionFilterProp="label"
                      placeholder="Select the client these logins are for"
                      options={clientOptions}
                      loading={loadingClients}
                    />
                  )}
                />
              </Form.Item>
            )}

            <Form.Item
              label="Role"
              required
              validateStatus={errors.role ? "error" : ""}
              help={errors.role?.message}
              extra="Every person in this batch gets this role."
            >
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select a role"
                    options={roleOptions}
                    loading={loadingRoles}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label="Email addresses"
              required
              htmlFor="batch-invite-emails"
              extra={
                entityType === "Employee"
                  ? "Each email must belong to an employee record. Paste from a spreadsheet or type them separated by commas, spaces or new lines (up to 100)."
                  : "Paste from a spreadsheet or type them separated by commas, spaces or new lines (up to 100)."
              }
            >
              <EmailChipInput
                id="batch-invite-emails"
                emails={emails}
                onChange={setEmails}
                statusOf={(email) =>
                  statuses.get(email) ??
                  resolveInviteChipStatus(email, entityType, lookup)
                }
                draft={draft}
                onDraftChange={setDraft}
                onNotice={setNotice}
                disabled={sending}
              />
            </Form.Item>

            {notice && (
              <Alert type="info" showIcon message={notice} className="mb-2" />
            )}
            {emails.length > 0 && (
              <Text type="secondary" className="text-xs">
                {ready.length} ready to invite
                {blockedCount > 0 &&
                  ` · ${blockedCount} need attention (hover a chip to see why)`}
              </Text>
            )}
          </Form>
        )}
        <div className="sr-only" aria-live="polite">
          {notice ?? liveMessage}
        </div>
      </Modal>
    </>
  );
}
