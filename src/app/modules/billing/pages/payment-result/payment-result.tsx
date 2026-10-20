import { useEffect, useState } from "react";
import { Button, Result, Space, Spin } from "antd";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  PAYMENT_RESULT_LABEL,
  STORAGE_LABEL,
  AUTO_RENEW_LABEL,
} from "../../constants/label.const";
import {
  useCheckout,
  useRefreshSubscription,
} from "../../hooks/use-subscription-queries";
import { checkoutScreen, describeCheckout } from "../../utils/payment";

/** How long the screen keeps checking before it says it's still waiting. */
const CONFIRM_TIMEOUT_MS = 2 * 60 * 1000;

/**
 * Where the payment page sends the payer back: /billing/payment?checkout={id}, with &canceled=1
 * when they backed out. Being sent back proves nothing, so this asks the server -- which asks the
 * gateway -- every few seconds until the payment is confirmed, or it stops waiting.
 */
export default function PaymentResult() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const checkoutId =
    typeof search.checkout === "string" ? search.checkout : undefined;
  const canceled = search.canceled !== undefined;

  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (timedOut) return;
    const timer = window.setTimeout(
      () => setTimedOut(true),
      CONFIRM_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [timedOut]);

  const {
    data: checkout,
    isError,
    refetch,
  } = useCheckout(checkoutId, !canceled && !timedOut);

  const refreshSubscription = useRefreshSubscription();
  const paid = checkout?.status === "Paid";
  useEffect(() => {
    if (paid) void refreshSubscription();
  }, [paid, refreshSubscription]);

  const screen = checkoutScreen({
    checkoutId,
    isError,
    checkout,
    canceled,
    timedOut,
  });
  const summary = checkout ? `${describeCheckout(checkout)}. ` : "";
  const toBilling = (
    <Button type="primary" onClick={() => navigate({ to: "/billing" })}>
      {PAYMENT_RESULT_LABEL.GO_TO_BILLING}
    </Button>
  );

  return (
    <div className="content-page">
      {screen === "confirming" && (
        <Result
          icon={<Spin size="large" />}
          title={PAYMENT_RESULT_LABEL.CONFIRMING}
          subTitle={`${summary}${PAYMENT_RESULT_LABEL.CONFIRMING_HINT}`}
        />
      )}
      {screen === "paid" && (
        <Result
          status="success"
          title={PAYMENT_RESULT_LABEL.PAID}
          subTitle={`${summary}${
            checkout && checkout.kind !== "Plan"
              ? STORAGE_LABEL.PAID_HINT
              : PAYMENT_RESULT_LABEL.PAID_HINT
          }${checkout?.autoRenew ? AUTO_RENEW_LABEL.PAID_HINT : ""}`}
          extra={toBilling}
        />
      )}
      {screen === "closed" && (
        <Result
          status="error"
          title={PAYMENT_RESULT_LABEL.CLOSED}
          subTitle={PAYMENT_RESULT_LABEL.CLOSED_HINT}
          extra={toBilling}
        />
      )}
      {screen === "canceled" && (
        <Result
          status="info"
          title={PAYMENT_RESULT_LABEL.CANCELED}
          subTitle={PAYMENT_RESULT_LABEL.CANCELED_HINT}
          extra={toBilling}
        />
      )}
      {screen === "waiting" && (
        <Result
          status="info"
          title={PAYMENT_RESULT_LABEL.WAITING}
          subTitle={PAYMENT_RESULT_LABEL.WAITING_HINT}
          extra={
            <Space wrap>
              <Button
                onClick={() => {
                  setTimedOut(false);
                  void refetch();
                }}
              >
                {PAYMENT_RESULT_LABEL.CHECK_AGAIN}
              </Button>
              {toBilling}
            </Space>
          }
        />
      )}
      {screen === "not-found" && (
        <Result
          status="warning"
          title={PAYMENT_RESULT_LABEL.NOT_FOUND}
          subTitle={PAYMENT_RESULT_LABEL.NOT_FOUND_HINT}
          extra={toBilling}
        />
      )}
    </div>
  );
}
