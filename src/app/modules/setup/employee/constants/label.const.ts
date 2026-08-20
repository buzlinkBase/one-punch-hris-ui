export const EMPLOYEE_LABEL = {
  TITLE: "Employee",
  EMPLOYEE_NO: "Employee No.",
  BIO_ID: "Bio ID",
  FIRST_NAME: "First Name",
  LAST_NAME: "Last Name",
  MIDDLE_NAME: "Middle Name",
  SUFFIX: "Suffix",
  GENDER: "Gender",
  CIVIL_STATUS: "Civil Status",
  DOB: "Date of Birth",
  BLOOD_TYPE: "Blood Type",
  EMAIL: "Email Address",
  CONTACT: "Contact No.",
  ADDRESS1: "Address Line 1",
  ADDRESS2: "Address Line 2",
  DEPARTMENT: "Department",
  AREA: "Project Site",
  PAYROLL_GROUP: "Payroll Group",
  CLIENT: "Client",
  BRANCH: "Branch",
  SECTION: "Section",
  POSITION: "Position",
  JOB_LEVEL: "Job Level",
  TIME_SHIFT: "Time Shift",
  EMPLOYMENT_STATUS: "Employment Status",
  HIRING_ENTITY: "Hiring Entity",
  DATE_REGISTERED: "Date Registered",
  HIRE_DATE: "Hire Date",
  CONTRACT_START: "Contract Start",
  CONTRACT_END: "Contract End",
  DATE_RESIGNED: "Date Resigned",
  STATUS: "Status",
  MODE_OF_PAYMENT: "Mode of Payment",
  SALARY_TYPE: "Salary Type",
  MONTHLY_RATE: "Monthly Rate",
  DAILY_RATE: "Daily Rate",
  COLA: "COLA (Per Payroll)",
  BANK_NAME: "Bank Name",
  BANK_NO: "Bank Account No.",
  SSS_NO: "SSS No.",
  PHIC_NO: "PhilHealth No.",
  HDMF_NO: "Pag-IBIG No.",
  TIN: "TIN",
  AGE: "Age",
  REST_DAYS: "Rest Days",
  CREATE_TITLE: "Create Employee",
  EDIT_TITLE: "Edit Employee",
};

export const MODE_OF_PAYMENT_OPTIONS = [
  { value: "Cash", label: "Cash" },
  { value: "ATM", label: "ATM" },
];

export const SALARY_TYPE_OPTIONS = [
  { value: "MONTHLY_VARIABLE", label: "Variable" },
  { value: "MONTHLY_FIXED", label: "Fixed" },
];

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "Regular", label: "Regular" },
  { value: "PartTime", label: "Part Time" },
  { value: "Probationary", label: "Probationary" },
  { value: "Contract", label: "Contract" },
  { value: "Temporary", label: "Temporary" },
  { value: "Casual", label: "Casual" },
  { value: "Intern", label: "Intern" },
  { value: "OnLeave", label: "On Leave" },
  { value: "Suspended", label: "Suspended" },
  { value: "Terminated", label: "Terminated" },
  { value: "Resigned", label: "Resigned" },
  { value: "Retired", label: "Retired" },
  { value: "Deceased", label: "Deceased" },
];

export const JOB_LEVEL_OPTIONS = [
  { value: "Managerial", label: "Managerial" },
  { value: "Supervisory", label: "Supervisory" },
  { value: "Executive", label: "Executive" },
  { value: "RankandFile", label: "Rank and File" },
  { value: "EntryLevel", label: "Entry Level" },
  { value: "TechnicalSpecialist", label: "Technical Specialist" },
  { value: "Contractual", label: "Contractual" },
  { value: "FieldStaff", label: "Field Staff" },
];

export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export const CIVIL_STATUS_OPTIONS = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Widowed", label: "Widowed" },
  { value: "Separated", label: "Separated" },
];

export const BLOOD_TYPE_OPTIONS = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export const COMPUTATION_BASIS_OPTIONS = [
  { value: "None", label: "None" },
  { value: "FixedPerPayroll", label: "Fixed Per Payroll" },
  { value: "FixedMonthly", label: "Fixed Monthly" },
  { value: "Table", label: "Table" },
];

// kept for backward compatibility
export const PAYMENT_METHOD_OPTIONS = MODE_OF_PAYMENT_OPTIONS;
