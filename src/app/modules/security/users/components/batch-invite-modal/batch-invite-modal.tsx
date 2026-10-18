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
import { useGrantableRoles } from "@/app/modules/security/roles/hooks/use-role-queries";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { useInvitePortalUsers } from "@/app/modules/client-portal/hooks/use-client-portal-queries";
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
  // Client logins are invited through the client portal; the first people invited to a client run it.
  Client: "Client Admin",
};

// "jane.doe@site.com" -> "jane.doe": the portal wants a name and an invite only carries the email.
const nameFromEmail = (email: string) => email.split("@")[0];

const defaultValues = (
  entityType: InviteEntityType,
): BatchInviteFormValues => ({
  entityType,
  role: DEFAULT_ROLE[entityType],
  clientId: undefined,
});

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
  /** What the form starts on; give the modal a matching `key` so a change starts it fresh. */
  defaultEntityType?: InviteEntityType;
}

/**
 * Invites up to 100 employees, or logins for one client, at once. Each pasted or typed email
 * becomes a chip that shows, as soon as it's checked, whether it can be invited.
 */
export default function BatchInviteModal({
  open,
  onClose,
  defaultEntityType = "Employee",
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
    defaultValues: defaultValues(defaultEntityType),
  });
  const entityType = useWatch({ control, name: "entityType" });
  const role = useWatch({ control, name: "role" });
  const clientId = useWatch({ control, name: "clientId" });

  // Without Users:AssignRole every invite gets the default role for its kind; the API enforces
  // the same, and never lets anyone grant a role with permissions they don't hold.
  const canAssignRole = useHasPermission("Users:AssignRole");
  const { data: roles = [], isLoading: loadingRoles } = useGrantableRoles();
  const { data: clients = [], isLoading: loadingClients } = useClients();
  const { mutate: sendBatch, isPending: sendingBatch } =
    useSendBatchInvitations();
  const { mutate: sendToPortal, isPending: sendingToPortal } =
    useInvitePortalUsers();
  const sending = sendingBatch || sendingToPortal;

  const debouncedEmails = useDebouncedValue(emails, 300);
  const { data: lookup, isPlaceholderData: lookupStale } = useBatchInviteLookup(
    debouncedEmails.filter(isValidEmail),
    entityType,
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
    !lookupStale &&
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
    reset(defaultValues(defaultEntityType));
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
    if (!canAssignRole || !role || role === DEFAULT_ROLE[entityType]) {
      setValue("role", DEFAULT_ROLE[next]);
    }
  };

  const sendInvitations = (values: BatchInviteFormValues) => {
    const handlers = {
      onSuccess: (result: BatchInvitationResult) => {
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
      onError: (err: unknown) =>
        notification.error({
          message: "Invitations not sent",
          description: errorMessage(err),
          placement: "topRight",
        }),
    };

    if (values.entityType === "Client") {
      // The HRIS client is the source of truth: the portal creates its copy (same id) on this
      // invite if it doesn't have one yet, so nothing has to be set up there first.
      const hrisClient = clients.find((c) => c.id === values.clientId);
      if (!hrisClient) return;
      sendToPortal(
        {
          hrisClient: {
            id: hrisClient.id,
            code: hrisClient.code,
            name: hrisClient.name,
          },
          recipients: ready.map((email) => ({
            email,
            fullName: nameFromEmail(email),
          })),
        },
        handlers,
      );
      return;
    }

    const recipients = ready.map((email) => {
      const status = statuses.get(email);
      return { email, entityId: status?.employeeId, name: status?.name };
    });
    idempotencyKey.current ??= crypto.randomUUID();
    sendBatch(
      {
        payload: {
          entityType: values.entityType,
          role: canAssignRole ? values.role : DEFAULT_ROLE[values.entityType],
          recipients,
        },
        idempotencyKey: idempotencyKey.current,
      },
      handlers,
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

  // The default role is always offered: anyone who may invite may give it.
  const defaultRole = DEFAULT_ROLE[entityType];
  // Client logins always join as Client Admin, so there's no role to pick for them.
  const rolePickable = canAssignRole && entityType === "Employee";
  const roleOptions = (
    rolePickable ? [...new Set([defaultRole, ...roles])] : [defaultRole]
  ).map((r) => ({ label: r, value: r }));
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
              extra={
                entityType === "Client"
                  ? "Client logins join the client portal as Client Admin. Roles can be changed there later."
                  : canAssignRole
                    ? "Every person in this batch gets this role."
                    : `Invitations use the default role (${defaultRole}). Roles can be changed later from the Users page by someone allowed to.`
              }
            >
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={rolePickable ? field.value : defaultRole}
                    placeholder="Select a role"
                    options={roleOptions}
                    loading={rolePickable && loadingRoles}
                    disabled={!rolePickable || sending}
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
