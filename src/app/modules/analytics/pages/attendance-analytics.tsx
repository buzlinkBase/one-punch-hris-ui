import {
  AnalyticsPage,
  type AnalyticsPageConfig,
} from "../components/analytics-page";
import {
  dtrForEmployee,
  dtrForPeriod,
  dtrForRange,
  type AnalyticsDrill,
} from "../utils/analytics-drill";

const SERIES_KEYS = [
  "attendanceRate",
  "lateHours",
  "undertimeHours",
  "absences",
  "overtimeHours",
] as const;

// Every figure comes from the DTR, so each opens the DTR for the same slice.
const DRILL: AnalyticsDrill = {
  breakdowns: {
    department: (row, filter) =>
      row.key ? dtrForRange(filter, { departmentId: row.key }) : null,
    mostLate: dtrForEmployee,
    mostAbsent: dtrForEmployee,
  },
  kpis: Object.fromEntries(
    SERIES_KEYS.map((key) => [key, dtrForRange] as const),
  ),
  series: Object.fromEntries(
    SERIES_KEYS.map((key) => [key, dtrForPeriod] as const),
  ),
};

const CONFIG: AnalyticsPageConfig = {
  area: "attendance",
  title: "Attendance & Time Analytics",
  subtitle:
    "Attendance rate, lateness, undertime, absences and overtime from approved DTRs.",
  exportPermission: "Attendance Analytics:Export",
  kpiDirections: {
    attendanceRate: "up-is-good",
    lateHours: "down-is-good",
    undertimeHours: "down-is-good",
    absences: "down-is-good",
  },
  note: "Only DTR batches that were approved count. Rest days and holidays aren't scheduled days.",
  charts: [
    { title: "Attendance rate", kind: "line", series: ["attendanceRate"] },
    {
      title: "Late, undertime and overtime hours",
      kind: "bar",
      series: ["lateHours", "undertimeHours", "overtimeHours"],
    },
    { title: "Absences", kind: "bar", series: ["absences"] },
  ],
  drill: DRILL,
};

export default function AttendanceAnalytics() {
  return <AnalyticsPage config={CONFIG} />;
}
