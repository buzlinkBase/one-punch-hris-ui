import { Button, Modal, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { usePlanRestrictionStore } from "@/core/stores/plan-restriction.store";
import { SUBSCRIPTION_PROBLEM_TYPES } from "@/shared/constants/entitlement-keys.const";
import {
  BILLING_LABEL,
  FEATURE_LABELS,
  LIMIT_LABELS,
} from "../../constants/label.const";
import { useSubscriptionState } from "../../hooks/use-subscription-state";

const { Paragraph, Text } = Typography;

const TITLES: Record<string, string> = {
  [SUBSCRIPTION_PROBLEM_TYPES.PLAN_REQUIRED]: "Not included in your plan",
  [SUBSCRIPTION_PROBLEM_TYPES.PLAN_LIMIT_REACHED]: "Plan limit reached",
  [SUBSCRIPTION_PROBLEM_TYPES.READ_ONLY]: "Your subscription is read-only",
};

/**
 * The upgrade prompt for a request the subscription refused (set by the axios error
 * interceptor). Owners and billing admins get a way to the plans; everyone else is told who
 * can upgrade. Mounted once in each layout.
 */
export function PlanRestrictionModal() {
  const navigate = useNavigate();
  const restriction = usePlanRestrictionStore((s) => s.restriction);
  const clear = usePlanRestrictionStore((s) => s.clear);
  const { canViewBilling } = useSubscriptionState();

  if (!restriction) return null;

  const what =
    (restriction.feature && FEATURE_LABELS[restriction.feature]) ??
    (restriction.limit && LIMIT_LABELS[restriction.limit]) ??
    null;
  const goToPlans = () => {
    clear();
    navigate({ to: "/billing/plans" });
  };

  return (
    <Modal
      open
      onCancel={clear}
      title={
        <span className="flex items-center gap-2">
          <LockOutlined className="text-(--ant-color-primary)" />
          {TITLES[restriction.type] ?? "Not available"}
        </span>
      }
      footer={[
        <Button key="close" onClick={clear}>
          Close
        </Button>,
        canViewBilling && (
          <Button key="plans" type="primary" onClick={goToPlans}>
            {BILLING_LABEL.CHOOSE_PLAN}
          </Button>
        ),
      ]}
    >
      {what && <Text strong>{what}</Text>}
      <Paragraph className="mt-2 mb-0">{restriction.detail}</Paragraph>
      {!canViewBilling && (
        <Paragraph type="secondary" className="mt-3 mb-0">
          Ask your company&apos;s owner or billing admin to change the plan.
        </Paragraph>
      )}
    </Modal>
  );
}
