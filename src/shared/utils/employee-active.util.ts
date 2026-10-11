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
