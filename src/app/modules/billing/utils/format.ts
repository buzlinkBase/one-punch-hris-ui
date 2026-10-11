const MANILA_DATE = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** A UTC instant as a Philippine calendar date, e.g. "Oct 9, 2026". */
export function formatManilaDate(utc: string | null | undefined): string {
  return utc ? MANILA_DATE.format(new Date(utc)) : "--";
}

/** An amount in the plan's currency, e.g. "₱4,999.00". */
export function formatMoney(amount: number, currency = "PHP"): string {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency }).format(
    amount,
  );
}
