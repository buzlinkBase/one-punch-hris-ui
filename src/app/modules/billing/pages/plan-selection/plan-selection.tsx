import { useState } from "react";
import {
  Alert,
  Button,
  Modal,
  Segmented,
  Skeleton,
  Space,
  Typography,
  message,
} from "antd";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { LIMIT_KEYS } from "@/shared/constants/entitlement-keys.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { PayNowButton } from "../../components/pay-now-button";
import { PlanCard } from "../../components/plan-card";
import { PaymentInstructions } from "../../components/payment-instructions";
import {
  BILLING_LABEL,
  LIMIT_LABELS,
  PLAN_SECTION,
  SYSTEM_FEATURE_KEYS,
} from "../../constants/label.const";
import {
  useBilling,
  usePlans,
  useRequestPlanChange,
  useUsage,
} from "../../hooks/use-subscription-queries";
import { BILLING_PERMISSION } from "../../hooks/use-subscription-state";
import type {
  BillingCycle,
  LimitViolation,
  PlanChangeQuoteResponse,
  PlanResponse,
} from "../../models/api/response/subscription-response.model";
import { formatManilaDate, formatMoney } from "../../utils/format";
import { formatStorage } from "../../utils/storage";

const { Title } = Typography;

const CYCLE_OPTIONS = [
  { label: BILLING_LABEL.MONTHLY, value: "Monthly" },
  {
    label: BILLING_LABEL.ANNUAL,
    value: "Annual",
  },
];

/** Column classes by plan count: written out in full so Tailwind sees them. */
function gridColumns(count: number): string {
  if (count <= 1) return "md:mx-auto md:max-w-md";
  if (count === 2) return "md:grid-cols-2";
  if (count === 3) return "md:grid-cols-3";
  return "md:grid-cols-2 xl:grid-cols-4";
}

/** A count, or for storage (kept in MB) a size people can read. */
function violationAmount(limitKey: string, amount: number): string {
  return limitKey === LIMIT_KEYS.STORAGE_MAX_MB
    ? formatStorage(amount)
    : String(amount);
}

function violationsOf(error: unknown): LimitViolation[] {
  const violations = (error as AxiosError<{ data?: { violations?: unknown } }>)
    .response?.data?.data?.violations;
  return Array.isArray(violations) ? (violations as LimitViolation[]) : [];
}

function errorDetail(error: unknown): string {
  const body = (error as AxiosError<{ data?: { detail?: string } | string }>)
    .response?.data?.data;
  if (typeof body === "string") return body;
  return body?.detail ?? "The plan couldn't be changed. Please try again.";
}

/**
 * All plans side by side with a monthly/annual toggle. Pre-selects the plan that fits what the
 * account actually used in its trial (UsageView.recommendedPlanCode). Choosing a plan records
 * the change; it takes effect once payment is confirmed (upgrades) or at period end (downgrades).
 */
