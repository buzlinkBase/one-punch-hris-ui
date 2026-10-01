import { Descriptions } from "antd";
import { BILLING_LABEL } from "../../constants/label.const";
import type { PlanChangeQuoteResponse } from "../../models/api/response/subscription-response.model";
import { formatMoney } from "../../utils/format";

interface PaymentInstructionsProps {
  quote: PlanChangeQuoteResponse;
  /** From the server (Subscriptions:PaymentInstructions) -- bank details and reference. */
  instructions: string;
  /** Philippine date a period-end change takes effect. */
  effectiveDate: string;
}

/**
 * What to pay and how, after choosing a plan. Until online payment exists the plan is
 * activated once the payment is confirmed on our side.
 */
export function PaymentInstructions({
  quote,
  instructions,
  effectiveDate,
}: PaymentInstructionsProps) {
  const atPeriodEnd = quote.timing === "AtPeriodEnd";

  return (
    <div className="flex flex-col gap-3">
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="Plan">
          {quote.planName} ({quote.billingCycle.toLowerCase()})
        </Descriptions.Item>
        <Descriptions.Item label="Amount">
          {formatMoney(quote.amountDue, quote.currency)}{" "}
          <span className="text-(--ant-color-text-secondary)">
            {quote.pricesIncludeVat
              ? BILLING_LABEL.VAT_INCLUSIVE
              : BILLING_LABEL.VAT_EXCLUSIVE}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Starts">
          {atPeriodEnd
            ? `When your current period ends (${effectiveDate})`
            : "As soon as your payment is confirmed"}
        </Descriptions.Item>
      </Descriptions>
      {atPeriodEnd ? (
        <p className="m-0">
          You keep your current plan until then. Nothing to pay now -- the new
          price applies from your next period.
        </p>
      ) : (
        <p className="m-0 whitespace-pre-line">{instructions}</p>
      )}
    </div>
  );
}
