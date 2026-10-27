// Screens that aggregate many employees (reports, payroll and DTR summaries, pay runs): when
// confidential employees are hidden from the user, their output is incomplete, so the main
// layout shows ConfidentialDataNotice above them.

/**
 * The clearance that shows a screen's confidential employees: pay figures need full Access,
 * DTR records are also visible with the partial Operations clearance (hrms-api's
 * ConfidentialDataClass.Operations).
 */
export type ConfidentialNoticeClearance = "access" | "operations";

const NOTICE_PATHS: [prefix: string, clearance: ConfidentialNoticeClearance][] =
  [
    ["/payroll/", "access"],
    // DTR records are visible with the partial Operations clearance.
    ["/reports/dtr-detail", "operations"],
    ["/reports/", "access"],
    ["/daily-time-record/summary", "operations"],
    ["/daily-time-record/for-", "operations"],
    // Analytics counts whole employees (workforce) and pay (payroll) -- both need full access;
    // DTR and request figures are Operations-class.
    ["/analytics/workforce", "access"],
    ["/analytics/payroll", "access"],
    ["/analytics/attendance", "operations"],
    ["/analytics/requests", "operations"],
  ];

/** Which clearance the page at `pathname` needs to be complete, or null when it has no notice. */
export function confidentialNoticeFor(
  pathname: string,
): ConfidentialNoticeClearance | null {
  const match = NOTICE_PATHS.find(([prefix]) => pathname.startsWith(prefix));
  return match ? match[1] : null;
}

export function showsConfidentialNotice(pathname: string): boolean {
  return confidentialNoticeFor(pathname) !== null;
}