export default function PlanSelection() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const focusFeature =
    typeof search.feature === "string" ? search.feature : undefined;
  const canManage = useHasPermission(BILLING_PERMISSION.MANAGE);

  const { data: billing, isLoading: billingLoading } = useBilling();
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  // Slow (counts in other services): the page shows without it, and the best fit appears when it lands.
  const { data: usage } = useUsage();
  const requestChange = useRequestPlanChange();

  const [cycle, setCycle] = useState<BillingCycle>(
    () => billing?.billingCycle ?? "Monthly",
  );
  // One accordion section open at a time, the same on every card: the one holding the feature
  // the user was sent here for, else the systems.
  const [openSection, setOpenSection] = useState<string | undefined>(
    focusFeature && !SYSTEM_FEATURE_KEYS.includes(focusFeature)
      ? PLAN_SECTION.FEATURES
      : PLAN_SECTION.SYSTEMS,
  );
  const [confirming, setConfirming] = useState<PlanResponse | null>(null);
  const [quote, setQuote] = useState<PlanChangeQuoteResponse | null>(null);
  const [violations, setViolations] = useState<LimitViolation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const snapshot = billing?.entitlements;
  const isPaidActive = snapshot?.status === "Active";
  const bestFit =
    usage?.recommendedPlanCode ??
    plans.find((p) => p.isRecommended)?.code ??
    null;
  const currentOrder =
    plans.find((p) => p.code === snapshot?.planCode)?.sortOrder ?? 0;
  // Moving down while paid waits for the period end; anything else waits for payment.
  const startsAtPeriodEnd = (plan: PlanResponse) =>
    isPaidActive && plan.sortOrder < currentOrder;
  const vatNote = plans.some((p) => !p.pricesIncludeVat)
    ? BILLING_LABEL.VAT_EXCLUSIVE
    : BILLING_LABEL.VAT_INCLUSIVE;
  // A plan that waits for payment can be paid right away, when online payment is set up.
  const payOnline =
    quote?.timing === "OnPayment" &&
    !!billing?.onlinePaymentEnabled &&
    canManage;

  const choose = async (plan: PlanResponse) => {
    setError(null);
    setViolations([]);
    try {
      const result = await requestChange.mutateAsync({
        planCode: plan.code,
        billingCycle: cycle,
      });
      setConfirming(null);
      if (result.appliedImmediately) {
        // The unused time paid for the whole period: there's nothing to pay.
        const applied = BILLING_LABEL.UPGRADE_APPLIED.replace(
          "{plan}",
          result.planName,
        );
        message.success(
          applied.replace("{date}", formatManilaDate(result.periodEndUtc)),
        );
        void navigate({ to: "/billing" });
        return;
      }
      setQuote(result);
    } catch (err) {
      setConfirming(null);
      setViolations(violationsOf(err));
      setError(errorDetail(err));
    }
  };

  if (billingLoading || plansLoading) {
    return (
      <div className="content-page">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {BILLING_LABEL.PLANS_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {BILLING_LABEL.PLANS_SUBTITLE}
            </p>
          </div>
          <Space wrap>
            <Segmented
              options={CYCLE_OPTIONS}
              value={cycle}
              onChange={(value) => setCycle(value as BillingCycle)}
            />
            <Button onClick={() => navigate({ to: "/billing" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      {error && (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message={error}
          description={
            violations.length > 0 && (
              <ul className="m-0 mt-1 pl-5">
                {violations.map((v) => (
                  <li key={`${v.limitKey}-${v.tenantId ?? "account"}`}>
                    {v.companyName ? `${v.companyName}: ` : ""}
                    {LIMIT_LABELS[v.limitKey] ?? v.limitKey}{" "}
                    {v.max === null
                      ? "couldn't be checked -- try again shortly"
                      : `${violationAmount(v.limitKey, v.used)} (this plan allows ${violationAmount(v.limitKey, v.max)})`}
                  </li>
                ))}
              </ul>
            )
          }
        />
      )}

      {!canManage && (
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message="Only the company owner or a billing admin can change the plan."
        />
      )}

      <div className={`grid grid-cols-1 gap-4 ${gridColumns(plans.length)}`}>
        {plans.map((plan) => (
          <PlanCard
            key={plan.code}
            plan={plan}
            cycle={cycle}
            highlighted={plan.code === bestFit}
            isCurrent={
              isPaidActive &&
              plan.code === snapshot?.planCode &&
              cycle === billing?.billingCycle
            }
            focusFeature={focusFeature}
            openSection={openSection}
            onOpenSectionChange={setOpenSection}
            canChoose={canManage}
            choosing={requestChange.isPending && confirming?.code === plan.code}
            onChoose={setConfirming}
          />
        ))}
      </div>

      <p className="mt-4 text-sm text-(--ant-color-text-secondary)">
        {vatNote}
      </p>

      <Modal
        open={!!confirming}
        title={`Switch to ${confirming?.name ?? ""}?`}
        okText="Confirm"
        confirmLoading={requestChange.isPending}
        onOk={() => confirming && void choose(confirming)}
        onCancel={() => setConfirming(null)}
      >
        {confirming && (
          <p className="mb-0">
            {formatMoney(
              cycle === "Annual"
                ? confirming.annualPrice
                : confirming.monthlyPrice,
              confirming.currency,
            )}{" "}
            {cycle === "Annual"
              ? BILLING_LABEL.PER_YEAR
              : BILLING_LABEL.PER_MONTH}
            .{" "}
            {startsAtPeriodEnd(confirming)
              ? `It starts when your current period ends, on ${formatManilaDate(snapshot?.currentPeriodEndUtc)}.`
              : "It starts once your payment is confirmed."}
            {isPaidActive &&
              !startsAtPeriodEnd(confirming) &&
              ` ${BILLING_LABEL.UPGRADE_CREDIT_NOTE}`}
          </p>
        )}
      </Modal>

      <Modal
        open={!!quote}
        title={BILLING_LABEL.PAYMENT_INSTRUCTIONS_TITLE}
        footer={
          payOnline && quote ? (
            <Space>
              <Button onClick={() => navigate({ to: "/billing" })}>
                {BILLING_LABEL.PAY_LATER}
              </Button>
              <PayNowButton
                amount={quote.amountDue}
                currency={quote.currency}
              />
            </Space>
          ) : (
            <Button type="primary" onClick={() => navigate({ to: "/billing" })}>
              Done
            </Button>
          )
        }
        onCancel={() => setQuote(null)}
      >
        {quote && (
          <PaymentInstructions
            quote={quote}
            instructions={billing?.paymentInstructions ?? ""}
            effectiveDate={formatManilaDate(quote.effectiveAtUtc)}
            payOnline={payOnline}
          />
        )}
      </Modal>
    </div>
  );
}
