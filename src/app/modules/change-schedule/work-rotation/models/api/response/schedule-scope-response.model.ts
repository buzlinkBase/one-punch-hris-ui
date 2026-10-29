import type { EmployeeFilterResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/employee-filter-response.model";

// What a team-scoped caller can schedule: their direct reports plus the employees at their granted
// project sites, and the sites they may send people to (empty = any site).
export interface ScheduleScopeResponse {
  employees: EmployeeFilterResponse[];
  allowedAreaIds: string[];
}
