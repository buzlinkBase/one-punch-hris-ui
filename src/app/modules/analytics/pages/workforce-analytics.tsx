import dayjs from "dayjs";
import {
  CURRENT_STAFF,
  employeeListTarget,
  type EmployeeDrillFilter,
} from "@/shared/drilldown/drill-screens";
import {
  periodRange,
  tenureHireRange,
} from "@/shared/drilldown/drill-search.util";
import {
  AnalyticsPage,
  type AnalyticsPageConfig,
} from "../components/analytics-page";
import type { AnalyticsFilter, AnalyticsRow } from "../models/analytics.model";
import { employeeScope, type AnalyticsDrill } from "../utils/analytics-drill";

/** Who's on board in the page's slice, narrowed by one more filter. */
const staff = (filter: AnalyticsFilter, more: EmployeeDrillFilter = {}) =>
  employeeListTarget({ ...CURRENT_STAFF, ...employeeScope(filter), ...more });

/** A breakdown row whose key is the value of one employee list filter. */
const byKey =
  (field: "departmentIds" | "branchIds" | "employmentStatuses" | "genders") =>
  (row: AnalyticsRow, filter: AnalyticsFilter) => {
    if (!row.key) return null;
    const more: EmployeeDrillFilter = {};
    more[field] = [row.key];
    return staff(filter, more);
  };

/** People hired in a range (whatever their status now), in the page's slice. */
const hiredIn = (filter: AnalyticsFilter, from: string, to: string) =>
  employeeListTarget({
    ...employeeScope(filter),
    hireDateFrom: from,
    hireDateTo: to,
  });

// Separations and turnover have no list (the employee list can't filter by separation date),
// and age bands none either (nor by birth date).
const DRILL: AnalyticsDrill = {
  breakdowns: {
    department: byKey("departmentIds"),
    branch: byKey("branchIds"),
    status: byKey("employmentStatuses"),
    gender: byKey("genders"),
    tenure: (row, filter) => {
      const hired = row.key ? tenureHireRange(row.key, dayjs(filter.to)) : null;
      return hired ? staff(filter, hired) : null;
    },
  },
  kpis: {
    headcount: (filter) => staff(filter),
    hires: (filter) => hiredIn(filter, filter.from, filter.to),
  },
  series: {
    hires: (period, filter) => {
      const month = periodRange(period, filter);
      return month ? hiredIn(filter, month.from, month.to) : null;
    },
  },
};

const CONFIG: AnalyticsPageConfig = {
  area: "workforce",
  title: "Workforce Analytics",
  subtitle:
    "Headcount, hires, separations and turnover over time, and who's on board today.",
  exportPermission: "Workforce Analytics:Export",
  kpiDirections: {
    separations: "down-is-good",
    turnover: "down-is-good",
    tenure: "up-is-good",
  },
  note: "Headcount counts hire and resignation dates. Past months use each employee's current department and branch.",
  charts: [
    { title: "Headcount at month end", kind: "line", series: ["headcount"] },
    {
      title: "Hires and separations",
      kind: "bar",
      series: ["hires", "separations"],
    },
  ],
  drill: DRILL,
};

export default function WorkforceAnalytics() {
  return <AnalyticsPage config={CONFIG} />;
}
