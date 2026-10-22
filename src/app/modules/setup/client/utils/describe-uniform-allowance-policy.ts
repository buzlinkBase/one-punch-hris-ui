import dayjs from "dayjs";
import { EMPLOYMENT_STATUS_OPTIONS } from "@/app/modules/setup/employee/constants/label.const";
import { MONTH_OPTIONS } from "../constants/uniform-allowance.const";
import type { UpsertUniformAllowancePolicy } from "../models/api/response/uniform-allowance-policy.model";

/** What a uniform allowance policy does, in plain language: one headline and the finer points. */
export interface UniformAllowanceSummary {
  headline: string;
  details: string[];
}

// The policy fields the description reads (a saved version, form values, or the API's legacy rules).
export type UniformAllowancePolicyRules = Omit<
  UpsertUniformAllowancePolicy,
  "changeReason" | "amount"
> & { amount: number | null };

const peso = (value: number | null | undefined) =>
  `₱${(value ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const ORDINAL_SUFFIX: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };

const ordinal = (n: number) => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${ORDINAL_SUFFIX[n % 10] ?? "th"}`;
};

const monthName = (month: number | null | undefined) =>
  MONTH_OPTIONS.find((m) => m.value === month)?.label ?? "";

const shortMonth = (month: number) => monthName(month).slice(0, 3);

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** "A, B and C". */
export function joinWords(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// The months a cycle posts in, from its start month: quarterly from January = Jan, Apr, Jul, Oct.
function cycleMonths(startMonth: number, every: number): number[] {
  return Array.from(
    { length: 12 / every },
    (_, i) => ((startMonth - 1 + i * every) % 12) + 1,
  );
}

function when(p: UniformAllowancePolicyRules): string {
  const day = ordinal(p.creditDay);
  switch (p.frequency) {
    case "Monthly":
      return `on the ${day} of each month, for the month before`;
    case "Quarterly":
      return `on the ${day} of ${joinWords(cycleMonths(p.startMonth, 3).map(shortMonth))}, each for the 3 months before`;
    case "SemiAnnual":
      return `on the ${day} of ${joinWords(cycleMonths(p.startMonth, 6).map(shortMonth))}, each for the 6 months before`;
    case "Annual":
      return `every ${monthName(p.startMonth)} ${p.creditDay}, for the year before`;
    case "HireAnniversary":
      return "on each employee's service anniversary, for the year before";
  }
}

function amount(p: UniformAllowancePolicyRules): string {
  switch (p.amountMode) {
    case "FixedPerPeriod":
      return peso(p.amount);
    case "ProratedByPresentDays":
      return `up to ${peso(p.amount)} (prorated: full at ${p.expectedDaysPerPeriod ?? "?"} present days)`;
    case "PerPresentDay":
      return `${peso(p.amount)} per present day`;
  }
}

function who(p: UniformAllowancePolicyRules): string {
  const labels = EMPLOYMENT_STATUS_OPTIONS.filter((o) =>
    p.eligibleStatuses.includes(o.value),
  ).map((o) => o.label);
  return labels.length > 0 ? `${joinWords(labels)} employees` : "no one yet";
}

/**
 * A plain-language description of what the rules will do, shown with the settings form (live,
 * as HR edits), on the ledger and in the employee portal -- one wording everywhere.
 * `effectiveFrom` "0001-01-01" (the legacy rules) has no start date to mention.
 */
export function describeUniformAllowancePolicy(
  p: UniformAllowancePolicyRules,
): UniformAllowanceSummary {
  const start =
    p.effectiveFrom && !p.effectiveFrom.startsWith("0001")
      ? `From ${dayjs(p.effectiveFrom).format("MMM D, YYYY")}: `
      : "";

  if (!p.isEnabled) {
    return {
      headline: `${start}no uniform allowance is credited to this client's employees.`,
      details: [],
    };
  }

  const conditions: string[] = [];
  if (p.minPresentDays !== null && p.minPresentDays !== undefined)
    conditions.push(
      `with at least ${plural(p.minPresentDays, "present day")} in that period`,
    );
  if (p.waitingMonths > 0)
    conditions.push(`after ${plural(p.waitingMonths, "month")} of service`);

  const headline =
    `${start}credits ${amount(p)} ${when(p)}, to ${who(p)}` +
    (conditions.length > 0 ? ` ${joinWords(conditions)}` : "") +
    ".";

  const details: string[] = [];
  details.push(
    p.maxBalance
      ? `The balance never goes above ${peso(p.maxBalance)} — a credit that would pass it is cut to fit.`
      : "There's no limit on the balance.",
  );
  switch (p.expiry) {
    case "CarryOver":
      details.push("Unused balance carries over and never expires.");
      break;
    case "ResetAnnually":
      details.push(
        `Unused balance resets to zero every ${monthName(p.expiryMonth)} 1.`,
      );
      break;
    case "ExpireAfterMonths":
      details.push(
        `Each credit expires ${plural(p.expiryAfterMonths ?? 0, "month")} after it's credited if not released by then.`,
      );
      break;
  }
  const paused = [
    !p.eligibleStatuses.includes("OnLeave") && "on leave",
    !p.eligibleStatuses.includes("Suspended") && "suspended",
  ].filter((s): s is string => !!s);
  if (paused.length > 0)
    details.push(
      `Employees ${paused.join(" or ")} are skipped until they return.`,
    );
  details.push(
    p.onSeparation === "Forfeit"
      ? "When an employee separates, their remaining balance is forfeited."
      : "When an employee separates, their balance stays for release with their last pay.",
  );
  details.push(
    p.rehireRule === "BridgeWithinDays"
      ? `A rehired employee who returns within ${plural(p.rehireBridgeDays ?? 0, "day")} keeps their earlier service; otherwise the waiting period starts again.`
      : "A rehired employee starts the waiting period again from their rehire date.",
  );
  return { headline, details };
}
