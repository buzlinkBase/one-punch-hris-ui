import dayjs from "dayjs";
import type { EmployeeResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";

const SEPARATED = new Set(["Terminated", "Resigned", "Retired", "Deceased"]);

// Whether an employee is expected to have attendance in a date range: hired by the end of the
// range and not separated before it started. Used to tell "no DTR yet" apart from "not employed
// then" on the Calculate DTR and Payroll Run screens.
export const isActiveInRange = (
  e: Pick<EmployeeResponse, "hireDate" | "dateResigned" | "employmentStatus">,
  from: string,
  to: string,
) => {
  if (e.hireDate && dayjs(e.hireDate).isAfter(to, "day")) return false;
  if (e.dateResigned) return !dayjs(e.dateResigned).isBefore(from, "day");
  return !SEPARATED.has(e.employmentStatus);
};

type PayrollOnlySource = Pick<EmployeeResponse, "settings">;

// Payroll-only (no DTR) employees -- owners, shareholders, officers -- are paid without attendance.
// A missing bound on the window is open-ended.
export const isPayrollOnlyInRange = (
  e: PayrollOnlySource,
  from: string,
  to: string,
) => {
  const s = e.settings;
  if (!s?.isNoDTRNotRequired) return false;
  const { noDtrEffectiveFrom: start, noDtrEffectiveUntil: end } = s;
  if (start && dayjs(start).isAfter(to, "day")) return false;
  if (end && dayjs(end).isBefore(from, "day")) return false;
  return true;
};

// The window covers every day of the range, so no DTR is expected for any of it.
export const isPayrollOnlyThroughout = (
  e: PayrollOnlySource,
  from: string,
  to: string,
) => {
  const s = e.settings;
  if (!s?.isNoDTRNotRequired) return false;
  const { noDtrEffectiveFrom: start, noDtrEffectiveUntil: end } = s;
  if (start && dayjs(start).isAfter(from, "day")) return false;
  if (end && dayjs(end).isBefore(to, "day")) return false;
  return true;
};
