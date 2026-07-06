import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PermissionResponse } from "../models/api/response/permission-response.model";
import type { CreatePermission } from "../models/api/request/create-permission.model";
import type { UpdatePermission } from "../models/api/request/update-permission.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "permissions");

const MOCK_PERMISSIONS: PermissionResponse[] = [
  // Department
  {
    id: "perm-001",
    code: "DEPT_CREATE",
    name: "Create Department",
    module: "Department",
    action: "CREATE",
    description: "Allows creating new department records.",
    status: "ACTIVE",
  },
  {
    id: "perm-002",
    code: "DEPT_READ",
    name: "View Department",
    module: "Department",
    action: "READ",
    description: "Allows viewing department records.",
    status: "ACTIVE",
  },
  {
    id: "perm-003",
    code: "DEPT_UPDATE",
    name: "Edit Department",
    module: "Department",
    action: "UPDATE",
    description: "Allows editing existing department records.",
    status: "ACTIVE",
  },
  {
    id: "perm-004",
    code: "DEPT_DELETE",
    name: "Delete Department",
    module: "Department",
    action: "DELETE",
    description: "Allows deleting department records.",
    status: "ACTIVE",
  },
  // Employee
  {
    id: "perm-005",
    code: "EMP_CREATE",
    name: "Create Employee",
    module: "Employee",
    action: "CREATE",
    description: "Allows onboarding a new employee.",
    status: "ACTIVE",
  },
  {
    id: "perm-006",
    code: "EMP_READ",
    name: "View Employee",
    module: "Employee",
    action: "READ",
    description: "Allows viewing employee profiles.",
    status: "ACTIVE",
  },
  {
    id: "perm-007",
    code: "EMP_UPDATE",
    name: "Edit Employee",
    module: "Employee",
    action: "UPDATE",
    description: "Allows updating employee information.",
    status: "ACTIVE",
  },
  {
    id: "perm-008",
    code: "EMP_DELETE",
    name: "Delete Employee",
    module: "Employee",
    action: "DELETE",
    description: "Allows removing an employee record.",
    status: "INACTIVE",
  },
  // Timekeeping
  {
    id: "perm-009",
    code: "TK_READ",
    name: "View Timekeeping",
    module: "Timekeeping",
    action: "READ",
    description: "Allows viewing raw logs and attendance entries.",
    status: "ACTIVE",
  },
  {
    id: "perm-010",
    code: "TK_EXPORT",
    name: "Export Timekeeping",
    module: "Timekeeping",
    action: "EXPORT",
    description: "Allows exporting attendance data.",
    status: "ACTIVE",
  },
  {
    id: "perm-011",
    code: "TK_UPDATE",
    name: "Edit Timekeeping Entry",
    module: "Timekeeping",
    action: "UPDATE",
    description: "Allows manual editing of attendance entries.",
    status: "ACTIVE",
  },
  // Daily Time Record
  {
    id: "perm-012",
    code: "DTR_READ",
    name: "View DTR",
    module: "Daily Time Record",
    action: "READ",
    description: "Allows viewing DTR detail and summary.",
    status: "ACTIVE",
  },
  {
    id: "perm-013",
    code: "DTR_EXPORT",
    name: "Export DTR",
    module: "Daily Time Record",
    action: "EXPORT",
    description: "Allows exporting DTR for payroll.",
    status: "ACTIVE",
  },
  {
    id: "perm-014",
    code: "DTR_APPROVE",
    name: "Approve DTR",
    module: "Daily Time Record",
    action: "APPROVE",
    description: "Allows approving time record submissions.",
    status: "ACTIVE",
  },
  // Change Schedule
  {
    id: "perm-015",
    code: "CS_READ",
    name: "View Change Schedule",
    module: "Change Schedule",
    action: "READ",
    description: "Allows viewing change schedule requests.",
    status: "ACTIVE",
  },
  {
    id: "perm-016",
    code: "CS_APPROVE",
    name: "Approve Change Schedule",
    module: "Change Schedule",
    action: "APPROVE",
    description: "Allows approving work rotation and rest day changes.",
    status: "ACTIVE",
  },
  {
    id: "perm-017",
    code: "CS_REJECT",
    name: "Reject Change Schedule",
    module: "Change Schedule",
    action: "REJECT",
    description: "Allows rejecting schedule change requests.",
    status: "ACTIVE",
  },
  // Reports
  {
    id: "perm-018",
    code: "RPT_READ",
    name: "View Reports",
    module: "Reports",
    action: "READ",
    description: "Allows accessing HR and payroll reports.",
    status: "ACTIVE",
  },
  {
    id: "perm-019",
    code: "RPT_EXPORT",
    name: "Export Reports",
    module: "Reports",
    action: "EXPORT",
    description: "Allows downloading report files.",
    status: "ACTIVE",
  },
  // Holiday
  {
    id: "perm-020",
    code: "HOL_CREATE",
    name: "Create Holiday",
    module: "Holiday",
    action: "CREATE",
    description: "Allows adding new holidays to the calendar.",
    status: "ACTIVE",
  },
  {
    id: "perm-021",
    code: "HOL_UPDATE",
    name: "Edit Holiday",
    module: "Holiday",
    action: "UPDATE",
    description: "Allows modifying existing holiday records.",
    status: "ACTIVE",
  },
  {
    id: "perm-022",
    code: "HOL_DELETE",
    name: "Delete Holiday",
    module: "Holiday",
    action: "DELETE",
    description: "Allows removing holidays from the calendar.",
    status: "ACTIVE",
  },
  // Users
  {
    id: "perm-023",
    code: "USR_CREATE",
    name: "Create User",
    module: "User",
    action: "CREATE",
    description: "Allows creating new system user accounts.",
    status: "ACTIVE",
  },
  {
    id: "perm-024",
    code: "USR_UPDATE",
    name: "Edit User",
    module: "User",
    action: "UPDATE",
    description: "Allows editing user account details and resetting passwords.",
    status: "ACTIVE",
  },
  {
    id: "perm-025",
    code: "USR_DELETE",
    name: "Delete User",
    module: "User",
    action: "DELETE",
    description: "Allows deactivating or removing system user accounts.",
    status: "INACTIVE",
  },
  // Roles
  {
    id: "perm-026",
    code: "ROLE_CREATE",
    name: "Create Role",
    module: "Role",
    action: "CREATE",
    description: "Allows defining new system roles.",
    status: "ACTIVE",
  },
  {
    id: "perm-027",
    code: "ROLE_UPDATE",
    name: "Edit Role",
    module: "Role",
    action: "UPDATE",
    description: "Allows modifying role names and linked permissions.",
    status: "ACTIVE",
  },
  {
    id: "perm-028",
    code: "ROLE_DELETE",
    name: "Delete Role",
    module: "Role",
    action: "DELETE",
    description: "Allows removing system roles.",
    status: "INACTIVE",
  },
  // Payroll Group
  {
    id: "perm-029",
    code: "PG_CREATE",
    name: "Create Payroll Group",
    module: "Payroll Group",
    action: "CREATE",
    description: "Allows creating new payroll group configurations.",
    status: "ACTIVE",
  },
  {
    id: "perm-030",
    code: "PG_UPDATE",
    name: "Edit Payroll Group",
    module: "Payroll Group",
    action: "UPDATE",
    description: "Allows updating payroll group settings.",
    status: "ACTIVE",
  },
];

export const permissionApi = {
  async getAll(): Promise<PermissionResponse[]> {
    try {
      const data =
        await httpClient.getUnwrapped<PermissionResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_PERMISSIONS;
    } catch {
      return MOCK_PERMISSIONS;
    }
  },

  async getById(id: string): Promise<PermissionResponse> {
    try {
      return await httpClient.getUnwrapped<PermissionResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_PERMISSIONS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Permission ${id} not found`);
    }
  },

  create(data: CreatePermission): Promise<PermissionResponse> {
    return httpClient.postUnwrapped<PermissionResponse>(ENDPOINT, data);
  },

  update(data: UpdatePermission): Promise<PermissionResponse> {
    return httpClient.put<PermissionResponse>(`${ENDPOINT}/${data.id}`, data);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
