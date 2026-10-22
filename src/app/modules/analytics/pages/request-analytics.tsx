import {
  applicationListTarget,
  isApplicationKind,
  type ApplicationKind,
} from "@/shared/drilldown/drill-screens";
import { periodRange } from "@/shared/drilldown/drill-search.util";
import {
  AnalyticsPage,
  type AnalyticsPageConfig,
} from "../components/analytics-page";
import type { AnalyticsFilter } from "../models/analytics.model";
import { rangeOf, type AnalyticsDrill } from "../utils/analytics-drill";

/**
 * The request series, which double as the type rows' keys -- in the API's order (by label), so
 * each type keeps its color.
 */
const REQUEST_KINDS: ApplicationKind[] = [
  "leave",
  "loan",
  "officialBusiness",
  "overtime",
  "passSlip",
  "profileUpdate",
];

// Each request type opens its own list for the same dates; approved leave opens the leave list's
// processed tab. Approvers have no list of their own.
const DRILL: AnalyticsDrill = {
  breakdowns: {
    type: (row, filter) =>
      isApplicationKind(row.key)
        ? applicationListTarget(row.key, { range: rangeOf(filter) })
        : null,
    leaveType: (_, filter) =>
      applicationListTarget("leave", {
        range: rangeOf(filter),
        tab: "processed",
      }),
  },
  kpis: {
    leaveDays: (filter) =>
      applicationListTarget("leave", {
        range: rangeOf(filter),
        tab: "processed",
      }),
  },
  series: Object.fromEntries(
    REQUEST_KINDS.map(
      (kind) =>
        [
          kind,
          (period: string, filter: AnalyticsFilter) => {
            const month = periodRange(period, rangeOf(filter));
            return month ? applicationListTarget(kind, { range: month }) : null;
          },
        ] as const,
    ),
  ),
};

const CONFIG: AnalyticsPageConfig = {
  area: "requests",
  title: "Leave & Request Analytics",
  subtitle:
    "Requests filed, how many get approved, how long approval takes, and leave taken.",
  exportPermission: "Request Analytics:Export",
  kpiDirections: {
    medianHours: "down-is-good",
    pending: "down-is-good",
  },
  note: "Covers leave, overtime, official business, pass slip, loan and profile update requests, by the date they were filed. Leave days count approved leave only.",
  charts: [
    {
      title: "Requests filed by type",
      kind: "stacked",
      series: REQUEST_KINDS,
    },
  ],
  drill: DRILL,
};

export default function RequestAnalytics() {
  return <AnalyticsPage config={CONFIG} />;
}
