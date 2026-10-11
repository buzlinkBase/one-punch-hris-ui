// Tooltip text for permissions whose name alone doesn't say enough, keyed by feature, then
// action. A feature-level entry ("") explains the whole row.
export const PERMISSION_HINTS: Record<string, Record<string, string>> = {
  Users: {
    Invite:
      "Send company invitations to employees and client logins, one at a time or up to 100 at once.",
    AssignRole:
      "Choose a role other than the default (Employee / Client) when inviting. Only roles whose permissions the user holds themselves can be given.",
  },
  "Confidential Records": {
    "": "Employees marked Confidential (for example, executives) are hidden from everyone, Admins included, except the Owner and roles given one of these. Choose the one that matches what the role needs to see.",
    Access:
      "Full view. Sees everything about confidential employees, including their salary, payroll, payslips and pay reports. Can also mark or unmark an employee as Confidential.",
    Operations:
      "Attendance and requests only. Sees their time records (DTR, attendance, schedules, rest days) and their leave, overtime, OB, pass slip and undertime requests. Their pay stays hidden.",
    Entries:
      "Money entries only. Can see and manage their cash bond, allowances / other income, and deductions / loans. Their salary, payroll and pay reports stay hidden.",
  },
};

export function permissionHint(
  feature: string,
  action = "",
): string | undefined {
  return PERMISSION_HINTS[feature]?.[action];
}
