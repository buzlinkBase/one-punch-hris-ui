import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";

export type StatusFilter =
  "All" | "ForApproval" | "Approved" | "Declined" | "Cancelled";

export interface PayrollSummaryFilter {
  status: StatusFilter;
  clientId?: string;
  payrollGroupId?: string;
}

// The one filter rule behind the table, CSV/Excel export and Print. Client / payroll group
// match the row's own snapshot (what it was paid under), the same fields the server's
// print-summary endpoint filters on, so all three always list the same rows.
export const filterPayrollResults = (
  rows: PayrollRunResult[],
  { status, clientId, payrollGroupId }: PayrollSummaryFilter,
) =>
  rows.filter(
    (r) =>
      (status === "All" || r.approvalStatus === status) &&
      (!clientId || r.clientId === clientId) &&
      (!payrollGroupId || r.payrollGroupId === payrollGroupId),
  );

// Query params for GET payrolls/print-summary — the selected batch plus the same filter.
export const buildPrintSummaryParams = (
  payrollBatchId: string,
  { status, clientId, payrollGroupId }: PayrollSummaryFilter,
) => ({
  payrollBatchId,
  status: status === "All" ? undefined : status,
  clientId,
  payrollGroupId,
});

// Appended to export file names so a filtered file says which filters produced it.
export const buildFilterFileSuffix = (parts: {
  status: StatusFilter;
  clientCode?: string;
  payrollGroupCode?: string;
}) =>
  [
    parts.status === "All" ? undefined : parts.status,
    parts.clientCode,
    parts.payrollGroupCode,
  ]
    .filter((p): p is string => !!p)
    .map((p) => `-${p.replace(/[^A-Za-z0-9_-]+/g, "_")}`)
    .join("");
