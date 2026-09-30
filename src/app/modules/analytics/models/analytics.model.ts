/** The four Analytics areas, as the API names them (`/analytics/{area}`). */
export type AnalyticsArea = "workforce" | "attendance" | "payroll" | "requests";

/** How a figure is read and formatted (hrms-api AnalyticsUnit). */
export type AnalyticsUnit =
  "Count" | "Percent" | "Hours" | "Days" | "Currency" | "Years";

/** What every Analytics page filters by. Dates are inclusive, `YYYY-MM-DD`. */
export interface AnalyticsFilter {
  from: string;
  to: string;
  departmentId?: string;
  branchId?: string;
  payrollGroupId?: string;
  employmentStatus?: string;
}

export interface AnalyticsKpi {
  key: string;
  label: string;
  value: number;
  /** The same figure for the equally long period just before; null when there's nothing to compare. */
  previous: number | null;
  unit: AnalyticsUnit;
}

export interface AnalyticsSeries {
  key: string;
  label: string;
  unit: AnalyticsUnit;
}

/** One month of a trend: its period ("2026-09") and a value per series key. */
export interface AnalyticsPoint {
  period: string;
  values: Record<string, number>;
}

export interface AnalyticsColumn {
  key: string;
  label: string;
  unit: AnalyticsUnit;
}

export interface AnalyticsRow {
  label: string;
  values: Record<string, number>;
}

export interface AnalyticsBreakdown {
  key: string;
  title: string;
  columns: AnalyticsColumn[];
  rows: AnalyticsRow[];
}

export interface AnalyticsResult {
  from: string;
  to: string;
  kpis: AnalyticsKpi[];
  seriesDefinitions: AnalyticsSeries[];
  series: AnalyticsPoint[];
  breakdowns: AnalyticsBreakdown[];
}
