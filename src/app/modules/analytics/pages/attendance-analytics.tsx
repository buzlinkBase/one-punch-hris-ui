import {
  AnalyticsPage,
  type AnalyticsPageConfig,
} from "../components/analytics-page";

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
};

export default function AttendanceAnalytics() {
  return <AnalyticsPage config={CONFIG} />;
}
