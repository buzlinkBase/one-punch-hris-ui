import {
  AnalyticsPage,
  type AnalyticsPageConfig,
} from "../components/analytics-page";

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
};

export default function PayrollAnalytics() {
  return <AnalyticsPage config={CONFIG} />;
}
