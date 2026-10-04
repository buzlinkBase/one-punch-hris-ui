import type { EmployeeResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import type {
  PayrollReadinessEmployee,
  PayrollReadinessStatus,
} from "../models/api/response/payroll-readiness.model";
import { isActiveInRange } from "@/shared/utils/employee-active.util";

export { isActiveInRange };

// Readiness plus "NoDtr": an active employee of the group with no DTR day at all in the cutoff --
// nobody generated their DTR yet, which is just as much a reason they'd be missing from the run.
export type ReadinessRowStatus = PayrollReadinessStatus | "NoDtr";

export interface ReadinessRow extends Omit<
  PayrollReadinessEmployee,
  "status" | "salaryType"
> {
  status: ReadinessRowStatus;
  salaryType?: PayrollReadinessEmployee["salaryType"];
}

export const READINESS_STATUS_ORDER: ReadinessRowStatus[] = [
  "Ready",
  "Partial",
  "Pending",
  "NoDtr",
  "Paid",
  "FixedSalaryAlreadyPaid",
];

export const READINESS_STATUS_LABEL: Record<ReadinessRowStatus, string> = {
  Ready: "Ready",
  Partial: "Partly ready",
  Pending: "Awaiting DTR approval",
  NoDtr: "No DTR yet",
  Paid: "Already paid",
  FixedSalaryAlreadyPaid: "Fixed salary paid",
};

export const READINESS_STATUS_COLOR: Record<ReadinessRowStatus, string> = {
  Ready: "success",
  Partial: "processing",
  Pending: "warning",
  NoDtr: "default",
  Paid: "default",
  FixedSalaryAlreadyPaid: "default",
};

export const READINESS_STATUS_HINT: Record<ReadinessRowStatus, string> = {
  Ready:
    "Every DTR day in the cutoff is approved and unpaid — a run pays all of it.",
  Partial:
    "Some days are approved, others still await DTR approval. A run pays the approved days now; the rest go to a later run.",
  Pending:
    "DTR exists but isn't approved yet. Approve the DTR batch before running payroll.",
  NoDtr: "No DTR has been generated for this employee in the cutoff.",
  Paid: "Every DTR day in the cutoff is already in a saved payroll run.",
  FixedSalaryAlreadyPaid:
    "A saved run already paid this cutoff's fixed salary. Delete that run to include the remaining days.",
};

// Statuses a run would actually pay something for -- the only selectable rows.
export const isPayable = (s: ReadinessRowStatus) =>
  s === "Ready" || s === "Partial";

// Every readiness row in scope, plus a NoDtr row for each in-scope active employee the server
// returned nothing for. Both lists are expected to be narrowed by group/client/department already
// (the server's rows carry the employee's own tags, so the same filters apply to both).
export function buildReadinessRows(
  readiness: PayrollReadinessEmployee[],
  employees: EmployeeResponse[],
  from: string,
  to: string,
): ReadinessRow[] {
  const withDtr = new Set(readiness.map((r) => r.employeeId));
  const noDtr: ReadinessRow[] = employees
    .filter((e) => !withDtr.has(e.id) && isActiveInRange(e, from, to))
    .map((e) => ({
      employeeId: e.id,
      employeeNo: e.employeeNo,
      fullName: `${e.lastName}, ${e.firstName}`,
      payrollGroupId: e.payrollGroupId,
      clientId: e.clientId,
      departmentId: e.departmentId,
      approvedDays: 0,
      pendingDays: 0,
      paidDays: 0,
      pendingBatchCodes: [],
      status: "NoDtr",
    }));
  return [...readiness, ...noDtr];
}

export function countByStatus(rows: { status: ReadinessRowStatus }[]) {
  const counts = Object.fromEntries(
    READINESS_STATUS_ORDER.map((s) => [s, 0]),
  ) as Record<ReadinessRowStatus, number>;
  for (const r of rows) counts[r.status] += 1;
  return counts;
}
