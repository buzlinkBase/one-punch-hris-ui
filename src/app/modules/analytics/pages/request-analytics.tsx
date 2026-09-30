import {
  AnalyticsPage,
  type AnalyticsPageConfig,
} from "../components/analytics-page";

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
      // The API's order (by label), so each type keeps its color.
      series: [
        "leave",
        "loan",
        "officialBusiness",
        "overtime",
        "passSlip",
        "profileUpdate",
      ],
    },
  ],
};

export default function RequestAnalytics() {
  return <AnalyticsPage config={CONFIG} />;
}
