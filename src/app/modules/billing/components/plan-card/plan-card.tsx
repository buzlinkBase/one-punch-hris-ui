import { Button, Card, Collapse, Tag } from "antd";
import {
  CheckCircleFilled,
  DatabaseOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import {
  FEATURE_KEYS,
  LIMIT_KEYS,
  UNLIMITED,
} from "@/shared/constants/entitlement-keys.const";
import {
  BILLING_LABEL,
  FEATURE_LABELS,
  LIMIT_LABELS,
  PLAN_SECTION,
  SUPPORT_TIER_LABELS,
  SYSTEM_FEATURE_KEYS,
} from "../../constants/label.const";
import { formatStorage } from "../../utils/storage";
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
  /** The open sections: one value for every card, so plans stay comparable. */
  openSections: string[];
  onOpenSectionsChange: (sections: string[]) => void;
  canChoose: boolean;
  choosing: boolean;
  onChoose: (plan: PlanResponse) => void;
}

// The systems get their own section; what's left are the HRMS features.
const FEATURE_ORDER = Object.values(FEATURE_KEYS).filter(
  (key) => !SYSTEM_FEATURE_KEYS.includes(key),
);
// Storage is shown as its own package block, not in the limits list.
const LIMIT_ORDER = Object.values(LIMIT_KEYS).filter(
  (key) => key !== LIMIT_KEYS.STORAGE_MAX_MB,
);

function limitText(key: string, max: number): string {
  if (max === UNLIMITED) return BILLING_LABEL.UNLIMITED;
  // Storage is stored in MB; people read GB.
  return key === LIMIT_KEYS.STORAGE_MAX_MB
    ? formatStorage(max)
    : max.toLocaleString();
}

/** One plan, side by side with the others on the plan selection screen. */
export function PlanCard({
  plan,
  cycle,
  highlighted,
  isCurrent,
  focusFeature,
  openSections,
  onOpenSectionsChange,
  canChoose,
  choosing,
  onChoose,
}: PlanCardProps) {
  const includedFeatures = FEATURE_ORDER.filter(
    (key) => plan.features[key],
  ).length;
  const includedSystems = SYSTEM_FEATURE_KEYS.filter(
    (key) => plan.features[key],
  ).length;

  const renderFeatures = (keys: string[], includedClass: string) => (
    <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
      {keys.map((key) => {
        const included = plan.features[key];
        return (
          <li
            key={key}
            className={[
              "flex items-start gap-2",
              included ? includedClass : "text-(--ant-color-text-quaternary)",
              key === focusFeature
                ? "-mx-2 rounded-md bg-(--ant-color-primary-bg) px-2 py-0.5 font-semibold"
                : "",
            ].join(" ")}
          >
            {included ? (
              <CheckCircleFilled className="mt-0.5 text-base text-(--ant-color-primary)!" />
            ) : (
              <MinusOutlined className="mt-1 text-xs" />
            )}
            <span>{FEATURE_LABELS[key]}</span>
          </li>
        );
      })}
    </ul>
  );
  const annual = cycle === "Annual";
  const price = annual ? plan.annualPrice : plan.monthlyPrice;

  return (
    <Card
      className={
        highlighted
          ? "h-full border-2! border-(--ant-color-primary)! shadow-lg!"
          : "h-full transition-shadow hover:shadow-md!"
      }
      classNames={{ body: "h-full p-6!" }}
    >
      <div className="flex h-full flex-col gap-5">
        <div>
          <div className="flex min-h-7 items-center justify-between gap-2">
            <h3 className="m-0 text-xl font-semibold text-(--ant-color-primary)">
              {plan.name}
            </h3>
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
          <p className="mt-1 mb-0 min-h-10 text-sm text-(--ant-color-text-secondary)">
            {plan.description}
          </p>
        </div>

        <div className="flex min-h-12 flex-wrap items-baseline gap-x-1 gap-y-1">
          <span className="text-4xl font-bold tracking-tight">
            {formatMoney(price, plan.currency)}
          </span>
          <span className="text-sm text-(--ant-color-text-secondary)">
            {annual ? BILLING_LABEL.PER_YEAR : BILLING_LABEL.PER_MONTH}
          </span>
          {annual && plan.annualPromoLabel && (
            <Tag color="gold" className="ml-1">
              {plan.annualPromoLabel}
            </Tag>
          )}
        </div>

        {isCurrent ? (
          <Button block size="large" disabled>
            {BILLING_LABEL.CURRENT}
          </Button>
        ) : (
          canChoose && (
            <Button
              block
              size="large"
              type={highlighted ? "primary" : "default"}
              loading={choosing}
              onClick={() => onChoose(plan)}
            >
              {BILLING_LABEL.SELECT} {plan.name}
            </Button>
          )
        )}

        <ul className="m-0 flex list-none flex-col gap-2 rounded-lg bg-(--ant-color-fill-quaternary) p-4 text-sm">
          {LIMIT_ORDER.map((key) => (
            <li key={key} className="flex justify-between gap-2">
              <span className="text-(--ant-color-text-secondary)">
                {LIMIT_LABELS[key]}
              </span>
              <span className="font-semibold whitespace-nowrap">
                {limitText(key, plan.limits[key] ?? 0)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-(--ant-color-primary) bg-(--ant-color-primary-bg) px-4 py-3">
          <div className="flex items-center gap-2">
            <DatabaseOutlined className="text-lg text-(--ant-color-primary)!" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">
                {BILLING_LABEL.STORAGE_PACKAGE}
              </span>
              <span className="text-xs text-(--ant-color-text-secondary)">
                {BILLING_LABEL.STORAGE_PACKAGE_NOTE}
              </span>
            </div>
          </div>
          <span className="text-base font-bold whitespace-nowrap text-(--ant-color-primary)">
            {limitText(
              LIMIT_KEYS.STORAGE_MAX_MB,
              plan.limits[LIMIT_KEYS.STORAGE_MAX_MB] ?? 0,
            )}
          </span>
        </div>

        <Collapse
          ghost
          size="small"
          className="flex-1"
          activeKey={openSections}
          onChange={(keys) =>
            onOpenSectionsChange(Array.isArray(keys) ? keys : [keys])
          }
          items={[
            {
              key: PLAN_SECTION.SYSTEMS,
              label: `${BILLING_LABEL.SYSTEMS_TITLE} (${includedSystems}/${SYSTEM_FEATURE_KEYS.length})`,
              children: renderFeatures(SYSTEM_FEATURE_KEYS, "font-semibold"),
            },
            {
              key: PLAN_SECTION.FEATURES,
              label: `${BILLING_LABEL.FEATURES_TITLE} (${includedFeatures}/${FEATURE_ORDER.length})`,
              children: renderFeatures(FEATURE_ORDER, ""),
            },
          ]}
        />

        {plan.supportTier && (
          <div className="flex items-start gap-2 text-sm">
            <CheckCircleFilled className="mt-0.5 text-base text-(--ant-color-primary)!" />
            <span>
              {SUPPORT_TIER_LABELS[plan.supportTier] ?? plan.supportTier}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
