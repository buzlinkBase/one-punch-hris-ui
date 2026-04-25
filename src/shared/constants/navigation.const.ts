export interface NavItem {
  key: string;
  label: string;
  path?: string;
  children?: NavItem[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { key: 'timekeeping', label: 'Time Keeping', path: '/timekeeping' },
  { key: 'change-schedule', label: 'Change Schedule', path: '/change-schedule' },
  { key: 'daily-time-record', label: 'Daily Time Record', path: '/daily-time-record' },
  { key: 'reports', label: 'Reports', path: '/reports' },
  {
    key: 'setup',
    label: 'Setup',
    children: [
      { key: 'setup-fixed-shift', label: 'Fixed Time Shift', path: '/setup/time-shift/fixed' },
      { key: 'setup-flexi-shift', label: 'Flexi Time Shift', path: '/setup/time-shift/flexi' },
      { key: 'setup-department', label: 'Department', path: '/setup/department' },
      { key: 'setup-operation-area', label: 'Operation Area', path: '/setup/operation-area' },
      { key: 'setup-payroll-group', label: 'Payroll Group', path: '/setup/payroll-group' },
      { key: 'setup-holiday', label: 'Holiday', path: '/setup/holiday' },
      { key: 'setup-employee', label: 'Employee', path: '/setup/employee' },
    ],
  },
  { key: 'clients', label: 'Clients', path: '/clients' },
  { key: 'employee-management', label: 'Employee Management', path: '/employee-management' },
  { key: 'enroll-biometrics', label: 'Enroll Biometrics', path: '/enroll-biometrics' },
  { key: 'security', label: 'Security', path: '/security' },
];

export const NAVIGATION_BUTTON_LABEL = {
  BACK: 'Back',
  SAVE: 'Save',
  CANCEL: 'Cancel',
  ADD: 'Add',
  EDIT: 'Edit',
  DELETE: 'Delete',
};
