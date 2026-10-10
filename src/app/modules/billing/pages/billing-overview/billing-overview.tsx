import {
  Alert,
  Button,
  Card,
  Descriptions,
  Popconfirm,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import { LIMIT_KEYS } from "@/shared/constants/entitlement-keys.const";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { PaymentDueAlert } from "../../components/payment-due-alert";
import { StorageCard } from "../../components/storage-card";
import {
  BILLING_LABEL,
  LIMIT_SHORT_LABELS,
  PAYMENT_METHOD_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "../../constants/label.const";
import {
  useBilling,
  useCancelSubscription,
  useResumeSubscription,
  useUsage,
  useWithdrawPlanChange,
} from "../../hooks/use-subscription-queries";
import { BILLING_PERMISSION } from "../../hooks/use-subscription-state";
import type {
  CompanyUsageResponse,
  PaymentResponse,
} from "../../models/api/response/subscription-response.model";
import { formatManilaDate, formatMoney } from "../../utils/format";

const { Title } = Typography;

const USAGE_KEYS = [
  LIMIT_KEYS.EMPLOYEES_MAX,
  LIMIT_KEYS.ADMINS_MAX,
  LIMIT_KEYS.BIOMETRIC_DEVICES_MAX,
];

function usageText(used: number | null, max: number | null): string {
  const usedText = used === null ? BILLING_LABEL.UNKNOWN : used.toString();
  return `${usedText} / ${max === null ? BILLING_LABEL.UNLIMITED : max}`;
}

function isOver(used: number | null, max: number | null): boolean {
  return used !== null && max !== null && used > max;
}

const USAGE_COLUMNS: ColumnsType<CompanyUsageResponse> = [
  { title: "Company", dataIndex: "name", key: "name" },
  ...USAGE_KEYS.map((key) => ({
    title: LIMIT_SHORT_LABELS[key],
    key,
    render: (_: unknown, row: CompanyUsageResponse) => {
      const used = row.used[key] ?? null;
      if (key === LIMIT_KEYS.EMPLOYEES_MAX) {
        return used === null ? BILLING_LABEL.UNKNOWN : used;
      }
      const max = row.max[key] ?? null;
      return (
        <span
          className={
            isOver(used, max) ? "font-semibold text-(--ant-color-error)" : ""
          }
        >
          {usageText(used, max)}
        </span>
      );
    },
  })),
];

const PAYMENT_COLUMNS: ColumnsType<PaymentResponse> = [
  {
    title: "Paid",
    dataIndex: "paidAtUtc",
    key: "paidAtUtc",
    render: (value: string) => formatManilaDate(value),
  },
  { title: "Plan", dataIndex: "planName", key: "planName" },
  {
    title: "Period",
    key: "period",
    render: (_, row) =>
      `${formatManilaDate(row.periodStartUtc)} - ${formatManilaDate(row.periodEndUtc)}`,
  },
  {
    title: "Amount",
    key: "amount",
    align: "right",
    render: (_, row) => formatMoney(row.amount, row.currency),
  },
  {
    title: "Method",
    dataIndex: "method",
    key: "method",
    render: (value: PaymentResponse["method"]) =>
      PAYMENT_METHOD_LABELS[value] ?? value,
  },
  { title: "Reference", dataIndex: "reference", key: "reference" },
];

/**
 * Usage per company. Counting asks other services and is slow, so this loads on its own: the rest
 * of the screen shows at once and this card fills in when its data lands.
 */
function UsageCard({
  companiesUsed,
  companiesMax,
}: {
  companiesUsed: number;
  companiesMax: number | null;
}) {
  const { data: usage, isLoading } = useUsage();

  // Employees are one pool for the account: the total across companies against its one limit.
  const companies = usage?.companies ?? [];
  const employeeCounts = companies.map(
    (company) => company.used[LIMIT_KEYS.EMPLOYEES_MAX] ?? null,
  );
  const employeesUsed = employeeCounts.includes(null)
    ? null
    : employeeCounts.reduce<number>((sum, count) => sum + (count ?? 0), 0);
  const employeesMax = companies[0]?.max[LIMIT_KEYS.EMPLOYEES_MAX] ?? null;

  return (
    <Card
      title={BILLING_LABEL.USAGE}
      extra={
        <Space
          size="large"
          className="text-sm text-(--ant-color-text-secondary)"
        >
          <span>
            {BILLING_LABEL.COMPANIES}: {companiesUsed} /{" "}
            {companiesMax ?? BILLING_LABEL.UNLIMITED}
          </span>
          {usage && (
            <span
              className={
                isOver(employeesUsed, employeesMax)
                  ? "font-semibold text-(--ant-color-error)"
                  : ""
              }
            >
              {LIMIT_SHORT_LABELS[LIMIT_KEYS.EMPLOYEES_MAX]}:{" "}
              {usageText(employeesUsed, employeesMax)}
            </span>
          )}
        </Space>
      }
    >
      <p className="mt-0 text-sm text-(--ant-color-text-secondary)">
        {BILLING_LABEL.USAGE_HINT}
      </p>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      ) : (
        <Table
          rowKey="tenantId"
          size="small"
          pagination={false}
          columns={USAGE_COLUMNS}
          dataSource={companies}
          scroll={{ x: "max-content" }}
        />
      )}
    </Card>
  );
}

