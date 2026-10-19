import { BILLING_LABEL, PAYMENT_METHOD_LABELS } from "../constants/label.const";
import type {
  BillingCycle,
  BillingResponse,
  CheckoutResponse,
  PaymentDueResponse,
} from "../models/api/response/subscription-response.model";
import { formatMoney } from "./format";

export function cycleLabel(cycle: BillingCycle): string {
  return cycle === "Annual" ? BILLING_LABEL.ANNUAL : BILLING_LABEL.MONTHLY;
}

/**
 * "Payroll (Monthly): ₱4,999.00", "...: ₱5,799.00 (includes ₱800.00 storage)", or for an upgrade
 * "Premium (Monthly): ₱7,418.87 (after ₱2,580.13 credit)"
 */
export function describeDue(due: PaymentDueResponse, currency: string): string {
  const notes = [
    due.addOnsAmount > 0
      ? `includes ${formatMoney(due.addOnsAmount, currency)} storage`
      : null,
    due.creditAmount > 0
      ? `after ${formatMoney(due.creditAmount, currency)} credit`
      : null,
  ].filter((note): note is string => note !== null);
  const suffix = notes.length > 0 ? ` (${notes.join(", ")})` : "";
  return `${due.planName} (${cycleLabel(due.billingCycle)}): ${formatMoney(due.amount, currency)}${suffix}`;
}

/** Splits the combined plan-period charge into the amounts shown before checkout. */
export function paymentDueAmounts(due: PaymentDueResponse): {
  plan: number;
  addOns: number;
  credit: number;
  total: number;
} {
  return {
    plan: roundMoney(due.amount + due.creditAmount - due.addOnsAmount),
    addOns: due.addOnsAmount,
    credit: due.creditAmount,
    total: due.amount,
  };
}

/** Centavos: sums of two-decimal amounts can pick up floating-point noise. */
function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** "Payroll (Monthly): ₱4,999.00 via GCash"; a storage purchase has no cycle: "2 x 50 GB storage block: ₱400.00" */
export function describeCheckout(checkout: CheckoutResponse): string {
  const method = checkout.paymentMethod
    ? ` via ${PAYMENT_METHOD_LABELS[checkout.paymentMethod]}`
    : "";
  const what =
    checkout.kind === "StorageAddOn"
      ? checkout.planName
      : `${checkout.planName} (${cycleLabel(checkout.billingCycle)})`;
  return `${what}: ${formatMoney(checkout.amount, checkout.currency)}${method}`;
}

/**
 * What this person can pay online right now -- null when nothing is due, online payment isn't
 * set up, or they can't manage billing (only the owner or a billing admin can).
 */
export function onlinePayable(
  billing: Pick<BillingResponse, "onlinePaymentEnabled" | "paymentDue">,
  canPay: boolean,
): PaymentDueResponse | null {
  return billing.onlinePaymentEnabled && canPay ? billing.paymentDue : null;
}

export type CheckoutScreen =
  "not-found" | "confirming" | "paid" | "closed" | "canceled" | "waiting";

interface CheckoutScreenInput {
  checkoutId: string | undefined;
  isError: boolean;
  checkout: CheckoutResponse | undefined;
  /** The payer backed out of the payment page. */
  canceled: boolean;
  /** The return screen stopped waiting for confirmation. */
  timedOut: boolean;
}

/**
 * Which screen the payment return page shows. What the server says wins over how the payer came
 * back: a page they "canceled" may still have been paid.
 */
export function checkoutScreen({
  checkoutId,
  isError,
  checkout,
  canceled,
  timedOut,
}: CheckoutScreenInput): CheckoutScreen {
  if (!checkoutId || isError) return "not-found";
  if (!checkout) return "confirming";
  if (checkout.status === "Paid") return "paid";
  if (checkout.status !== "Open") return "closed";
  if (canceled) return "canceled";
  return timedOut ? "waiting" : "confirming";
}
