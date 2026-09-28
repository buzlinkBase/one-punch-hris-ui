import dayjs from "dayjs";
import type { PortalPassSlipEntryValues } from "../models/forms/portal-pass-slip-form.schema";

/**
 * Search params the File Pass Slip form reads to prefill a new filing -- e.g. from My
 * Incomplete Logs' "File Pass Slip" action (see buildPassSlipPrefill).
 */
export interface PassSlipPrefillSearch {
  date?: string;
  timeIn?: string;
  timeOut?: string;
}

const TIME_PATTERN = /^\d{2}:\d{2}$/;

function isTime(value: unknown): value is string {
  return typeof value === "string" && TIME_PATTERN.test(value);
}

/** The prefilled date, entries and remarks, or null when the search carries no prefill. */
export function toPassSlipPrefill(search: Record<string, unknown>): {
  applicationDate: string;
  entries: PortalPassSlipEntryValues[];
  remarks: string;
} | null {
  const date = typeof search.date === "string" ? dayjs(search.date) : null;
  if (!date?.isValid()) return null;

  const entries: PortalPassSlipEntryValues[] = [];
  if (isTime(search.timeIn))
    entries.push({ punchTime: search.timeIn, notes: "Missing time in" });
  if (isTime(search.timeOut))
    entries.push({ punchTime: search.timeOut, notes: "Missing time out" });

  return {
    applicationDate: date.format("YYYY-MM-DD"),
    entries: entries.length > 0 ? entries : [{ punchTime: "", notes: "" }],
    remarks: `Incomplete log on ${date.format("MMM D, YYYY")}`,
  };
}
