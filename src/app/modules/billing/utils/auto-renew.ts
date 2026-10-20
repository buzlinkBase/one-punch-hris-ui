import { AUTO_RENEW_LABEL } from "../constants/label.const";
import type {
  AutoRenewResponse,
  AutoRenewTarget,
} from "../models/api/response/subscription-response.model";
import { formatManilaDate } from "./format";

/** The target's auto renew from the billing view, if one is on or being set up. */
export function autoRenewOf(
  list: AutoRenewResponse[] | undefined,
  target: AutoRenewTarget,
): AutoRenewResponse | null {
  return list?.find((item) => item.target === target) ?? null;
}

/** Whether it charges by itself now (on, or retrying a failed charge) -- so a renewal isn't paid by hand. */
export function isCharging(
  autoRenew: AutoRenewResponse | null | undefined,
): boolean {
  return autoRenew?.status === "Active" || autoRenew?.status === "PastDue";
}

/**
 * One line for the billing screens: "Auto renew is on: Visa •••• 4242, next charge Nov 1, 2026",
 * the failed-charge warning, or that it's still waiting for its first payment.
 */
export function autoRenewSummary(autoRenew: AutoRenewResponse): {
  type: "success" | "warning" | "info";
  message: string;
} {
  const method = autoRenew.paymentMethodLabel ?? AUTO_RENEW_LABEL.SAVED_METHOD;
  switch (autoRenew.status) {
    case "PastDue":
      return {
        type: "warning",
        message: AUTO_RENEW_LABEL.FAILED.replace("{method}", method),
      };
    case "Pending":
      return { type: "info", message: AUTO_RENEW_LABEL.PENDING };
    default:
      return {
        type: "success",
        message: (autoRenew.nextChargeAtUtc
          ? AUTO_RENEW_LABEL.ON_WITH_DATE
          : AUTO_RENEW_LABEL.ON
        )
          .replace("{method}", method)
          .replace("{date}", formatManilaDate(autoRenew.nextChargeAtUtc)),
      };
  }
}

/** "08/28" or "8/2028" as month and four-digit year; null when it isn't a real future-looking expiry. */
export function parseExpiry(
  text: string,
): { month: number; year: number } | null {
  const match = /^\s*(\d{1,2})\s*\/\s*(\d{2}|\d{4})\s*$/.exec(text);
  if (!match) return null;
  const month = Number(match[1]);
  const year =
    match[2].length === 2 ? 2000 + Number(match[2]) : Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { month, year };
}

/** Card number as typed, grouped in fours for reading: "4343 4343 4343 4345". */
export function formatCardNumber(text: string): string {
  return text
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}
