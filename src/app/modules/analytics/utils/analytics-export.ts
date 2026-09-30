import type { ExcelSheet } from "@/shared/utils/export.utils";
import type { AnalyticsResult } from "../models/analytics.model";
import { kpiChange } from "./analytics-format";
import { formatPeriod } from "./analytics-filter";

/**
 * An Analytics page as workbook sheets: Summary (the headline figures), Trend (every monthly
 * series) and one sheet per breakdown. Figures stay numbers so they can be summed in Excel.
 */
export function buildAnalyticsSheets(result: AnalyticsResult): ExcelSheet[] {
  const summary: ExcelSheet = {
    name: "Summary",
    headers: ["Figure", "Value", "Previous period", "Change", "Unit"],
    rows: [
      ["Period", `${result.from} to ${result.to}`, "", "", ""],
      ...result.kpis.map((k) => [
        k.label,
        k.value,
        k.previous ?? "",
        kpiChange(k).text ?? "",
        k.unit,
      ]),
    ],
  };

  const trend: ExcelSheet = {
    name: "Trend",
    headers: ["Month", ...result.seriesDefinitions.map((s) => s.label)],
    rows: result.series.map((p) => [
      formatPeriod(p.period),
      ...result.seriesDefinitions.map((s) => p.values[s.key] ?? 0),
    ]),
  };

  const breakdowns = result.breakdowns.map<ExcelSheet>((b) => ({
    name: b.title,
    headers: ["", ...b.columns.map((c) => c.label)],
    rows: b.rows.map((r) => [
      r.label,
      ...b.columns.map((c) => r.values[c.key] ?? 0),
    ]),
  }));

  return [summary, trend, ...breakdowns];
}
