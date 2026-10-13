import { useState } from "react";
import { Alert, Button, Modal } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { authStorage } from "@/core/auth/auth-storage";
import { BILLING_LABEL } from "../../constants/label.const";
import { formatManilaDate } from "../../utils/format";
import { useSubscriptionState } from "../../hooks/use-subscription-state";
import {
  localDayKey,
  subscriptionBanner,
  type SubscriptionBannerState,
} from "../../utils/trial-schedule";

const TRIAL_DAYS = 7;

// Banner dismissals and the once-a-day popup live in this browser only -- a per-viewer
// convenience, never anything the subscription depends on.
function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string) {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // Storage unavailable (private mode, blocked): the banner simply shows again.
  }
}

function readSessionFlag(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeSessionFlag(key: string) {
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Storage unavailable: the prompt may show once more this session.
  }
}

function bannerText(
  state: SubscriptionBannerState,
  canViewBilling: boolean,
): { type: "info" | "warning" | "error"; message: string } {
  // Dates show in Philippine time; the subscription itself runs on UTC.
  const date = formatManilaDate(state.date);
  switch (state.kind) {
    case "trial-welcome":
      return {
        type: "info",
        message: `Welcome! Your free trial includes everything in Premium until ${date}.`,
      };
    case "trial-days-left":
      return {
        type: "info",
        message: `${state.daysLeft} days left in your free trial (ends ${date}).`,
      };
    case "trial-ends-tomorrow":
      return {
        type: "warning",
        message: `Your free trial ends tomorrow, ${date}.`,
      };
    case "trial-ends-today":
      return {
        type: "warning",
        message:
          "Your free trial ends today. Choose a plan to keep everything running.",
      };
    case "canceling":
      return {
        type: "info",
        message: `Your subscription is canceled and ends on ${date}.`,
      };
    case "past-due":
      return {
        type: "warning",
        message: `Payment is overdue. Full access continues until ${date}, then your company becomes read-only.`,
      };
    case "read-only":
      return {
        type: "error",
        message: !canViewBilling
          ? BILLING_LABEL.CONTACT_ADMIN
          : state.payToRestore
            ? "Your account is read-only until payment is received: you can view and export, but not make changes. Pay now to restore full access right away."
            : "Your company is read-only: you can view and export, but not make changes. Choose a plan to continue.",
      };
  }
}

/**
 * The subscription banner above every page: trial countdown, overdue payment, read-only. Trial
 * and payment notices are for whoever can see billing (owner, billing admins); a read-only
 * company tells everyone else to contact their admin. Also opens the plan selection prompt --
 * once a day near the trial's end, once a session when read-only.
 */
export function SubscriptionBanner() {
  const navigate = useNavigate();
  const { snapshot, canViewBilling } = useSubscriptionState();
  const [now] = useState(() => Date.now());
  const [, rerender] = useState(0);
  const tenantId = authStorage.getTenantId() ?? "none";

  const state = subscriptionBanner(snapshot, TRIAL_DAYS, now);
  if (!state) return null;
  if (!canViewBilling && state.kind !== "read-only") return null;

  const today = localDayKey(now);
  const dismissKey = `subscription-banner:${tenantId}:${state.kind}:${today}`;
  const popupKey = `subscription-plan-popup:${tenantId}:${today}`;
  const readOnlyPromptKey = `subscription-read-only-prompt:${tenantId}`;

  if (state.dismissible && readFlag(dismissKey)) return null;

  const popupOpen =
    canViewBilling &&
    ((state.showPlanPopup && !readFlag(popupKey)) ||
      (state.kind === "read-only" && !readSessionFlag(readOnlyPromptKey)));
  const closePopup = () => {
    writeFlag(popupKey);
    writeSessionFlag(readOnlyPromptKey);
    rerender((n) => n + 1);
  };
  // A lapsed paid plan is restored by paying what's due (Billing); anything else starts at the plans.
  const payNow = state.kind === "read-only" && !!state.payToRestore;
  const actionLabel = payNow
    ? BILLING_LABEL.PAY_NOW
    : BILLING_LABEL.CHOOSE_PLAN;
  const goToPlans = () => {
    closePopup();
    navigate({ to: payNow ? "/billing" : "/billing/plans" });
  };

  const text = bannerText(state, canViewBilling);

  return (
    <>
      <Alert
        className="mx-2 mt-2 md:mx-6 md:mt-4"
        type={text.type}
        showIcon
        message={text.message}
        closable={state.dismissible}
        onClose={() => writeFlag(dismissKey)}
        action={
          canViewBilling && (
            <Button size="small" type="primary" onClick={goToPlans}>
              {actionLabel}
            </Button>
          )
        }
      />
      <Modal
        open={popupOpen}
        title={
          state.kind === "read-only"
            ? payNow
              ? "Pay to restore full access"
              : "Choose a plan to continue"
            : "Your free trial is ending"
        }
        onCancel={closePopup}
        footer={[
          <Button key="later" onClick={closePopup}>
            {state.kind === "read-only" ? "Continue read-only" : "Later"}
          </Button>,
          <Button key="plans" type="primary" onClick={goToPlans}>
            {actionLabel}
          </Button>,
        ]}
      >
        <p className="mb-0">{text.message}</p>
      </Modal>
    </>
  );
}
