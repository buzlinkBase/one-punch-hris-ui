export const PERMISSION_LABEL = {
  TITLE: "Permissions",
  CODE: "Code",
  NAME: "Permission Name",
  MODULE: "Module",
  ACTION: "Action",
  DESCRIPTION: "Description",
  STATUS: "Status",
  CREATE_TITLE: "Create Permission",
  EDIT_TITLE: "Edit Permission",
};

export const PERMISSION_ACTION_OPTIONS = [
  { value: "CREATE", label: "Create" },
  { value: "READ", label: "Read" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "EXPORT", label: "Export" },
  { value: "APPROVE", label: "Approve" },
  { value: "REJECT", label: "Reject" },
] as const;

export const PERMISSION_MODULE_OPTIONS = [
  { value: "Department", label: "Department" },
  { value: "Employee", label: "Employee" },
  { value: "Holiday", label: "Holiday" },
  { value: "Operation Area", label: "Operation Area" },
  { value: "Payroll Group", label: "Payroll Group" },
  { value: "Time Shift", label: "Time Shift" },
  { value: "Timekeeping", label: "Timekeeping" },
  { value: "Daily Time Record", label: "Daily Time Record" },
  { value: "Change Schedule", label: "Change Schedule" },
  { value: "Reports", label: "Reports" },
  { value: "User", label: "User" },
  { value: "Role", label: "Role" },
] as const;

export const PERMISSION_ACTION_COLORS: Record<string, string> = {
  CREATE: "green",
  READ: "blue",
  UPDATE: "orange",
  DELETE: "red",
  EXPORT: "purple",
  APPROVE: "success",
  REJECT: "error",
};

export const PERMISSION_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];
