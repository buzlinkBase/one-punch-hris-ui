import { Button, Card, Tag } from "antd";
import { CheckOutlined, MinusOutlined } from "@ant-design/icons";
import {
  FEATURE_KEYS,
  LIMIT_KEYS,
  UNLIMITED,
} from "@/shared/constants/entitlement-keys.const";
import {
  BILLING_LABEL,
  FEATURE_LABELS,
  LIMIT_LABELS,
  SUPPORT_TIER_LABELS,
} from "../../constants/label.const";
import type {
  BillingCycle,
  PlanResponse,
} from "../../models/api/response/subscription-response.model";
import { formatMoney } from "../../utils/format";

interface PlanCardProps {
  plan: PlanResponse;
  cycle: BillingCycle;
  /** Highlighted as the best fit for this account. */
  highlighted: boolean;
  isCurrent: boolean;
  /** A feature to draw attention to (the one the user tried to open). */
  focusFeature?: string;
  canChoose: boolean;
  choosing: boolean;
  onChoose: (plan: PlanResponse) => void;
}

const FEATURE_ORDER = Object.values(FEATURE_KEYS);
const LIMIT_ORDER = Object.values(LIMIT_KEYS);

function limitText(max: number): string {
  return max === UNLIMITED ? BILLING_LABEL.UNLIMITED : max.toLocaleString();
}

/** One plan, side by side with the others on the plan selection screen. */
export function PlanCard({
  plan,
  cycle,
  highlighted,
  isCurrent,
  focusFeature,
  canChoose,
  choosing,
  onChoose,
}: PlanCardProps) {
  const annual = cycle === "Annual";
  const price = annual ? plan.annualPrice : plan.monthlyPrice;

  return (
    <Card
      className={
        highlighted
          ? "h-full border-2! border-(--ant-color-primary)!"
          : "h-full"
      }
      classNames={{ body: "h-full" }}
    >
      <div className="flex h-full flex-col gap-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="m-0 text-lg font-semibold">{plan.name}</h3>
            <div className="flex flex-wrap justify-end gap-1">
              {!plan.isPublic && (
                <Tag color="blue" className="m-0">
                  {BILLING_LABEL.OFFERED_TO_YOU}
                </Tag>
              )}
              {highlighted && (
                <Tag color="green" className="m-0">
                  {BILLING_LABEL.BEST_FIT}
                </Tag>
              )}
            </div>
          </div>
          <p className="mt-1 mb-0 text-sm text-(--ant-color-text-secondary)">
            {plan.description}
          </p>
        </div>

        <div>
          <span className="text-3xl font-bold">
            {formatMoney(price, plan.currency)}
          </span>
          <span className="ml-1 text-sm text-(--ant-color-text-secondary)">
            {annual ? BILLING_LABEL.PER_YEAR : BILLING_LABEL.PER_MONTH}
          </span>
          {annual && (
            <Tag color="gold" className="ml-2">
              {BILLING_LABEL.ANNUAL_SAVING}
            </Tag>
          )}
        </div>

        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm">
          {LIMIT_ORDER.map((key) => (
            <li key={key} className="flex justify-between gap-2">
              <span>{LIMIT_LABELS[key]}</span>
              <span className="font-semibold">
                {limitText(plan.limits[key] ?? 0)}
              </span>
            </li>
          ))}
        </ul>

        <ul className="m-0 flex flex-1 list-none flex-col gap-1.5 p-0 text-sm">
          {FEATURE_ORDER.map((key) => {
            const included = plan.features[key];
            return (
              <li
                key={key}
                className={[
                  "flex items-start gap-2",
                  included ? "" : "text-(--ant-color-text-quaternary)",
                  key === focusFeature ? "font-semibold" : "",
                ].join(" ")}
              >
                {included ? (
                  <CheckOutlined className="mt-1 text-(--ant-color-primary)" />
                ) : (
                  <MinusOutlined className="mt-1" />
                )}
                <span>{FEATURE_LABELS[key]}</span>
              </li>
            );
          })}
          {plan.supportTier && (
            <li className="flex items-start gap-2">
              <CheckOutlined className="mt-1 text-(--ant-color-primary)" />
              <span>
                {SUPPORT_TIER_LABELS[plan.supportTier] ?? plan.supportTier}
              </span>
            </li>
          )}
        </ul>

        {isCurrent ? (
          <Button block disabled>
            {BILLING_LABEL.CURRENT}
          </Button>
        ) : (
          canChoose && (
            <Button
              block
              type={highlighted ? "primary" : "default"}
              loading={choosing}
              onClick={() => onChoose(plan)}
            >
              {BILLING_LABEL.SELECT} {plan.name}
            </Button>
          )
        )}
      </div>
    </Card>
  );
}
