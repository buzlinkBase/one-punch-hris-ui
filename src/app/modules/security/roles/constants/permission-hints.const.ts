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
    "": "Employees tagged Confidential are hidden from anyone without one of these.",
    Access:
      "Everything about confidential employees, including salary, payroll runs, payslips and pay reports. Also lets the user tag or untag an employee as Confidential.",
    Operations:
      "Day-to-day records of confidential employees: DTR, attendance, schedules, rest days, leave, overtime, OB, pass slip and undertime. Salary, payroll and pay reports stay hidden.",
    Entries:
      "Money entries for confidential employees: cash bond, allowances / other income and deductions / loans. Salary, payroll and pay reports stay hidden.",
  },
};

export function permissionHint(
  feature: string,
  action = "",
): string | undefined {
  return PERMISSION_HINTS[feature]?.[action];
}
