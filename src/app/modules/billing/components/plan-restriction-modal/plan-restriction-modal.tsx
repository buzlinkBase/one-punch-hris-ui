import { useEffect } from "react";
import { Button, Modal, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { usePlanRestrictionStore } from "@/core/stores/plan-restriction.store";
import { getNotify } from "@/shared/utils/notify";
import {
  LIMIT_KEYS,
  SUBSCRIPTION_PROBLEM_TYPES,
} from "@/shared/constants/entitlement-keys.const";
import {
  BILLING_LABEL,
  FEATURE_LABELS,
  LIMIT_LABELS,
  STORAGE_LABEL,
} from "../../constants/label.const";
import { useSubscriptionState } from "../../hooks/use-subscription-state";
import { lapsedPaidPlan } from "../../utils/trial-schedule";

const { Paragraph, Text } = Typography;

const TITLES: Record<string, string> = {
  [SUBSCRIPTION_PROBLEM_TYPES.PLAN_REQUIRED]: "Not included in your plan",
  [SUBSCRIPTION_PROBLEM_TYPES.PLAN_LIMIT_REACHED]: "Plan limit reached",
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
  const { canViewBilling, snapshot } = useSubscriptionState();
  const isReadOnly = restriction?.type === SUBSCRIPTION_PROBLEM_TYPES.READ_ONLY;
  const payToRestore = !!snapshot && lapsedPaidPlan(snapshot);

  // Being read-only isn't an error the user can fix on the spot, and every refused save would
  // reopen a modal: say it once, quietly, with the way out (one toast, replaced in place).
  useEffect(() => {
    if (!isReadOnly) return;
    clear();
    const toastKey = "subscription-read-only";
    try {
      getNotify().warning({
        key: toastKey,
        message: BILLING_LABEL.READ_ONLY_TITLE,
        description: canViewBilling
          ? BILLING_LABEL.READ_ONLY_REFUSED
          : `${BILLING_LABEL.READ_ONLY_REFUSED} ${BILLING_LABEL.CONTACT_ADMIN}`,
        placement: "topRight",
        actions: canViewBilling ? (
          <Button
            size="small"
            type="primary"
            onClick={() => {
              getNotify().destroy(toastKey);
              navigate({ to: payToRestore ? "/billing" : "/billing/plans" });
            }}
          >
            {payToRestore ? BILLING_LABEL.PAY_NOW : BILLING_LABEL.CHOOSE_PLAN}
          </Button>
        ) : undefined,
      });
    } catch {
      // NotificationProvider not mounted yet: the subscription banner still says it.
    }
  }, [isReadOnly, clear, canViewBilling, payToRestore, navigate]);

  if (!restriction || isReadOnly) return null;

  const what =
    (restriction.feature && FEATURE_LABELS[restriction.feature]) ??
    (restriction.limit && LIMIT_LABELS[restriction.limit]) ??
    null;
  // A full disk isn't fixed by a bigger plan alone: the way out is storage blocks, on Billing.
  const isStorage =
    restriction.type === SUBSCRIPTION_PROBLEM_TYPES.PLAN_LIMIT_REACHED &&
    restriction.limit === LIMIT_KEYS.STORAGE_MAX_MB;
  const goToPlans = () => {
    clear();
    navigate({ to: isStorage ? "/billing" : "/billing/plans" });
  };

  return (
    <Modal
      open
      onCancel={clear}
      title={
        <span className="flex items-center gap-2">
          <LockOutlined className="text-(--ant-color-primary)" />
          {isStorage
            ? STORAGE_LABEL.FULL_TITLE
            : (TITLES[restriction.type] ?? "Not available")}
        </span>
      }
      footer={[
        <Button key="close" onClick={clear}>
          Close
        </Button>,
        canViewBilling && (
          <Button key="plans" type="primary" onClick={goToPlans}>
            {isStorage ? STORAGE_LABEL.UPGRADE : BILLING_LABEL.CHOOSE_PLAN}
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
