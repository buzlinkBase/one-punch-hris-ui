import { Alert } from "antd";
import {
  BILLING_LABEL,
  PAYMENT_DUE_TITLES,
  STORAGE_LABEL,
} from "../../constants/label.const";
import type { BillingResponse } from "../../models/api/response/subscription-response.model";
import { formatMoney } from "../../utils/format";
import {
  cycleLabel,
  describeDue,
  onlinePayable,
  paymentDueAmounts,
} from "../../utils/payment";
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
  const dueAmounts = due ? paymentDueAmounts(due) : null;

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
          {due &&
            ((due.addOnsAmount > 0 || due.creditAmount > 0) && dueAmounts ? (
              <div className="max-w-md space-y-1 font-medium">
                <div className="flex justify-between gap-6">
                  <span>
                    {due.planName} ({cycleLabel(due.billingCycle)})
                  </span>
                  <span>{formatMoney(dueAmounts.plan, billing.currency)}</span>
                </div>
                {dueAmounts.addOns > 0 && (
                  <div className="flex justify-between gap-6">
                    <span>{STORAGE_LABEL.ADD_ONS_LINE}</span>
                    <span>
                      {formatMoney(dueAmounts.addOns, billing.currency)}
                    </span>
                  </div>
                )}
                {dueAmounts.credit > 0 && (
                  <div className="flex justify-between gap-6 text-(--ant-color-success)">
                    <span>
                      {BILLING_LABEL.UPGRADE_CREDIT_LINE.replace(
                        "{days}",
                        String(due.unusedDays),
                      )}
                    </span>
                    <span>
                      {formatMoney(-dueAmounts.credit, billing.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-6 border-t border-(--ant-color-border-secondary) pt-1 font-semibold">
                  <span>{STORAGE_LABEL.TOTAL_LINE}</span>
                  <span>{formatMoney(dueAmounts.total, billing.currency)}</span>
                </div>
              </div>
            ) : (
              <span className="font-medium">
                {describeDue(due, billing.currency)}
              </span>
            ))}
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
