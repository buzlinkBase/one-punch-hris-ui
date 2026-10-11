import { Button, Result } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { BILLING_LABEL, FEATURE_LABELS } from "../../constants/label.const";
import type { FeatureLock } from "../../utils/feature-lock";
import { useSubscriptionState } from "../../hooks/use-subscription-state";

interface FeatureLockedProps {
  lock: FeatureLock;
}

/** Shown in place of a page the company's plan doesn't include. */
export function FeatureLocked({ lock }: FeatureLockedProps) {
  const navigate = useNavigate();
  const { canViewBilling } = useSubscriptionState();
  const feature = FEATURE_LABELS[lock.feature] ?? "This feature";

  const subTitle =
    lock.reason === "revoked"
      ? BILLING_LABEL.NOT_IN_SUBSCRIPTION
      : canViewBilling
        ? `Available on the ${lock.availableOn ?? "higher"} plan.`
        : `Available on the ${lock.availableOn ?? "higher"} plan. Ask your company's owner to upgrade.`;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Result
        icon={<LockOutlined className="text-(--ant-color-primary)" />}
        title={`${feature} isn't included in your plan`}
        subTitle={subTitle}
        extra={
          lock.reason === "upgrade" &&
          canViewBilling && (
            <Button
              type="primary"
              onClick={() =>
                navigate({
                  to: "/billing/plans",
                  search: { feature: lock.feature },
                })
              }
            >
              {BILLING_LABEL.CHOOSE_PLAN}
            </Button>
          )
        }
      />
    </div>
  );
}