/** Billing: the account's plan and status, usage against limits, and payments. */
export default function BillingOverview() {
  const navigate = useNavigate();
  const canManage = useHasPermission(BILLING_PERMISSION.MANAGE);
  const { data: billing, isLoading } = useBilling();
  const withdraw = useWithdrawPlanChange();
  const cancel = useCancelSubscription();
  const resume = useResumeSubscription();

  if (isLoading || !billing) {
    return (
      <div className="content-page">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  const snapshot = billing.entitlements;
  const status = snapshot.status;
  const pending = billing.pendingChange;
  // How to pay: something is due (a chosen plan, a renewal, a comeback), or the account has to
  // pay to continue.
  const awaitingPayment =
    !!billing.paymentDue ||
    pending?.timing === "OnPayment" ||
    ["Expired", "PastDue", "Suspended", "Canceled"].includes(status);

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {BILLING_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">{BILLING_LABEL.SUBTITLE}</p>
          </div>
          <Button
            type="primary"
            onClick={() => navigate({ to: "/billing/plans" })}
          >
            {status === "Active"
              ? BILLING_LABEL.CHANGE_PLAN
              : BILLING_LABEL.CHOOSE_PLAN}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card title={BILLING_LABEL.CURRENT_PLAN}>
          <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
            <Descriptions.Item label="Plan">
              {snapshot.planName ?? "--"}
            </Descriptions.Item>
            <Descriptions.Item label={BILLING_LABEL.STATUS}>
              <Tag color={STATUS_COLORS[status] ?? "default"}>
                {STATUS_LABELS[status] ?? status}
              </Tag>
            </Descriptions.Item>
            {status === "Trialing" ? (
              <Descriptions.Item label={BILLING_LABEL.TRIAL_ENDS}>
                {formatManilaDate(snapshot.trialEndsAtUtc)}
              </Descriptions.Item>
            ) : (
              <Descriptions.Item label={BILLING_LABEL.PERIOD_ENDS}>
                {formatManilaDate(snapshot.currentPeriodEndUtc)}
              </Descriptions.Item>
            )}
            {billing.billingCycle && status !== "Trialing" && (
              <Descriptions.Item label={BILLING_LABEL.BILLING_CYCLE}>
                {billing.billingCycle === "Annual"
                  ? BILLING_LABEL.ANNUAL
                  : BILLING_LABEL.MONTHLY}
              </Descriptions.Item>
            )}
            {billing.nextAmountDue !== null && status !== "Trialing" && (
              <Descriptions.Item label={BILLING_LABEL.NEXT_AMOUNT}>
                {formatMoney(billing.nextAmountDue, billing.currency)}
              </Descriptions.Item>
            )}
            {status === "PastDue" && (
              <Descriptions.Item label="Read-only from">
                {formatManilaDate(snapshot.graceEndsAtUtc)}
              </Descriptions.Item>
            )}
            {billing.purgeAfterUtc && (
              <Descriptions.Item label="Data kept until">
                {formatManilaDate(billing.purgeAfterUtc)}
              </Descriptions.Item>
            )}
          </Descriptions>

          {pending && (
            <Alert
              className="mt-4"
              type="info"
              showIcon
              message={
                pending.timing === "AtPeriodEnd"
                  ? `Moving to ${pending.planName} on ${formatManilaDate(pending.effectiveAtUtc)}.`
                  : `${pending.planName} (${pending.billingCycle.toLowerCase()}) starts once your payment of ${formatMoney(pending.amountDue, billing.currency)} is confirmed.`
              }
              action={
                canManage && (
                  <Button
                    size="small"
                    loading={withdraw.isPending}
                    onClick={() => withdraw.mutate(undefined)}
                  >
                    {BILLING_LABEL.WITHDRAW_CHANGE}
                  </Button>
                )
              }
            />
          )}

          {awaitingPayment && (
            <PaymentDueAlert billing={billing} canPay={canManage} />
          )}

          {canManage && status === "Active" && (
            <Space className="mt-4">
              {snapshot.cancelAtPeriodEnd ? (
                <Button
                  loading={resume.isPending}
                  onClick={() => resume.mutate(undefined)}
                >
                  {BILLING_LABEL.RESUME_SUBSCRIPTION}
                </Button>
              ) : (
                <Popconfirm
                  title="Cancel your subscription?"
                  description={`You keep full access until ${formatManilaDate(snapshot.currentPeriodEndUtc)}, then your companies become read-only.`}
                  okText="Cancel subscription"
                  cancelText="Keep it"
                  onConfirm={() => cancel.mutate(undefined)}
                >
                  <Button danger loading={cancel.isPending}>
                    {BILLING_LABEL.CANCEL_SUBSCRIPTION}
                  </Button>
                </Popconfirm>
              )}
            </Space>
          )}
        </Card>

        <StorageCard
          canManage={canManage}
          onlinePaymentEnabled={billing.onlinePaymentEnabled}
        />

        <UsageCard
          companiesUsed={billing.companiesUsed}
          companiesMax={billing.companiesMax}
        />

        <Card title={BILLING_LABEL.PAYMENTS}>
          <Table
            rowKey="id"
            size="small"
            columns={PAYMENT_COLUMNS}
            dataSource={billing.payments}
            locale={{ emptyText: BILLING_LABEL.NO_PAYMENTS }}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            scroll={{ x: "max-content" }}
          />
        </Card>
      </div>
    </div>
  );
}
