// Screens that aggregate many employees (reports, payroll and DTR summaries, pay runs): when
// confidential employees are hidden from the user, their output is incomplete, so the main
// layout shows ConfidentialDataNotice above them.
const NOTICE_PATH_PREFIXES = [
  "/payroll/",
  "/reports/",
  "/daily-time-record/summary",
  "/daily-time-record/for-",
];

export function showsConfidentialNotice(pathname: string): boolean {
  return NOTICE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
