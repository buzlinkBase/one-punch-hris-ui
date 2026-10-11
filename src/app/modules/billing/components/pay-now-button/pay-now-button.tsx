import { Button } from "antd";
import { BILLING_LABEL } from "../../constants/label.const";
import { useStartCheckout } from "../../hooks/use-subscription-queries";
import { formatMoney } from "../../utils/format";

interface PayNowButtonProps {
  /** What the server will charge (BillingView.paymentDue / the plan change quote). */
  amount: number;
  currency: string;
}

/**
 * Opens the payment gateway's page for what's due now. Stays busy while the browser leaves for
 * it; a refusal is shown by the global error notification.
 */
export function PayNowButton({ amount, currency }: PayNowButtonProps) {
  const checkout = useStartCheckout();

  return (
    <Button
      type="primary"
      loading={checkout.isPending || checkout.isSuccess}
      onClick={() => checkout.mutate()}
    >
      {BILLING_LABEL.PAY} {formatMoney(amount, currency)}
    </Button>
  );
}
