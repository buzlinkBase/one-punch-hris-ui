import type { EmployeeResponse } from "../models/api/response/employee-response.model";

export function formatFullName(record: EmployeeResponse) {
  if (record.fullName) return record.fullName;
  return `${record.lastName}, ${record.firstName} ${record.middleName ?? ""} ${record.suffix ?? ""}`
    .replace(/\s+/g, " ")
    .trim();
}
