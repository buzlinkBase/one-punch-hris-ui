import { Alert } from "antd";
import { BILLING_LABEL, PAYMENT_DUE_TITLES } from "../../constants/label.const";
import type { BillingResponse } from "../../models/api/response/subscription-response.model";
import { describeDue, onlinePayable } from "../../utils/payment";
import { PayNowButton } from "../pay-now-button";

interface PaymentDueAlertProps {
  billing: BillingResponse;
  /** Owner or billing admin -- only they can start a payment. */
  canPay: boolean;
}

/**
 * What's due and how to pay it: Pay now (when online payment is set up) with the bank transfer
 * instructions as the other way, or the instructions alone. Without anything due (a trial that
 * ended with no plan chosen) it's just the instructions.
 */
export function PaymentDueAlert({ billing, canPay }: PaymentDueAlertProps) {
  const due = billing.paymentDue;
  const payable = onlinePayable(billing, canPay);
  const isUpcomingRenewal =
    due?.reason === "Renewal" && billing.entitlements.status === "Active";

  return (
    <Alert
      className="mt-4"
      type={isUpcomingRenewal ? "info" : "warning"}
      showIcon
      message={
        due
          ? PAYMENT_DUE_TITLES[due.reason]
          : BILLING_LABEL.PAYMENT_INSTRUCTIONS_TITLE
      }
      description={
        <div className="flex flex-col gap-3">
          {due && (
            <span className="font-medium">
              {describeDue(due, billing.currency)}
            </span>
          )}
          {payable && (
            <>
              <span>{BILLING_LABEL.PAY_ONLINE_HINT}</span>
              <div>
                <PayNowButton
                  amount={payable.amount}
                  currency={billing.currency}
                />
              </div>
              <span className="text-(--ant-color-text-secondary)">
                {BILLING_LABEL.PAY_OTHER_WAYS}
              </span>
            </>
          )}
          <span className="whitespace-pre-line">
            {billing.paymentInstructions}
          </span>
        </div>
      }
    />
  );
}
