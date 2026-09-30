import {
  AnalyticsPage,
  type AnalyticsPageConfig,
} from "../components/analytics-page";

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
};

export default function WorkforceAnalytics() {
  return <AnalyticsPage config={CONFIG} />;
}
