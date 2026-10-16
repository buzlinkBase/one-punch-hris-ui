export const USER_LABEL = {
  TITLE: "User",
  SUBTITLE: "Manage company users, roles, and access status.",
  EMAIL: "Email",
  FULL_NAME: "Full Name",
  ROLES: "Roles",
  STATUS: "Status",
  TYPE: "Type",
  LINKED_TO: "Linked To",
  EMPLOYEE_NO: "Employee No.",
  DEPARTMENT: "Department",
  CLIENT: "Client",
  ALL_CLIENTS: "All clients",
  EDIT_IN_PORTAL: "Roles are managed in Client Portal > Portal Clients",
  CREATE_TITLE: "Create User",
  EDIT_TITLE: "Edit User",
};

export const USER_TAB_LABEL = {
  ALL: "All",
  EMPLOYEE: "Employees",
  CLIENT: "Clients",
  OTHER: "Others",
};

export const USER_BULK_LABEL = {
  SELECTED: (count: number) => `${count} selected`,
  ACTIVATE: "Activate",
  REVOKE: "Revoke",
  REMOVE: "Remove",
  CLEAR: "Clear",
  CONFIRM_ACTIVATE: (count: number) => `Activate ${count} user(s)?`,
  CONFIRM_REVOKE: (count: number) => `Revoke access for ${count} user(s)?`,
  CONFIRM_REMOVE: (count: number) =>
    `Remove ${count} user(s) from the company?`,
  REVOKE_DESCRIPTION:
    "They will be signed out and can't access this company until reactivated.",
  REMOVE_DESCRIPTION:
    "Their membership and access to this company will be removed.",
  DONE: (action: string, count: number) => `${action} ${count} user(s).`,
  PARTIAL: (failed: number) => `${failed} could not be updated.`,
};
