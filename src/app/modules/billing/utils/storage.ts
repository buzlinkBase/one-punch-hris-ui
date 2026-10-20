import { BILLING_LABEL, STORAGE_LABEL } from "../constants/label.const";
import { formatManilaDate } from "./format";
import type {
  StorageLevel,
  StorageOfferingResponse,
  StorageStatusResponse,
  StorageSummaryResponse,
} from "../models/api/response/storage-response.model";
import type { BillingCycle } from "../models/api/response/subscription-response.model";

const MB_PER_GB = 1024;

/** A size given in MB as people read it: "512 MB", "20 GB", "1.5 GB". Null (no maximum) is "Unlimited". */
export function formatStorage(megabytes: number | null | undefined): string {
  if (megabytes === null || megabytes === undefined) return "Unlimited";
  if (megabytes < MB_PER_GB) return `${megabytes} MB`;
  const gigabytes = megabytes / MB_PER_GB;
  return `${Number(gigabytes.toFixed(2))} GB`;
}

/** "45 GB used of 110 GB -- 65 GB available", or just the limit when usage couldn't be measured. */
export function storageHeadline(
  status: Pick<StorageStatusResponse, "usedMb" | "limitMb" | "availableMb">,
): string {
  if (status.usedMb === null) {
    return `Usage unavailable -- ${formatStorage(status.limitMb)} in total`;
  }
  const used = `${formatStorage(status.usedMb)} used of ${formatStorage(status.limitMb)}`;
  return status.availableMb === null
    ? used
    : `${used} -- ${formatStorage(status.availableMb)} available`;
}

export type StorageColorToken = "colorSuccess" | "colorWarning" | "colorError";

/** Green below 80%, amber from 80%, red from 95% -- the antd theme token to draw the gauge with. */
export const STORAGE_LEVEL_COLOR: Record<StorageLevel, StorageColorToken> = {
  Normal: "colorSuccess",
  Warning: "colorWarning",
  Critical: "colorError",
};

export type StorageBannerKind = "warning" | "critical";

/**
 * Which banner, if any, the storage state calls for: a subtle notice from 80% used and a
 * high-priority one from 95%. Nothing while usage is unknown or the plan has no maximum.
 */
export function storageBannerKind(
  status:
    Pick<StorageStatusResponse, "level" | "usedMb" | "limitMb"> | undefined,
): StorageBannerKind | null {
  if (!status || status.usedMb === null || status.limitMb === null) return null;
  if (status.level === "Critical") return "critical";
  if (status.level === "Warning") return "warning";
  return null;
}

/** Whole percent for the gauge, never past the end of the bar. */
export function gaugePercent(percentUsed: number | null): number {
  return percentUsed === null ? 0 : Math.max(0, Math.min(100, percentUsed));
}

/** Total storage a purchase of `blocks` of `blockMb` adds. */
export function blocksToMb(blocks: number, blockMb: number): number {
  return blocks * blockMb;
}

/** "2 x 50 GB blocks" */
export function describeBlocks(blocks: number, blockMb: number): string {
  return `${blocks} x ${formatStorage(blockMb)} ${blocks === 1 ? "block" : "blocks"}`;
}

/**
 * The company's limit once a holding drops from its current blocks to `newBlocks`; null while the
 * limit is unlimited. Other scheduled changes aren't considered -- it answers "what if I do this".
 */
export function limitAfterReduction(
  limitMb: number | null,
  addOn: { blocks: number; blockMb: number },
  newBlocks: number,
): number | null {
  if (limitMb === null) return null;
  return Math.max(0, limitMb - (addOn.blocks - newBlocks) * addOn.blockMb);
}

/** Whether usage already exceeds `limitMb`, so shrinking to it would block uploads. */
export function exceedsLimit(
  usedMb: number | null,
  limitMb: number | null,
): boolean {
  return usedMb !== null && limitMb !== null && usedMb > limitMb;
}

/** "/ month" or "/ year", for an amount billed once per cycle. */
export function perCycle(cycle: BillingCycle): string {
  return cycle === "Annual" ? BILLING_LABEL.PER_YEAR : BILLING_LABEL.PER_MONTH;
}

/** "monthly" / "annual", for a sentence. */
export function cycleWord(cycle: BillingCycle): string {
  return cycle === "Annual" ? "annual" : "monthly";
}

/** The cycle storage would switch to. */
export function otherCycle(cycle: BillingCycle): BillingCycle {
  return cycle === "Annual" ? "Monthly" : "Annual";
}

export interface StorageStanding {
  type: "info" | "warning" | "error";
  message: string;
}

/**
 * Where storage's own billing period stands, as one line for the Billing page -- independent of the
 * plan: paid until its due date, ending (every paid block given up), past due with the grace end, or
 * lapsed. Null before any storage is bought, or when there's nothing paid to bill.
 */
export function storageStanding(
  summary: Pick<
    StorageSummaryResponse,
    | "status"
    | "periodEndUtc"
    | "graceEndsAtUtc"
    | "billingCycle"
    | "cancelAtPeriodEnd"
    | "addOnsTotal"
  >,
): StorageStanding | null {
  const fill = (template: string, date: string | null) =>
    template
      .replace("{date}", formatManilaDate(date))
      .replace("{cycle}", cycleWord(summary.billingCycle));

  switch (summary.status) {
    case "PastDue":
      return {
        type: "warning",
        message: fill(STORAGE_LABEL.STATUS_PAST_DUE, summary.graceEndsAtUtc),
      };
    case "Lapsed":
      return summary.addOnsTotal > 0
        ? { type: "error", message: STORAGE_LABEL.STATUS_LAPSED }
        : null;
    case "Active":
      if (summary.addOnsTotal <= 0) return null;
      return summary.cancelAtPeriodEnd
        ? {
            type: "warning",
            message: fill(STORAGE_LABEL.STATUS_ENDING, summary.periodEndUtc),
          }
        : {
            type: "info",
            message: fill(STORAGE_LABEL.STATUS_ACTIVE, summary.periodEndUtc),
          };
    default:
      return null;
  }
}

/** One block's price for the cycle the account is billed on (monthly or annual). */
export function blockPrice(
  offering: Pick<StorageOfferingResponse, "monthlyPrice" | "annualPrice">,
  cycle: BillingCycle,
): number {
  return cycle === "Annual" ? offering.annualPrice : offering.monthlyPrice;
}
