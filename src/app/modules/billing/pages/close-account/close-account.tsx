import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Skeleton,
  Table,
  Typography,
  notification,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { LIMIT_KEYS } from "@/shared/constants/entitlement-keys.const";
import {
  CLOSURE_LABEL,
  CLOSURE_STATUS_LABELS,
} from "../../constants/closure-label.const";
import {
  useAccountClosure,
  useCancelAccountClosure,
  useRequestAccountClosure,
} from "../../hooks/use-closure-queries";
import { useUsage } from "../../hooks/use-subscription-queries";
import {
  closureFormSchema,
  type ClosureFormValues,
} from "../../models/forms/closure-form.schema";
import type { CompanyUsageResponse } from "../../models/api/response/subscription-response.model";
import { formatManilaDate } from "../../utils/format";

const { Title, Text } = Typography;

const OPEN_STATUSES = ["PendingConfirmation", "CoolingOff", "ReadyForReview"];

const COMPANY_COLUMNS: ColumnsType<CompanyUsageResponse> = [
  { title: CLOSURE_LABEL.COMPANY, dataIndex: "name", key: "name" },
  {
    title: CLOSURE_LABEL.EMPLOYEES,
    key: "employees",
    render: (_, row) => row.used[LIMIT_KEYS.EMPLOYEES_MAX] ?? "--",
  },
];

function CompaniesTable() {
  const { data: usage, isLoading } = useUsage();
  if (isLoading)
    return <Skeleton active paragraph={{ rows: 2 }} title={false} />;
  return (
    <Table
      rowKey="tenantId"
      size="small"
      pagination={false}
      columns={COMPANY_COLUMNS}
      dataSource={usage?.companies ?? []}
      scroll={{ x: "max-content" }}
    />
  );
}

/** Billing > Close my account: the account owner asks to close the account; nothing is deleted straight away. */
export default function CloseAccount() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const isOwner = !!user?.roles?.includes("Owner");
  const { data: closure, isLoading } = useAccountClosure(isOwner);
  const request = useRequestAccountClosure();
  const cancel = useCancelAccountClosure();
  const [open, setOpen] = useState(false);

  const form = useForm<ClosureFormValues>({
    resolver: zodResolver(closureFormSchema),
    defaultValues: { confirmEmail: "", reason: "", exported: false },
  });

  if (!isOwner) {
    return (
      <div className="content-page">
        <Alert type="info" showIcon message={CLOSURE_LABEL.OWNERS_ONLY} />
      </div>
    );
  }

  const isOpen = !!closure && OPEN_STATUSES.includes(closure.status);

  const submit = form.handleSubmit(async (values) => {
    if (
      values.confirmEmail.trim().toLowerCase() !==
      (user?.email ?? "").trim().toLowerCase()
    ) {
      form.setError("confirmEmail", { message: CLOSURE_LABEL.EMAIL_MISMATCH });
      return;
    }
    try {
      await request.mutateAsync({
        confirmEmail: values.confirmEmail.trim(),
        reason: values.reason?.trim() || undefined,
      });
      notification.success({
        message: CLOSURE_LABEL.REQUESTED,
        placement: "topRight",
      });
      setOpen(false);
      form.reset();
    } catch {
      // The server's reason is already shown by the HTTP client; keep the form open.
    }
  });

  const status = closure && (
    <Alert
      className="mb-4"
      type={closure.status === "Rejected" ? "warning" : "info"}
      showIcon
      message={CLOSURE_STATUS_LABELS[closure.status]}
      description={
        <div className="space-y-1">
          {closure.status === "PendingConfirmation" &&
            closure.confirmExpiresAtUtc && (
              <div>
                {CLOSURE_LABEL.REQUESTED} (
                {formatManilaDate(closure.confirmExpiresAtUtc)})
              </div>
            )}
          {closure.status === "CoolingOff" && closure.coolingOffEndsAtUtc && (
            <div>
              {formatManilaDate(closure.coolingOffEndsAtUtc)}:{" "}
              {CLOSURE_LABEL.DECIDED_BY_US}
            </div>
          )}
          {closure.status === "ReadyForReview" && (
            <div>{CLOSURE_LABEL.DECIDED_BY_US}</div>
          )}
          {closure.status === "Approved" && closure.purgeAfterUtc && (
            <div>
              {CLOSURE_LABEL.PURGE_ON} {formatManilaDate(closure.purgeAfterUtc)}
              .
            </div>
          )}
          {closure.status === "Rejected" && closure.decisionReason && (
            <div>
              {CLOSURE_LABEL.REJECTED_PREFIX} {closure.decisionReason}
            </div>
          )}
        </div>
      }
      action={
        isOpen && (
          <Button
            loading={cancel.isPending}
            onClick={() => cancel.mutate(undefined)}
          >
            {CLOSURE_LABEL.CANCEL_REQUEST}
          </Button>
        )
      }
    />
  );

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {CLOSURE_LABEL.PAGE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {CLOSURE_LABEL.PAGE_SUBTITLE}
            </p>
          </div>
          <Button onClick={() => navigate({ to: "/billing" })}>
            Back to billing
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div className="flex flex-col gap-4">
          {status}
          <Card title={CLOSURE_LABEL.WHAT_HAPPENS_TITLE}>
            <ol className="m-0 mb-2 space-y-2 pl-5">
              {CLOSURE_LABEL.WHAT_HAPPENS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
            <Alert
              className="mt-4"
              type="error"
              showIcon
              message={CLOSURE_LABEL.EXPORT_HINT}
            />
          </Card>
          <Card title={CLOSURE_LABEL.COMPANIES}>
            <CompaniesTable />
          </Card>
          {!isOpen && (
            <div>
              <Button danger type="default" onClick={() => setOpen(true)}>
                {CLOSURE_LABEL.LINK_BUTTON}
              </Button>
            </div>
          )}
        </div>
      )}

      <Modal
        open={open}
        title={CLOSURE_LABEL.PAGE_TITLE}
        okText={CLOSURE_LABEL.SUBMIT}
        okButtonProps={{ danger: true, loading: request.isPending }}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnHidden
      >
        <Form layout="vertical" requiredMark={false}>
          <Controller
            name="confirmEmail"
            control={form.control}
            render={({ field, fieldState }) => (
              <Form.Item
                label={`${CLOSURE_LABEL.CONFIRM_EMAIL} (${user?.email ?? ""})`}
                validateStatus={fieldState.error ? "error" : undefined}
                help={fieldState.error?.message}
              >
                <Input {...field} autoComplete="off" />
              </Form.Item>
            )}
          />
          <Controller
            name="reason"
            control={form.control}
            render={({ field, fieldState }) => (
              <Form.Item
                label={CLOSURE_LABEL.REASON}
                validateStatus={fieldState.error ? "error" : undefined}
                help={fieldState.error?.message}
              >
                <Input.TextArea {...field} rows={3} maxLength={500} showCount />
              </Form.Item>
            )}
          />
          <Controller
            name="exported"
            control={form.control}
            render={({ field, fieldState }) => (
              <Form.Item
                validateStatus={fieldState.error ? "error" : undefined}
                help={fieldState.error?.message}
              >
                <Checkbox
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                >
                  {CLOSURE_LABEL.EXPORTED}
                </Checkbox>
              </Form.Item>
            )}
          />
          <Text type="secondary">{CLOSURE_LABEL.LINK_TEXT}</Text>
        </Form>
      </Modal>
    </div>
  );
}
