import type { AnalyticsKpi, AnalyticsUnit } from "../models/analytics.model";

const NUMBER = new Intl.NumberFormat("en-PH", { maximumFractionDigits: 1 });
const CURRENCY = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});
const COMPACT = new Intl.NumberFormat("en-PH", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const SUFFIX: Record<AnalyticsUnit, string> = {
  Count: "",
  Percent: "%",
  Hours: " hrs",
  Days: " days",
  Currency: "",
  Years: " yrs",
};

/** A figure as the page shows it: "₱1,250,000", "92.4%", "12.5 hrs". */
export function formatValue(value: number, unit: AnalyticsUnit): string {
  if (unit === "Currency") return CURRENCY.format(value);
  return `${NUMBER.format(value)}${SUFFIX[unit]}`;
}

/** A short axis tick: "₱1.2M", "92%", "1.5K". */
export function formatAxisValue(value: number, unit: AnalyticsUnit): string {
  if (unit === "Currency") return `₱${COMPACT.format(value)}`;
  if (unit === "Percent") return `${COMPACT.format(value)}%`;
  return COMPACT.format(value);
}

/** Whether a rise in this figure is good news, bad news, or neither. */
export type KpiDirection = "up-is-good" | "down-is-good" | "neutral";

export type KpiTone = "good" | "bad" | "flat" | "neutral";

export interface KpiChange {
  /** "+4.2%", "−1.5 pts", "New" -- or null when there's nothing to compare against. */
  text: string | null;
  trend: "up" | "down" | "flat";
  tone: KpiTone;
}

const MINUS = "−";

function signed(value: number, suffix: string): string {
  const sign = value > 0 ? "+" : value < 0 ? MINUS : "";
  return `${sign}${NUMBER.format(Math.abs(value))}${suffix}`;
}

/**
 * The change against the previous period. Percent figures change in percentage points ("pts"),
 * everything else as a percent of the previous value; from zero it's "New".
 */
export function kpiChange(
  kpi: Pick<AnalyticsKpi, "value" | "previous" | "unit">,
  direction: KpiDirection = "neutral",
): KpiChange {
  const { value, previous, unit } = kpi;
  if (previous === null || previous === undefined) {
    return { text: null, trend: "flat", tone: "neutral" };
  }

  const diff = value - previous;
  const trend = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  const tone: KpiTone =
    trend === "flat"
      ? "flat"
      : direction === "neutral"
        ? "neutral"
        : (trend === "up") === (direction === "up-is-good")
          ? "good"
          : "bad";

  if (unit === "Percent") {
    return { text: signed(Math.round(diff * 10) / 10, " pts"), trend, tone };
  }
  if (previous === 0) {
    return { text: value === 0 ? "No change" : "New", trend, tone };
  }
  return { text: signed((diff / Math.abs(previous)) * 100, "%"), trend, tone };
}
