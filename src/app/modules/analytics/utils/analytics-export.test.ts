import { describe, expect, it } from "vitest";
import type { AnalyticsResult } from "../models/analytics.model";
import { buildAnalyticsSheets } from "./analytics-export";

const RESULT: AnalyticsResult = {
  from: "2026-01-01",
  to: "2026-02-28",
  kpis: [
    {
      key: "headcount",
      label: "Active headcount",
      value: 12,
      previous: 10,
      unit: "Count",
    },
  ],
  seriesDefinitions: [
    { key: "hires", label: "Hires", unit: "Count" },
    { key: "separations", label: "Separations", unit: "Count" },
  ],
  series: [
    { period: "2026-01", values: { hires: 2, separations: 1 } },
    { period: "2026-02", values: { hires: 1 } },
  ],
  breakdowns: [
    {
      key: "department",
      title: "By department",
      columns: [{ key: "count", label: "Employees", unit: "Count" }],
      rows: [{ label: "Sales", values: { count: 7 } }],
    },
  ],
};

describe("buildAnalyticsSheets", () => {
  it("writes a summary, the trend and one sheet per breakdown, with numbers kept numeric", () => {
    const [summary, trend, department] = buildAnalyticsSheets(RESULT);

    expect(summary.rows[1]).toEqual([
      "Active headcount",
      12,
      10,
      "+20%",
      "Count",
    ]);
    expect(trend.headers).toEqual(["Month", "Hires", "Separations"]);
    expect(trend.rows).toEqual([
      ["Jan 2026", 2, 1],
      ["Feb 2026", 1, 0],
    ]);
    expect(department).toEqual({
      name: "By department",
      headers: ["", "Employees"],
      rows: [["Sales", 7]],
    });
  });
});
