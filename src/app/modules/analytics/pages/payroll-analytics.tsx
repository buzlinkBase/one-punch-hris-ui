import { payrollRunTarget } from "@/shared/drilldown/drill-screens";
import {
  AnalyticsPage,
  type AnalyticsPageConfig,
} from "../components/analytics-page";
import { filterToSearch } from "../utils/analytics-filter";
import type { AnalyticsDrill } from "../utils/analytics-drill";

// Pay rows have no list screen of their own, so a department narrows this page to it, and a run
// type opens that run's batches.
const DRILL: AnalyticsDrill = {
  breakdowns: {
    department: (row, filter) =>
      row.key && row.key !== filter.departmentId
        ? {
            to: "/analytics/payroll",
            search: filterToSearch({ ...filter, departmentId: row.key }),
          }
        : null,
    runType: (row) => payrollRunTarget(row.key),
  },
};

const CONFIG: AnalyticsPageConfig = {
  area: "payroll",
  title: "Payroll & Labor Cost Analytics",
  subtitle:
    "What the company spends on pay: gross, net, employer contributions and overtime.",
  exportPermission: "Payroll Analytics:Export",
  kpiDirections: {
    overtimeShare: "down-is-good",
  },
  note: "Only approved payroll runs count, by the month each pay period ends. Labor cost is gross pay plus the employer's SSS, PhilHealth, Pag-IBIG and EC share.",
  charts: [
    {
      title: "Labor cost (gross pay + employer contributions)",
      kind: "stacked",
      series: ["gross", "employerContributions"],
    },
    { title: "Overtime pay", kind: "bar", series: ["overtime"] },
  ],
  drill: DRILL,
};

export default function PayrollAnalytics() {
  return <AnalyticsPage config={CONFIG} />;
}
